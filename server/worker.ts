/**
 * Background Worker Entry Point (Option B Architecture)
 *
 * This runs as a separate Render Background Worker service.
 * It polls the backgroundJobs table and processes jobs.
 *
 * Start: NODE_ENV=production node dist/worker.js
 * Dev:   NODE_ENV=development tsx server/worker.ts
 */
import "dotenv/config";
import { registerAllHandlers } from "./jobs/handlers";
import { startWorkerLoop } from "./jobs/queue";
import { seedPromptTemplates } from "./prompts/seed";

const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL || "5000");

async function main() {
  console.log("[Worker] FinanceFlo Background Worker starting...");
  console.log(`[Worker] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[Worker] Poll interval: ${POLL_INTERVAL_MS}ms`);

  // Register all job handlers
  registerAllHandlers();
  console.log("[Worker] Job handlers registered");

  // Seed prompt templates on startup (idempotent)
  try {
    await seedPromptTemplates();
  } catch (error) {
    console.warn("[Worker] Failed to seed prompts (non-fatal):", error);
  }

  // Start the polling loop
  await startWorkerLoop(POLL_INTERVAL_MS);
}

main().catch(error => {
  console.error("[Worker] Fatal error:", error);
  process.exit(1);
});
