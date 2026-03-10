import type { Express } from "express";
import {
  AI_FINANCE_REPORT,
  AI_FINANCE_REPORT_FILENAME,
  AI_FINANCE_REPORT_ROUTE,
  AI_FINANCE_REPORT_SECTIONS,
} from "@shared/aiFinanceReport";

interface ReportRecipient {
  company?: string;
  email?: string;
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

export function registerReportRoutes(app: Express): void {
  app.get(AI_FINANCE_REPORT_ROUTE, (req, res) => {
    const recipient: ReportRecipient = {
      company: readQueryValue(req.query.company),
      email: readQueryValue(req.query.email),
      name: readQueryValue(req.query.name),
      role: readQueryValue(req.query.role),
    };

    const download =
      req.query.download === "1" || req.query.download === "true";

    const html = renderReportHtml(recipient);

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");

    if (download) {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${AI_FINANCE_REPORT_FILENAME}"`
      );
    }

    res.status(200).send(html);
  });
}

export const __testing = {
  renderReportHtml,
};
