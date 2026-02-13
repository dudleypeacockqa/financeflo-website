/**
 * Company research step of the lead research pipeline.
 * Uses Perplexity AI for web-grounded company intelligence.
 */
import { researchCompany, type CompanyResearch } from "../integrations/perplexityAi";

export interface ResearchResult {
  success: boolean;
  data: CompanyResearch | null;
  error?: string;
  costUsd: number;
}

/**
 * Research a lead's company using Perplexity AI.
 * Cost: ~$0.10 per call.
 */
export async function researchLeadCompany(
  companyName: string,
  industry?: string,
  website?: string
): Promise<ResearchResult> {
  if (!companyName) {
    return { success: false, data: null, error: "No company name provided", costUsd: 0 };
  }

  try {
    const data = await researchCompany(companyName, industry, website);
    return { success: true, data, costUsd: 0.10 };
  } catch (error: any) {
    return { success: false, data: null, error: error.message, costUsd: 0 };
  }
}
