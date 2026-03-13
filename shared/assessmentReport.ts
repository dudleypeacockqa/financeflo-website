import { REGION_CONFIGS, type Region } from "./pricing";

export const ASSESSMENT_REPORT_ROUTE = "/api/reports/assessment";
export const ASSESSMENT_REPORT_FILENAME =
  "financeflo-ai-readiness-assessment.pdf";

const QUESTION_ORDER = [
  "region",
  "company_size",
  "revenue_band",
  "constraint_capacity",
  "bottleneck_area",
  "scale_break",
  "current_system",
  "data_quality",
  "ai_readiness",
  "budget_timeline",
  "decision_authority",
] as const;

const QUESTION_LABELS: Record<string, string> = {
  region: "Where is your business primarily based?",
  company_size: "How many entities or companies does your group manage?",
  revenue_band: "What is your group's approximate annual revenue?",
  constraint_capacity: "Where does your business model break at scale?",
  bottleneck_area: "Where are you hitting delays or backlog right now?",
  scale_break: "What breaks if your volume doubles in the next 90 days?",
  current_system: "What is your primary accounting/ERP system?",
  data_quality:
    "How would you rate the quality and accessibility of your financial data?",
  ai_readiness: "Where is your organisation on the AI adoption journey?",
  budget_timeline:
    "What is your expected timeline for a financial system transformation?",
  decision_authority:
    "What is your role in the technology decision-making process?",
};

const ANSWER_LABELS: Record<string, Record<string, string>> = {
  region: {
    UK: "United Kingdom",
    EU: "Europe (EU / EEA)",
    ZA: "South Africa",
    US: "United States",
    CA: "Canada",
  },
  company_size: {
    single: "1 entity (single company)",
    small_group: "2-5 entities",
    mid_group: "6-15 entities",
    large_group: "16+ entities across multiple jurisdictions",
  },
  constraint_capacity: {
    capacity_high:
      "Volume is too high - team is drowning in transactions",
    knowledge_gap:
      "Inconsistent answers - tribal knowledge, no single source of truth",
    process_broken:
      "Bad handoffs - messy workflows, bottlenecks between departments",
    none: "None of these - we're operating smoothly",
  },
  bottleneck_area: {
    close: "Month-end close takes 10+ days with manual reconciliation",
    reporting:
      "Reporting - pulling data from multiple systems into spreadsheets",
    approvals:
      "Approvals - invoices, POs, and expenses stuck in email chains",
    interco: "Inter-company transactions and eliminations done manually",
  },
  scale_break: {
    everything:
      "Everything - we'd need to hire 2-3 more people immediately",
    finance:
      "Finance team would be overwhelmed, month-end would slip to 20+ days",
    manageable: "Some strain but we could manage with overtime",
    ready: "We're already built for scale - systems can handle it",
  },
  current_system: {
    manual: "Spreadsheets / Manual processes",
    entry: "Entry-level (Sage One, Xero, QuickBooks)",
    midmarket: "Mid-market (Sage 200, Sage 300, Pastel, Whimbrel)",
    enterprise: "Enterprise ERP (SAP, Oracle, Sage Intacct)",
  },
  data_quality: {
    poor: "Data is scattered across systems, often unreliable",
    fair: "Data exists but requires significant manual cleanup",
    good: "Reasonably clean data with some automation",
    excellent: "Clean, centralised, and readily accessible via APIs",
  },
  ai_readiness: {
    exploring: "Haven't started - still exploring what AI means for us",
    aware: "Aware of AI benefits but no concrete plans",
    piloting:
      "Piloting AI tools in some areas (e.g., ChatGPT, Copilot)",
    implementing: "Actively implementing AI in business processes",
  },
  budget_timeline: {
    urgent: "Within 3 months - urgent need, budget approved",
    planning: "3-6 months - actively planning and evaluating",
    budgeting: "6-12 months - budgeting for next financial year",
    longterm: "12+ months - long-term consideration",
  },
  decision_authority: {
    decision_maker: "I make the final decision (CEO, CFO, COO)",
    influencer:
      "I strongly influence the decision (Finance Director, Head of IT)",
    evaluator: "I'm part of the evaluation team",
    researcher: "I'm researching options for my team",
  },
};

const ANSWER_SCORES: Record<string, Record<string, number>> = {
  region: {
    UK: 0,
    EU: 0,
    ZA: 0,
    US: 0,
    CA: 0,
  },
  company_size: {
    single: 1,
    small_group: 2,
    mid_group: 3,
    large_group: 4,
  },
  revenue_band: {
    under_2m: 1,
    "2m_10m": 2,
    "10m_50m": 3,
    "50m_plus": 4,
  },
  constraint_capacity: {
    capacity_high: 4,
    knowledge_gap: 4,
    process_broken: 4,
    none: 1,
  },
  bottleneck_area: {
    close: 4,
    reporting: 3,
    approvals: 3,
    interco: 4,
  },
  scale_break: {
    everything: 4,
    finance: 3,
    manageable: 2,
    ready: 1,
  },
  current_system: {
    manual: 1,
    entry: 2,
    midmarket: 3,
    enterprise: 4,
  },
  data_quality: {
    poor: 1,
    fair: 2,
    good: 3,
    excellent: 4,
  },
  ai_readiness: {
    exploring: 1,
    aware: 2,
    piloting: 3,
    implementing: 4,
  },
  budget_timeline: {
    urgent: 4,
    planning: 3,
    budgeting: 2,
    longterm: 1,
  },
  decision_authority: {
    decision_maker: 4,
    influencer: 3,
    evaluator: 2,
    researcher: 1,
  },
};

const PRIMARY_CONSTRAINT_LABELS: Record<string, string> = {
  capacity: "Capacity Constraint",
  knowledge: "Knowledge Constraint",
  process: "Process Constraint",
  scale: "Scale Constraint",
};

const RECOMMENDED_TIER_LABELS: Record<string, string> = {
  audit: "AI Operations Audit",
  quick_wins: "Strategic Engagement",
  implementation: "Full Transformation",
  retainer: "Ongoing Retainer",
};

export interface AssessmentAnswerSummaryItem {
  id: string;
  question: string;
  answer: string;
  rawValue: unknown;
}

export interface BuildAssessmentReportUrlOptions {
  download?: boolean;
  token: string;
}

function humanizeSlug(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getRevenueBandLabel(
  value: string,
  region: Region = "UK"
): string | undefined {
  const symbol = REGION_CONFIGS[region].currencySymbol;

  if (region === "ZA") {
    return {
      under_2m: `Under ${symbol}30M`,
      "2m_10m": `${symbol}30M - ${symbol}150M`,
      "10m_50m": `${symbol}150M - ${symbol}750M`,
      "50m_plus": `${symbol}750M+`,
    }[value];
  }

  return {
    under_2m: `Under ${symbol}2M`,
    "2m_10m": `${symbol}2M - ${symbol}10M`,
    "10m_50m": `${symbol}10M - ${symbol}50M`,
    "50m_plus": `${symbol}50M+`,
  }[value];
}

export function getAssessmentQuestionLabel(questionId: string): string {
  return QUESTION_LABELS[questionId] || humanizeSlug(questionId);
}

export function formatAssessmentAnswer(
  questionId: string,
  value: unknown,
  region?: Region
): string {
  if (value == null) {
    return "Not provided";
  }

  if (typeof value !== "string") {
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    return JSON.stringify(value);
  }

  if (questionId === "revenue_band") {
    return getRevenueBandLabel(value, region) || humanizeSlug(value);
  }

  return ANSWER_LABELS[questionId]?.[value] || humanizeSlug(value);
}

export function getAssessmentAnswerScore(
  questionId: string,
  value: unknown
): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return ANSWER_SCORES[questionId]?.[value];
}

export function getAssessmentRegion(
  answers: Record<string, unknown>
): Region {
  return typeof answers.region === "string" && answers.region in REGION_CONFIGS
    ? (answers.region as Region)
    : "UK";
}

export function summarizeAssessmentAnswers(
  answers: Record<string, unknown>
): AssessmentAnswerSummaryItem[] {
  const region = getAssessmentRegion(answers);
  const seen = new Set<string>();
  const summary: AssessmentAnswerSummaryItem[] = [];

  for (const questionId of QUESTION_ORDER) {
    if (!(questionId in answers)) {
      continue;
    }

    seen.add(questionId);
    summary.push({
      id: questionId,
      question: getAssessmentQuestionLabel(questionId),
      answer: formatAssessmentAnswer(questionId, answers[questionId], region),
      rawValue: answers[questionId],
    });
  }

  for (const [questionId, value] of Object.entries(answers)) {
    if (seen.has(questionId)) {
      continue;
    }

    summary.push({
      id: questionId,
      question: getAssessmentQuestionLabel(questionId),
      answer: formatAssessmentAnswer(questionId, value, region),
      rawValue: value,
    });
  }

  return summary;
}

export function getPrimaryConstraintLabel(primaryConstraint: string): string {
  return (
    PRIMARY_CONSTRAINT_LABELS[primaryConstraint] ||
    humanizeSlug(primaryConstraint)
  );
}

export function getRecommendedTierLabel(recommendedTier: string): string {
  return (
    RECOMMENDED_TIER_LABELS[recommendedTier] ||
    humanizeSlug(recommendedTier)
  );
}

export function buildAssessmentExecutiveSummary(input: {
  companyName?: string;
  costOfInaction?: number | null;
  overallScore: number;
  primaryConstraint: string;
  recommendedTier: string;
}): string {
  const companyName = input.companyName || "this organisation";
  const primaryConstraint = getPrimaryConstraintLabel(
    input.primaryConstraint
  ).toLowerCase();
  const recommendedTier = getRecommendedTierLabel(input.recommendedTier);
  const costLine =
    typeof input.costOfInaction === "number"
      ? ` The estimated annual cost of inaction is ${input.costOfInaction.toLocaleString()}.`
      : "";

  return `${companyName} scored ${input.overallScore}/100 on the AI readiness assessment, with ${primaryConstraint} identified as the main blocker to scale.${costLine} The recommended next step is ${recommendedTier}.`;
}

export function buildAssessmentAnswersText(
  answerSummary: AssessmentAnswerSummaryItem[]
): string {
  return answerSummary
    .map((item) => `${item.question}: ${item.answer}`)
    .join("\n");
}

export function buildAssessmentReportUrl(
  options: BuildAssessmentReportUrlOptions
): string {
  const params = new URLSearchParams();
  params.set("token", options.token);

  if (options.download) {
    params.set("download", "1");
  }

  return `${ASSESSMENT_REPORT_ROUTE}?${params.toString()}`;
}
