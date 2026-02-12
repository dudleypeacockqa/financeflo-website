import { invokeLLM } from "./_core/llm";
import type { Lead, Assessment } from "../drizzle/schema";

interface ProposalContent {
  title: string;
  executiveSummary: string;
  constraintDiagnosis: {
    primaryConstraint: string;
    constraintBreakdown: Record<string, number>;
    costOfInaction: number;
  };
  recommendedSolution: {
    tier: string;
    description: string;
    deliverables: string[];
    timeline: string;
  };
  roiProjection: {
    year1Savings: number;
    year3Savings: number;
    roiMultiple: number;
    paybackMonths: number;
  };
  pricingIndicative: {
    auditFee: string;
    implementationRange: string;
    monthlyRetainer: string;
  };
  nextSteps: string[];
  estimatedValue: number;
}

export async function generateProposalContent(
  lead: Lead,
  assessment: Assessment
): Promise<ProposalContent> {
  const constraintScores = assessment.constraintScores as Record<string, number>;
  const costOfInaction = assessment.costOfInaction ?? 0;

  const prompt = `You are a senior AI consultant at FinanceFlo.ai. Generate a structured proposal for the following prospect.

PROSPECT:
- Name: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company || "Not specified"}
- Job Title: ${lead.jobTitle || "Not specified"}
- Industry: ${lead.industry || "Not specified"}
- Company Size: ${lead.companySize || "Not specified"}

ASSESSMENT RESULTS:
- Overall Score: ${assessment.overallScore}/100
- Primary Constraint: ${assessment.primaryConstraint}
- Constraint Scores: ${JSON.stringify(constraintScores)}
- Cost of Inaction (annual): £${costOfInaction.toLocaleString()}
- Recommended Tier: ${assessment.recommendedTier}

Generate a professional proposal with:
1. Executive summary (2-3 paragraphs)
2. Constraint diagnosis with specific recommendations
3. Recommended solution (Sage Intacct + AI) with deliverables and timeline
4. ROI projection with realistic numbers based on the Cost of Inaction
5. Indicative pricing
6. Clear next steps

Use the ADAPT Framework (Assess, Design, Automate, Pilot, Transform) and QDOAA methodology.
Be specific but realistic. Use GBP currency.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a senior AI consultant at FinanceFlo.ai specialising in Sage Intacct implementations and AI-powered financial transformation. Return valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "proposal_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Proposal title" },
              executiveSummary: { type: "string", description: "2-3 paragraph executive summary" },
              constraintDiagnosis: {
                type: "object",
                properties: {
                  primaryConstraint: { type: "string" },
                  constraintBreakdown: {
                    type: "object",
                    properties: {
                      capacity: { type: "number" },
                      knowledge: { type: "number" },
                      process: { type: "number" },
                      scale: { type: "number" },
                    },
                    required: ["capacity", "knowledge", "process", "scale"],
                    additionalProperties: false,
                  },
                  costOfInaction: { type: "number" },
                },
                required: ["primaryConstraint", "constraintBreakdown", "costOfInaction"],
                additionalProperties: false,
              },
              recommendedSolution: {
                type: "object",
                properties: {
                  tier: { type: "string" },
                  description: { type: "string" },
                  deliverables: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                },
                required: ["tier", "description", "deliverables", "timeline"],
                additionalProperties: false,
              },
              roiProjection: {
                type: "object",
                properties: {
                  year1Savings: { type: "number" },
                  year3Savings: { type: "number" },
                  roiMultiple: { type: "number" },
                  paybackMonths: { type: "number" },
                },
                required: ["year1Savings", "year3Savings", "roiMultiple", "paybackMonths"],
                additionalProperties: false,
              },
              pricingIndicative: {
                type: "object",
                properties: {
                  auditFee: { type: "string" },
                  implementationRange: { type: "string" },
                  monthlyRetainer: { type: "string" },
                },
                required: ["auditFee", "implementationRange", "monthlyRetainer"],
                additionalProperties: false,
              },
              nextSteps: { type: "array", items: { type: "string" } },
              estimatedValue: { type: "number", description: "Total estimated project value in GBP" },
            },
            required: [
              "title", "executiveSummary", "constraintDiagnosis",
              "recommendedSolution", "roiProjection", "pricingIndicative",
              "nextSteps", "estimatedValue"
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) throw new Error("No content in LLM response");
    const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

    return JSON.parse(content) as ProposalContent;
  } catch (error) {
    console.error("[ProposalGenerator] LLM call failed:", error);
    // Return a fallback proposal structure
    return {
      title: `AI-Powered Financial Transformation Proposal for ${lead.company || lead.firstName}`,
      executiveSummary: `Based on our assessment, ${lead.company || "your organisation"} has significant opportunities to improve operational efficiency through AI-powered financial management. Your primary constraint is ${assessment.primaryConstraint}, and we estimate the annual cost of inaction at £${costOfInaction.toLocaleString()}.`,
      constraintDiagnosis: {
        primaryConstraint: assessment.primaryConstraint,
        constraintBreakdown: constraintScores,
        costOfInaction,
      },
      recommendedSolution: {
        tier: assessment.recommendedTier,
        description: "Sage Intacct multi-company implementation with custom AI solutions",
        deliverables: [
          "Current-state process mapping and constraint analysis",
          "Sage Intacct configuration and migration plan",
          "AI automation roadmap with prioritised quick wins",
          "Implementation and change management support",
        ],
        timeline: "12-16 weeks for initial implementation",
      },
      roiProjection: {
        year1Savings: Math.round(costOfInaction * 0.4),
        year3Savings: Math.round(costOfInaction * 1.8),
        roiMultiple: 3.2,
        paybackMonths: 8,
      },
      pricingIndicative: {
        auditFee: "£5,000 - £8,000",
        implementationRange: "£25,000 - £75,000",
        monthlyRetainer: "£8,000 - £15,000",
      },
      nextSteps: [
        "Schedule a 30-minute discovery call to discuss findings",
        "Conduct the AI Operations Audit (2-3 weeks)",
        "Present detailed implementation roadmap and ROI analysis",
        "Begin Quick Wins Sprint to prove value within 4-8 weeks",
      ],
      estimatedValue: Math.round(costOfInaction * 0.5),
    };
  }
}
