import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  AI_FINANCE_REPORT,
  AI_FINANCE_REPORT_FILENAME,
  AI_FINANCE_REPORT_ROUTE,
} from "@shared/aiFinanceReport";
import { registerReportRoutes } from "./reportRoutes";

function createApp() {
  const app = express();
  registerReportRoutes(app);
  return app;
}

describe("reportRoutes", () => {
  it("serves the AI in Finance report as html", async () => {
    const app = createApp();

    const res = await request(app).get(AI_FINANCE_REPORT_ROUTE);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain(AI_FINANCE_REPORT.title);
    expect(res.text).toContain(
      AI_FINANCE_REPORT.subtitle.replace("'", "&#39;")
    );
    expect(res.text).toContain("Executive Summary");
  });

  it("returns an attachment when download mode is requested", async () => {
    const app = createApp();

    const res = await request(app)
      .get(AI_FINANCE_REPORT_ROUTE)
      .query({
        company: "Acme Holdings",
        download: "1",
        email: "alex@example.com",
        name: "Alex Morgan",
        role: "CFO",
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(
      AI_FINANCE_REPORT_FILENAME
    );
    expect(res.text).toContain("Alex Morgan");
    expect(res.text).toContain("Acme Holdings");
    expect(res.text).toContain("alex@example.com");
  });
});
