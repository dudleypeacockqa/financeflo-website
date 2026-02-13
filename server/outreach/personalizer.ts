/**
 * AI-powered message personalization for outreach campaigns.
 * Uses lead research data + knowledge base RAG to craft personalized messages.
 */
import { getDb } from "../db";
import { leads, leadResearch } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../llm";
import { searchKnowledge } from "../knowledge/search";

interface PersonalizationContext {
  leadName: string;
  leadTitle: string;
  leadCompany: string;
  leadIndustry: string;
  linkedinHeadline?: string;
  archetype?: string;
  constraintType?: string;
  painGainSummary?: string;
  companyInsights?: string;
  knowledgeContext?: string;
}

/**
 * Personalize a message template for a specific lead using AI.
 */
export async function personalizeMessage(params: {
  leadId: number;
  templateBody: string;
  subject?: string;
  channel: string;
  stepNumber: number;
}): Promise<{ personalizedBody: string; personalizedSubject?: string }> {
  const context = await buildPersonalizationContext(params.leadId);

  // Simple variable substitution first
  let body = substituteVariables(params.templateBody, context);
  let subject = params.subject ? substituteVariables(params.subject, context) : undefined;

  // If template contains {{AI_PERSONALIZE}} or is generic, use AI
  if (body.includes("{{AI_PERSONALIZE}}") || body.includes("{{ai_personalize}}")) {
    const aiResult = await aiPersonalize(body, subject, context, params.channel, params.stepNumber);
    body = aiResult.body;
    subject = aiResult.subject || subject;
  }

  return {
    personalizedBody: body,
    personalizedSubject: subject,
  };
}

/**
 * Build context from lead data and research for personalization.
 */
async function buildPersonalizationContext(leadId: number): Promise<PersonalizationContext> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch lead
  const leadRows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (leadRows.length === 0) throw new Error(`Lead #${leadId} not found`);
  const lead = leadRows[0];

  // Fetch latest research
  const researchRows = await db.select().from(leadResearch)
    .where(eq(leadResearch.leadId, leadId))
    .orderBy(desc(leadResearch.createdAt))
    .limit(1);
  const research = researchRows[0];

  // Get knowledge base context about their industry
  let knowledgeContext = "";
  if (lead.industry) {
    try {
      const kbResults = await searchKnowledge(`${lead.industry} challenges pain points`, 3);
      knowledgeContext = kbResults.map((r) => r.content).join("\n\n");
    } catch {
      // Knowledge base search is optional
    }
  }

  return {
    leadName: `${lead.firstName} ${lead.lastName}`,
    leadTitle: lead.jobTitle || "",
    leadCompany: lead.company || "",
    leadIndustry: lead.industry || "",
    linkedinHeadline: lead.linkedinHeadline || undefined,
    archetype: research?.archetype || lead.archetype || undefined,
    constraintType: research?.constraintType || undefined,
    painGainSummary: research?.painGainAnalysis
      ? JSON.stringify(research.painGainAnalysis).slice(0, 500)
      : undefined,
    companyInsights: research?.companyResearch
      ? JSON.stringify(research.companyResearch).slice(0, 500)
      : undefined,
    knowledgeContext: knowledgeContext.slice(0, 1000) || undefined,
  };
}

/**
 * Substitute simple {{variable}} placeholders.
 */
function substituteVariables(template: string, context: PersonalizationContext): string {
  return template
    .replace(/\{\{firstName\}\}/gi, context.leadName.split(" ")[0])
    .replace(/\{\{lastName\}\}/gi, context.leadName.split(" ").slice(1).join(" "))
    .replace(/\{\{fullName\}\}/gi, context.leadName)
    .replace(/\{\{company\}\}/gi, context.leadCompany)
    .replace(/\{\{title\}\}/gi, context.leadTitle)
    .replace(/\{\{industry\}\}/gi, context.leadIndustry)
    .replace(/\{\{headline\}\}/gi, context.linkedinHeadline || "");
}

/**
 * Use Claude to generate a personalized version of the message.
 */
async function aiPersonalize(
  body: string,
  subject: string | undefined,
  context: PersonalizationContext,
  channel: string,
  stepNumber: number
): Promise<{ body: string; subject?: string }> {
  const channelGuidance = channel.startsWith("linkedin")
    ? "This is a LinkedIn message. Keep it concise (under 300 characters for connection requests, under 500 for DMs). Be conversational and professional. No salesy language."
    : "This is a cold email. Keep it concise and scannable. Use a compelling subject line. Include a clear CTA.";

  const stepGuidance = stepNumber === 1
    ? "This is the first outreach message. Focus on building rapport and showing genuine interest in their work."
    : stepNumber === 2
    ? "This is a follow-up message. Reference the previous message naturally and provide additional value."
    : "This is a later-stage follow-up. Be direct about the value proposition while respecting their time.";

  const systemPrompt = `You are an expert B2B outreach copywriter for FinanceFlo, an AI consulting firm specializing in financial services technology. Personalize the message template below for the specific lead using the context provided.

Rules:
- ${channelGuidance}
- ${stepGuidance}
- Never be pushy or use fake urgency
- Reference specific details about their company, role, or industry when available
- Use their constraint type (if known) to frame the value proposition
- Sound human and authentic, not like a template
- Replace {{AI_PERSONALIZE}} with contextually relevant content
- Return ONLY the personalized message, nothing else`;

  const contextSection = [
    `Lead: ${context.leadName}, ${context.leadTitle} at ${context.leadCompany}`,
    context.leadIndustry && `Industry: ${context.leadIndustry}`,
    context.linkedinHeadline && `LinkedIn: ${context.linkedinHeadline}`,
    context.archetype && `Archetype: ${context.archetype}`,
    context.constraintType && `Primary Constraint: ${context.constraintType}`,
    context.painGainSummary && `Pain/Gain Summary: ${context.painGainSummary}`,
    context.companyInsights && `Company Insights: ${context.companyInsights}`,
    context.knowledgeContext && `Industry Knowledge: ${context.knowledgeContext}`,
  ]
    .filter(Boolean)
    .join("\n");

  const userPrompt = `Context:
${contextSection}

Template to personalize:
${body}${subject ? `\n\nSubject line to personalize: ${subject}` : ""}`;

  const result = await invokeLLM({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
  });

  // Parse subject if it was included
  if (subject) {
    const subjectMatch = result.match(/^Subject:\s*(.+)\n/i);
    if (subjectMatch) {
      return {
        body: result.replace(/^Subject:\s*.+\n+/i, "").trim(),
        subject: subjectMatch[1].trim(),
      };
    }
  }

  return { body: result.trim() };
}
