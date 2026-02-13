/**
 * One-off script to ingest SRT transcript files into the knowledge base.
 *
 * Usage:
 *   npx tsx server/scripts/ingest-srt.ts
 *
 * Reads SRT files from the "Mansel Scheffal Skool Course/" directory,
 * parses them, inserts document records, and queues embed_document jobs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { documents, backgroundJobs } from "../../drizzle/schema";

/** Inline copy of parseSrt to avoid transitive pdf-parse ESM issue. */
function parseSrt(content: string): string {
  return content
    .split(/\r?\n\r?\n/)
    .map((block) => {
      const lines = block.trim().split(/\r?\n/);
      return lines.slice(2).join(" ");
    })
    .filter((text) => text.trim().length > 0)
    .join(" ");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRT_DIR = path.resolve(__dirname, "../../Mansel Scheffal Skool Course");
const TAGS = ["mansel-scheffal", "skool-course"];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Exiting.");
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Find all .srt files in the directory
  const files = fs.readdirSync(SRT_DIR).filter((f) => f.endsWith(".srt"));
  if (files.length === 0) {
    console.log("No .srt files found in", SRT_DIR);
    await pool.end();
    return;
  }

  console.log(`Found ${files.length} SRT file(s) to ingest:\n`);

  for (const filename of files) {
    const filePath = path.join(SRT_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = parseSrt(raw);
    const title = filename.replace(/\.srt$/, "");

    console.log(`  "${title}"`);
    console.log(`    Raw length: ${raw.length} chars -> Parsed: ${parsed.length} chars`);

    // Insert document record
    const [doc] = await db
      .insert(documents)
      .values({
        title,
        type: "course_material",
        status: "pending",
        rawContent: parsed,
        filename,
        mimeType: "application/x-subrip",
        fileSize: Buffer.byteLength(raw, "utf-8"),
        tags: TAGS,
        metadata: { source: "mansel-scheffal-skool-course" },
      })
      .returning({ id: documents.id });

    console.log(`    -> Document #${doc.id} created`);

    // Queue embed_document background job
    await db.insert(backgroundJobs).values({
      type: "embed_document",
      payload: { documentId: doc.id },
    });

    console.log(`    -> embed_document job queued`);
  }

  console.log(`\nDone. ${files.length} document(s) inserted with embed jobs queued.`);
  console.log("Start the server/worker to process embeddings, or run the job handler manually.");

  await pool.end();
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
