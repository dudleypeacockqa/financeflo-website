/**
 * Workflow trigger evaluation.
 * Matches events against workflow trigger conditions to determine enrollment.
 */
import { getDb } from "../db";
import { workflows } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface TriggerEvent {
  type: string;
  leadId: number;
  data?: Record<string, unknown>;
}

/**
 * Find all active workflows that match a given trigger event.
 */
export async function findMatchingWorkflows(event: TriggerEvent): Promise<number[]> {
  const db = await getDb();
  if (!db) return [];

  const activeWorkflows = await db.select()
    .from(workflows)
    .where(eq(workflows.status, "active"));

  const matchingIds: number[] = [];

  for (const wf of activeWorkflows) {
    if (wf.trigger !== event.type) continue;

    // Check trigger conditions
    if (wf.triggerConditions && Object.keys(wf.triggerConditions).length > 0) {
      if (matchesConditions(wf.triggerConditions, event.data || {})) {
        matchingIds.push(wf.id);
      }
    } else {
      // No conditions — trigger type match is sufficient
      matchingIds.push(wf.id);
    }
  }

  return matchingIds;
}

/**
 * Check if event data matches workflow trigger conditions.
 * Supports simple equality checks and array includes.
 */
function matchesConditions(
  conditions: Record<string, unknown>,
  data: Record<string, unknown>
): boolean {
  for (const [key, expected] of Object.entries(conditions)) {
    const actual = data[key];

    if (Array.isArray(expected)) {
      // Expected is an array — actual must be in the array
      if (!expected.includes(actual)) return false;
    } else if (typeof expected === "object" && expected !== null) {
      // Nested condition — e.g., { $ne: "closed_lost" }
      const cond = expected as Record<string, unknown>;
      if ("$ne" in cond && actual === cond.$ne) return false;
      if ("$gt" in cond && (typeof actual !== "number" || actual <= (cond.$gt as number))) return false;
      if ("$gte" in cond && (typeof actual !== "number" || actual < (cond.$gte as number))) return false;
      if ("$lt" in cond && (typeof actual !== "number" || actual >= (cond.$lt as number))) return false;
      if ("$in" in cond && Array.isArray(cond.$in) && !cond.$in.includes(actual)) return false;
    } else {
      // Simple equality check
      if (actual !== expected) return false;
    }
  }
  return true;
}
