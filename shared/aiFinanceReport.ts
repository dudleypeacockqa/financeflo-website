export const AI_FINANCE_REPORT_ROUTE = "/api/reports/ai-in-finance";
export const AI_FINANCE_REPORT_FILENAME =
  "financeflo-ai-in-finance-report.pdf";

export const AI_FINANCE_REPORT = {
  title: "Navigating the AI Revolution",
  subtitle: "A CFO's Strategic Guide",
  fullTitle: "Navigating the AI Revolution: A CFO's Strategic Guide",
  editionLabel: "Free Report - 2026 Edition",
  lengthLabel: "32 pages",
  readTimeLabel: "15 min read",
  updatedLabel: "Updated February 2026",
  description:
    "Most AI projects fail because they automate the wrong things. This report shows finance leaders how to diagnose constraints first, apply the QDOAA framework, and build AI programmes that produce measurable ROI.",
} as const;

export const AI_FINANCE_REPORT_HIGHLIGHTS = [
  "Constraint-based diagnosis: identify where your business breaks at scale",
  "The ADAPT and QDOAA frameworks for structured AI adoption",
  "Top 5 challenges CFOs face and how to overcome each",
  "Cost of Inaction calculator methodology and ROI levers",
  "10 practical AI use cases with real ROI metrics",
  "Why most AI projects fail and how to be in the winning minority",
] as const;

export const AI_FINANCE_REPORT_SECTIONS = [
  {
    chapter: "01",
    title: "The State of AI in Finance 2026",
    description:
      "The market shift is real: finance teams are under pressure to close faster, report with greater confidence, and operate with leaner headcount.",
    points: [
      "AI investment is rising because CFOs now need better forecasting, tighter controls, and more responsive decision support.",
      "The winners are not the teams with the most tools; they are the teams with the clearest process and data foundations.",
      "Finance leaders should treat AI as an operating model decision, not a standalone software experiment.",
    ],
  },
  {
    chapter: "02",
    title: "Why Most AI Projects Fail",
    description:
      "Failure usually starts long before model selection. Teams automate handoffs, approvals, and reporting loops that were already broken.",
    points: [
      "If the underlying workflow is unclear, AI only accelerates confusion.",
      "If ownership is weak, pilots stall after initial enthusiasm and never become operating capability.",
      "If data quality is poor, AI outputs look polished while decisions become less reliable.",
    ],
  },
  {
    chapter: "03",
    title: "The ADAPT Framework",
    description:
      "FinanceFlo's five-phase approach creates structure from diagnosis through transformation: Assess, Design, Automate, Pilot, Transform.",
    points: [
      "Assess identifies the real operational bottlenecks and quantifies the Cost of Inaction.",
      "Design reshapes the target workflow, governance, and information model before new tooling is introduced.",
      "Automate, Pilot, and Transform move from focused implementation to controlled rollout and sustained adoption.",
    ],
  },
  {
    chapter: "04",
    title: "Constraint Diagnosis",
    description:
      "The fastest route to ROI is to locate the limiting constraint: capacity, knowledge, process, or scale.",
    points: [
      "Capacity constraints show up as late close cycles, backlog, and dependency on overtime or extra headcount.",
      "Knowledge constraints show up as tribal expertise, inconsistent answers, and fragile reporting logic.",
      "Process constraints show up as handoff delays, duplicated work, and approvals trapped in email or spreadsheets.",
    ],
  },
  {
    chapter: "05",
    title: "10 Practical AI Use Cases",
    description:
      "The best opportunities are narrow enough to control but material enough to change economics quickly.",
    points: [
      "Month-end close acceleration, anomaly detection, and automated reconciliations are common high-confidence starting points.",
      "Board pack preparation, cash-flow forecasting, and dimensional reporting benefit when data definitions are stable.",
      "Document intake, query handling, and policy compliance checks can reduce workload without weakening governance.",
    ],
  },
  {
    chapter: "06",
    title: "Cost of Inaction Calculator",
    description:
      "Inaction has a measurable cost. Slow close, inconsistent reporting, manual rework, and delayed decisions compound every quarter.",
    points: [
      "Quantify wasted team capacity, missed growth, risk exposure, and execution drag separately.",
      "Use baseline cycle-time and error-rate measures so ROI can be defended after deployment.",
      "Treat Cost of Inaction as a board-level number, not a marketing estimate.",
    ],
  },
  {
    chapter: "07",
    title: "Building Your AI Roadmap",
    description:
      "A credible roadmap prioritises sequence, governance, and adoption before broad scale-up.",
    points: [
      "Start with one or two high-friction workflows where the economics are visible and the data boundary is controllable.",
      "Define ownership, approval logic, and exception handling before launch so the operating model survives contact with reality.",
      "Scale only after the pilot proves time savings, quality improvement, or throughput gains against a hard baseline.",
    ],
  },
] as const;

export interface AiFinanceReportUrlOptions {
  company?: string;
  download?: boolean;
  email?: string;
  leadId?: number;
  name?: string;
  role?: string;
}

export function buildAiFinanceReportUrl(
  options: AiFinanceReportUrlOptions = {}
): string {
  const params = new URLSearchParams();

  if (options.download) {
    params.set("download", "1");
  }

  if (options.name) {
    params.set("name", options.name);
  }

  if (options.email) {
    params.set("email", options.email);
  }

  if (typeof options.leadId === "number" && Number.isFinite(options.leadId)) {
    params.set("leadId", String(options.leadId));
  }

  if (options.company) {
    params.set("company", options.company);
  }

  if (options.role) {
    params.set("role", options.role);
  }

  const query = params.toString();
  return query
    ? `${AI_FINANCE_REPORT_ROUTE}?${query}`
    : AI_FINANCE_REPORT_ROUTE;
}
