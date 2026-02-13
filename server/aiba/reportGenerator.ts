/**
 * AIBA Report Generator.
 * Generates branded diagnostic reports as structured data.
 * PDF generation can be added later with a library like puppeteer or react-pdf.
 */
import { getDb } from "../db";
import { aibaAnalyses, leads, deals } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface ReportData {
  title: string;
  companyName: string;
  contactName: string;
  date: string;
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
  overallScore: number;
}

/**
 * Generate report data from an AIBA analysis.
 */
export async function generateReportData(analysisId: number): Promise<ReportData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const analysisRows = await db.select().from(aibaAnalyses).where(eq(aibaAnalyses.id, analysisId)).limit(1);
  if (analysisRows.length === 0) throw new Error(`Analysis #${analysisId} not found`);
  const analysis = analysisRows[0];

  if (!analysis.fourEngines) {
    throw new Error("Analysis has no 4 Engines data — run the diagnostic first");
  }

  // Get lead/company name
  let companyName = "Company";
  let contactName = "Contact";
  if (analysis.leadId) {
    const leadRows = await db.select().from(leads).where(eq(leads.id, analysis.leadId)).limit(1);
    if (leadRows.length > 0) {
      companyName = leadRows[0].company || companyName;
      contactName = `${leadRows[0].firstName} ${leadRows[0].lastName}`;
    }
  }

  const fe = analysis.fourEngines;
  const overallScore = Math.round(
    (fe.revenue.score + fe.operations.score + fe.compliance.score + fe.data.score) / 4 * 10
  );

  return {
    title: `AIBA Diagnostic Report: ${companyName}`,
    companyName,
    contactName,
    date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }),
    fourEngines: fe,
    constraintType: analysis.constraintType || "process",
    quickWins: analysis.quickWins || [],
    strategicRecommendations: analysis.strategicRecommendations || [],
    aiRecommendations: analysis.aiRecommendations || {
      ml: { applicable: false, useCases: [] },
      agentic: { applicable: false, useCases: [] },
      rl: { applicable: false, useCases: [] },
    },
    costOfInaction: analysis.costOfInaction || 0,
    readinessScore: analysis.readinessScore || 0,
    overallScore,
  };
}

/**
 * Generate an HTML report string for PDF conversion or email attachment.
 */
export function renderReportHtml(data: ReportData): string {
  const constraintLabels: Record<string, string> = {
    capacity: "Capacity Constraint",
    knowledge: "Knowledge Constraint",
    process: "Process Constraint",
    scale: "Scale Constraint",
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; margin: 40px; }
    h1 { color: #0d9488; border-bottom: 3px solid #0d9488; padding-bottom: 10px; }
    h2 { color: #1a1a2e; margin-top: 30px; }
    .engine-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .engine-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .engine-card h3 { margin-top: 0; }
    .score { font-size: 24px; font-weight: bold; }
    .score-high { color: #0d9488; }
    .score-mid { color: #f59e0b; }
    .score-low { color: #ef4444; }
    .constraint-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; background: #0d9488; color: white; font-weight: bold; }
    .quick-win { background: #f0fdf4; border-left: 4px solid #0d9488; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .strategic { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .cost-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .cost-value { font-size: 32px; font-weight: bold; color: #ef4444; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <p>Prepared for: <strong>${data.contactName}</strong> | Date: ${data.date}</p>
  <p>Overall Readiness Score: <span class="score ${data.readinessScore >= 70 ? 'score-high' : data.readinessScore >= 40 ? 'score-mid' : 'score-low'}">${data.readinessScore}/100</span></p>
  <p>Primary Constraint: <span class="constraint-badge">${constraintLabels[data.constraintType] || data.constraintType}</span></p>

  <h2>4 Engines Analysis</h2>
  <div class="engine-grid">
    ${["revenue", "operations", "compliance", "data"].map((engine) => {
      const e = (data.fourEngines as any)[engine];
      const scoreClass = e.score >= 7 ? "score-high" : e.score >= 4 ? "score-mid" : "score-low";
      return `<div class="engine-card">
        <h3>${engine.charAt(0).toUpperCase() + engine.slice(1)} Engine</h3>
        <p class="score ${scoreClass}">${e.score}/10</p>
        <h4>Findings</h4>
        <ul>${e.findings.map((f: string) => `<li>${f}</li>`).join("")}</ul>
        <h4>Opportunities</h4>
        <ul>${e.opportunities.map((o: string) => `<li>${o}</li>`).join("")}</ul>
      </div>`;
    }).join("")}
  </div>

  <div class="cost-box">
    <p>Estimated Annual Cost of Inaction</p>
    <p class="cost-value">&pound;${data.costOfInaction.toLocaleString()}</p>
  </div>

  <h2>Quick Wins (< 30 days)</h2>
  ${data.quickWins.map((qw) => `<div class="quick-win">
    <strong>${qw.title}</strong> (${qw.effort} effort)<br>
    ${qw.description}<br>
    <em>Impact: ${qw.estimatedImpact}</em>
  </div>`).join("")}

  <h2>Strategic Recommendations</h2>
  ${data.strategicRecommendations.map((sr) => `<div class="strategic">
    <strong>${sr.title}</strong> (${sr.timeline})<br>
    ${sr.description}<br>
    <em>Investment: ${sr.investment}</em>
  </div>`).join("")}

  <h2>AI Opportunity Mapping</h2>
  <ul>
    ${data.aiRecommendations.ml.applicable ? `<li><strong>Machine Learning:</strong> ${data.aiRecommendations.ml.useCases.join(", ")}</li>` : ""}
    ${data.aiRecommendations.agentic.applicable ? `<li><strong>Agentic AI:</strong> ${data.aiRecommendations.agentic.useCases.join(", ")}</li>` : ""}
    ${data.aiRecommendations.rl.applicable ? `<li><strong>Reinforcement Learning:</strong> ${data.aiRecommendations.rl.useCases.join(", ")}</li>` : ""}
  </ul>

  <div class="footer">
    <p>FinanceFlo | AI-Powered Business Intelligence</p>
    <p>This report was generated using the AIBA (AI Business Analysis) framework.</p>
  </div>
</body>
</html>`;
}
