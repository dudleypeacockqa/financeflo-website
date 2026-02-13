/**
 * Seed knowledge base from text/md/srt files in the _knowledge/ directory.
 * Idempotent: skips documents that already exist by title match.
 *
 * Usage: pnpm db:seed-knowledge
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { enqueueJob } from "../jobs/queue";

const KNOWLEDGE_DIR = path.resolve(import.meta.dirname, "../../_knowledge");

const EXT_TO_MIME: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/plain",
  ".srt": "application/x-subrip",
};

const EXT_TO_TYPE: Record<string, string> = {
  ".txt": "framework",
  ".md": "framework",
  ".srt": "transcript",
};

function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("[KnowledgeSeed] Database not available. Set DATABASE_URL.");
    process.exit(1);
  }

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error(`[KnowledgeSeed] Directory not found: ${KNOWLEDGE_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    return ext in EXT_TO_MIME;
  });

  if (files.length === 0) {
    console.log("[KnowledgeSeed] No eligible files found in _knowledge/");
    process.exit(0);
  }

  console.log(`[KnowledgeSeed] Found ${files.length} files to process`);
  let seeded = 0;
  let skipped = 0;

  for (const filename of files) {
    const title = titleFromFilename(filename);

    // Check for existing document by title (idempotent)
    const existing = await db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.title, title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  [skip] "${title}" already exists (id: ${existing[0].id})`);
      skipped++;
      continue;
    }

    const ext = path.extname(filename).toLowerCase();
    const filePath = path.join(KNOWLEDGE_DIR, filename);
    const rawContent = fs.readFileSync(filePath, "utf-8");
    const mimeType = EXT_TO_MIME[ext] ?? "text/plain";
    const docType = EXT_TO_TYPE[ext] ?? "framework";

    const rows = await db
      .insert(documents)
      .values({
        title,
        type: docType as any,
        status: "pending",
        rawContent,
        filename,
        mimeType,
        tags: ["seed", "knowledge-base"],
      })
      .returning();

    const doc = rows[0];
    await enqueueJob("embed_document", { documentId: doc.id });

    console.log(`  [seed] "${title}" → document #${doc.id} (queued for embedding)`);
    seeded++;
  }

  console.log(`\n[KnowledgeSeed] Done: ${seeded} seeded, ${skipped} skipped`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[KnowledgeSeed] Fatal error:", err);
  process.exit(1);
});
