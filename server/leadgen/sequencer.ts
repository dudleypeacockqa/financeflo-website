/**
 * DM sequence generation step: creates personalized LinkedIn outreach
 * sequences based on lead analysis.
 * Generates: connection request + 3 DMs + quality review.
 */
import { invokeLLM } from "../llm";
import { loadAndRenderPrompt } from "../prompts/registry";

export interface DmSequence {
  connectionRequest: string;
  dm1: string;
  dm2: string;
  dm3: string;
  qualityNotes?: string;
}

export interface SequencerResult {
  success: boolean;
  sequence: DmSequence | null;
  error?: string;
  costUsd: number;
}

/**
 * Generate a 3-DM sequence + connection request for a lead.
 */
export async function generateDmSequence(
  leadProfile: Record<string, unknown>,
  painPoints: Record<string, unknown> | null,
  constraintType: string | null,
  archetype: string | null
): Promise<SequencerResult> {
  try {
    // Try loading prompt template from DB
    const template = await loadAndRenderPrompt("dm_sequence_generator", {
      leadProfile: JSON.stringify(leadProfile, null, 2),
      painPoints: painPoints ? JSON.stringify(painPoints, null, 2) : "Not analyzed",
      constraintType: constraintType || "Unknown",
      archetype: archetype || "Unknown",
    });

    let systemPrompt: string;
    let userPrompt: string;

    if (template) {
      systemPrompt = template.systemPrompt;
      userPrompt = template.userPrompt;
    } else {
      systemPrompt = `You are a LinkedIn outreach specialist for FinanceFlo. Write authentic, conversational messages that reference specific details. Never be salesy or generic. Focus on starting conversations, not closing deals.`;
      userPrompt = `Generate a LinkedIn outreach sequence based on this lead analysis:

Profile: ${JSON.stringify(leadProfile, null, 2)}
Pain Points: ${painPoints ? JSON.stringify(painPoints, null, 2) : "Not analyzed"}
Constraint Type: ${constraintType || "Unknown"}
Archetype: ${archetype || "Unknown"}

Return JSON with: connectionRequest (max 300 chars), dm1, dm2, dm3, qualityNotes.`;
    }

    const response = await invokeLLM({ systemPrompt, userPrompt, maxTokens: 2048 });

    const parsed = extractJSON(response);

    const sequence: DmSequence = {
      connectionRequest: parsed?.connectionRequest || "",
      dm1: parsed?.dm1 || "",
      dm2: parsed?.dm2 || "",
      dm3: parsed?.dm3 || "",
      qualityNotes: parsed?.qualityNotes,
    };

    return { success: true, sequence, costUsd: 0.15 };
  } catch (error: any) {
    return { success: false, sequence: null, error: error.message, costUsd: 0 };
  }
}

function extractJSON(text: string): any {
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : text;
  try {
    return JSON.parse(jsonStr.trim());
  } catch {
    const objMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch { return null; }
    }
    return null;
  }
}
