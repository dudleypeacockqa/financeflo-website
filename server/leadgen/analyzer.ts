/**
 * Lead analysis step: Claude-based profile analysis, pain/gain mapping,
 * archetype classification, and constraint identification.
 * Cost: ~$0.20 per lead.
 */
import { invokeLLM } from "../llm";
import { loadAndRenderPrompt } from "../prompts/registry";
import type { LinkedInProfileData } from "../integrations/relevanceAi";
import type { CompanyResearch } from "../integrations/perplexityAi";

export interface AnalysisResult {
  success: boolean;
  leadProfile: Record<string, unknown> | null;
  painGainAnalysis: Record<string, unknown> | null;
  archetype: string | null;
  constraintType: string | null;
  qualityScore: number | null;
  error?: string;
  costUsd: number;
}

/**
 * Analyze a lead using Claude with LinkedIn data and company research.
 * Uses the lead_profile_analysis prompt template if available, falls back to inline prompt.
 */
export async function analyzeLead(
  leadInfo: { name: string; title: string; company: string; industry: string; companySize: string },
  linkedinData: LinkedInProfileData | null,
  companyResearch: CompanyResearch | null
): Promise<AnalysisResult> {
  try {
    // Try loading prompt template from DB
    const template = await loadAndRenderPrompt("lead_profile_analysis", {
      name: leadInfo.name,
      title: leadInfo.title || "Unknown",
      company: leadInfo.company || "Unknown",
      industry: leadInfo.industry || "Unknown",
      companySize: leadInfo.companySize || "Unknown",
      linkedinData: linkedinData ? JSON.stringify(linkedinData, null, 2) : "Not available",
      companyResearch: companyResearch ? (companyResearch.rawResponse || JSON.stringify(companyResearch, null, 2)) : "Not available",
    });

    let systemPrompt: string;
    let userPrompt: string;

    if (template) {
      systemPrompt = template.systemPrompt;
      userPrompt = template.userPrompt;
    } else {
      // Fallback inline prompt
      systemPrompt = `You are an expert B2B lead analyst for FinanceFlo, an AI consultancy. Analyze leads using the 4 Engines framework (Revenue, Operations, Compliance, Data) and constraint classification (Capacity, Knowledge, Process, Scale).`;
      userPrompt = `Analyze this lead:
Name: ${leadInfo.name}
Title: ${leadInfo.title}
Company: ${leadInfo.company}
Industry: ${leadInfo.industry}

LinkedIn Data: ${linkedinData ? JSON.stringify(linkedinData, null, 2) : "Not available"}

Company Research: ${companyResearch ? companyResearch.rawResponse : "Not available"}

Return JSON with: leadProfile, painPoints (mapped to 4 Engines), constraintClassification (Capacity/Knowledge/Process/Scale), archetype (Declared Change/Active Execution/Latent Operational Friction), engagementStrategy, qualityScore (1-100).`;
    }

    const response = await invokeLLM({ systemPrompt, userPrompt, maxTokens: 4096 });

    // Parse JSON from response
    const parsed = extractJSON(response);

    return {
      success: true,
      leadProfile: parsed?.leadProfile || parsed,
      painGainAnalysis: parsed?.painPoints || parsed?.painGainAnalysis || null,
      archetype: parsed?.archetype || null,
      constraintType: parsed?.constraintClassification?.primary || parsed?.constraintClassification || null,
      qualityScore: parsed?.qualityScore || null,
      costUsd: 0.20,
    };
  } catch (error: any) {
    return {
      success: false,
      leadProfile: null,
      painGainAnalysis: null,
      archetype: null,
      constraintType: null,
      qualityScore: null,
      error: error.message,
      costUsd: 0,
    };
  }
}

/**
 * Extract JSON from an LLM response that may contain markdown code fences.
 */
function extractJSON(text: string): any {
  // Try extracting from code fence first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : text;

  try {
    return JSON.parse(jsonStr.trim());
  } catch {
    // Try to find JSON object in the text
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        return JSON.parse(objMatch[0]);
      } catch {
        return { rawAnalysis: text };
      }
    }
    return { rawAnalysis: text };
  }
}
