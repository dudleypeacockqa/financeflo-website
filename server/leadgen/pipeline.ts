/**
 * Lead research pipeline orchestrator.
 * Full flow: LinkedIn URL -> scrape -> research -> analyze -> sequence.
 * Can run each step independently or as a full pipeline.
 */
import { getDb } from "../db";
import { leads, leadResearch } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { scrapeLeadProfile } from "./scraper";
import { researchLeadCompany } from "./researcher";
import { analyzeLead } from "./analyzer";
import { generateDmSequence } from "./sequencer";

export interface PipelineResult {
  success: boolean;
  researchId: number | null;
  totalCostUsd: number;
  steps: {
    scrape: { success: boolean; error?: string };
    research: { success: boolean; error?: string };
    analysis: { success: boolean; error?: string };
    sequence: { success: boolean; error?: string };
  };
}

/**
 * Run the full lead research pipeline for a single lead.
 */
export async function runLeadPipeline(leadId: number): Promise<PipelineResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch lead
  const leadRows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (leadRows.length === 0) throw new Error(`Lead #${leadId} not found`);
  const lead = leadRows[0];

  let totalCost = 0;
  const steps: PipelineResult["steps"] = {
    scrape: { success: false },
    research: { success: false },
    analysis: { success: false },
    sequence: { success: false },
  };

  // Create research record
  const researchRows = await db.insert(leadResearch).values({
    leadId,
    status: "researching",
  }).returning();
  const research = researchRows[0];

  // Update lead status
  await db.update(leads).set({ researchStatus: "researching", updatedAt: new Date() }).where(eq(leads.id, leadId));

  try {
    // Step 1: Scrape LinkedIn profile
    console.log(`[Pipeline] Lead #${leadId}: Scraping LinkedIn profile...`);
    const scrapeResult = await scrapeLeadProfile(lead.linkedinUrl || "");
    steps.scrape = { success: scrapeResult.success, error: scrapeResult.error };
    totalCost += scrapeResult.costUsd;

    if (scrapeResult.success && scrapeResult.data) {
      await db.update(leadResearch).set({
        linkedinData: scrapeResult.data as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      }).where(eq(leadResearch.id, research.id));

      // Update lead enrichment fields
      await db.update(leads).set({
        linkedinHeadline: scrapeResult.data.headline,
        enrichedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(leads.id, leadId));
    }

    // Step 2: Research company
    console.log(`[Pipeline] Lead #${leadId}: Researching company...`);
    const researchResult = await researchLeadCompany(
      lead.company || "",
      lead.industry || undefined,
      lead.companyWebsite || undefined
    );
    steps.research = { success: researchResult.success, error: researchResult.error };
    totalCost += researchResult.costUsd;

    if (researchResult.success && researchResult.data) {
      await db.update(leadResearch).set({
        companyResearch: researchResult.data as unknown as Record<string, unknown>,
        status: "analyzed",
        updatedAt: new Date(),
      }).where(eq(leadResearch.id, research.id));

      await db.update(leads).set({ researchStatus: "analyzed", updatedAt: new Date() }).where(eq(leads.id, leadId));
    }

    // Step 3: AI Analysis
    console.log(`[Pipeline] Lead #${leadId}: Analyzing lead...`);
    const analysisResult = await analyzeLead(
      {
        name: `${lead.firstName} ${lead.lastName}`,
        title: lead.jobTitle || "",
        company: lead.company || "",
        industry: lead.industry || "",
        companySize: lead.companySize || "",
      },
      scrapeResult.data,
      researchResult.data
    );
    steps.analysis = { success: analysisResult.success, error: analysisResult.error };
    totalCost += analysisResult.costUsd;

    if (analysisResult.success) {
      await db.update(leadResearch).set({
        leadProfile: analysisResult.leadProfile,
        painGainAnalysis: analysisResult.painGainAnalysis,
        archetype: analysisResult.archetype,
        constraintType: analysisResult.constraintType,
        qualityScore: analysisResult.qualityScore,
        updatedAt: new Date(),
      }).where(eq(leadResearch.id, research.id));

      // Update lead archetype
      if (analysisResult.archetype) {
        await db.update(leads).set({ archetype: analysisResult.archetype, updatedAt: new Date() }).where(eq(leads.id, leadId));
      }
    }

    // Step 4: Generate DM Sequence
    console.log(`[Pipeline] Lead #${leadId}: Generating DM sequence...`);
    const sequenceResult = await generateDmSequence(
      analysisResult.leadProfile || {},
      analysisResult.painGainAnalysis,
      analysisResult.constraintType,
      analysisResult.archetype
    );
    steps.sequence = { success: sequenceResult.success, error: sequenceResult.error };
    totalCost += sequenceResult.costUsd;

    if (sequenceResult.success && sequenceResult.sequence) {
      await db.update(leadResearch).set({
        dmSequence: sequenceResult.sequence as unknown as Record<string, unknown>,
        status: "complete",
        costUsd: totalCost.toFixed(2),
        updatedAt: new Date(),
      }).where(eq(leadResearch.id, research.id));

      await db.update(leads).set({ researchStatus: "complete", updatedAt: new Date() }).where(eq(leads.id, leadId));
    } else {
      await db.update(leadResearch).set({
        status: "sequenced",
        costUsd: totalCost.toFixed(2),
        updatedAt: new Date(),
      }).where(eq(leadResearch.id, research.id));

      await db.update(leads).set({ researchStatus: "sequenced", updatedAt: new Date() }).where(eq(leads.id, leadId));
    }

    console.log(`[Pipeline] Lead #${leadId}: Pipeline complete. Cost: $${totalCost.toFixed(2)}`);

    return {
      success: true,
      researchId: research.id,
      totalCostUsd: totalCost,
      steps,
    };
  } catch (error: any) {
    // Mark as error
    await db.update(leadResearch).set({
      status: "error",
      errorMessage: error.message,
      costUsd: totalCost.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(leadResearch.id, research.id));

    await db.update(leads).set({ researchStatus: "error", updatedAt: new Date() }).where(eq(leads.id, leadId));

    return {
      success: false,
      researchId: research.id,
      totalCostUsd: totalCost,
      steps,
    };
  }
}
