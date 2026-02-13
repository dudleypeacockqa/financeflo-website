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

/**
 * Register all job handlers. Called once at worker startup.
 */
export function registerAllHandlers(): void {
  registerJobHandler("embed_document", handleEmbedDocument);
  registerJobHandler("research_lead", handleResearchLead);
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
