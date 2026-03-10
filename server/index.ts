import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { appRouter } from "./routers";
import { createContext } from "./context";
import { buildReadinessSnapshot } from "./readiness";
import { registerReportRoutes } from "./reportRoutes";
import { serveStatic, setupVite } from "./vite";
import { registerWebhookRoutes } from "./webhooks";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "financeflo-website",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/ready", async (_req, res) => {
    const readiness = await buildReadinessSnapshot();
    res.status(readiness.status === "ready" ? 200 : 503).json({
      status: readiness.status,
      service: "financeflo-website",
      timestamp: new Date().toISOString(),
      checks: readiness.checks,
      ...(readiness.issues ? { issues: readiness.issues } : {}),
    });
  });

  // Auth routes under /api/auth/*
  registerAuthRoutes(app);

  // Webhook routes for external service callbacks
  registerWebhookRoutes(app);

  // Public report delivery routes
  registerReportRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "10000");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
