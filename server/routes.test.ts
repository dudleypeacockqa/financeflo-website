import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./context";

/**
 * Tests for FinanceFlo.ai tRPC API routes.
 * We mock the database and GHL modules to test router logic in isolation.
 */

// ─── MOCKS ─────────────────────────────────────────────────────────────────

// Mock the database module
vi.mock("./db", () => {
  let leadIdCounter = 100;
  let assessmentIdCounter = 200;
  let proposalIdCounter = 300;
  let workshopIdCounter = 400;

  return {
    createLead: vi.fn(async (input: Record<string, unknown>) => ({
      id: ++leadIdCounter,
      ...input,
      ghlContactId: null,
      archetype: null,
      tags: input.tags || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getLeadById: vi.fn(async (id: number) => ({
      id,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      company: "Test Corp",
      jobTitle: "CFO",
      phone: null,
      linkedinUrl: null,
      companySize: "51-200",
      industry: null,
      country: null,
      source: "quiz",
      archetype: null,
      ghlContactId: null,
      tags: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getLeadByEmail: vi.fn(async (_email: string) => null),
    listLeads: vi.fn(async (_limit: number) => []),
    updateLeadGhlId: vi.fn(async () => {}),
    createAssessment: vi.fn(async (input: Record<string, unknown>) => ({
      id: ++assessmentIdCounter,
      ...input,
      proposalGenerated: 0,
      createdAt: new Date(),
    })),
    getAssessmentById: vi.fn(async (id: number) => ({
      id,
      leadId: 101,
      answers: { company_size: "mid_group" },
      constraintScores: { capacity: 75, process: 50 },
      overallScore: 65,
      primaryConstraint: "capacity",
      costOfInaction: 150000,
      recommendedTier: "quick_wins" as const,
      recommendedPhase: "assess",
      proposalGenerated: 0,
      createdAt: new Date(),
    })),
    getAssessmentsByLeadId: vi.fn(async () => []),
    markAssessmentProposalGenerated: vi.fn(async () => {}),
    createProposal: vi.fn(async (input: Record<string, unknown>) => ({
      id: ++proposalIdCounter,
      ...input,
      pdfUrl: null,
      sentAt: null,
      viewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getProposalById: vi.fn(async (id: number) => ({
      id,
      leadId: 101,
      assessmentId: 201,
      title: "Test Proposal",
      content: { title: "Test", executiveSummary: "Summary" },
      pdfUrl: null,
      status: "draft" as const,
      estimatedValue: 50000,
      sentAt: null,
      viewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getProposalsByLeadId: vi.fn(async () => []),
    updateProposalStatus: vi.fn(async () => {}),
    updateProposalPdfUrl: vi.fn(async () => {}),
    createWorkshopRegistration: vi.fn(async (input: Record<string, unknown>) => ({
      id: ++workshopIdCounter,
      ...input,
      status: "registered",
      prepCompleted: 0,
      surveyCompleted: 0,
      certificateIssued: 0,
      ghlEventId: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getWorkshopRegistrationsByWorkshopId: vi.fn(async () => []),
    updateWorkshopStatus: vi.fn(async () => {}),
    logWebhookEvent: vi.fn(async () => {}),
  };
});

// Mock the GHL module
vi.mock("./ghl", () => ({
  sendToGHL: vi.fn(async () => {}),
}));

// Mock the proposal generator (LLM call)
vi.mock("./proposalGenerator", () => ({
  generateProposalContent: vi.fn(async () => ({
    title: "AI Transformation Proposal for Test Corp",
    executiveSummary: "A comprehensive proposal...",
    constraintDiagnosis: {
      primaryConstraint: "capacity",
      constraintBreakdown: { capacity: 75, process: 50 },
      costOfInaction: 150000,
    },
    recommendedSolution: {
      tier: "quick_wins",
      description: "Quick wins sprint",
      deliverables: ["Automated reconciliation", "AI-powered reporting"],
      timeline: "4-8 weeks",
    },
    roiProjection: {
      year1Savings: 120000,
      year3Savings: 400000,
      roiMultiple: 3.2,
      paybackMonths: 6,
    },
    pricingIndicative: {
      auditFee: "£7,500",
      implementationRange: "£25,000 – £45,000",
      monthlyRetainer: "£8,000",
    },
    nextSteps: ["Book strategy call", "Schedule audit"],
    estimatedValue: 50000,
  })),
}));

// Mock the PDF generator
vi.mock("./pdfGenerator", () => ({
  generateAndUploadProposal: vi.fn(async () => "https://s3.example.com/proposals/test.pdf"),
}));

// ─── HELPERS ────────────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "owner-user",
      email: "owner@financeflo.ai",
      name: "Dudley Peacock",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe("lead.create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new lead with required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      firstName: "John",
      lastName: "Smith",
      email: "john@acme.com",
      source: "quiz",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeTypeOf("number");
    expect(result.firstName).toBe("John");
    expect(result.lastName).toBe("Smith");
    expect(result.email).toBe("john@acme.com");
  });

  it("creates a lead with all optional fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@corp.co.za",
      company: "Corp Holdings",
      jobTitle: "CFO",
      phone: "+27 82 123 4567",
      companySize: "51-200",
      industry: "Financial Services",
      country: "South Africa",
      source: "workshop",
      tags: ["high-value", "multi-entity"],
      utmSource: "linkedin",
      utmMedium: "paid",
      utmCampaign: "q2-workshop",
    });

    expect(result).toBeDefined();
    expect(result.company).toBe("Corp Holdings");
    expect(result.source).toBe("workshop");
  });

  it("returns existing lead if email already exists", async () => {
    const { getLeadByEmail } = await import("./db");
    (getLeadByEmail as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 42,
      firstName: "Existing",
      lastName: "User",
      email: "existing@test.com",
      source: "quiz",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      firstName: "New",
      lastName: "User",
      email: "existing@test.com",
      source: "quiz",
    });

    expect(result.id).toBe(42);
    expect(result.firstName).toBe("Existing");
  });

  it("fires GHL webhook on new lead creation", async () => {
    const { sendToGHL } = await import("./ghl");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.lead.create({
      firstName: "Webhook",
      lastName: "Test",
      email: "webhook@test.com",
      source: "contact",
    });

    // sendToGHL is called asynchronously (fire-and-forget)
    // Give it a tick to resolve
    await new Promise((r) => setTimeout(r, 10));

    expect(sendToGHL).toHaveBeenCalledWith(
      "lead_created",
      expect.objectContaining({
        email: "webhook@test.com",
        source: "contact",
      })
    );
  });

  it("rejects invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lead.create({
        firstName: "Bad",
        lastName: "Email",
        email: "not-an-email",
        source: "quiz",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid source enum value", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lead.create({
        firstName: "Bad",
        lastName: "Source",
        email: "test@test.com",
        source: "invalid_source" as any,
      })
    ).rejects.toThrow();
  });
});

describe("lead.getById", () => {
  it("returns a lead by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.getById({ id: 101 });

    expect(result).toBeDefined();
    expect(result?.id).toBe(101);
    expect(result?.firstName).toBe("Test");
  });
});

describe("lead.list", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.lead.list()).rejects.toThrow();
  });

  it("returns leads when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("assessment.submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an assessment with valid data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assessment.submit({
      leadId: 101,
      answers: { company_size: "mid_group", revenue_band: "10m_50m" },
      constraintScores: { capacity: 75, process: 50, knowledge: 25 },
      overallScore: 65,
      primaryConstraint: "capacity",
      costOfInaction: 150000,
      recommendedTier: "quick_wins",
      recommendedPhase: "assess",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeTypeOf("number");
    expect(result.overallScore).toBe(65);
    expect(result.primaryConstraint).toBe("capacity");
  });

  it("fires GHL webhook on assessment submission", async () => {
    const { sendToGHL } = await import("./ghl");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.assessment.submit({
      leadId: 101,
      answers: { test: "value" },
      constraintScores: { capacity: 80 },
      overallScore: 72,
      primaryConstraint: "capacity",
      recommendedTier: "audit",
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(sendToGHL).toHaveBeenCalledWith(
      "assessment_completed",
      expect.objectContaining({
        leadId: 101,
        overallScore: 72,
        primaryConstraint: "capacity",
      })
    );
  });

  it("rejects invalid recommendedTier", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assessment.submit({
        leadId: 101,
        answers: {},
        constraintScores: {},
        overallScore: 50,
        primaryConstraint: "process",
        recommendedTier: "invalid_tier" as any,
      })
    ).rejects.toThrow();
  });
});

describe("assessment.getById", () => {
  it("returns an assessment by ID", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assessment.getById({ id: 201 });

    expect(result).toBeDefined();
    expect(result?.id).toBe(201);
    expect(result?.overallScore).toBe(65);
  });
});

describe("proposal.generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a proposal from lead and assessment", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.proposal.generate({
      leadId: 101,
      assessmentId: 201,
    });

    expect(result).toBeDefined();
    expect(result.id).toBeTypeOf("number");
    expect(result.title).toBe("AI Transformation Proposal for Test Corp");
    expect(result.status).toBe("draft");
  });

  it("marks assessment as proposal generated", async () => {
    const { markAssessmentProposalGenerated } = await import("./db");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.proposal.generate({
      leadId: 101,
      assessmentId: 201,
    });

    expect(markAssessmentProposalGenerated).toHaveBeenCalledWith(201);
  });

  it("fires GHL webhook on proposal generation", async () => {
    const { sendToGHL } = await import("./ghl");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.proposal.generate({
      leadId: 101,
      assessmentId: 201,
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(sendToGHL).toHaveBeenCalledWith(
      "proposal_generated",
      expect.objectContaining({
        leadId: 101,
        assessmentId: 201,
        title: "AI Transformation Proposal for Test Corp",
      })
    );
  });
});

describe("proposal.generatePdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a PDF and returns the URL", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.proposal.generatePdf({
      proposalId: 301,
    });

    expect(result).toBeDefined();
    expect(result.pdfUrl).toBe("https://s3.example.com/proposals/test.pdf");
  });

  it("updates the proposal with the PDF URL", async () => {
    const { updateProposalPdfUrl } = await import("./db");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.proposal.generatePdf({ proposalId: 301 });

    expect(updateProposalPdfUrl).toHaveBeenCalledWith(
      301,
      "https://s3.example.com/proposals/test.pdf"
    );
  });
});

describe("proposal.updateStatus", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.proposal.updateStatus({ id: 301, status: "sent" })
    ).rejects.toThrow();
  });

  it("updates status when authenticated", async () => {
    const { updateProposalStatus } = await import("./db");

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.proposal.updateStatus({ id: 301, status: "sent" });

    expect(result).toEqual({ success: true });
    expect(updateProposalStatus).toHaveBeenCalledWith(301, "sent");
  });
});

describe("workshop.register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers a lead for a workshop", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.workshop.register({
      leadId: 101,
      workshopId: "ai-in-action-finance-2026-q2",
      workshopTitle: "AI in Action for Finance Leaders",
    });

    expect(result).toBeDefined();
    expect(result.id).toBeTypeOf("number");
    expect(result.workshopId).toBe("ai-in-action-finance-2026-q2");
    expect(result.status).toBe("registered");
  });

  it("fires GHL webhook on workshop registration", async () => {
    const { sendToGHL } = await import("./ghl");

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.workshop.register({
      leadId: 101,
      workshopId: "ai-in-action-finance-2026-q2",
      workshopTitle: "AI in Action for Finance Leaders",
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(sendToGHL).toHaveBeenCalledWith(
      "workshop_registered",
      expect.objectContaining({
        leadId: 101,
        workshopId: "ai-in-action-finance-2026-q2",
      })
    );
  });
});

describe("workshop.listByWorkshop", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.workshop.listByWorkshop({ workshopId: "test" })
    ).rejects.toThrow();
  });

  it("returns registrations when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.workshop.listByWorkshop({
      workshopId: "ai-in-action-finance-2026-q2",
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("workshop.updateStatus", () => {
  it("requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.workshop.updateStatus({ id: 401, status: "confirmed" })
    ).rejects.toThrow();
  });

  it("updates workshop registration status when authenticated", async () => {
    const { updateWorkshopStatus } = await import("./db");

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.workshop.updateStatus({ id: 401, status: "attended" });

    expect(result).toEqual({ success: true });
    expect(updateWorkshopStatus).toHaveBeenCalledWith(401, "attended");
  });
});
