import axios from "axios";
import { logWebhookEvent } from "./db";

/**
 * GoHighLevel webhook integration.
 * Sends events to GHL for pipeline automation.
 * The GHL_WEBHOOK_URL env var should be set to the GHL webhook endpoint.
 */

const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || "";

export async function sendToGHL(
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!GHL_WEBHOOK_URL) {
    console.warn("[GHL] No webhook URL configured, skipping:", eventType);
    // Still log the event for debugging
    await logWebhookEvent({
      eventType,
      entityId: (payload.leadId as number) || null,
      payload,
      responseStatus: null,
      success: 0,
      errorMessage: "No GHL_WEBHOOK_URL configured",
    });
    return;
  }

  const fullPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    source: "financeflo-mvp",
    data: payload,
  };

  try {
    const response = await axios.post(GHL_WEBHOOK_URL, fullPayload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    await logWebhookEvent({
      eventType,
      entityId: (payload.leadId as number) || null,
      payload: fullPayload,
      responseStatus: response.status,
      success: response.status >= 200 && response.status < 300 ? 1 : 0,
      errorMessage: null,
    });

    console.log(`[GHL] Webhook sent: ${eventType} → ${response.status}`);
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[GHL] Webhook failed: ${eventType} → ${errMsg}`);

    await logWebhookEvent({
      eventType,
      entityId: (payload.leadId as number) || null,
      payload: fullPayload,
      responseStatus: null,
      success: 0,
      errorMessage: errMsg,
    });
  }
}
