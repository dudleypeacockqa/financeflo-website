/**
 * LinkedIn profile scraping step of the lead research pipeline.
 * Wraps the Relevance AI integration with error handling and data normalization.
 */
import { scrapeLinkedInProfile, type LinkedInProfileData } from "../integrations/relevanceAi";

export interface ScrapeResult {
  success: boolean;
  data: LinkedInProfileData | null;
  error?: string;
  costUsd: number;
}

/**
 * Scrape a LinkedIn profile and normalize the data.
 * Cost: ~$0.05 per call.
 */
export async function scrapeLeadProfile(linkedinUrl: string): Promise<ScrapeResult> {
  if (!linkedinUrl) {
    return { success: false, data: null, error: "No LinkedIn URL provided", costUsd: 0 };
  }

  // Normalize LinkedIn URL
  const normalizedUrl = normalizeLinkedInUrl(linkedinUrl);

  try {
    const data = await scrapeLinkedInProfile(normalizedUrl);
    return { success: true, data, costUsd: 0.05 };
  } catch (error: any) {
    return { success: false, data: null, error: error.message, costUsd: 0 };
  }
}

function normalizeLinkedInUrl(url: string): string {
  // Strip trailing slashes and query parameters
  let normalized = url.trim();
  if (!normalized.startsWith("http")) {
    normalized = `https://www.linkedin.com/in/${normalized}`;
  }
  // Remove query params
  const urlObj = new URL(normalized);
  return `${urlObj.origin}${urlObj.pathname}`.replace(/\/+$/, "");
}
