import axios from "axios";
import { logWebhookEvent } from "./db";

/**
 * GoHighLevel Integration — FinanceFlo.ai
 *
 * Dual-mode integration:
 *   1. Direct API — Creates contacts, opportunities, and tags via GHL V2 REST API
 *   2. Webhook fallback — Sends events to GHL webhook endpoint
 *
 * Environment Variables:
 *   GHL_API_KEY         — FinanceFlo Private Integration Token (PIT)
 *   GHL_LOCATION_ID     — FinanceFlo GHL Location ID (f2hL1WCfLruukYmOIvhu)
 *   GHL_WEBHOOK_URL     — Fallback webhook URL (optional if API key is set)
 *   META_PIXEL_ACCESS_TOKEN — Meta Conversions API access token (server-side events)
 *   META_PIXEL_ID       — Meta Pixel ID (1740344890642234)
 */

const GHL_API_KEY = process.env.GHL_API_KEY || "";
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID || "f2hL1WCfLruukYmOIvhu";
const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";
const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || "";

// Meta Conversions API (server-side pixel events)
const META_PIXEL_ACCESS_TOKEN = process.env.META_PIXEL_ACCESS_TOKEN || "";
const META_PIXEL_ID = process.env.META_PIXEL_ID || "1740344890642234";

// FinanceFlo pipeline IDs (from multi-location-constants.js)
const PIPELINE_IDS = {
  erpSales: "Q59tDsy122B778g1gPip",
  newLeads: "owPsuKjXQcXs2qQ1WuyB",
  coldOutbound: "t9CymN9iv7fwDaGEyDL8",
};

// Calendar IDs
const CALENDAR_IDS = {
  discoveryCall: "zO9pKBvIAqGJtHTfX0NP",
  strategyCall: "OoDgv1r9U6994V0VjeX2",
};

// ─── GHL API HELPERS ──────────────────────────────────────────────────────

async function ghlApiRequest(
  method: string,
  endpoint: string,
  body?: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data?: any; error?: string }> {
  if (!GHL_API_KEY) {
    return { ok: false, status: 0, error: "No GHL_API_KEY configured" };
  }

  try {
    const response = await axios({
      method,
      url: `${GHL_BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: GHL_API_VERSION,
        "Content-Type": "application/json",
      },
      data: body,
      timeout: 15000,
    });

    return { ok: true, status: response.status, data: response.data };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      // Rate limited — wait and retry once
      if (error.response.status === 429) {
        const retryAfter = parseInt(
          error.response.headers["retry-after"] || "10",
          10
        );
        console.warn(`[GHL API] Rate limited, waiting ${retryAfter}s...`);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        try {
          const retryRes = await axios({
            method,
            url: `${GHL_BASE_URL}${endpoint}`,
            headers: {
              Authorization: `Bearer ${GHL_API_KEY}`,
              Version: GHL_API_VERSION,
              "Content-Type": "application/json",
            },
            data: body,
            timeout: 15000,
          });
          return { ok: true, status: retryRes.status, data: retryRes.data };
        } catch (retryErr: unknown) {
          const msg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          return { ok: false, status: 429, error: msg };
        }
      }
      return {
        ok: false,
        status: error.response.status,
        error: JSON.stringify(error.response.data),
      };
    }
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, status: 0, error: msg };
  }
}

// ─── CREATE OR UPDATE GHL CONTACT ─────────────────────────────────────────

interface GHLContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
  source?: string;
  customFields?: Array<{ id: string; field_value: string }>;
}

export async function createGHLContact(
  input: GHLContactInput
): Promise<{ contactId: string | null; isNew: boolean }> {
  if (!GHL_API_KEY) {
    console.warn("[GHL] No API key — skipping contact creation");
    return { contactId: null, isNew: false };
  }

  const body: Record<string, unknown> = {
    locationId: GHL_LOCATION_ID,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    source: input.source || "financeflo.ai",
    tags: [
      "financeflo-lead",
      "rev-financeflo",
      "assessment-completed",
      ...(input.tags || []),
    ],
  };

  if (input.phone) body.phone = input.phone;
  if (input.companyName) body.companyName = input.companyName;
  if (input.customFields) body.customField = input.customFields;

  // Try to create the contact
  const res = await ghlApiRequest("POST", "/contacts/", body);

  if (res.ok && res.data?.contact?.id) {
    console.log(
      `[GHL] Contact created: ${res.data.contact.id} (${input.email})`
    );
    return { contactId: res.data.contact.id, isNew: true };
  }

  // If contact already exists (GHL returns 400 for duplicates), search and update
  if (res.status === 400 || res.status === 422) {
    console.log(`[GHL] Contact may exist, searching: ${input.email}`);
    const searchRes = await ghlApiRequest(
      "GET",
      `/contacts/search/duplicate?locationId=${GHL_LOCATION_ID}&email=${encodeURIComponent(input.email)}`
    );

    if (searchRes.ok && searchRes.data?.contact?.id) {
      const existingId = searchRes.data.contact.id;
      // Update with latest tags
      const existingTags = searchRes.data.contact.tags || [];
      const tagSet = new Set([
        ...existingTags,
        "financeflo-lead",
        "rev-financeflo",
        "assessment-completed",
        ...(input.tags || []),
      ]);
      const newTags = Array.from(tagSet);

      await ghlApiRequest("PUT", `/contacts/${existingId}`, {
        tags: newTags,
        ...(input.companyName ? { companyName: input.companyName } : {}),
      });

      console.log(`[GHL] Contact updated: ${existingId} (${input.email})`);
      return { contactId: existingId, isNew: false };
    }
  }

  console.error(
    `[GHL] Contact creation failed: ${res.error || res.status}`
  );
  return { contactId: null, isNew: false };
}

// ─── CREATE GHL OPPORTUNITY ───────────────────────────────────────────────

export async function createGHLOpportunity(
  contactId: string,
  input: {
    name: string;
    pipelineId?: string;
    monetaryValue?: number;
    status?: string;
  }
): Promise<string | null> {
  if (!GHL_API_KEY || !contactId) return null;

  const pipelineId = input.pipelineId || PIPELINE_IDS.newLeads;

  // Get pipeline stages to find the first stage
  const pipelineRes = await ghlApiRequest(
    "GET",
    `/opportunities/pipelines/${pipelineId}`
  );
  if (!pipelineRes.ok || !pipelineRes.data?.stages?.length) {
    console.warn(`[GHL] Could not get pipeline stages for ${pipelineId}`);
    return null;
  }

  const firstStageId = pipelineRes.data.stages[0].id;

  const res = await ghlApiRequest("POST", "/opportunities/", {
    pipelineId,
    locationId: GHL_LOCATION_ID,
    name: input.name,
    pipelineStageId: firstStageId,
    contactId,
    status: input.status || "open",
    monetaryValue: input.monetaryValue || 0,
    source: "AI Readiness Assessment",
  });

  if (res.ok && res.data?.opportunity?.id) {
    console.log(
      `[GHL] Opportunity created: ${res.data.opportunity.id} (${input.name})`
    );
    return res.data.opportunity.id;
  }

  console.warn(
    `[GHL] Opportunity creation failed: ${res.error || res.status}`
  );
  return null;
}

// ─── META CONVERSIONS API (SERVER-SIDE) ───────────────────────────────────

export async function fireMetaCAPI(
  eventName: string,
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    country?: string;
  },
  customData?: Record<string, unknown>
): Promise<void> {
  if (!META_PIXEL_ACCESS_TOKEN || !META_PIXEL_ID) {
    console.warn("[Meta CAPI] No access token or pixel ID configured");
    return;
  }

  try {
    // Hash user data for Meta CAPI (SHA-256)
    const crypto = await import("crypto");
    const hash = (v: string) =>
      crypto.createHash("sha256").update(v.toLowerCase().trim()).digest("hex");

    const user_data: Record<string, string> = {};
    if (userData.email) user_data.em = hash(userData.email);
    if (userData.phone) user_data.ph = hash(userData.phone);
    if (userData.firstName) user_data.fn = hash(userData.firstName);
    if (userData.lastName) user_data.ln = hash(userData.lastName);
    if (userData.country) user_data.country = hash(userData.country);

    const eventData: Record<string, unknown> = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: "https://financeflo.ai/assessment",
      user_data,
    };

    if (customData) {
      eventData.custom_data = customData;
    }

    await axios.post(
      `https://graph.facebook.com/v25.0/${META_PIXEL_ID}/events`,
      {
        data: [eventData],
        access_token: META_PIXEL_ACCESS_TOKEN,
      },
      { timeout: 10000 }
    );

    console.log(`[Meta CAPI] Event sent: ${eventName}`);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Meta CAPI] Failed: ${eventName} — ${msg}`);
  }
}

// ─── WEBHOOK FALLBACK ─────────────────────────────────────────────────────

export async function sendToGHL(
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  // If we have direct API access, use it for contact creation events
  if (GHL_API_KEY && eventType === "lead_created") {
    const { contactId } = await createGHLContact({
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      email: payload.email as string,
      phone: payload.phone as string | undefined,
      companyName: payload.company as string | undefined,
      source: (payload.source as string) || "financeflo.ai",
      tags: (payload.tags as string[]) || [],
    });

    // Also fire Meta CAPI Lead event from server
    await fireMetaCAPI(
      "Lead",
      {
        email: payload.email as string,
        phone: payload.phone as string | undefined,
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
      },
      {
        content_name: "AI Readiness Assessment",
        lead_event_source: "financeflo.ai",
      }
    );

    if (contactId) {
      payload.ghlContactId = contactId;
    }
  }

  // If we have API key and this is an assessment_completed event, create opportunity
  if (GHL_API_KEY && eventType === "assessment_completed") {
    const ghlContactId = payload.ghlContactId as string;
    if (ghlContactId) {
      await createGHLOpportunity(ghlContactId, {
        name: `Assessment Lead — ${payload.recommendedTier || "audit"}`,
        pipelineId: PIPELINE_IDS.newLeads,
        monetaryValue: (payload.costOfInaction as number) || 0,
      });
    }

    // Fire Meta CAPI CompleteRegistration from server
    await fireMetaCAPI("CompleteRegistration", {
      email: payload.email as string,
    }, {
      content_name: "AI Readiness Assessment - Completed",
      value: payload.costOfInaction,
      currency: "GBP",
    });
  }

  // Still send webhook for any additional GHL workflow automations
  if (!GHL_WEBHOOK_URL) {
    console.warn("[GHL] No webhook URL configured, skipping webhook:", eventType);
    await logWebhookEvent({
      eventType,
      entityId: (payload.leadId as number) || null,
      payload,
      responseStatus: null,
      success: GHL_API_KEY ? 1 : 0, // If API key was used, still log as success
      errorMessage: GHL_API_KEY ? null : "No GHL_WEBHOOK_URL configured",
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

// Export constants for use in other modules
export { CALENDAR_IDS, PIPELINE_IDS, GHL_LOCATION_ID };
