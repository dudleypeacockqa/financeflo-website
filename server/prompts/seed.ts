/**
 * Seed initial prompt templates from the LeadGenSystem hardprompts.
 * Run once to populate the promptTemplates table.
 */
import { getDb } from "../db";
import { promptTemplates } from "../../drizzle/schema";
import type { InsertPromptTemplate } from "../../drizzle/schema";

const SEED_PROMPTS: InsertPromptTemplate[] = [
  {
    name: "lead_profile_analysis",
    category: "lead_analysis",
    description: "Analyze a LinkedIn profile and company research to build a comprehensive lead profile with pain/gain analysis using the 4 Engines framework.",
    systemPrompt: `You are an expert B2B lead analyst for FinanceFlo, an AI consultancy that helps financial services firms overcome operational constraints through AI-driven solutions. You use the 4 Engines framework (Revenue, Operations, Compliance, Data) and constraint-based analysis (Capacity, Knowledge, Process, Scale) to evaluate leads.`,
    userPromptTemplate: `Analyze this lead and provide a comprehensive profile:

**Lead Information:**
Name: {{name}}
Title: {{title}}
Company: {{company}}
Industry: {{industry}}
Company Size: {{companySize}}

**LinkedIn Data:**
{{linkedinData}}

**Company Research:**
{{companyResearch}}

Provide your analysis in JSON format with these sections:
1. leadProfile: Summary of the lead's role, responsibilities, and decision-making authority
2. painPoints: Array of specific pain points mapped to the 4 Engines (Revenue, Operations, Compliance, Data)
3. constraintClassification: Primary constraint type (Capacity, Knowledge, Process, or Scale) with reasoning
4. archetype: Lead archetype (Declared Change, Active Execution, or Latent Operational Friction)
5. engagementStrategy: Recommended approach for first contact
6. qualityScore: 1-100 score based on fit, intent signals, and engagement potential`,
    model: "claude-sonnet-4-5-20250929",
    maxTokens: 4096,
  },
  {
    name: "dm_sequence_generator",
    category: "dm_sequence",
    description: "Generate a 3-message LinkedIn DM sequence plus connection request based on lead analysis.",
    systemPrompt: `You are a LinkedIn outreach specialist for FinanceFlo. Write authentic, conversational messages that reference specific details from the lead's profile. Never be salesy or generic. Use constraint language naturally. Focus on starting conversations, not closing deals.`,
    userPromptTemplate: `Generate a LinkedIn outreach sequence for this lead:

**Lead Profile:**
{{leadProfile}}

**Pain Points:**
{{painPoints}}

**Constraint Type:** {{constraintType}}
**Archetype:** {{archetype}}

Generate:
1. connectionRequest: Short connection request message (max 300 chars)
2. dm1: First DM after connection accepted (reference specific detail, offer value)
3. dm2: Follow-up 3 days later (share relevant insight or case study)
4. dm3: Final message 5 days later (soft CTA for a call)

Each message should feel personal and reference specific details about the lead's situation.`,
    model: "claude-sonnet-4-5-20250929",
    maxTokens: 2048,
  },
  {
    name: "aiba_diagnostic",
    category: "aiba_diagnostic",
    description: "Run the AIBA (AI Business Analysis) diagnostic: Analyze operations across 4 Engines, identify constraints, build recommendations, advise on implementation.",
    systemPrompt: `You are FinanceFlo's AIBA (AI Business Analysis) diagnostic engine. AIBA is a structured methodology:
A - Analyze operations across the 4 Engines (Revenue, Operations, Compliance, Data)
I - Identify constraints using the CKPS framework (Capacity, Knowledge, Process, Scale)
B - Build recommendations using QDOAA (Quick wins, Departmental improvements, Organizational changes, AI Automation, Advanced AI)
A - Advise on implementation with AI type mapping (ML for prediction, Agentic for automation, RL for optimization)

Use constraint-based language. Distinguish between symptoms and root causes. Map every recommendation to a specific AI type with clear reasoning.`,
    userPromptTemplate: `Run a full AIBA diagnostic for this business:

**Company:** {{company}}
**Industry:** {{industry}}
**Size:** {{companySize}}

**Discovery Notes / Transcript:**
{{discoveryNotes}}

Provide your analysis in JSON format:
1. fourEngines: Analysis of each engine (Revenue, Operations, Compliance, Data) with current state, constraints found, and impact score (1-10)
2. constraintMap: Primary and secondary constraints with evidence
3. quickWins: 3-5 immediate improvements (low effort, high impact)
4. strategicRecommendations: 3-5 medium-term recommendations with QDOAA classification
5. aiRecommendations: Specific AI applications mapped to type (ML/Agentic/RL) with expected ROI
6. costOfInaction: Annual estimated cost of maintaining status quo
7. implementationRoadmap: Phased approach using ADAPT framework`,
    model: "claude-sonnet-4-5-20250929",
    maxTokens: 8192,
  },
];

/**
 * Seed prompt templates into the database.
 * Skips prompts that already exist (by name).
 */
export async function seedPromptTemplates(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Prompts] Database not available, skipping seed");
    return 0;
  }

  let seeded = 0;

  for (const prompt of SEED_PROMPTS) {
    try {
      await db.insert(promptTemplates).values(prompt).onConflictDoNothing({ target: promptTemplates.name });
      seeded++;
    } catch (error: any) {
      if (!error.message?.includes("duplicate")) {
        console.error(`[Prompts] Failed to seed "${prompt.name}":`, error.message);
      }
    }
  }

  console.log(`[Prompts] Seeded ${seeded} prompt templates`);
  return seeded;
}
