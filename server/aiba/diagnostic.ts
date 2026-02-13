/**
 * AIBA Diagnostic Engine.
 * Full 4-Engines analysis: Revenue, Operations, Compliance, Data.
 * Classifies constraints (CKPS), identifies quick wins, maps AI recommendations.
 */
import { getDb } from "../db";
import { aibaAnalyses, leads } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../llm";
import { searchKnowledge } from "../knowledge/search";

export interface DiagnosticInput {
  dealId?: number;
  leadId?: number;
  notes: string;
  companyName?: string;
  industry?: string;
}

export interface DiagnosticResult {
  analysisId: number;
  fourEngines: {
    revenue: { score: number; findings: string[]; opportunities: string[] };
    operations: { score: number; findings: string[]; opportunities: string[] };
    compliance: { score: number; findings: string[]; opportunities: string[] };
    data: { score: number; findings: string[]; opportunities: string[] };
  };
  constraintType: string;
  quickWins: { title: string; description: string; estimatedImpact: string; effort: string }[];
  strategicRecommendations: { title: string; description: string; timeline: string; investment: string }[];
  aiRecommendations: {
    ml: { applicable: boolean; useCases: string[] };
    agentic: { applicable: boolean; useCases: string[] };
    rl: { applicable: boolean; useCases: string[] };
  };
  costOfInaction: number;
  readinessScore: number;
}

/**
 * Run a full AIBA diagnostic from discovery notes or transcript.
 */
export async function runDiagnostic(input: DiagnosticInput): Promise<DiagnosticResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Create analysis record
  const rows = await db.insert(aibaAnalyses).values({
    dealId: input.dealId,
    leadId: input.leadId,
    inputNotes: input.notes,
    status: "processing",
  }).returning();
  const analysis = rows[0];

  try {
    // Get RAG context from knowledge base
    let kbContext = "";
    try {
      const kbResults = await searchKnowledge(
        `AIBA diagnostic ${input.industry || ""} business analysis constraint`, 5
      );
      kbContext = kbResults.map((r) => r.content).join("\n\n");
    } catch {
      // Knowledge base is optional
    }

    // Run the 4 Engines analysis via Claude
    const result = await analyzeWithClaude(input, kbContext);

    // Update the analysis record
    await db.update(aibaAnalyses).set({
      fourEngines: result.fourEngines,
      constraintType: result.constraintType,
      quickWins: result.quickWins,
      strategicRecommendations: result.strategicRecommendations,
      aiRecommendations: result.aiRecommendations,
      costOfInaction: result.costOfInaction,
      readinessScore: result.readinessScore,
      status: "complete",
      updatedAt: new Date(),
    }).where(eq(aibaAnalyses.id, analysis.id));

    return { analysisId: analysis.id, ...result };
  } catch (error: any) {
    await db.update(aibaAnalyses).set({
      status: "error",
      errorMessage: error.message,
      updatedAt: new Date(),
    }).where(eq(aibaAnalyses.id, analysis.id));
    throw error;
  }
}

async function analyzeWithClaude(
  input: DiagnosticInput,
  kbContext: string
): Promise<Omit<DiagnosticResult, "analysisId">> {
  const systemPrompt = `You are FinanceFlo's AIBA (AI Business Analysis) diagnostic engine. You analyze businesses using the 4 Engines framework and classify their primary constraint.

## 4 Engines Framework
1. **Revenue Engine**: Sales processes, pricing, customer acquisition, retention, revenue growth
2. **Operations Engine**: Workflows, efficiency, resource utilization, supply chain, production
3. **Compliance Engine**: Regulatory adherence, risk management, audit readiness, governance
4. **Data Engine**: Data quality, analytics capabilities, reporting, decision-making infrastructure

## CKPS Constraint Classification
- **Capacity**: They know what to do but can't do enough of it (scaling bottleneck)
- **Knowledge**: They don't know what they should be doing (strategy/insight gap)
- **Process**: They know what to do but can't do it efficiently (workflow bottleneck)
- **Scale**: They can do it well but can't replicate or grow it (growth bottleneck)

## AI Type Mapping
- **ML (Machine Learning)**: Pattern recognition, prediction, classification, forecasting
- **Agentic AI**: Task automation, workflow orchestration, decision support, autonomous processes
- **RL (Reinforcement Learning)**: Dynamic optimization, real-time adaptation, resource allocation

## Output Format
Return a JSON object with this exact structure:
{
  "fourEngines": {
    "revenue": { "score": 1-10, "findings": ["..."], "opportunities": ["..."] },
    "operations": { "score": 1-10, "findings": ["..."], "opportunities": ["..."] },
    "compliance": { "score": 1-10, "findings": ["..."], "opportunities": ["..."] },
    "data": { "score": 1-10, "findings": ["..."], "opportunities": ["..."] }
  },
  "constraintType": "capacity|knowledge|process|scale",
  "quickWins": [{ "title": "...", "description": "...", "estimatedImpact": "...", "effort": "low|medium|high" }],
  "strategicRecommendations": [{ "title": "...", "description": "...", "timeline": "...", "investment": "..." }],
  "aiRecommendations": {
    "ml": { "applicable": true/false, "useCases": ["..."] },
    "agentic": { "applicable": true/false, "useCases": ["..."] },
    "rl": { "applicable": true/false, "useCases": ["..."] }
  },
  "costOfInaction": 50000,
  "readinessScore": 65
}

Scores are 1-10 where 1=critical issues, 10=excellent. Provide 2-4 findings and opportunities per engine. Quick wins should be achievable in under 30 days. Cost of inaction is annual estimate in GBP. Readiness score is 0-100 for AI/digital transformation readiness.`;

  const contextSection = [
    input.companyName && `Company: ${input.companyName}`,
    input.industry && `Industry: ${input.industry}`,
    kbContext && `\nRelevant Knowledge Base Context:\n${kbContext.slice(0, 3000)}`,
  ].filter(Boolean).join("\n");

  const userPrompt = `${contextSection ? contextSection + "\n\n" : ""}Discovery Notes / Transcript:
${input.notes}

Analyze this business using the AIBA 4 Engines framework. Return ONLY the JSON object, no markdown formatting.`;

  const response = await invokeLLM({
    systemPrompt,
    userPrompt,
    maxTokens: 4096,
  });

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AIBA diagnostic response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    fourEngines: parsed.fourEngines,
    constraintType: parsed.constraintType || "process",
    quickWins: parsed.quickWins || [],
    strategicRecommendations: parsed.strategicRecommendations || [],
    aiRecommendations: parsed.aiRecommendations || { ml: { applicable: false, useCases: [] }, agentic: { applicable: false, useCases: [] }, rl: { applicable: false, useCases: [] } },
    costOfInaction: parsed.costOfInaction || 0,
    readinessScore: parsed.readinessScore || 50,
  };
}
