/**
 * Job handler registrations for background processing.
 * Each handler corresponds to a job type in the backgroundJobs table.
 */
import { registerJobHandler } from "./queue";
import { getDb } from "../db";
import { documents, knowledgeChunks } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { parseContent, chunkText } from "../knowledge/ingestion";
import { generateEmbeddings } from "../knowledge/embeddings";
import { runLeadPipeline } from "../leadgen/pipeline";
import { updateBatchProgress } from "../leadgen/batch";
import { getDueMessages, markMessageSent, markMessageFailed } from "../outreach/scheduler";
import { personalizeMessage } from "../outreach/personalizer";
import { sendLinkedInDm, sendConnectionRequest } from "../integrations/heyreach";
import { sendEmail } from "../integrations/email";
import { campaigns } from "../../drizzle/schema";

/**
 * Register all job handlers. Called once at worker startup.
 */
export function registerAllHandlers(): void {
  registerJobHandler("embed_document", handleEmbedDocument);
  registerJobHandler("research_lead", handleResearchLead);
  registerJobHandler("process_outreach", handleProcessOutreach);
}

/**
 * Process a document: parse content, chunk text, generate embeddings, store chunks.
 */
async function handleEmbedDocument(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const documentId = payload.documentId as number;
  if (!documentId) throw new Error("Missing documentId in payload");

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch document
  const docRows = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  if (docRows.length === 0) throw new Error(`Document #${documentId} not found`);
  const doc = docRows[0];

  if (!doc.rawContent) throw new Error(`Document #${documentId} has no raw content`);

  // Update status to processing
  await db.update(documents)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(documents.id, documentId));

  try {
    // Parse content based on type
    const parsedContent = await parseContent(doc.rawContent, doc.mimeType ?? undefined);

    // Chunk the text
    const chunks = chunkText(parsedContent);
    console.log(`[EmbedDocument] Document #${documentId}: ${chunks.length} chunks generated`);

    // Generate embeddings for all chunks
    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(chunkTexts);

    // Delete existing chunks (in case of re-processing)
    await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));

    // Insert chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const embedding = embeddings[i];
      await db.insert(knowledgeChunks).values({
        documentId,
        chunkIndex: i,
        content: chunks[i].content,
        embedding: embedding && embedding.length > 0 ? embedding : undefined,
        tokenCount: chunks[i].tokenCount,
      });
    }

    // Update document status
    await db.update(documents)
      .set({
        status: "ready",
        chunkCount: chunks.length,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return { chunksCreated: chunks.length, embeddingsGenerated: embeddings.filter(e => e.length > 0).length };
  } catch (error: any) {
    await db.update(documents)
      .set({
        status: "error",
        errorMessage: error.message,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));
    throw error;
  }
}

/**
 * Run the full lead research pipeline for a single lead.
 * Optionally part of a batch.
 */
async function handleResearchLead(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const leadId = payload.leadId as number;
  const batchId = payload.batchId as number | undefined;
  if (!leadId) throw new Error("Missing leadId in payload");

  const result = await runLeadPipeline(leadId);

  // Update batch progress if part of a batch
  if (batchId) {
    await updateBatchProgress(
      batchId,
      result.success,
      result.totalCostUsd,
      leadId,
      result.success ? undefined : "Pipeline failed"
    );
  }

  return {
    success: result.success,
    researchId: result.researchId,
    totalCostUsd: result.totalCostUsd,
    steps: result.steps,
  };
}

/**
 * Process due outreach messages for a campaign.
 * Personalizes and sends messages via the appropriate channel.
 */
async function handleProcessOutreach(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const campaignId = payload.campaignId as number | undefined;
  let sent = 0;
  let failed = 0;

  // Get due messages (limit batch size)
  const dueMessages = await getDueMessages(20);

  // Filter to campaign if specified
  const messages = campaignId
    ? dueMessages.filter((m) => m.campaignId === campaignId)
    : dueMessages;

  if (messages.length === 0) {
    return { sent: 0, failed: 0, message: "No messages due for sending" };
  }

  // Get campaign info for HeyReach campaign IDs
  const db = await getDb();

  for (const msg of messages) {
    try {
      // Personalize the message
      const personalized = await personalizeMessage({
        leadId: msg.leadId,
        templateBody: msg.templateBody || "",
        subject: msg.subject || undefined,
        channel: msg.channel,
        stepNumber: msg.stepNumber,
      });

      // Update message with personalized content
      if (db) {
        const { outreachMessages: om } = await import("../../drizzle/schema");
        await db.update(om).set({
          personalizedBody: personalized.personalizedBody,
          subject: personalized.personalizedSubject || msg.subject,
          updatedAt: new Date(),
        }).where(eq(om.id, msg.id));
      }

      // Send via appropriate channel
      let externalId: string | undefined;

      if (msg.channel === "linkedin_dm") {
        // Get lead's LinkedIn URL
        if (db) {
          const { leads } = await import("../../drizzle/schema");
          const leadRows = await db.select().from(leads).where(eq(leads.id, msg.leadId)).limit(1);
          const lead = leadRows[0];
          if (lead?.linkedinUrl) {
            const campaignRows = await db.select().from(campaigns).where(eq(campaigns.id, msg.campaignId)).limit(1);
            const heyreachId = campaignRows[0]?.heyreachCampaignId || "";
            const result = await sendLinkedInDm({
              campaignId: heyreachId,
              linkedinUrl: lead.linkedinUrl,
              message: personalized.personalizedBody,
            });
            if (!result.success) throw new Error(result.error || "DM send failed");
            externalId = result.messageId;
          }
        }
      } else if (msg.channel === "linkedin_connection") {
        if (db) {
          const { leads } = await import("../../drizzle/schema");
          const leadRows = await db.select().from(leads).where(eq(leads.id, msg.leadId)).limit(1);
          const lead = leadRows[0];
          if (lead?.linkedinUrl) {
            const campaignRows = await db.select().from(campaigns).where(eq(campaigns.id, msg.campaignId)).limit(1);
            const heyreachId = campaignRows[0]?.heyreachCampaignId || "";
            const result = await sendConnectionRequest({
              campaignId: heyreachId,
              linkedinUrl: lead.linkedinUrl,
              message: personalized.personalizedBody,
            });
            if (!result.success) throw new Error(result.error || "Connection request failed");
            externalId = result.messageId;
          }
        }
      } else if (msg.channel === "email") {
        if (db) {
          const { leads } = await import("../../drizzle/schema");
          const leadRows = await db.select().from(leads).where(eq(leads.id, msg.leadId)).limit(1);
          const lead = leadRows[0];
          if (lead?.email) {
            const result = await sendEmail({
              to: lead.email,
              subject: personalized.personalizedSubject || "Message from FinanceFlo",
              htmlBody: personalized.personalizedBody,
            });
            if (!result.success) throw new Error(result.error || "Email send failed");
            externalId = result.messageId;
          }
        }
      }

      await markMessageSent(msg.id, externalId);
      sent++;
    } catch (error: any) {
      console.error(`[Outreach] Message #${msg.id} failed:`, error.message);
      await markMessageFailed(msg.id, error.message);
      failed++;
    }
  }

  console.log(`[Outreach] Processed ${messages.length} messages: ${sent} sent, ${failed} failed`);
  return { sent, failed, total: messages.length };
}
