/**
 * Meeting prep briefing generator.
 * Given a deal ID, builds context from CRM data + KB and generates a structured brief.
 */
import { invokeLLM } from "../llm";
import { searchKnowledge } from "../knowledge/search";
import { getDb } from "../db";
import { deals, leads, activities, aibaAnalyses } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export interface MeetingBrief {
  dealTitle: string;
  suggestedAgenda: string[];
  talkingPoints: string[];
  questionsToAsk: string[];
  risks: string[];
  backgroundSummary: string;
}

export async function generateMeetingPrep(dealId: number): Promise<MeetingBrief> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Load deal
  const dealRows = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
  if (dealRows.length === 0) throw new Error(`Deal #${dealId} not found`);
  const deal = dealRows[0];

  // Load lead
  const leadRows = await db.select().from(leads).where(eq(leads.id, deal.leadId)).limit(1);
  const lead = leadRows[0];

  // Load recent activities
  const recentActivities = await db
    .select()
    .from(activities)
    .where(eq(activities.dealId, dealId))
    .orderBy(desc(activities.createdAt))
    .limit(10);

  // Load AIBA analysis if available
  const aibaRows = await db
    .select()
    .from(aibaAnalyses)
    .where(eq(aibaAnalyses.dealId, dealId))
    .orderBy(desc(aibaAnalyses.createdAt))
    .limit(1);
  const aiba = aibaRows[0] ?? null;

  // Search KB for industry/constraint-specific content
  const kbQuery = [
    lead?.industry,
    aiba?.constraintType,
    deal.title,
  ].filter(Boolean).join(" ");

  let kbContext = "";
  try {
    const kbResults = await searchKnowledge(kbQuery, 5);
    if (kbResults.length > 0) {
      kbContext = kbResults
        .map((r) => `[${r.documentTitle}]\n${r.content}`)
        .join("\n\n---\n\n");
    }
  } catch {
    // Non-critical
  }

  // Build prompt
  const contextParts: string[] = [];

  contextParts.push(`DEAL: "${deal.title}" | Stage: ${deal.stage} | Value: ${deal.value ?? "TBD"}`);

  if (lead) {
    contextParts.push(
      `CONTACT: ${lead.firstName} ${lead.lastName}, ${lead.jobTitle ?? "N/A"} at ${lead.company ?? "N/A"}. Industry: ${lead.industry ?? "N/A"}. Size: ${lead.companySize ?? "N/A"}.`
    );
  }

  if (aiba) {
    contextParts.push(
      `AIBA ANALYSIS: Primary constraint: ${aiba.constraintType ?? "N/A"}. Readiness score: ${aiba.readinessScore ?? "N/A"}/100. Cost of inaction: ${aiba.costOfInaction ?? "N/A"}.`
    );
    if (aiba.fourEngines) {
      const engines = aiba.fourEngines as any;
      contextParts.push(
        `ENGINE SCORES: Revenue: ${engines.revenue?.score ?? "?"}, Operations: ${engines.operations?.score ?? "?"}, Compliance: ${engines.compliance?.score ?? "?"}, Data: ${engines.data?.score ?? "?"}`
      );
    }
  }

  if (recentActivities.length > 0) {
    const activityLog = recentActivities
      .map((a) => `- [${a.type}] ${a.description}`)
      .join("\n");
    contextParts.push(`RECENT ACTIVITIES:\n${activityLog}`);
  }

  if (deal.notes) {
    contextParts.push(`DEAL NOTES: ${deal.notes}`);
  }

  if (kbContext) {
    contextParts.push(`RELEVANT KNOWLEDGE:\n${kbContext}`);
  }

  const prompt = `Based on the following deal context, generate a structured meeting preparation briefing.

${contextParts.join("\n\n")}

Return ONLY valid JSON with this structure (no markdown, no code fences):
{
  "suggestedAgenda": ["string - 4 to 6 agenda items in logical order"],
  "talkingPoints": ["string - 4 to 6 key points to raise, referencing specific data"],
  "questionsToAsk": ["string - 4 to 6 discovery or qualification questions"],
  "risks": ["string - 2 to 4 potential risks or objections to prepare for"],
  "backgroundSummary": "string - 2-3 paragraph executive summary of what we know"
}`;

  try {
    const raw = await invokeLLM({
      systemPrompt:
        "You are FinanceFlo's meeting prep AI. Generate actionable, specific meeting briefings using FinanceFlo's methodology (AIBA, ADAPT, CKPS). Reference specific data points. Be direct and practical. Return valid JSON only.",
      userPrompt: prompt,
      maxTokens: 2048,
    });

    const parsed = JSON.parse(raw) as Omit<MeetingBrief, "dealTitle">;
    return { dealTitle: deal.title, ...parsed };
  } catch (error: any) {
    console.error("[MeetingPrep] LLM call failed:", error.message);
    return {
      dealTitle: deal.title,
      suggestedAgenda: [
        "Review current situation and pain points",
        "Discuss AIBA diagnostic findings",
        "Present recommended approach",
        "Outline next steps and timeline",
      ],
      talkingPoints: [
        `Deal is at ${deal.stage} stage with value ${deal.value ?? "TBD"}`,
        lead ? `${lead.firstName} is ${lead.jobTitle} at ${lead.company}` : "Contact details pending",
        aiba ? `Primary constraint: ${aiba.constraintType}` : "No AIBA analysis yet",
      ],
      questionsToAsk: [
        "What has changed since our last conversation?",
        "What is your timeline for making a decision?",
        "Who else is involved in the evaluation process?",
        "What would success look like in the first 90 days?",
      ],
      risks: [
        "Budget constraints may delay decision",
        "Competing priorities could reduce engagement",
      ],
      backgroundSummary: `Meeting briefing for "${deal.title}". The deal is currently at the ${deal.stage} stage.${lead ? ` The primary contact is ${lead.firstName} ${lead.lastName} at ${lead.company}.` : ""}${aiba ? ` AIBA analysis identified ${aiba.constraintType} as the primary constraint.` : ""}`,
    };
  }
}
