/**
 * Outreach message status tracking.
 * Processes webhook callbacks and updates message + campaign status.
 */
import { getDb } from "../db";
import { outreachMessages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { refreshCampaignMetrics } from "./campaignManager";

type TrackableStatus = "delivered" | "opened" | "clicked" | "replied" | "bounced" | "failed";

/**
 * Update a message status from an external webhook callback.
 */
export async function trackMessageEvent(params: {
  externalMessageId?: string;
  messageId?: number;
  status: TrackableStatus;
  metadata?: Record<string, unknown>;
}): Promise<{ updated: boolean; campaignId?: number }> {
  const db = await getDb();
  if (!db) return { updated: false };

  // Find the message
  let messageRow;
  if (params.messageId) {
    const rows = await db.select().from(outreachMessages)
      .where(eq(outreachMessages.id, params.messageId)).limit(1);
    messageRow = rows[0];
  } else if (params.externalMessageId) {
    const rows = await db.select().from(outreachMessages)
      .where(eq(outreachMessages.externalMessageId, params.externalMessageId)).limit(1);
    messageRow = rows[0];
  }

  if (!messageRow) {
    console.warn(`[Tracker] Message not found: id=${params.messageId}, external=${params.externalMessageId}`);
    return { updated: false };
  }

  // Build update based on status
  const update: Record<string, unknown> = {
    status: params.status,
    updatedAt: new Date(),
  };

  switch (params.status) {
    case "delivered":
      update.deliveredAt = new Date();
      break;
    case "opened":
      update.openedAt = new Date();
      break;
    case "clicked":
      update.clickedAt = new Date();
      break;
    case "replied":
      update.repliedAt = new Date();
      break;
    case "bounced":
    case "failed":
      update.errorMessage = (params.metadata?.error as string) || `Message ${params.status}`;
      break;
  }

  await db.update(outreachMessages).set(update).where(eq(outreachMessages.id, messageRow.id));

  // Refresh campaign metrics
  await refreshCampaignMetrics(messageRow.campaignId);

  console.log(`[Tracker] Message #${messageRow.id} -> ${params.status}`);
  return { updated: true, campaignId: messageRow.campaignId };
}

/**
 * Process a HeyReach webhook payload.
 */
export async function processHeyReachWebhook(payload: Record<string, unknown>): Promise<void> {
  const eventType = payload.event_type as string;
  const externalId = (payload.message_id || payload.action_id) as string;

  if (!externalId) {
    console.warn("[Tracker] HeyReach webhook missing message ID");
    return;
  }

  const statusMap: Record<string, TrackableStatus> = {
    message_sent: "delivered",
    connection_accepted: "delivered",
    reply_received: "replied",
    message_failed: "failed",
    connection_failed: "failed",
  };

  const status = statusMap[eventType];
  if (!status) {
    console.log(`[Tracker] Ignoring HeyReach event type: ${eventType}`);
    return;
  }

  await trackMessageEvent({
    externalMessageId: externalId,
    status,
    metadata: payload,
  });
}

/**
 * Process an email service webhook payload (SES/SendGrid format).
 */
export async function processEmailWebhook(payload: Record<string, unknown>): Promise<void> {
  const eventType = (payload.eventType || payload.event) as string;
  const mail = payload.mail as Record<string, unknown> | undefined;
  const messageId = (mail?.messageId || payload.sg_message_id || payload.messageId) as string;

  if (!messageId) {
    console.warn("[Tracker] Email webhook missing message ID");
    return;
  }

  const statusMap: Record<string, TrackableStatus> = {
    // SES event types
    Delivery: "delivered",
    Open: "opened",
    Click: "clicked",
    Bounce: "bounced",
    Complaint: "failed",
    // SendGrid event types
    delivered: "delivered",
    open: "opened",
    click: "clicked",
    bounce: "bounced",
    dropped: "failed",
    spamreport: "failed",
  };

  const status = statusMap[eventType];
  if (!status) {
    console.log(`[Tracker] Ignoring email event type: ${eventType}`);
    return;
  }

  await trackMessageEvent({
    externalMessageId: messageId,
    status,
    metadata: payload,
  });
}
