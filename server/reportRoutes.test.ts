import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AI_FINANCE_REPORT,
  AI_FINANCE_REPORT_FILENAME,
  AI_FINANCE_REPORT_ROUTE,
} from "@shared/aiFinanceReport";
import {
  ASSESSMENT_REPORT_FILENAME,
  ASSESSMENT_REPORT_ROUTE,
} from "@shared/assessmentReport";
import { createAssessmentReportToken } from "./assessmentReportTokens";
import { createGeneratedDocument } from "./db";
import { renderHtmlToPdf } from "./pdfRenderer";
import { registerReportRoutes } from "./reportRoutes";

vi.mock("./db", () => ({
  createGeneratedDocument: vi.fn(async () => ({ id: 901 })),
  getAssessmentById: vi.fn(async (id: number) => {
    if (id !== 201) {
      return undefined;
    }

    return {
      id,
      leadId: 101,
      answers: {
        region: "UK",
        company_size: "mid_group",
        bottleneck_area: "close",
        decision_authority: "decision_maker",
      },
      constraintScores: {
        capacity: 82,
        process: 61,
      },
      overallScore: 72,
      primaryConstraint: "capacity",
      costOfInaction: 180000,
      recommendedTier: "quick_wins",
      createdAt: new Date("2026-03-10T12:00:00.000Z"),
    };
  }),
  getLeadById: vi.fn(async (id: number) => {
    if (id !== 101) {
      return undefined;
    }

    return {
      id,
      firstName: "Edward",
      lastName: "Wright",
      email: "edward@example.com",
      company: "Acme Holdings UK",
      jobTitle: "CFO",
    };
  }),
  getLeadByEmail: vi.fn(async (email: string) => {
    if (email !== "alex@example.com") {
      return undefined;
    }

    return {
      id: 101,
      firstName: "Alex",
      lastName: "Morgan",
      email,
      company: "Acme Holdings",
      jobTitle: "CFO",
    };
  }),
}));

vi.mock("./pdfRenderer", () => ({
  renderHtmlToPdf: vi.fn(async () => Buffer.from("%PDF-1.7\nmock")),
}));

function binaryParser(
  res: NodeJS.ReadableStream,
  callback: (error: Error | null, data?: Buffer) => void
) {
  const chunks: Buffer[] = [];

  res.on("data", (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });
  res.on("end", () => {
    callback(null, Buffer.concat(chunks));
  });
  res.on("error", (error) => {
    callback(error);
  });
}

function createApp() {
  const app = express();
  registerReportRoutes(app);
  return app;
}

describe("reportRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(renderHtmlToPdf).not.toHaveBeenCalled();
  });

  it("returns a pdf attachment when download mode is requested", async () => {
    const app = createApp();

    const res = await request(app)
      .get(AI_FINANCE_REPORT_ROUTE)
      .query({
        company: "Acme Holdings",
        download: "1",
        email: "alex@example.com",
        leadId: "101",
        name: "Alex Morgan",
        role: "CFO",
      })
      .buffer(true)
      .parse(binaryParser);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(
      AI_FINANCE_REPORT_FILENAME
    );
    expect(res.body.equals(Buffer.from("%PDF-1.7\nmock"))).toBe(true);
    expect(renderHtmlToPdf).toHaveBeenCalledTimes(1);
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "Alex Morgan"
    );
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "Acme Holdings"
    );
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "alex@example.com"
    );
    expect(createGeneratedDocument).toHaveBeenCalledTimes(1);
    expect(vi.mocked(createGeneratedDocument).mock.calls[0]?.[0]).toMatchObject(
      {
        leadId: 101,
        type: "ai_finance_report",
        filename: AI_FINANCE_REPORT_FILENAME,
        mimeType: "application/pdf",
      }
    );
  });

  it("serves a signed assessment report with captured answers", async () => {
    const app = createApp();
    const token = createAssessmentReportToken(201);

    const res = await request(app).get(ASSESSMENT_REPORT_ROUTE).query({
      token,
    });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Assessment Summary");
    expect(res.text).toContain("Edward Wright - CFO - Acme Holdings UK");
    expect(res.text).toContain("Capacity Constraint");
    expect(res.text).toContain("5 Value Levers for Acme Holdings UK");
    expect(res.text).toContain("Ready to Eliminate Your Constraints?");
    expect(res.text).toContain(
      "How many entities or companies does your group manage?"
    );
    expect(res.text).toContain("6-15 entities");
  });

  it("returns an attachment for assessment report downloads", async () => {
    const app = createApp();
    const token = createAssessmentReportToken(201);

    const res = await request(app)
      .get(ASSESSMENT_REPORT_ROUTE)
      .query({
        download: "1",
        token,
      })
      .buffer(true)
      .parse(binaryParser);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("application/pdf");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.headers["content-disposition"]).toContain(
      ASSESSMENT_REPORT_FILENAME
    );
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "Ready to Eliminate Your Constraints?"
    );
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "/booking/erp-consultation?source=assessment-report&amp;assessmentId=201"
    );
    expect(vi.mocked(renderHtmlToPdf).mock.calls[0]?.[0]).toContain(
      "Get My Proposal"
    );
    expect(createGeneratedDocument).toHaveBeenCalledTimes(1);
    expect(vi.mocked(createGeneratedDocument).mock.calls[0]?.[0]).toMatchObject(
      {
        assessmentId: 201,
        leadId: 101,
        type: "assessment_report",
        filename: ASSESSMENT_REPORT_FILENAME,
        mimeType: "application/pdf",
      }
    );
  });
});
