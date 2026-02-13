/**
 * Project lifecycle management for service delivery.
 * Creates projects from closed deals and manages project status/phases.
 */
import { getDb } from "../db";
import { projects, deals, leads } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Create a project from a closed deal.
 */
export async function createProjectFromDeal(params: {
  dealId: number;
  name?: string;
  assignedTo?: string;
  startDate?: Date;
  targetEndDate?: Date;
}): Promise<{ projectId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get the deal and lead info
  const dealRows = await db.select().from(deals).where(eq(deals.id, params.dealId)).limit(1);
  if (dealRows.length === 0) throw new Error("Deal not found");
  const deal = dealRows[0];

  const rows = await db.insert(projects).values({
    dealId: params.dealId,
    leadId: deal.leadId,
    name: params.name || deal.title,
    contractValue: deal.value || undefined,
    assignedTo: params.assignedTo || deal.assignedTo || undefined,
    startDate: params.startDate,
    targetEndDate: params.targetEndDate,
    status: "planning",
    currentPhase: "assess",
  }).returning();

  return { projectId: rows[0].id };
}

/**
 * Create a standalone project (not from a deal).
 */
export async function createProject(params: {
  name: string;
  description?: string;
  leadId?: number;
  contractValue?: number;
  assignedTo?: string;
  startDate?: Date;
  targetEndDate?: Date;
}): Promise<{ projectId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.insert(projects).values({
    name: params.name,
    description: params.description,
    leadId: params.leadId,
    contractValue: params.contractValue,
    assignedTo: params.assignedTo,
    startDate: params.startDate,
    targetEndDate: params.targetEndDate,
    status: "planning",
    currentPhase: "assess",
  }).returning();

  return { projectId: rows[0].id };
}

/**
 * Advance project to the next ADAPT phase.
 */
export async function advancePhase(projectId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (rows.length === 0) throw new Error("Project not found");

  const phaseOrder = ["assess", "design", "architect", "pilot", "transform"];
  const currentIndex = phaseOrder.indexOf(rows[0].currentPhase);

  if (currentIndex >= phaseOrder.length - 1) {
    throw new Error("Project is already in the final phase (Transform)");
  }

  const nextPhase = phaseOrder[currentIndex + 1] as any;

  await db.update(projects).set({
    currentPhase: nextPhase,
    updatedAt: new Date(),
  }).where(eq(projects.id, projectId));

  return nextPhase;
}

/**
 * Update project status.
 */
export async function updateProjectStatus(
  projectId: number,
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const update: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "completed") update.completedAt = new Date();

  await db.update(projects).set(update).where(eq(projects.id, projectId));
}

/**
 * Get project summary with computed metrics.
 */
export async function getProjectSummary(): Promise<{
  total: number;
  active: number;
  completed: number;
  totalValue: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, completed: 0, totalValue: 0 };

  const stats = await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where ${projects.status} = 'active')`,
    completed: sql<number>`count(*) filter (where ${projects.status} = 'completed')`,
    totalValue: sql<number>`coalesce(sum(${projects.contractValue}), 0)::int`,
  }).from(projects);

  return stats[0] ?? { total: 0, active: 0, completed: 0, totalValue: 0 };
}
