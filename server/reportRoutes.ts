import type { Express } from "express";
import {
  AI_FINANCE_REPORT,
  AI_FINANCE_REPORT_FILENAME,
  AI_FINANCE_REPORT_ROUTE,
  AI_FINANCE_REPORT_SECTIONS,
} from "@shared/aiFinanceReport";
import {
  ASSESSMENT_REPORT_FILENAME,
  ASSESSMENT_REPORT_ROUTE,
  buildAssessmentExecutiveSummary,
  getAssessmentAnswerScore,
  getAssessmentRegion,
  getPrimaryConstraintLabel,
  summarizeAssessmentAnswers,
} from "@shared/assessmentReport";
import {
  formatCurrency,
  formatRange,
  REGION_CONFIGS,
  type Region,
} from "@shared/pricing";
import {
  createGeneratedDocument,
  getAssessmentById,
  getLeadByEmail,
  getLeadById,
} from "./db";
import { readAssessmentReportToken } from "./assessmentReportTokens";
import { renderHtmlToPdf } from "./pdfRenderer";

interface ReportRecipient {
  company?: string;
  email?: string;
  leadId?: number;
  name?: string;
  role?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readQueryValue(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, 160);
}

function readNumericQueryValue(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function getRequestBaseUrl(
  req: { protocol?: string; headers?: Record<string, unknown> } | undefined
): string {
  if (!req?.headers) {
    return "";
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const host = forwardedHost || req.headers.host;
  const protocol =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]?.trim()
      : req.protocol || "https";

  if (typeof host !== "string" || !host) {
    return "";
  }

  return `${protocol}://${host}`;
}

function getReadinessLevel(score: number): {
  description: string;
  level: string;
  themeClass: string;
} {
  if (score >= 75) {
    return {
      description:
        "Your organisation shows strong readiness for AI-powered financial transformation. The opportunity is to accelerate and scale with discipline.",
      level: "Advanced",
      themeClass: "teal",
    };
  }

  if (score >= 50) {
    return {
      description:
        "You have workable foundations but significant constraints are limiting growth. The right intervention now prevents compounding cost.",
      level: "Developing",
      themeClass: "amber",
    };
  }

  return {
    description:
      "Critical constraints are actively costing money. This is the right moment to rebuild the underlying operating model before the cost compounds further.",
    level: "Emerging",
    themeClass: "orange",
  };
}

function getConstraintSummary(primaryConstraint: string): {
  description: string;
  label: string;
} {
  switch (primaryConstraint) {
    case "capacity":
      return {
        label: "Capacity Constraint",
        description:
          "Volume is too high for the current operating model. The goal is to increase throughput without adding proportional headcount.",
      };
    case "knowledge":
      return {
        label: "Knowledge Constraint",
        description:
          "Knowledge is fragmented across people and tools. The goal is to systematise decision logic and reduce dependency on tribal expertise.",
      };
    case "process":
      return {
        label: "Process Constraint",
        description:
          "Broken handoffs and workflow friction are slowing the business down. The goal is to redesign the flow before adding automation.",
      };
    default:
      return {
        label: "Operational Constraint",
        description:
          "Multiple issues are showing up at once. The first task is to identify the limiting constraint and sequence the intervention correctly.",
      };
  }
}

function getProspectScore(answers: Record<string, unknown>) {
  const pain = Math.min(
    3,
    Math.round(
      ([
        getAssessmentAnswerScore(
          "constraint_capacity",
          answers.constraint_capacity
        ) || 1,
        getAssessmentAnswerScore("bottleneck_area", answers.bottleneck_area) ||
          1,
        getAssessmentAnswerScore("scale_break", answers.scale_break) || 1,
      ].reduce((sum, value) => sum + value, 0) /
        3)
    )
  );
  const budget =
    getAssessmentAnswerScore("budget_timeline", answers.budget_timeline) || 1;
  const authority =
    getAssessmentAnswerScore(
      "decision_authority",
      answers.decision_authority
    ) || 1;

  return {
    authority,
    budget,
    pain,
    timing: budget,
  };
}

function getEngagementTierSummary(
  score: number,
  answers: Record<string, unknown>,
  region: Region
): {
  description: string;
  phases: Array<{ duration: string; name: string; price: string }>;
  tagline: string;
  tier: string;
} {
  const totalProspect = Object.values(getProspectScore(answers)).reduce(
    (sum, value) => sum + value,
    0
  );
  const config = REGION_CONFIGS[region];
  const auditPrice = formatRange(config.auditRange, region);
  const retainerPrice = `${formatRange(config.retainerRange, region)}/mo`;

  if (totalProspect >= 12 && score < 60) {
    return {
      description:
        "Constraint severity and readiness indicate the highest ROI from a full transformation programme: audit first, then implementation, then optimisation.",
      phases: [
        {
          duration: "2-3 weeks",
          name: "Phase 1: AI Operations Audit",
          price: auditPrice,
        },
        {
          duration: "8-16 weeks",
          name: "Phase 2: Implementation",
          price: "Scoped from audit",
        },
        {
          duration: "Monthly",
          name: "Phase 3: Ongoing Retainer",
          price: retainerPrice,
        },
      ],
      tagline: "Audit -> Implementation -> Ongoing Retainer",
      tier: "Full Transformation",
    };
  }

  if (totalProspect >= 8) {
    return {
      description:
        "Your profile shows strong potential for quick wins. Start with an audit, then implement the highest-value interventions in a focused sprint.",
      phases: [
        {
          duration: "2-3 weeks",
          name: "Phase 1: AI Operations Audit",
          price: auditPrice,
        },
        {
          duration: "4-8 weeks",
          name: "Phase 2: Quick Wins Sprint",
          price: "Scoped from audit",
        },
      ],
      tagline: "Audit + Quick Wins Implementation",
      tier: "Strategic Engagement",
    };
  }

  return {
    description:
      "The correct starting point is a focused audit that diagnoses the constraint properly, quantifies cost of inaction, and sequences the roadmap.",
    phases: [
      {
        duration: "2-3 weeks",
        name: "AI Operations Audit",
        price: auditPrice,
      },
    ],
    tagline: "AI Operations Audit + ROI Roadmap",
    tier: "Discovery Engagement",
  };
}

function getRoiLevers(
  answers: Record<string, unknown>,
  annualCost: number,
  region: Region
) {
  const levers: Array<{ amount: number; description: string; title: string }> =
    [];

  if (
    answers.bottleneck_area === "close" ||
    answers.bottleneck_area === "interco"
  ) {
    levers.push({
      amount: Math.round(annualCost * 0.35),
      description:
        "Reduce month-end close time through reconciliations, consolidation, and journal workflow automation.",
      title: "Time Saved",
    });
  }

  if ((getAssessmentAnswerScore("data_quality", answers.data_quality) || 4) <= 2) {
    levers.push({
      amount: Math.round(annualCost * 0.25),
      description:
        "Reduce manual rework, improve audit readiness, and cut data-entry error cost across entities.",
      title: "Error Reduction",
    });
  }

  if ((getAssessmentAnswerScore("scale_break", answers.scale_break) || 1) >= 3) {
    levers.push({
      amount: Math.round(annualCost * 0.3),
      description:
        "Handle materially higher transaction volume without matching headcount growth.",
      title: "Throughput Increase",
    });
  }

  levers.push({
    amount: Math.round(annualCost * 0.15),
    description:
      "Faster reporting improves decision quality and enables earlier intervention on performance issues.",
    title: "Revenue Optimisation",
  });
  levers.push({
    amount: Math.round(annualCost * 0.1),
    description:
      "Tighter controls reduce compliance exposure, operational risk, and avoidable leakage.",
    title: "Risk Avoidance",
  });

  return levers.map((lever) => ({
    ...lever,
    formattedAmount: formatCurrency(lever.amount, region),
  }));
}

function renderReadinessPips(score: number, max: number): string {
  return Array.from({ length: max }, (_, index) => {
    const active = index < score;

    return `<span class="pip ${active ? "pip-active" : ""}"></span>`;
  }).join("");
}

async function resolveLeadForAiFinanceReport(recipient: ReportRecipient) {
  if (recipient.leadId) {
    const lead = await getLeadById(recipient.leadId);
    if (lead) {
      return lead;
    }
  }

  if (recipient.email) {
    return getLeadByEmail(recipient.email);
  }

  return undefined;
}

async function persistGeneratedPdfCopy(input: {
  assessmentId?: number;
  filename: string;
  leadId: number;
  mimeType: string;
  pdf: Buffer;
  proposalId?: number;
  recipientSnapshot?: Record<string, unknown>;
  sourceUrl?: string;
  type: "ai_finance_report" | "assessment_report" | "proposal_pdf";
}) {
  await createGeneratedDocument({
    assessmentId: input.assessmentId ?? null,
    filename: input.filename,
    fileData: input.pdf,
    leadId: input.leadId,
    mimeType: input.mimeType,
    proposalId: input.proposalId ?? null,
    recipientSnapshot: input.recipientSnapshot,
    sourceUrl: input.sourceUrl,
    type: input.type,
  });
}

function renderPreparedFor(recipient: ReportRecipient): string {
  const parts = [recipient.name, recipient.role, recipient.company].filter(
    Boolean
  );

  if (!parts.length && !recipient.email) {
    return `<p class="recipient-copy">Prepared for finance leaders building a disciplined AI roadmap.</p>`;
  }

  return `
    <div class="recipient-card">
      <span class="eyebrow">Prepared for</span>
      <h2>${escapeHtml(
        parts.join(" - ") || recipient.email || "Finance team"
      )}</h2>
      ${
        recipient.email
          ? `<p>${escapeHtml(recipient.email)}</p>`
          : `<p>FinanceFlo.ai report delivery</p>`
      }
    </div>
  `;
}

function renderReportHtml(recipient: ReportRecipient): string {
  const generatedOn = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const sections = AI_FINANCE_REPORT_SECTIONS.map(
    (section) => `
      <section class="section">
        <div class="section-header">
          <span class="chapter">${section.chapter}</span>
          <div>
            <h3>${escapeHtml(section.title)}</h3>
            <p>${escapeHtml(section.description)}</p>
          </div>
        </div>
        <ul>
          ${section.points
            .map((point) => `<li>${escapeHtml(point)}</li>`)
            .join("")}
        </ul>
      </section>
    `
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(AI_FINANCE_REPORT.fullTitle)} | FinanceFlo.ai</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #051220;
        --panel: #0b1e30;
        --panel-soft: rgba(11, 30, 48, 0.74);
        --text: #ebf4ff;
        --muted: #9db4ca;
        --teal: #15d4d4;
        --amber: #ffbe55;
        --line: rgba(21, 212, 212, 0.18);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background:
          radial-gradient(circle at top, rgba(21, 212, 212, 0.18), transparent 32%),
          linear-gradient(180deg, #04101d 0%, #071624 45%, #04101d 100%);
        color: var(--text);
      }

      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 56px 24px 80px;
      }

      .cover,
      .section,
      .summary {
        background: var(--panel-soft);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(8px);
      }

      .cover {
        padding: 40px;
        margin-bottom: 28px;
      }

      .summary {
        padding: 28px 32px;
        margin-bottom: 28px;
      }

      .section {
        padding: 28px 32px;
        margin-bottom: 20px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .eyebrow {
        display: inline-block;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 12px;
        color: var(--teal);
      }

      h1,
      h2,
      h3,
      p,
      li {
        margin: 0;
      }

      h1 {
        font-size: clamp(38px, 6vw, 62px);
        line-height: 1.02;
        margin-top: 14px;
        max-width: 12ch;
      }

      .subtitle {
        color: var(--amber);
      }

      .cover-copy {
        max-width: 760px;
        font-size: 18px;
        line-height: 1.7;
        color: var(--muted);
        margin-top: 22px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-top: 28px;
      }

      .meta-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 18px;
        padding: 16px 18px;
      }

      .meta-card strong {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
      }

      .meta-card span {
        color: var(--muted);
        font-size: 14px;
      }

      .recipient-card {
        margin-top: 28px;
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(21, 212, 212, 0.08);
        border: 1px solid rgba(21, 212, 212, 0.18);
      }

      .recipient-card h2 {
        margin-top: 8px;
        font-size: 24px;
      }

      .recipient-card p,
      .recipient-copy,
      .summary p,
      .section-header p,
      li,
      footer p {
        color: var(--muted);
        line-height: 1.7;
      }

      .summary h2 {
        font-size: 24px;
        margin-bottom: 14px;
      }

      .summary ul {
        margin: 18px 0 0;
        padding-left: 20px;
      }

      .summary li + li,
      .section li + li {
        margin-top: 10px;
      }

      .section-header {
        display: grid;
        grid-template-columns: 78px 1fr;
        gap: 18px;
        align-items: start;
        margin-bottom: 18px;
      }

      .chapter {
        font-size: 28px;
        font-weight: 700;
        color: rgba(21, 212, 212, 0.6);
      }

      .section h3 {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .section ul {
        margin: 0;
        padding-left: 20px;
      }

      footer {
        padding-top: 12px;
        text-align: center;
      }

      @media print {
        body {
          background: #fff;
          color: #111827;
        }

        .cover,
        .summary,
        .section {
          background: #fff;
          border-color: #dbe5ef;
          box-shadow: none;
        }

        .eyebrow,
        .chapter {
          color: #0f766e;
        }

        .subtitle {
          color: #92400e;
        }

        .cover-copy,
        .recipient-card p,
        .recipient-copy,
        .summary p,
        .section-header p,
        li,
        footer p,
        .meta-card span {
          color: #475569;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="cover">
        <span class="eyebrow">${escapeHtml(AI_FINANCE_REPORT.editionLabel)}</span>
        <h1>
          ${escapeHtml(AI_FINANCE_REPORT.title)}
          <span class="subtitle">${escapeHtml(
            `: ${AI_FINANCE_REPORT.subtitle}`
          )}</span>
        </h1>
        <p class="cover-copy">${escapeHtml(AI_FINANCE_REPORT.description)}</p>
        <div class="meta-grid">
          <div class="meta-card">
            <strong>Length</strong>
            <span>${escapeHtml(AI_FINANCE_REPORT.lengthLabel)}</span>
          </div>
          <div class="meta-card">
            <strong>Read Time</strong>
            <span>${escapeHtml(AI_FINANCE_REPORT.readTimeLabel)}</span>
          </div>
          <div class="meta-card">
            <strong>Edition</strong>
            <span>${escapeHtml(AI_FINANCE_REPORT.updatedLabel)}</span>
          </div>
          <div class="meta-card">
            <strong>Generated</strong>
            <span>${escapeHtml(generatedOn)}</span>
          </div>
        </div>
        ${renderPreparedFor(recipient)}
      </section>

      <section class="summary">
        <span class="eyebrow">Executive Summary</span>
        <h2>How to use this report</h2>
        <p>
          Use this guide to separate AI theatre from operational leverage. The
          report is designed to help finance leaders diagnose the real limiting
          constraint, sequence interventions properly, and justify investment
          with defensible ROI logic.
        </p>
        <ul>
          <li>Start with the chapter on project failure to avoid automating broken work.</li>
          <li>Use the constraint diagnosis section to identify where scale breaks first.</li>
          <li>Apply the roadmap section only after workflow ownership and data boundaries are clear.</li>
        </ul>
      </section>

      ${sections}

      <footer>
        <p>${escapeHtml(AI_FINANCE_REPORT.fullTitle)}</p>
        <p>FinanceFlo.ai &middot; Constraint diagnosis before automation</p>
      </footer>
    </main>
  </body>
</html>`;
}

function renderAssessmentReportHtml(input: {
  assessment: {
    answers: Record<string, unknown>;
    constraintScores: Record<string, number>;
    costOfInaction: number | null;
    createdAt: Date;
    id: number;
    overallScore: number;
    primaryConstraint: string;
    recommendedTier: string;
  };
  baseUrl?: string;
  lead?: {
    company?: string | null;
    email?: string | null;
    firstName: string;
    lastName: string;
    jobTitle?: string | null;
  };
}): string {
  const { assessment, lead } = input;
  const region = getAssessmentRegion(assessment.answers);
  const generatedOn = assessment.createdAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const bookingUrl = `${
    input.baseUrl || ""
  }/booking/erp-consultation?source=assessment-report&assessmentId=${
    assessment.id
  }`;
  const answerSummary = summarizeAssessmentAnswers(assessment.answers);
  const executiveSummary = buildAssessmentExecutiveSummary({
    companyName: lead?.company || undefined,
    costOfInaction: assessment.costOfInaction,
    overallScore: assessment.overallScore,
    primaryConstraint: assessment.primaryConstraint,
    recommendedTier: assessment.recommendedTier,
  });
  const contactName = [lead?.firstName, lead?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const preparedFor = [contactName, lead?.jobTitle, lead?.company]
    .filter(Boolean)
    .join(" - ");
  const readiness = getReadinessLevel(assessment.overallScore);
  const constraint = getConstraintSummary(assessment.primaryConstraint);
  const roiLevers = getRoiLevers(
    assessment.answers,
    assessment.costOfInaction ?? 0,
    region
  );
  const totalRoi = roiLevers.reduce((sum, lever) => sum + lever.amount, 0);
  const engagement = getEngagementTierSummary(
    assessment.overallScore,
    assessment.answers,
    region
  );
  const readinessProfile = getProspectScore(assessment.answers);
  const constraintScores = Object.entries(assessment.constraintScores || {})
    .sort((a, b) => b[1] - a[1])
    .map(
      ([key, score]) => `
        <div class="metric-card compact-card">
          <strong>${escapeHtml(getPrimaryConstraintLabel(key))}</strong>
          <span>${escapeHtml(String(score))}/100</span>
        </div>
      `
    )
    .join("");
  const roiMarkup = roiLevers
    .map(
      (lever) => `
        <div class="metric-card roi-card">
          <strong>${escapeHtml(lever.title)}</strong>
          <span>${escapeHtml(lever.formattedAmount)}/yr</span>
          <p>${escapeHtml(lever.description)}</p>
        </div>
      `
    )
    .join("");
  const engagementMarkup = engagement.phases
    .map(
      (phase, index) => `
        <div class="phase-card">
          <div class="phase-index">${index + 1}</div>
          <div class="phase-copy">
            <h3>${escapeHtml(phase.name)}</h3>
            <p>${escapeHtml(phase.duration)}</p>
          </div>
          <div class="phase-price">${escapeHtml(phase.price)}</div>
        </div>
      `
    )
    .join("");
  const answersMarkup = answerSummary
    .map(
      (item) => `
        <tr>
          <th>${escapeHtml(item.question)}</th>
          <td>${escapeHtml(item.answer)}</td>
        </tr>
      `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Assessment Report | FinanceFlo.ai</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #051220;
        --panel: rgba(11, 30, 48, 0.84);
        --panel-soft: rgba(255, 255, 255, 0.03);
        --text: #ebf4ff;
        --muted: #9db4ca;
        --teal: #15d4d4;
        --amber: #ffbe55;
        --orange: #fb923c;
        --line: rgba(21, 212, 212, 0.18);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background:
          radial-gradient(circle at top, rgba(21, 212, 212, 0.16), transparent 34%),
          linear-gradient(180deg, #04101d 0%, #071624 45%, #04101d 100%);
        color: var(--text);
      }

      main {
        max-width: 980px;
        margin: 0 auto;
        padding: 56px 24px 80px;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 24px;
        box-shadow: 0 16px 50px rgba(0, 0, 0, 0.24);
        backdrop-filter: blur(8px);
        margin-bottom: 24px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .cover {
        padding: 40px;
      }

      .section {
        padding: 28px 32px;
      }

      .section-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }

      .eyebrow {
        display: inline-block;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-size: 12px;
        color: var(--teal);
      }

      h1,
      h2,
      h3,
      p,
      ul,
      li {
        margin: 0;
      }

      h1 {
        font-size: clamp(34px, 5vw, 54px);
        line-height: 1.05;
        margin-top: 14px;
        max-width: 12ch;
      }

      h2 {
        font-size: 24px;
        margin-bottom: 14px;
      }

      .subtitle {
        color: var(--amber);
      }

      .cover-copy,
      .body-copy,
      .contact-card p,
      .metric-card strong,
      .metric-card p,
      th,
      td,
      footer p {
        color: var(--muted);
        line-height: 1.7;
      }

      .cover-copy {
        font-size: 18px;
        margin-top: 20px;
        max-width: 760px;
      }

      .meta-grid,
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-top: 24px;
      }

      .meta-card,
      .metric-card {
        background: var(--panel-soft);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 18px;
        padding: 16px 18px;
      }

      .meta-card strong,
      .metric-card span {
        display: block;
        color: var(--text);
      }

      .compact-card span {
        margin-top: 8px;
        font-size: 22px;
        font-weight: 700;
      }

      .score-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .score-ring {
        width: 180px;
        height: 180px;
        border-radius: 999px;
        border: 2px solid rgba(21, 212, 212, 0.22);
        background: rgba(21, 212, 212, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 12px auto 18px;
      }

      .score-ring.amber {
        border-color: rgba(255, 190, 85, 0.28);
        background: rgba(255, 190, 85, 0.08);
      }

      .score-ring.orange {
        border-color: rgba(251, 146, 60, 0.28);
        background: rgba(251, 146, 60, 0.08);
      }

      .score-value {
        font-size: 46px;
        font-weight: 700;
      }

      .score-label {
        font-size: 15px;
        font-weight: 600;
        margin-top: 6px;
      }

      .theme-teal {
        color: var(--teal);
      }

      .theme-amber {
        color: var(--amber);
      }

      .theme-orange {
        color: var(--orange);
      }

      .contact-card {
        margin-top: 24px;
        padding: 18px 20px;
        border-radius: 18px;
        background: rgba(21, 212, 212, 0.08);
        border: 1px solid rgba(21, 212, 212, 0.18);
      }

      .constraint-flag {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(255, 190, 85, 0.12);
        border: 1px solid rgba(255, 190, 85, 0.24);
        color: var(--amber);
        font-size: 12px;
        margin-bottom: 12px;
      }

      .roi-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }

      .roi-card p {
        margin-top: 12px;
        font-size: 13px;
      }

      .phase-card {
        display: grid;
        grid-template-columns: 42px 1fr auto;
        gap: 16px;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 18px;
        padding: 14px 16px;
      }

      .phase-card + .phase-card {
        margin-top: 12px;
      }

      .phase-index {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: rgba(21, 212, 212, 0.08);
        border: 1px solid rgba(21, 212, 212, 0.24);
        color: var(--teal);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }

      .phase-copy h3,
      .metric-card h3 {
        font-size: 16px;
        margin-bottom: 4px;
      }

      .phase-copy p {
        color: var(--muted);
        font-size: 13px;
      }

      .phase-price {
        color: var(--amber);
        font-weight: 700;
        font-size: 14px;
        text-align: right;
      }

      .profile-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }

      .profile-card {
        text-align: center;
      }

      .profile-card strong {
        display: block;
        font-size: 12px;
        margin-bottom: 10px;
        color: var(--text);
      }

      .pip-row {
        display: flex;
        justify-content: center;
        gap: 6px;
      }

      .pip {
        width: 12px;
        height: 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      .pip-active {
        background: var(--teal);
        border-color: rgba(21, 212, 212, 0.8);
      }

      .cta-panel {
        text-align: center;
        background:
          radial-gradient(circle at top, rgba(21, 212, 212, 0.16), transparent 30%),
          rgba(5, 18, 32, 0.84);
      }

      .cta-actions {
        display: flex;
        justify-content: center;
        gap: 14px;
        flex-wrap: wrap;
        margin-top: 22px;
      }

      .cta-button {
        display: inline-block;
        text-decoration: none;
        padding: 13px 20px;
        border-radius: 14px;
        font-weight: 700;
      }

      .cta-button-primary {
        background: var(--amber);
        color: #08121f;
      }

      .cta-button-secondary {
        border: 1px solid rgba(21, 212, 212, 0.3);
        color: var(--teal);
      }

      .cta-url {
        margin-top: 16px;
        font-size: 12px;
        color: var(--muted);
        word-break: break-all;
      }

      .answers-table {
        width: 100%;
        border-collapse: collapse;
      }

      .answers-table th,
      .answers-table td {
        padding: 14px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        vertical-align: top;
      }

      .answers-table th {
        width: 44%;
        padding-right: 18px;
        font-weight: 600;
      }

      ul.next-steps {
        padding-left: 18px;
      }

      ul.next-steps li + li {
        margin-top: 8px;
      }

      footer {
        padding-top: 12px;
        text-align: center;
      }

      @media (max-width: 780px) {
        .section-grid,
        .roi-grid,
        .profile-grid {
          grid-template-columns: 1fr;
        }

        .phase-card {
          grid-template-columns: 42px 1fr;
        }

        .phase-price {
          text-align: left;
          grid-column: 2;
        }
      }

      @media print {
        body {
          background: #fff;
          color: #111827;
        }

        .panel {
          background: #fff;
          border-color: #dbe5ef;
          box-shadow: none;
        }

        .eyebrow {
          color: #0f766e;
        }

        .subtitle {
          color: #92400e;
        }

        .cover-copy,
        .body-copy,
        .contact-card p,
        .metric-card strong,
        .metric-card p,
        th,
        td,
        footer p {
          color: #475569;
        }

        .cta-button-secondary {
          border-color: #0f766e;
          color: #0f766e;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel cover">
        <span class="eyebrow">Assessment Report</span>
        <h1>
          AI Readiness
          <span class="subtitle"> Assessment Summary</span>
        </h1>
        <p class="cover-copy">
          ${escapeHtml(executiveSummary)}
        </p>
        <div class="meta-grid">
          <div class="meta-card">
            <strong>Prepared</strong>
            <span>${escapeHtml(generatedOn)}</span>
          </div>
          <div class="meta-card">
            <strong>Readiness Score</strong>
            <span>${escapeHtml(String(assessment.overallScore))}/100</span>
          </div>
          <div class="meta-card">
            <strong>Primary Constraint</strong>
            <span>${escapeHtml(constraint.label)}</span>
          </div>
          <div class="meta-card">
            <strong>Recommended Next Step</strong>
            <span>${escapeHtml(engagement.tier)}</span>
          </div>
        </div>
        ${
          preparedFor || lead?.email
            ? `
              <div class="contact-card">
                <span class="eyebrow">Prepared for</span>
                <h2>${escapeHtml(preparedFor || lead?.email || "Finance team")}</h2>
                <p>${escapeHtml(lead?.email || "FinanceFlo.ai assessment delivery")}</p>
              </div>
            `
            : ""
        }
      </section>

      <section class="section-grid">
        <section class="panel section score-panel">
          <span class="eyebrow">Readiness Score</span>
          <div class="score-ring ${escapeHtml(readiness.themeClass)}">
            <span class="score-value theme-${escapeHtml(
              readiness.themeClass
            )}">${escapeHtml(String(assessment.overallScore))}%</span>
            <span class="score-label theme-${escapeHtml(
              readiness.themeClass
            )}">${escapeHtml(readiness.level)}</span>
          </div>
          <h2>AI Readiness: ${escapeHtml(readiness.level)}</h2>
          <p class="body-copy">${escapeHtml(readiness.description)}</p>
        </section>

        <section class="panel section">
          <span class="eyebrow">Primary Constraint</span>
          <span class="constraint-flag">${escapeHtml(constraint.label)}</span>
          <h2>${escapeHtml(constraint.label)}</h2>
          <p class="body-copy">${escapeHtml(constraint.description)}</p>
          <div class="metrics-grid">
            ${constraintScores || `
              <div class="metric-card compact-card">
                <strong>Constraint Scores</strong>
                <span>Not available</span>
              </div>
            `}
          </div>
        </section>
      </section>

      <section class="panel section">
        <span class="eyebrow">Cost of Inaction</span>
        <h2>Estimated Annual Cost of Doing Nothing</h2>
        <p class="body-copy">
          ${
            assessment.costOfInaction != null
              ? `Based on your revenue band, constraint severity, and current system maturity, the status quo is costing approximately ${escapeHtml(
                  formatCurrency(assessment.costOfInaction, region)
                )} per year.`
              : "No cost of inaction estimate was provided."
          }
        </p>
        <div class="meta-grid">
          <div class="metric-card compact-card">
            <strong>Estimated Annual Cost</strong>
            <span>${escapeHtml(
              assessment.costOfInaction != null
                ? formatCurrency(assessment.costOfInaction, region)
                : "Not available"
            )}</span>
          </div>
          <div class="metric-card compact-card">
            <strong>Recommended Tier</strong>
            <span>${escapeHtml(engagement.tier)}</span>
          </div>
        </div>
      </section>

      <section class="panel section">
        <span class="eyebrow">ROI Projection</span>
        <h2>5 Value Levers for ${escapeHtml(lead?.company || "Your Team")}</h2>
        <p class="body-copy">
          Total projected annual ROI opportunity: <strong>${escapeHtml(
            formatCurrency(totalRoi, region)
          )}</strong>
        </p>
        <div class="roi-grid">
          ${roiMarkup}
        </div>
      </section>

      <section class="panel section">
        <span class="eyebrow">Recommended Engagement</span>
        <h2>${escapeHtml(engagement.tier)}</h2>
        <p class="body-copy">
          <strong>${escapeHtml(engagement.tagline)}</strong>
        </p>
        <p class="body-copy" style="margin-top: 10px;">
          ${escapeHtml(engagement.description)}
        </p>
        <div style="margin-top: 20px;">
          ${engagementMarkup}
        </div>
      </section>

      <section class="panel section">
        <span class="eyebrow">Readiness Profile</span>
        <h2>Your Buyer Readiness Signals</h2>
        <div class="profile-grid">
          <div class="profile-card">
            <strong>Pain Severity</strong>
            <div class="pip-row">${renderReadinessPips(
              readinessProfile.pain,
              3
            )}</div>
          </div>
          <div class="profile-card">
            <strong>Budget Readiness</strong>
            <div class="pip-row">${renderReadinessPips(
              readinessProfile.budget,
              4
            )}</div>
          </div>
          <div class="profile-card">
            <strong>Decision Authority</strong>
            <div class="pip-row">${renderReadinessPips(
              readinessProfile.authority,
              4
            )}</div>
          </div>
          <div class="profile-card">
            <strong>Timing Urgency</strong>
            <div class="pip-row">${renderReadinessPips(
              readinessProfile.timing,
              4
            )}</div>
          </div>
        </div>
      </section>

      <section class="panel section cta-panel">
        <span class="eyebrow">Proposal CTA</span>
        <h2>Ready to Eliminate Your Constraints?</h2>
        <p class="body-copy">
          Book a free strategy call to get your personalised transformation proposal with detailed ROI projections, implementation sequencing, and next-step recommendations.
        </p>
        <div class="cta-actions">
          <a class="cta-button cta-button-primary" href="${escapeHtml(
            bookingUrl
          )}">
            Book a Free Strategy Call
          </a>
          <a class="cta-button cta-button-secondary" href="${escapeHtml(
            bookingUrl
          )}">
            Get My Proposal
          </a>
        </div>
        <p class="cta-url">${escapeHtml(bookingUrl)}</p>
      </section>

      <section class="panel section">
        <span class="eyebrow">Assessment Answers</span>
        <h2>Question-by-question responses</h2>
        <table class="answers-table">
          <tbody>
            ${answersMarkup}
          </tbody>
        </table>
      </section>

      <footer>
        <p>FinanceFlo.ai AI Readiness Assessment</p>
        <p>Constraint diagnosis before automation</p>
      </footer>
    </main>
  </body>
</html>`;
}

export function registerReportRoutes(app: Express): void {
  app.get(ASSESSMENT_REPORT_ROUTE, async (req, res) => {
    const token = readQueryValue(req.query.token);
    if (!token) {
      res.status(400).send("Missing assessment report token");
      return;
    }

    const tokenPayload = readAssessmentReportToken(token);
    if (!tokenPayload) {
      res.status(403).send("Invalid or expired assessment report token");
      return;
    }

    const assessment = await getAssessmentById(tokenPayload.assessmentId);
    if (!assessment) {
      res.status(404).send("Assessment report not found");
      return;
    }

    const lead = await getLeadById(assessment.leadId);
    const download =
      req.query.download === "1" || req.query.download === "true";

    const html = renderAssessmentReportHtml({
      assessment: {
        answers: assessment.answers as Record<string, unknown>,
        constraintScores:
          (assessment.constraintScores as Record<string, number>) || {},
        costOfInaction: assessment.costOfInaction ?? null,
        createdAt: assessment.createdAt,
        id: assessment.id,
        overallScore: assessment.overallScore,
        primaryConstraint: assessment.primaryConstraint,
        recommendedTier: assessment.recommendedTier,
      },
      baseUrl: getRequestBaseUrl(req),
      lead: lead
        ? {
            company: lead.company,
            email: lead.email,
            firstName: lead.firstName,
            jobTitle: lead.jobTitle,
            lastName: lead.lastName,
          }
        : undefined,
    });

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (download) {
      try {
        const pdf = await renderHtmlToPdf(html);

        if (lead) {
          await persistGeneratedPdfCopy({
            assessmentId: assessment.id,
            filename: ASSESSMENT_REPORT_FILENAME,
            leadId: lead.id,
            mimeType: "application/pdf",
            pdf,
            recipientSnapshot: {
              company: lead.company,
              email: lead.email,
              firstName: lead.firstName,
              jobTitle: lead.jobTitle,
              lastName: lead.lastName,
              overallScore: assessment.overallScore,
              primaryConstraint: assessment.primaryConstraint,
              recommendedTier: assessment.recommendedTier,
            },
            type: "assessment_report",
          });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${ASSESSMENT_REPORT_FILENAME}"`
        );
        res.status(200).send(pdf);
        return;
      } catch (error) {
        console.error(
          "[reportRoutes] Failed to generate assessment report PDF",
          error
        );
        res.status(500).send("Failed to generate report PDF");
        return;
      }
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.get(AI_FINANCE_REPORT_ROUTE, async (req, res) => {
    const recipient: ReportRecipient = {
      company: readQueryValue(req.query.company),
      email: readQueryValue(req.query.email),
      leadId: readNumericQueryValue(req.query.leadId),
      name: readQueryValue(req.query.name),
      role: readQueryValue(req.query.role),
    };

    const download =
      req.query.download === "1" || req.query.download === "true";

    const html = renderReportHtml(recipient);

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (download) {
      try {
        const pdf = await renderHtmlToPdf(html);
        const lead = await resolveLeadForAiFinanceReport(recipient);

        if (lead) {
          await persistGeneratedPdfCopy({
            filename: AI_FINANCE_REPORT_FILENAME,
            leadId: lead.id,
            mimeType: "application/pdf",
            pdf,
            recipientSnapshot: {
              company: recipient.company ?? lead.company,
              email: recipient.email ?? lead.email,
              firstName: lead.firstName,
              jobTitle: recipient.role ?? lead.jobTitle,
              lastName: lead.lastName,
              reportTitle: AI_FINANCE_REPORT.fullTitle,
            },
            type: "ai_finance_report",
          });
        } else {
          console.warn(
            "[reportRoutes] Skipping AI in Finance PDF persistence: lead not resolved"
          );
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${AI_FINANCE_REPORT_FILENAME}"`
        );
        res.status(200).send(pdf);
        return;
      } catch (error) {
        console.error(
          "[reportRoutes] Failed to generate AI in Finance report PDF",
          error
        );
        res.status(500).send("Failed to generate report PDF");
        return;
      }
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });
}

export const __testing = {
  renderAssessmentReportHtml,
  renderReportHtml,
};
