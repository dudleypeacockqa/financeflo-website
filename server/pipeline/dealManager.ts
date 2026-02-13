/**
 * Deal lifecycle management for the sales pipeline.
 * Handles stage transitions, probability scoring, and pipeline aggregation.
 */
import { getDb } from "../db";
import { deals, activities, leads } from "../../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

/** Default probability by stage */
const STAGE_PROBABILITY: Record<string, number> = {
  lead: 5,
  mql: 10,
  sql: 20,
  discovery: 30,
  aiba_diagnostic: 50,
  proposal_sent: 60,
  negotiation: 80,
  closed_won: 100,
  closed_lost: 0,
};

/** Valid stage transitions */
const VALID_TRANSITIONS: Record<string, string[]> = {
  lead: ["mql", "sql", "closed_lost"],
  mql: ["sql", "closed_lost"],
  sql: ["discovery", "closed_lost"],
  discovery: ["aiba_diagnostic", "proposal_sent", "closed_lost"],
  aiba_diagnostic: ["proposal_sent", "closed_lost"],
  proposal_sent: ["negotiation", "closed_won", "closed_lost"],
  negotiation: ["closed_won", "closed_lost"],
  closed_won: [],
  closed_lost: ["lead"], // Allow reopening
};

/**
 * Create a deal from a lead.
 */
export async function createDeal(params: {
  leadId: number;
  title: string;
  value?: number;
  assignedTo?: string;
  stage?: string;
}): Promise<{ dealId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const stage = (params.stage || "lead") as any;
  const probability = STAGE_PROBABILITY[stage] ?? 5;
  const weightedValue = params.value ? Math.round(params.value * probability / 100) : undefined;

  const rows = await db.insert(deals).values({
    leadId: params.leadId,
    title: params.title,
    stage,
    value: params.value,
    probability,
    weightedValue,
    assignedTo: params.assignedTo,
  }).returning();

  const deal = rows[0];

  // Log activity
  await db.insert(activities).values({
    dealId: deal.id,
    type: "stage_change",
    description: `Deal created at stage: ${stage}`,
    metadata: { stage },
  });

  return { dealId: deal.id };
}

/**
 * Move a deal to a new stage with validation.
 */
export async function moveDealStage(
  dealId: number,
  newStage: string,
  lossReason?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (rows.length === 0) throw new Error("Deal not found");
  const deal = rows[0];

  const allowed = VALID_TRANSITIONS[deal.stage] || [];
  if (!allowed.includes(newStage)) {
    throw new Error(`Cannot move from ${deal.stage} to ${newStage}. Allowed: ${allowed.join(", ")}`);
  }

  const probability = STAGE_PROBABILITY[newStage] ?? deal.probability ?? 0;
  const weightedValue = deal.value ? Math.round(deal.value * probability / 100) : undefined;

  const update: Record<string, unknown> = {
    stage: newStage,
    probability,
    weightedValue,
    updatedAt: new Date(),
  };

  if (newStage === "closed_won" || newStage === "closed_lost") {
    update.closedAt = new Date();
  }
  if (newStage === "closed_lost" && lossReason) {
    update.lossReason = lossReason;
  }

  await db.update(deals).set(update).where(eq(deals.id, dealId));

  // Log stage change activity
  await db.insert(activities).values({
    dealId,
    type: "stage_change",
    description: `Stage changed: ${deal.stage} → ${newStage}${lossReason ? ` (Reason: ${lossReason})` : ""}`,
    metadata: { fromStage: deal.stage, toStage: newStage, lossReason },
  });
}

/**
 * Get pipeline overview with deal counts and values per stage.
 */
export async function getPipelineOverview(): Promise<{
  stages: { stage: string; count: number; totalValue: number; weightedValue: number }[];
  totalDeals: number;
  totalValue: number;
  totalWeightedValue: number;
}> {
  const db = await getDb();
  if (!db) return { stages: [], totalDeals: 0, totalValue: 0, totalWeightedValue: 0 };

  const stageData = await db.select({
    stage: deals.stage,
    count: sql<number>`count(*)::int`,
    totalValue: sql<number>`coalesce(sum(${deals.value}), 0)::int`,
    weightedValue: sql<number>`coalesce(sum(${deals.weightedValue}), 0)::int`,
  })
    .from(deals)
    .groupBy(deals.stage);

  const totalDeals = stageData.reduce((sum, s) => sum + s.count, 0);
  const totalValue = stageData.reduce((sum, s) => sum + s.totalValue, 0);
  const totalWeightedValue = stageData.reduce((sum, s) => sum + s.weightedValue, 0);

  return { stages: stageData, totalDeals, totalValue, totalWeightedValue };
}
