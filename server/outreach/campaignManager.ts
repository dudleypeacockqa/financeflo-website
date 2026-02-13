/**
 * Campaign lifecycle management.
 * Handles transitions: draft -> scheduled -> running -> paused -> completed/cancelled.
 */
import { getDb } from "../db";
import { campaigns, outreachMessages, leads, leadListMembers } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { scheduleMessagesForCampaign } from "./scheduler";

/**
 * Transition a campaign to scheduled state and create message records.
 */
export async function scheduleCampaign(campaignId: number): Promise<{ messageCount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  if (rows.length === 0) throw new Error("Campaign not found");
  const campaign = rows[0];

  if (campaign.status !== "draft") {
    throw new Error(`Cannot schedule campaign in ${campaign.status} status`);
  }

  if (!campaign.listId) {
    throw new Error("Campaign must have a lead list assigned");
  }

  if (!campaign.sequenceSteps || campaign.sequenceSteps.length === 0) {
    throw new Error("Campaign must have at least one sequence step");
  }

  // Get leads from the list
  const members = await db
    .select({ leadId: leadListMembers.leadId })
    .from(leadListMembers)
    .where(eq(leadListMembers.listId, campaign.listId));

  if (members.length === 0) {
    throw new Error("No leads in the assigned list");
  }

  const leadIds = members.map((m) => m.leadId);

  // Create message records for each lead x step
  const messageCount = await scheduleMessagesForCampaign(campaign, leadIds);

  // Update campaign status
  await db.update(campaigns).set({
    status: "scheduled",
    scheduledAt: campaign.scheduledAt || new Date(),
    updatedAt: new Date(),
  }).where(eq(campaigns.id, campaignId));

  return { messageCount };
}

/**
 * Start a campaign — transition from scheduled to running.
 */
export async function startCampaign(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rows = await db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  if (rows.length === 0) throw new Error("Campaign not found");
  const campaign = rows[0];

  if (campaign.status !== "scheduled" && campaign.status !== "paused") {
    throw new Error(`Cannot start campaign in ${campaign.status} status`);
  }

  await db.update(campaigns).set({
    status: "running",
    startedAt: campaign.startedAt || new Date(),
    updatedAt: new Date(),
  }).where(eq(campaigns.id, campaignId));

  console.log(`[Campaign] Campaign #${campaignId} "${campaign.name}" started`);
}

/**
 * Pause a running campaign.
 */
export async function pauseCampaign(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaigns).set({
    status: "paused",
    updatedAt: new Date(),
  }).where(
    and(eq(campaigns.id, campaignId), eq(campaigns.status, "running"))
  );

  console.log(`[Campaign] Campaign #${campaignId} paused`);
}

/**
 * Cancel a campaign and mark unsent messages as failed.
 */
export async function cancelCampaign(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Cancel pending/scheduled messages
  await db.update(outreachMessages).set({
    status: "failed",
    errorMessage: "Campaign cancelled",
    updatedAt: new Date(),
  }).where(
    and(
      eq(outreachMessages.campaignId, campaignId),
      sql`${outreachMessages.status} IN ('pending', 'scheduled')`
    )
  );

  await db.update(campaigns).set({
    status: "cancelled",
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(campaigns.id, campaignId));

  console.log(`[Campaign] Campaign #${campaignId} cancelled`);
}

/**
 * Recalculate and update campaign metrics from message statuses.
 */
export async function refreshCampaignMetrics(campaignId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const messages = await db.select({ status: outreachMessages.status })
    .from(outreachMessages)
    .where(eq(outreachMessages.campaignId, campaignId));

  const metrics = {
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    failed: 0,
  };

  for (const msg of messages) {
    switch (msg.status) {
      case "sent": metrics.totalSent++; break;
      case "delivered": metrics.totalSent++; metrics.delivered++; break;
      case "opened": metrics.totalSent++; metrics.delivered++; metrics.opened++; break;
      case "clicked": metrics.totalSent++; metrics.delivered++; metrics.opened++; metrics.clicked++; break;
      case "replied": metrics.totalSent++; metrics.delivered++; metrics.replied++; break;
      case "bounced": metrics.bounced++; break;
      case "failed": metrics.failed++; break;
    }
  }

  await db.update(campaigns).set({
    metrics,
    updatedAt: new Date(),
  }).where(eq(campaigns.id, campaignId));

  // Check if campaign is complete (all messages processed)
  const pendingCount = messages.filter(
    (m) => m.status === "pending" || m.status === "scheduled"
  ).length;

  if (pendingCount === 0 && messages.length > 0) {
    await db.update(campaigns).set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(
      and(eq(campaigns.id, campaignId), eq(campaigns.status, "running"))
    );
  }
}
