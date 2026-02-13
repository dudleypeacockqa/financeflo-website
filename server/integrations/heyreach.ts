/**
 * HeyReach API wrapper for LinkedIn outreach automation.
 * Handles DM sending, connection requests, and campaign sync.
 */
import axios from "axios";
import { ENV } from "../env";

const HEYREACH_API_URL = "https://api.heyreach.io/api/v1";

function getHeaders() {
  if (!ENV.heyreachApiKey) {
    throw new Error("HEYREACH_API_KEY not configured");
  }
  return {
    "X-API-KEY": ENV.heyreachApiKey,
    "Content-Type": "application/json",
  };
}

export interface HeyReachCampaign {
  id: string;
  name: string;
  status: string;
}

export interface HeyReachSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Create a campaign in HeyReach for LinkedIn outreach.
 */
export async function createHeyReachCampaign(params: {
  name: string;
  linkedinAccountId?: string;
}): Promise<HeyReachCampaign> {
  try {
    const response = await axios.post(
      `${HEYREACH_API_URL}/campaigns`,
      {
        name: params.name,
        linkedin_account_id: params.linkedinAccountId,
      },
      { headers: getHeaders(), timeout: 15000 }
    );
    return {
      id: response.data.id || response.data.campaign_id,
      name: params.name,
      status: response.data.status || "created",
    };
  } catch (error: any) {
    throw new Error(`HeyReach campaign creation failed: ${error.message}`);
  }
}

/**
 * Add leads to a HeyReach campaign by LinkedIn URL.
 */
export async function addLeadsToCampaign(
  campaignId: string,
  leads: { linkedinUrl: string; firstName: string; lastName: string }[]
): Promise<{ added: number; skipped: number }> {
  try {
    const response = await axios.post(
      `${HEYREACH_API_URL}/campaigns/${campaignId}/leads`,
      {
        leads: leads.map((l) => ({
          linkedin_url: l.linkedinUrl,
          first_name: l.firstName,
          last_name: l.lastName,
        })),
      },
      { headers: getHeaders(), timeout: 30000 }
    );
    return {
      added: response.data.added ?? leads.length,
      skipped: response.data.skipped ?? 0,
    };
  } catch (error: any) {
    throw new Error(`HeyReach add leads failed: ${error.message}`);
  }
}

/**
 * Send a LinkedIn connection request via HeyReach.
 */
export async function sendConnectionRequest(params: {
  campaignId: string;
  linkedinUrl: string;
  message: string;
}): Promise<HeyReachSendResult> {
  try {
    const response = await axios.post(
      `${HEYREACH_API_URL}/campaigns/${params.campaignId}/actions/connect`,
      {
        linkedin_url: params.linkedinUrl,
        message: params.message,
      },
      { headers: getHeaders(), timeout: 15000 }
    );
    return {
      success: true,
      messageId: response.data.message_id || response.data.id,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Send a LinkedIn DM via HeyReach.
 */
export async function sendLinkedInDm(params: {
  campaignId: string;
  linkedinUrl: string;
  message: string;
}): Promise<HeyReachSendResult> {
  try {
    const response = await axios.post(
      `${HEYREACH_API_URL}/campaigns/${params.campaignId}/actions/message`,
      {
        linkedin_url: params.linkedinUrl,
        message: params.message,
      },
      { headers: getHeaders(), timeout: 15000 }
    );
    return {
      success: true,
      messageId: response.data.message_id || response.data.id,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get campaign status and metrics from HeyReach.
 */
export async function getCampaignStatus(campaignId: string): Promise<{
  status: string;
  metrics: { sent: number; delivered: number; replied: number };
}> {
  try {
    const response = await axios.get(
      `${HEYREACH_API_URL}/campaigns/${campaignId}`,
      { headers: getHeaders(), timeout: 10000 }
    );
    return {
      status: response.data.status || "unknown",
      metrics: {
        sent: response.data.metrics?.sent ?? 0,
        delivered: response.data.metrics?.delivered ?? 0,
        replied: response.data.metrics?.replied ?? 0,
      },
    };
  } catch (error: any) {
    throw new Error(`HeyReach status check failed: ${error.message}`);
  }
}
