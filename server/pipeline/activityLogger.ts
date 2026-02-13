/**
 * Activity logging for deal timeline.
 * Provides helpers to auto-log activities on deal mutations.
 */
import { getDb } from "../db";
import { activities } from "../../drizzle/schema";

type ActivityType = "note" | "call" | "meeting" | "email" | "stage_change" | "task_completed";

/**
 * Log an activity on a deal.
 */
export async function logActivity(params: {
  dealId: number;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  performedBy?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.insert(activities).values({
    dealId: params.dealId,
    type: params.type,
    description: params.description,
    metadata: params.metadata,
    performedBy: params.performedBy,
  }).returning();

  return rows[0].id;
}

/**
 * Log a note on a deal.
 */
export async function logNote(dealId: number, note: string, performedBy?: string): Promise<number> {
  return logActivity({ dealId, type: "note", description: note, performedBy });
}

/**
 * Log a call on a deal.
 */
export async function logCall(
  dealId: number,
  description: string,
  metadata?: { duration?: number; outcome?: string },
  performedBy?: string
): Promise<number> {
  return logActivity({ dealId, type: "call", description, metadata, performedBy });
}

/**
 * Log a meeting on a deal.
 */
export async function logMeeting(
  dealId: number,
  description: string,
  metadata?: { attendees?: string[]; agenda?: string },
  performedBy?: string
): Promise<number> {
  return logActivity({ dealId, type: "meeting", description, metadata, performedBy });
}
