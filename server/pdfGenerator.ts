/**
 * PDF Proposal Generator — FinanceFlo.ai
 * Generates branded HTML proposals and uploads them as PDF-ready HTML to S3.
 * Uses the Data Cartography design system: deep navy, teal accents, amber CTAs.
 *
 * Architecture (GOTCHA):
 * - Tool layer: deterministic HTML generation from structured data
 * - Called by routers.ts (orchestration layer)
 * - Uses proposalGenerator.ts output (context layer)
 */

import { storagePut } from "./storage";
import type { Lead, Assessment, Proposal } from "../drizzle/schema";
import {
  type Region,
  REGION_CONFIGS,
  formatCurrency as fmtCurrency,
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
  region?: Region;
  currency?: string;
  currencySymbol?: string;
  pricingDisclaimer?: string;
}

function formatCurrency(amount: number, region: Region = "UK"): string {
  return fmtCurrency(amount, region);
}

function getConstraintLabel(key: string): string {
  const labels: Record<string, string> = {
    capacity: "Capacity Constraint",
    knowledge: "Knowledge Constraint",
    process: "Process Constraint",
    scale: "Scale Constraint",
  };
  return labels[key] || key;
}

function getConstraintBarColor(score: number): string {
  if (score >= 70) return "#FF6B35"; // amber — critical
  if (score >= 40) return "#00D9FF"; // teal — moderate
  return "#4ADE80"; // green — low
}

function getTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    audit: "AI Operations Audit",
    quick_wins: "Quick Wins Sprint",
    implementation: "Full Implementation",
    retainer: "Ongoing Retainer",
  };
  return labels[tier] || tier;
}

/**
 * Generate a branded HTML proposal document.
 */
export function generateProposalHTML(
  lead: Lead,
  assessment: Assessment,
  content: ProposalContent
): string {
  const region: Region = content.region || "UK";
  const config = REGION_CONFIGS[region];
  const today = new Date().toLocaleDateString(config.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const constraintBars = Object.entries(content.constraintDiagnosis.constraintBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(
      ([key, score]) => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-size: 13px; color: #E0E0E0;">${getConstraintLabel(key)}</span>
          <span style="font-size: 13px; font-weight: 600; color: ${getConstraintBarColor(score)};">${score}/100</span>
        </div>
        <div style="background: #1A2744; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="width: ${score}%; height: 100%; background: ${getConstraintBarColor(score)}; border-radius: 4px;"></div>
        </div>
      </div>`
    )
    .join("");

  const deliverablesList = content.recommendedSolution.deliverables
    .map(
      (d) => `
      <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
        <span style="color: #00D9FF; font-size: 16px; line-height: 1.2;">✓</span>
        <span style="font-size: 13px; color: #C0C0C0; line-height: 1.5;">${d}</span>
      </div>`
    )
    .join("");

  const nextStepsList = content.nextSteps
    .map(
      (step, i) => `
      <div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #00D9FF20; border: 1px solid #00D9FF40; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 12px; font-weight: 700; color: #00D9FF;">${i + 1}</span>
        </div>
        <span style="font-size: 13px; color: #C0C0C0; line-height: 1.5; padding-top: 4px;">${step}</span>
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #0A1628; color: #E8E8E8; }
    .page { max-width: 800px; margin: 0 auto; padding: 40px; }
    h1, h2, h3, h4 { font-family: 'Space Grotesk', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .section { margin-bottom: 40px; }
    .divider { height: 1px; background: linear-gradient(90deg, #00D9FF20, #00D9FF60, #00D9FF20); margin: 32px 0; }
    @media print {
      body { background: white; color: #1a1a1a; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #00D9FF40;">
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <div style="width: 32px; height: 32px; border-radius: 6px; background: #00D9FF; display: flex; align-items: center; justify-content: center;">
            <span style="font-family: 'Space Grotesk'; font-weight: 700; color: #0A1628; font-size: 18px;">F</span>
          </div>
          <span style="font-family: 'Space Grotesk'; font-weight: 700; font-size: 18px; color: #E8E8E8;">Finance<span style="color: #00D9FF;">Flo</span>.ai</span>
        </div>
        <span class="mono" style="font-size: 11px; color: #888;">AI-Powered Financial Transformation</span>
      </div>
      <div style="text-align: right;">
        <span class="mono" style="font-size: 11px; color: #888;">Prepared: ${today}</span><br>
        <span class="mono" style="font-size: 11px; color: #888;">Ref: FFP-${Date.now().toString(36).toUpperCase()}</span>
      </div>
    </div>

    <!-- TITLE -->
    <div class="section" style="text-align: center; padding: 40px 0;">
      <span class="mono" style="font-size: 11px; color: #00D9FF; text-transform: uppercase; letter-spacing: 3px;">Transformation Proposal</span>
      <h1 style="font-size: 28px; font-weight: 700; margin-top: 12px; line-height: 1.3; color: #FFFFFF;">${content.title}</h1>
      <p style="font-size: 14px; color: #888; margin-top: 8px;">
        Prepared for <strong style="color: #E8E8E8;">${lead.firstName} ${lead.lastName}</strong>${lead.company ? ` at <strong style="color: #E8E8E8;">${lead.company}</strong>` : ""}
      </p>
    </div>

    <div class="divider"></div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 16px;">Executive Summary</h2>
      <p style="font-size: 14px; line-height: 1.7; color: #C0C0C0;">${content.executiveSummary}</p>
    </div>

    <div class="divider"></div>

    <!-- CONSTRAINT DIAGNOSIS -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 8px;">Constraint Diagnosis</h2>
      <p style="font-size: 13px; color: #888; margin-bottom: 20px;">
        Primary constraint identified: <strong style="color: #FF6B35;">${content.constraintDiagnosis.primaryConstraint}</strong>
      </p>
      ${constraintBars}
      <div style="margin-top: 20px; padding: 16px; background: #FF6B3510; border: 1px solid #FF6B3530; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; color: #FF6B35; font-weight: 600;">Annual Cost of Inaction</span>
          <span style="font-size: 24px; font-weight: 700; color: #FF6B35; font-family: 'Space Grotesk';">${formatCurrency(content.constraintDiagnosis.costOfInaction, region)}</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- RECOMMENDED SOLUTION -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 8px;">Recommended Solution</h2>
      <div style="display: inline-block; padding: 4px 12px; background: #00D9FF20; border: 1px solid #00D9FF40; border-radius: 20px; margin-bottom: 12px;">
        <span class="mono" style="font-size: 11px; color: #00D9FF;">${getTierLabel(content.recommendedSolution.tier)}</span>
      </div>
      <p style="font-size: 14px; line-height: 1.7; color: #C0C0C0; margin-bottom: 20px;">${content.recommendedSolution.description}</p>

      <h3 style="font-size: 15px; font-weight: 600; color: #E8E8E8; margin-bottom: 12px;">Key Deliverables</h3>
      ${deliverablesList}

      <div style="margin-top: 16px; padding: 12px 16px; background: #1A2744; border-radius: 8px;">
        <span style="font-size: 13px; color: #888;">Estimated Timeline: </span>
        <span style="font-size: 13px; font-weight: 600; color: #00D9FF;">${content.recommendedSolution.timeline}</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ROI PROJECTION -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 16px;">ROI Projection</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="padding: 16px; background: #1A2744; border-radius: 8px; text-align: center;">
          <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Year 1 Savings</span>
          <div style="font-size: 22px; font-weight: 700; color: #00D9FF; font-family: 'Space Grotesk'; margin-top: 4px;">${formatCurrency(content.roiProjection.year1Savings, region)}</div>
        </div>
        <div style="padding: 16px; background: #1A2744; border-radius: 8px; text-align: center;">
          <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">3-Year Savings</span>
          <div style="font-size: 22px; font-weight: 700; color: #00D9FF; font-family: 'Space Grotesk'; margin-top: 4px;">${formatCurrency(content.roiProjection.year3Savings, region)}</div>
        </div>
        <div style="padding: 16px; background: #1A2744; border-radius: 8px; text-align: center;">
          <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">ROI Multiple</span>
          <div style="font-size: 22px; font-weight: 700; color: #FF6B35; font-family: 'Space Grotesk'; margin-top: 4px;">${content.roiProjection.roiMultiple}x</div>
        </div>
        <div style="padding: 16px; background: #1A2744; border-radius: 8px; text-align: center;">
          <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Payback Period</span>
          <div style="font-size: 22px; font-weight: 700; color: #FF6B35; font-family: 'Space Grotesk'; margin-top: 4px;">${content.roiProjection.paybackMonths} months</div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- INDICATIVE PRICING -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 16px;">Indicative Pricing</h2>
      <div style="border: 1px solid #1A2744; border-radius: 8px; overflow: hidden;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px; background: #1A2744;">
          <span style="font-size: 13px; font-weight: 600; color: #E8E8E8;">Engagement</span>
          <span style="font-size: 13px; font-weight: 600; color: #E8E8E8; text-align: right;">Investment</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px; border-bottom: 1px solid #1A274480;">
          <span style="font-size: 13px; color: #C0C0C0;">AI Operations Audit</span>
          <span style="font-size: 13px; color: #00D9FF; font-weight: 600; text-align: right;">${content.pricingIndicative.auditFee}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px; border-bottom: 1px solid #1A274480;">
          <span style="font-size: 13px; color: #C0C0C0;">Implementation</span>
          <span style="font-size: 13px; color: #00D9FF; font-weight: 600; text-align: right;">${content.pricingIndicative.implementationRange}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; padding: 14px 16px;">
          <span style="font-size: 13px; color: #C0C0C0;">Monthly Retainer</span>
          <span style="font-size: 13px; color: #00D9FF; font-weight: 600; text-align: right;">${content.pricingIndicative.monthlyRetainer}</span>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- NEXT STEPS -->
    <div class="section">
      <h2 style="font-size: 20px; font-weight: 600; color: #00D9FF; margin-bottom: 16px;">Next Steps</h2>
      ${nextStepsList}
    </div>

    <div class="divider"></div>

    <!-- FOOTER -->
    <div style="text-align: center; padding: 24px 0;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 24px; height: 24px; border-radius: 4px; background: #00D9FF; display: flex; align-items: center; justify-content: center;">
          <span style="font-family: 'Space Grotesk'; font-weight: 700; color: #0A1628; font-size: 14px;">F</span>
        </div>
        <span style="font-family: 'Space Grotesk'; font-weight: 600; font-size: 14px; color: #E8E8E8;">Finance<span style="color: #00D9FF;">Flo</span>.ai</span>
      </div>
      <p class="mono" style="font-size: 11px; color: #666;">
        AI-Powered Financial Transformation &middot; Sage Intacct Partner<br>
        hello@financeflo.ai &middot; financeflo.ai
      </p>
      <p class="mono" style="font-size: 10px; color: #555; margin-top: 8px; max-width: 600px; margin-left: auto; margin-right: auto;">
        ${content.pricingDisclaimer || PRICING_DISCLAIMER}
      </p>
      <p class="mono" style="font-size: 10px; color: #444; margin-top: 8px;">
        This proposal is confidential and intended solely for the named recipient.<br>
        All pricing shown in ${config.currency} (${config.taxLabel}). Valid for 30 days from the date of issue.
      </p>
    </div>

  </div>
</body>
</html>`;
}

/**
 * Generate and upload the proposal HTML to S3.
 * Returns the public URL of the uploaded proposal.
 */
export async function generateAndUploadProposal(
  lead: Lead,
  assessment: Assessment,
  proposalContent: ProposalContent
): Promise<string> {
  const html = generateProposalHTML(lead, assessment, proposalContent);

  // Generate a unique key for the proposal
  const timestamp = Date.now();
  const sanitizedCompany = (lead.company || "prospect")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 30);
  const fileKey = `proposals/${sanitizedCompany}-${timestamp}.html`;

  try {
    const { url } = await storagePut(fileKey, html, "text/html");
    console.log(`[PDFGenerator] Proposal uploaded: ${url}`);
    return url;
  } catch (error) {
    console.error("[PDFGenerator] Upload failed:", error);
    throw error;
  }
}
