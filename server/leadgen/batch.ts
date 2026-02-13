/**
 * Batch processing for lead research.
 * Processes leads from a list with parallel execution, progress tracking, and cost aggregation.
 */
import { getDb } from "../db";
import { leadResearchBatches, leadListMembers, leads } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { runLeadPipeline } from "./pipeline";
import { enqueueJob } from "../jobs/queue";

/**
 * Create a batch and enqueue individual lead research jobs.
 * Each lead gets its own background job for resilience.
 */
export async function createAndStartBatch(
  batchId: number,
  leadIds: number[]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update batch status
  await db.update(leadResearchBatches).set({
    status: "running",
    totalLeads: leadIds.length,
    updatedAt: new Date(),
  }).where(eq(leadResearchBatches.id, batchId));

  // Enqueue a job for each lead
  for (const leadId of leadIds) {
    await enqueueJob("research_lead", {
      leadId,
      batchId,
    });
  }

  console.log(`[Batch] Batch #${batchId}: Enqueued ${leadIds.length} lead research jobs`);
}

/**
 * Update batch progress after a lead is processed.
 */
export async function updateBatchProgress(
  batchId: number,
  success: boolean,
  costUsd: number,
  leadId?: number,
  error?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const batchRows = await db.select().from(leadResearchBatches).where(eq(leadResearchBatches.id, batchId)).limit(1);
  if (batchRows.length === 0) return;

  const batch = batchRows[0];
  const newProcessed = batch.processedLeads + 1;
  const newFailed = success ? batch.failedLeads : batch.failedLeads + 1;
  const currentCost = parseFloat(batch.totalCostUsd || "0");
  const newCost = (currentCost + costUsd).toFixed(2);

  // Add error to log if failed
  const errors = batch.errors || [];
  if (!success && leadId && error) {
    errors.push({ leadId, error });
  }

  const isComplete = newProcessed >= batch.totalLeads;

  await db.update(leadResearchBatches).set({
    processedLeads: newProcessed,
    failedLeads: newFailed,
    totalCostUsd: newCost,
    errors,
    status: isComplete ? "completed" : "running",
    updatedAt: new Date(),
  }).where(eq(leadResearchBatches.id, batchId));

  if (isComplete) {
    console.log(`[Batch] Batch #${batchId}: Complete. ${newProcessed} leads, ${newFailed} failures, $${newCost} cost.`);
  }
}

/**
 * Get lead IDs from a lead list for batch processing.
 */
export async function getLeadIdsFromList(listId: number): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const members = await db.select({ leadId: leadListMembers.leadId })
    .from(leadListMembers)
    .where(eq(leadListMembers.listId, listId));

  return members.map(m => m.leadId);
}
