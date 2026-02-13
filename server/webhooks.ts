/**
 * Express routes for external webhook callbacks.
 * Handles HeyReach (LinkedIn) and email service (SES/SendGrid) status updates.
 */
import type { Express, Request, Response } from "express";
import { processHeyReachWebhook, processEmailWebhook } from "./outreach/tracker";

/**
 * Register webhook routes on the Express app.
 * Called once at server startup.
 */
export function registerWebhookRoutes(app: Express): void {
  // HeyReach webhook endpoint
  app.post("/api/webhooks/heyreach", async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (!payload || typeof payload !== "object") {
        res.status(400).json({ error: "Invalid payload" });
        return;
      }

      console.log(`[Webhook] HeyReach event: ${payload.event_type || "unknown"}`);
      await processHeyReachWebhook(payload);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("[Webhook] HeyReach error:", error.message);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Email service webhook endpoint (SES SNS notifications or SendGrid Event Webhook)
  app.post("/api/webhooks/email", async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      // SES sends notifications via SNS which may need subscription confirmation
      if (payload.Type === "SubscriptionConfirmation" && payload.SubscribeURL) {
        // Auto-confirm SNS subscription
        const fetch = globalThis.fetch;
        await fetch(payload.SubscribeURL);
        console.log("[Webhook] SNS subscription confirmed");
        res.status(200).json({ confirmed: true });
        return;
      }

      // SES wraps events in an SNS notification
      if (payload.Type === "Notification" && payload.Message) {
        const message = JSON.parse(payload.Message);
        await processEmailWebhook(message);
      } else if (Array.isArray(payload)) {
        // SendGrid sends an array of events
        for (const event of payload) {
          await processEmailWebhook(event);
        }
      } else {
        await processEmailWebhook(payload);
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error("[Webhook] Email error:", error.message);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  console.log("[Webhooks] Registered: /api/webhooks/heyreach, /api/webhooks/email");
}
