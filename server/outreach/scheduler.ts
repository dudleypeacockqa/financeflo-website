/**
 * Message scheduling for outreach campaigns.
 * Handles send windows, daily limits, delays between steps, and weekend skipping.
 */
import { getDb } from "../db";
import { outreachMessages, campaigns } from "../../drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import type { Campaign } from "../../drizzle/schema";

/**
 * Create scheduled message records for all leads in a campaign.
 * Returns the total number of messages created.
 */
export async function scheduleMessagesForCampaign(
  campaign: Campaign,
  leadIds: number[]
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const steps = campaign.sequenceSteps || [];
  if (steps.length === 0) return 0;

  const settings = campaign.settings || {
    dailyLimit: 50,
    sendWindowStart: "09:00",
    sendWindowEnd: "17:00",
    timezone: "Europe/London",
    skipWeekends: true,
  };

  const baseDate = campaign.scheduledAt || new Date();
  let messageCount = 0;

  for (const step of steps) {
    // Calculate scheduled time for this step
    const stepDate = addBusinessDays(baseDate, step.delayDays, settings.skipWeekends);
    const scheduledAt = setTimeInWindow(stepDate, settings.sendWindowStart, settings.sendWindowEnd);

    // Create messages in batches respecting daily limits
    const batches = chunkArray(leadIds, settings.dailyLimit);

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      // Spread across days if more leads than daily limit
      const batchDate = addBusinessDays(scheduledAt, batchIdx, settings.skipWeekends);

      const values = batch.map((leadId) => ({
        campaignId: campaign.id,
        leadId,
        stepNumber: step.stepNumber,
        channel: (step.channel || campaign.channel) as "linkedin_dm" | "linkedin_connection" | "email",
        status: "scheduled" as const,
        subject: step.subject || null,
        templateBody: step.templateBody,
        scheduledAt: batchDate,
      }));

      await db.insert(outreachMessages).values(values);
      messageCount += batch.length;
    }
  }

  console.log(`[Scheduler] Campaign #${campaign.id}: ${messageCount} messages scheduled for ${leadIds.length} leads across ${steps.length} steps`);
  return messageCount;
}

/**
 * Get messages due for sending now.
 * Called by the worker to process pending messages.
 */
export async function getDueMessages(limit: number = 10): Promise<{
  id: number;
  campaignId: number;
  leadId: number;
  channel: string;
  stepNumber: number;
  templateBody: string | null;
  subject: string | null;
}[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return db.select({
    id: outreachMessages.id,
    campaignId: outreachMessages.campaignId,
    leadId: outreachMessages.leadId,
    channel: outreachMessages.channel,
    stepNumber: outreachMessages.stepNumber,
    templateBody: outreachMessages.templateBody,
    subject: outreachMessages.subject,
  })
    .from(outreachMessages)
    .innerJoin(campaigns, eq(outreachMessages.campaignId, campaigns.id))
    .where(
      and(
        eq(outreachMessages.status, "scheduled"),
        lte(outreachMessages.scheduledAt, now),
        eq(campaigns.status, "running")
      )
    )
    .limit(limit);
}

/**
 * Mark a message as sent with an external message ID.
 */
export async function markMessageSent(
  messageId: number,
  externalId?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(outreachMessages).set({
    status: "sent",
    sentAt: new Date(),
    externalMessageId: externalId || null,
    updatedAt: new Date(),
  }).where(eq(outreachMessages.id, messageId));
}

/**
 * Mark a message as failed.
 */
export async function markMessageFailed(
  messageId: number,
  error: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(outreachMessages).set({
    status: "failed",
    errorMessage: error,
    updatedAt: new Date(),
  }).where(eq(outreachMessages.id, messageId));
}

// ── Helpers ────────────────────────────────────────────────────────────────

function addBusinessDays(date: Date, days: number, skipWeekends: boolean): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (!skipWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      added++;
    }
  }
  return result;
}

function setTimeInWindow(date: Date, startTime: string, endTime: string): Date {
  const result = new Date(date);
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  // Randomize within the send window for natural timing
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const randomMinutes = startMinutes + Math.floor(Math.random() * (endMinutes - startMinutes));

  result.setHours(Math.floor(randomMinutes / 60), randomMinutes % 60, 0, 0);
  return result;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
