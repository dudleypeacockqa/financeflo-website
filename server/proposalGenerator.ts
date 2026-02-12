import { invokeLLM } from "./llm";
import type { Lead, Assessment } from "../drizzle/schema";
import {
  type Region,
  REGION_CONFIGS,
  formatCurrency,
  formatRange,
  PRICING_DISCLAIMER,
} from "../shared/pricing";

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
  region: Region;
  currency: string;
  currencySymbol: string;
  pricingDisclaimer: string;
}

/**
 * Detect region from assessment answers or default to UK
 */
function detectRegion(assessment: Assessment): Region {
  const answers = assessment.answers as Record<string, string> | null;
  if (answers?.region && ["UK", "EU", "ZA"].includes(answers.region)) {
    return answers.region as Region;
  }
  return "UK";
}

export async function generateProposalContent(
  lead: Lead,
  assessment: Assessment
): Promise<ProposalContent> {
  const constraintScores = assessment.constraintScores as Record<string, number>;
  const costOfInaction = assessment.costOfInaction ?? 0;
  const region = detectRegion(assessment);
  const config = REGION_CONFIGS[region];

  const prompt = `You are a senior AI consultant at FinanceFlo.ai. Generate a structured proposal for the following prospect.

PROSPECT:
- Name: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company || "Not specified"}
- Job Title: ${lead.jobTitle || "Not specified"}
- Industry: ${lead.industry || "Not specified"}
- Company Size: ${lead.companySize || "Not specified"}
- Region: ${config.label}

ASSESSMENT RESULTS:
- Overall Score: ${assessment.overallScore}/100
- Primary Constraint: ${assessment.primaryConstraint}
- Constraint Scores: ${JSON.stringify(constraintScores)}
- Cost of Inaction (annual): ${config.currencySymbol}${costOfInaction.toLocaleString()}
- Recommended Tier: ${assessment.recommendedTier}

PRICING CONTEXT (${config.currency}):
- AI Operations Audit: ${formatRange(config.auditRange, region)}
- Monthly Retainer: ${formatRange(config.retainerRange, region)}/mo
- Market context: ${config.marketContext}

Generate a professional proposal with:
1. Executive summary (2-3 paragraphs)
2. Constraint diagnosis with specific recommendations
3. Recommended solution (Sage Intacct + AI) with deliverables and timeline
4. ROI projection with realistic numbers based on the Cost of Inaction
5. Indicative pricing in ${config.currency} (${config.currencySymbol})
6. Clear next steps

Use the ADAPT Framework (Assess, Design, Automate, Pilot, Transform) and QDOAA methodology.
Be specific but realistic. Use ${config.currency} (${config.currencySymbol}) for ALL monetary values.
All pricing is indicative, not fixed, and excludes ${config.taxLabel}.

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "title": "string",
  "executiveSummary": "string (2-3 paragraphs)",
  "constraintDiagnosis": {
    "primaryConstraint": "string",
    "constraintBreakdown": {"capacity": number, "knowledge": number, "process": number, "scale": number},
    "costOfInaction": number
  },
  "recommendedSolution": {
    "tier": "string",
    "description": "string",
    "deliverables": ["string"],
    "timeline": "string"
  },
  "roiProjection": {
    "year1Savings": number,
    "year3Savings": number,
    "roiMultiple": number,
    "paybackMonths": number
  },
  "pricingIndicative": {
    "auditFee": "string (formatted currency)",
    "implementationRange": "string",
    "monthlyRetainer": "string"
  },
  "nextSteps": ["string"],
  "estimatedValue": number
}`;

  try {
    const rawContent = await invokeLLM({
      systemPrompt: `You are a senior AI consultant at FinanceFlo.ai specialising in Sage Intacct implementations and AI-powered financial transformation. Return valid JSON only. Use ${config.currency} (${config.currencySymbol}) for all monetary values.`,
      userPrompt: prompt,
      maxTokens: 4096,
    });

    const parsed = JSON.parse(rawContent) as Omit<ProposalContent, 'region' | 'currency' | 'currencySymbol' | 'pricingDisclaimer'>;
    return {
      ...parsed,
      region,
      currency: config.currency,
      currencySymbol: config.currencySymbol,
      pricingDisclaimer: PRICING_DISCLAIMER,
    };
  } catch (error) {
    console.error("[ProposalGenerator] LLM call failed:", error);
    // Return a fallback proposal structure with region-appropriate pricing
    return {
      title: `AI-Powered Financial Transformation Proposal for ${lead.company || lead.firstName}`,
      executiveSummary: `Based on our assessment, ${lead.company || "your organisation"} has significant opportunities to improve operational efficiency through AI-powered financial management. Your primary constraint is ${assessment.primaryConstraint}, and we estimate the annual cost of inaction at ${formatCurrency(costOfInaction, region)}.`,
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
        auditFee: formatRange(config.auditRange, region),
        implementationRange: `${formatCurrency(config.auditRange[1] * 2, region)} – ${formatCurrency(config.auditRange[1] * 5, region)}`,
        monthlyRetainer: `${formatRange(config.retainerRange, region)}/mo`,
      },
      nextSteps: [
        "Schedule a 30-minute discovery call to discuss findings",
        "Conduct the AI Operations Audit (2-3 weeks)",
        "Present detailed implementation roadmap and ROI analysis",
        "Begin Quick Wins Sprint to prove value within 4-8 weeks",
      ],
      estimatedValue: Math.round(costOfInaction * 0.5),
      region,
      currency: config.currency,
      currencySymbol: config.currencySymbol,
      pricingDisclaimer: PRICING_DISCLAIMER,
    };
  }
}
