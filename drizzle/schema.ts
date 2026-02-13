import { pgTable, serial, text, varchar, integer, timestamp, jsonb, boolean, pgEnum, index, customType } from "drizzle-orm/pg-core";

// ─── CUSTOM TYPES ─────────────────────────────────────────────────────────
const vector = customType<{ data: number[]; dpiData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    const str = value as string;
    return str
      .slice(1, -1)
      .split(",")
      .map(Number);
  },
});

// ─── ENUMS ────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const leadSourceEnum = pgEnum("lead_source", ["quiz", "lead_magnet", "workshop", "contact", "referral", "linkedin"]);
export const assessmentTierEnum = pgEnum("assessment_tier", ["audit", "quick_wins", "implementation", "retainer"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "sent", "viewed", "accepted", "declined"]);
export const workshopStatusEnum = pgEnum("workshop_status", ["registered", "confirmed", "attended", "no_show", "cancelled"]);
export const documentTypeEnum = pgEnum("document_type", ["transcript", "meeting_notes", "framework", "course_material", "prompt", "other"]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "processing", "ready", "error"]);
export const jobStatusEnum = pgEnum("job_status", ["pending", "running", "completed", "failed", "cancelled"]);
export const promptCategoryEnum = pgEnum("prompt_category", ["lead_analysis", "dm_sequence", "proposal", "aiba_diagnostic", "research", "general"]);
export const researchStatusEnum = pgEnum("research_status", ["none", "pending", "researching", "analyzed", "sequenced", "complete", "error"]);
export const batchStatusEnum = pgEnum("batch_status", ["draft", "queued", "running", "paused", "completed", "failed"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads captured from quiz funnel, lead magnet downloads, workshop registrations, etc.
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: varchar("firstName", { length: 128 }).notNull(),
  lastName: varchar("lastName", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 256 }),
  jobTitle: varchar("jobTitle", { length: 256 }),
  phone: varchar("phone", { length: 64 }),
  linkedinUrl: varchar("linkedinUrl", { length: 512 }),
  companySize: varchar("companySize", { length: 64 }),
  industry: varchar("industry", { length: 128 }),
  country: varchar("country", { length: 128 }),
  source: leadSourceEnum("source").notNull(),
  /** Archetype from lead gen system: Declared Change, Active Execution, Latent Operational Friction */
  archetype: varchar("archetype", { length: 128 }),
  /** GHL contact ID once synced */
  ghlContactId: varchar("ghlContactId", { length: 128 }),
  /** Tags for segmentation */
  tags: jsonb("tags").$type<string[]>(),
  /** UTM parameters */
  utmSource: varchar("utmSource", { length: 256 }),
  utmMedium: varchar("utmMedium", { length: 256 }),
  utmCampaign: varchar("utmCampaign", { length: 256 }),
  /** Phase 2: Lead enrichment fields */
  linkedinHeadline: varchar("linkedinHeadline", { length: 512 }),
  companyWebsite: varchar("companyWebsite", { length: 512 }),
  companyEmployeeCount: integer("companyEmployeeCount"),
  enrichedAt: timestamp("enrichedAt"),
  researchStatus: researchStatusEnum("researchStatus").default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Assessment quiz submissions — stores full quiz answers and computed scores.
 */
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  /** Full quiz answers as JSON */
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull(),
  /** Constraint scores: capacity, knowledge, process, scale */
  constraintScores: jsonb("constraintScores").$type<Record<string, number>>().notNull(),
  /** Overall readiness score 0-100 */
  overallScore: integer("overallScore").notNull(),
  /** Primary constraint identified */
  primaryConstraint: varchar("primaryConstraint", { length: 64 }).notNull(),
  /** Cost of Inaction estimate in GBP */
  costOfInaction: integer("costOfInaction"),
  /** Recommended engagement tier */
  recommendedTier: assessmentTierEnum("recommendedTier").notNull(),
  /** Recommended ADAPT phase to start */
  recommendedPhase: varchar("recommendedPhase", { length: 32 }),
  /** Whether proposal has been generated */
  proposalGenerated: integer("proposalGenerated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * Generated proposals — stores the proposal data and PDF URL.
 */
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  assessmentId: integer("assessmentId"),
  /** Proposal title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Full proposal content as structured JSON */
  content: jsonb("content").$type<Record<string, unknown>>().notNull(),
  /** S3 URL of generated PDF */
  pdfUrl: varchar("pdfUrl", { length: 1024 }),
  /** Proposal status */
  status: proposalStatusEnum("status").default("draft").notNull(),
  /** Total estimated value in GBP */
  estimatedValue: integer("estimatedValue"),
  /** When the proposal was sent */
  sentAt: timestamp("sentAt"),
  /** When the proposal was viewed */
  viewedAt: timestamp("viewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

/**
 * Workshop registrations — for AI in Action for Finance workshop series.
 */
export const workshopRegistrations = pgTable("workshopRegistrations", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(),
  /** Which workshop session */
  workshopId: varchar("workshopId", { length: 128 }).notNull(),
  workshopTitle: varchar("workshopTitle", { length: 512 }).notNull(),
  /** Registration status */
  status: workshopStatusEnum("status").default("registered").notNull(),
  /** Pre-workshop prep completed */
  prepCompleted: integer("prepCompleted").default(0).notNull(),
  /** Post-workshop survey completed */
  surveyCompleted: integer("surveyCompleted").default(0).notNull(),
  /** Certificate issued */
  certificateIssued: integer("certificateIssued").default(0).notNull(),
  /** GHL event ID */
  ghlEventId: varchar("ghlEventId", { length: 128 }),
  /** Notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type WorkshopRegistration = typeof workshopRegistrations.$inferSelect;
export type InsertWorkshopRegistration = typeof workshopRegistrations.$inferInsert;

/**
 * GHL webhook events log — tracks all webhook calls for debugging.
 */
export const webhookEvents = pgTable("webhookEvents", {
  id: serial("id").primaryKey(),
  /** Event type: lead_created, assessment_completed, proposal_sent, workshop_registered */
  eventType: varchar("eventType", { length: 128 }).notNull(),
  /** Related entity ID */
  entityId: integer("entityId"),
  /** Full payload sent to GHL */
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  /** HTTP response status from GHL */
  responseStatus: integer("responseStatus"),
  /** Whether the webhook was successful */
  success: integer("success").default(0).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

// ─── PHASE 1: KNOWLEDGE BASE ──────────────────────────────────────────────

/**
 * Uploaded documents: transcripts, meeting notes, frameworks, course materials.
 */
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  /** Document title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Document type classification */
  type: documentTypeEnum("type").notNull(),
  /** Processing status */
  status: documentStatusEnum("status").default("pending").notNull(),
  /** Raw text content (for text-based docs) */
  rawContent: text("rawContent"),
  /** S3 key for original file */
  s3Key: varchar("s3Key", { length: 1024 }),
  /** Original filename */
  filename: varchar("filename", { length: 512 }),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 128 }),
  /** File size in bytes */
  fileSize: integer("fileSize"),
  /** Tags for filtering */
  tags: jsonb("tags").$type<string[]>(),
  /** Arbitrary metadata */
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  /** Number of chunks generated */
  chunkCount: integer("chunkCount").default(0).notNull(),
  /** Processing error message */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Chunked text with pgvector embeddings for semantic search.
 */
export const knowledgeChunks = pgTable("knowledgeChunks", {
  id: serial("id").primaryKey(),
  /** Parent document */
  documentId: integer("documentId").notNull(),
  /** Chunk sequential index within document */
  chunkIndex: integer("chunkIndex").notNull(),
  /** Text content of this chunk */
  content: text("content").notNull(),
  /** Embedding vector (1536 dimensions for Voyage AI) */
  embedding: vector("embedding"),
  /** Token count for this chunk */
  tokenCount: integer("tokenCount").notNull(),
  /** Metadata for filtering */
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("knowledgeChunks_documentId_idx").on(table.documentId),
]);

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = typeof knowledgeChunks.$inferInsert;

// ─── PHASE 1: BACKGROUND JOBS ─────────────────────────────────────────────

/**
 * PostgreSQL-backed job queue for async operations.
 */
export const backgroundJobs = pgTable("backgroundJobs", {
  id: serial("id").primaryKey(),
  /** Job type identifier (e.g., "embed_document", "research_lead", "send_email") */
  type: varchar("type", { length: 128 }).notNull(),
  /** Current status */
  status: jobStatusEnum("status").default("pending").notNull(),
  /** Input payload */
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  /** Result data on completion */
  result: jsonb("result").$type<Record<string, unknown>>(),
  /** Error message on failure */
  errorMessage: text("errorMessage"),
  /** Number of attempts */
  attempts: integer("attempts").default(0).notNull(),
  /** Max attempts before giving up */
  maxAttempts: integer("maxAttempts").default(3).notNull(),
  /** When the job should run (for scheduling) */
  scheduledAt: timestamp("scheduledAt").defaultNow().notNull(),
  /** When processing started */
  startedAt: timestamp("startedAt"),
  /** When processing completed or failed */
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("backgroundJobs_status_scheduledAt_idx").on(table.status, table.scheduledAt),
  index("backgroundJobs_type_idx").on(table.type),
]);

export type BackgroundJob = typeof backgroundJobs.$inferSelect;
export type InsertBackgroundJob = typeof backgroundJobs.$inferInsert;

// ─── PHASE 1: PROMPT TEMPLATES ────────────────────────────────────────────

/**
 * GOTCHA hardprompts stored in DB for version management and A/B testing.
 */
export const promptTemplates = pgTable("promptTemplates", {
  id: serial("id").primaryKey(),
  /** Unique prompt name (e.g., "lead_analysis_v1") */
  name: varchar("name", { length: 256 }).notNull().unique(),
  /** Category for grouping */
  category: promptCategoryEnum("category").notNull(),
  /** Description of what this prompt does */
  description: text("description"),
  /** System prompt content */
  systemPrompt: text("systemPrompt").notNull(),
  /** User prompt template with {{variable}} placeholders */
  userPromptTemplate: text("userPromptTemplate").notNull(),
  /** Which model to use */
  model: varchar("model", { length: 128 }).default("claude-sonnet-4-5-20250929").notNull(),
  /** Version number for tracking changes */
  version: integer("version").default(1).notNull(),
  /** Whether this is the active version */
  isActive: integer("isActive").default(1).notNull(),
  /** Max tokens for response */
  maxTokens: integer("maxTokens").default(4096).notNull(),
  /** Temperature setting */
  temperature: varchar("temperature", { length: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("promptTemplates_category_idx").on(table.category),
])

export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type InsertPromptTemplate = typeof promptTemplates.$inferInsert;

// ─── PHASE 2: LEAD RESEARCH ───────────────────────────────────────────────

/**
 * Research results per lead — LinkedIn scrape, company research, AI analysis, DM sequences.
 */
export const leadResearch = pgTable("leadResearch", {
  id: serial("id").primaryKey(),
  /** The lead this research belongs to */
  leadId: integer("leadId").notNull(),
  /** Raw LinkedIn profile data from Relevance AI */
  linkedinData: jsonb("linkedinData").$type<Record<string, unknown>>(),
  /** Company research from Perplexity AI */
  companyResearch: jsonb("companyResearch").$type<Record<string, unknown>>(),
  /** AI-generated lead profile analysis */
  leadProfile: jsonb("leadProfile").$type<Record<string, unknown>>(),
  /** Pain/gain analysis mapped to 4 Engines */
  painGainAnalysis: jsonb("painGainAnalysis").$type<Record<string, unknown>>(),
  /** Lead archetype classification */
  archetype: varchar("archetype", { length: 128 }),
  /** Constraint classification (Capacity, Knowledge, Process, Scale) */
  constraintType: varchar("constraintType", { length: 64 }),
  /** Generated DM sequence (connection request + 3 DMs) */
  dmSequence: jsonb("dmSequence").$type<Record<string, unknown>>(),
  /** Quality score 1-100 */
  qualityScore: integer("qualityScore"),
  /** Total API cost for this research in USD */
  costUsd: varchar("costUsd", { length: 16 }),
  /** Processing status */
  status: researchStatusEnum("status").default("pending").notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("leadResearch_leadId_idx").on(table.leadId),
]);

export type LeadResearch = typeof leadResearch.$inferSelect;
export type InsertLeadResearch = typeof leadResearch.$inferInsert;

/**
 * Batch processing runs for lead research.
 */
export const leadResearchBatches = pgTable("leadResearchBatches", {
  id: serial("id").primaryKey(),
  /** Batch name for identification */
  name: varchar("name", { length: 256 }).notNull(),
  /** Current status */
  status: batchStatusEnum("status").default("draft").notNull(),
  /** Total leads in batch */
  totalLeads: integer("totalLeads").default(0).notNull(),
  /** Leads processed so far */
  processedLeads: integer("processedLeads").default(0).notNull(),
  /** Leads that failed */
  failedLeads: integer("failedLeads").default(0).notNull(),
  /** Total cost in USD */
  totalCostUsd: varchar("totalCostUsd", { length: 16 }),
  /** Lead list ID this batch is based on (optional) */
  listId: integer("listId"),
  /** Error log entries */
  errors: jsonb("errors").$type<{ leadId: number; error: string }[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LeadResearchBatch = typeof leadResearchBatches.$inferSelect;
export type InsertLeadResearchBatch = typeof leadResearchBatches.$inferInsert;

/**
 * Named lists for organizing leads.
 */
export const leadLists = pgTable("leadLists", {
  id: serial("id").primaryKey(),
  /** List name */
  name: varchar("name", { length: 256 }).notNull(),
  /** Description */
  description: text("description"),
  /** Number of members (denormalized for performance) */
  memberCount: integer("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type LeadList = typeof leadLists.$inferSelect;
export type InsertLeadList = typeof leadLists.$inferInsert;

/**
 * Junction table: lead list membership.
 */
export const leadListMembers = pgTable("leadListMembers", {
  id: serial("id").primaryKey(),
  listId: integer("listId").notNull(),
  leadId: integer("leadId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
}, (table) => [
  index("leadListMembers_listId_idx").on(table.listId),
  index("leadListMembers_leadId_idx").on(table.leadId),
]);

export type LeadListMember = typeof leadListMembers.$inferSelect;
export type InsertLeadListMember = typeof leadListMembers.$inferInsert;

// ─── PHASE 3: OUTREACH AUTOMATION ────────────────────────────────────────

export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "running", "paused", "completed", "cancelled"]);
export const outreachChannelEnum = pgEnum("outreach_channel", ["linkedin_dm", "linkedin_connection", "email"]);
export const messageStatusEnum = pgEnum("message_status", ["pending", "scheduled", "sent", "delivered", "opened", "clicked", "replied", "bounced", "failed"]);

/**
 * Outreach campaigns — multi-channel sequences targeting lead lists.
 */
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  /** Campaign name */
  name: varchar("name", { length: 256 }).notNull(),
  /** Primary channel */
  channel: outreachChannelEnum("channel").notNull(),
  /** Current status */
  status: campaignStatusEnum("status").default("draft").notNull(),
  /** Lead list to target */
  listId: integer("listId"),
  /** Sequence steps config: array of { stepNumber, channel, delayDays, templateBody } */
  sequenceSteps: jsonb("sequenceSteps").$type<{
    stepNumber: number;
    channel: string;
    delayDays: number;
    subject?: string;
    templateBody: string;
  }[]>(),
  /** Campaign settings: daily limits, send windows, etc. */
  settings: jsonb("settings").$type<{
    dailyLimit: number;
    sendWindowStart: string; // HH:mm
    sendWindowEnd: string;   // HH:mm
    timezone: string;
    skipWeekends: boolean;
  }>(),
  /** Aggregated metrics */
  metrics: jsonb("metrics").$type<{
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    replied: number;
    bounced: number;
    failed: number;
  }>(),
  /** External HeyReach campaign ID (if synced) */
  heyreachCampaignId: varchar("heyreachCampaignId", { length: 256 }),
  /** External GHL campaign ID (if synced) */
  ghlCampaignId: varchar("ghlCampaignId", { length: 256 }),
  /** Scheduled start time */
  scheduledAt: timestamp("scheduledAt"),
  /** When campaign started running */
  startedAt: timestamp("startedAt"),
  /** When campaign completed or was cancelled */
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Individual outreach messages — one per lead per step.
 */
export const outreachMessages = pgTable("outreachMessages", {
  id: serial("id").primaryKey(),
  /** Parent campaign */
  campaignId: integer("campaignId").notNull(),
  /** Target lead */
  leadId: integer("leadId").notNull(),
  /** Step number in the sequence */
  stepNumber: integer("stepNumber").notNull(),
  /** Channel for this message */
  channel: outreachChannelEnum("channel").notNull(),
  /** Delivery status */
  status: messageStatusEnum("status").default("pending").notNull(),
  /** Subject line (email only) */
  subject: varchar("subject", { length: 512 }),
  /** AI-personalized message body */
  personalizedBody: text("personalizedBody"),
  /** Original template body before personalization */
  templateBody: text("templateBody"),
  /** External message ID from HeyReach or email service */
  externalMessageId: varchar("externalMessageId", { length: 256 }),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** When scheduled to send */
  scheduledAt: timestamp("scheduledAt"),
  /** When actually sent */
  sentAt: timestamp("sentAt"),
  /** When delivered */
  deliveredAt: timestamp("deliveredAt"),
  /** When opened (email tracking) */
  openedAt: timestamp("openedAt"),
  /** When clicked (email tracking) */
  clickedAt: timestamp("clickedAt"),
  /** When replied */
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("outreachMessages_campaignId_idx").on(table.campaignId),
  index("outreachMessages_leadId_idx").on(table.leadId),
  index("outreachMessages_status_scheduledAt_idx").on(table.status, table.scheduledAt),
]);

export type OutreachMessage = typeof outreachMessages.$inferSelect;
export type InsertOutreachMessage = typeof outreachMessages.$inferInsert;

// ─── PHASE 4: SALES PIPELINE & AIBA ─────────────────────────────────────

export const dealStageEnum = pgEnum("deal_stage", [
  "lead", "mql", "sql", "discovery", "aiba_diagnostic",
  "proposal_sent", "negotiation", "closed_won", "closed_lost",
]);
export const activityTypeEnum = pgEnum("activity_type", ["note", "call", "meeting", "email", "stage_change", "task_completed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "urgent"]);

/**
 * Sales pipeline deals — tracks opportunities from lead to close.
 */
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  /** Associated lead */
  leadId: integer("leadId").notNull(),
  /** Current pipeline stage */
  stage: dealStageEnum("stage").default("lead").notNull(),
  /** Deal title/name */
  title: varchar("title", { length: 512 }).notNull(),
  /** Estimated deal value in GBP */
  value: integer("value"),
  /** Win probability percentage (0-100) */
  probability: integer("probability"),
  /** Weighted value (value * probability / 100) */
  weightedValue: integer("weightedValue"),
  /** Deal owner/assignee */
  assignedTo: varchar("assignedTo", { length: 256 }),
  /** Expected close date */
  expectedCloseDate: timestamp("expectedCloseDate"),
  /** Actual close date */
  closedAt: timestamp("closedAt"),
  /** Loss reason (if closed_lost) */
  lossReason: text("lossReason"),
  /** Notes */
  notes: text("notes"),
  /** Associated AIBA analysis ID */
  aibaAnalysisId: integer("aibaAnalysisId"),
  /** Associated proposal ID */
  proposalId: integer("proposalId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("deals_leadId_idx").on(table.leadId),
  index("deals_stage_idx").on(table.stage),
]);

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;

/**
 * Activity timeline entries for deals.
 */
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  /** Parent deal */
  dealId: integer("dealId").notNull(),
  /** Activity type */
  type: activityTypeEnum("type").notNull(),
  /** Description of the activity */
  description: text("description").notNull(),
  /** Additional metadata (e.g., old/new stage for stage_change) */
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  /** Who performed the activity */
  performedBy: varchar("performedBy", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("activities_dealId_idx").on(table.dealId),
]);

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;

/**
 * AIBA diagnostic analysis reports.
 * Full 4-Engines analysis with constraint classification and recommendations.
 */
export const aibaAnalyses = pgTable("aibaAnalyses", {
  id: serial("id").primaryKey(),
  /** Associated deal (optional — can run standalone) */
  dealId: integer("dealId"),
  /** Associated lead */
  leadId: integer("leadId"),
  /** Input: discovery notes or transcript */
  inputNotes: text("inputNotes"),
  /** 4 Engines analysis: Revenue, Operations, Compliance, Data */
  fourEngines: jsonb("fourEngines").$type<{
    revenue: { score: number; findings: string[]; opportunities: string[] };
    operations: { score: number; findings: string[]; opportunities: string[] };
    compliance: { score: number; findings: string[]; opportunities: string[] };
    data: { score: number; findings: string[]; opportunities: string[] };
  }>(),
  /** Primary constraint classification */
  constraintType: varchar("constraintType", { length: 64 }),
  /** Quick wins (implementable in < 30 days) */
  quickWins: jsonb("quickWins").$type<{
    title: string;
    description: string;
    estimatedImpact: string;
    effort: string;
  }[]>(),
  /** Strategic recommendations */
  strategicRecommendations: jsonb("strategicRecommendations").$type<{
    title: string;
    description: string;
    timeline: string;
    investment: string;
  }[]>(),
  /** AI type recommendations mapped to findings */
  aiRecommendations: jsonb("aiRecommendations").$type<{
    ml: { applicable: boolean; useCases: string[] };
    agentic: { applicable: boolean; useCases: string[] };
    rl: { applicable: boolean; useCases: string[] };
  }>(),
  /** Estimated annual cost of inaction in GBP */
  costOfInaction: integer("costOfInaction"),
  /** Overall readiness score 0-100 */
  readinessScore: integer("readinessScore"),
  /** S3 URL of generated PDF report */
  reportPdfUrl: varchar("reportPdfUrl", { length: 1024 }),
  /** Processing status */
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  /** Error message */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("aibaAnalyses_dealId_idx").on(table.dealId),
  index("aibaAnalyses_leadId_idx").on(table.leadId),
]);

export type AibaAnalysis = typeof aibaAnalyses.$inferSelect;
export type InsertAibaAnalysis = typeof aibaAnalyses.$inferInsert;

/**
 * Sales tasks with due dates and priority.
 */
export const salesTasks = pgTable("salesTasks", {
  id: serial("id").primaryKey(),
  /** Parent deal */
  dealId: integer("dealId").notNull(),
  /** Task title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Task description */
  description: text("description"),
  /** Due date */
  dueDate: timestamp("dueDate"),
  /** Priority level */
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  /** Whether the task is completed */
  completed: integer("completed").default(0).notNull(),
  /** When completed */
  completedAt: timestamp("completedAt"),
  /** Assigned to */
  assignedTo: varchar("assignedTo", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("salesTasks_dealId_idx").on(table.dealId),
]);

export type SalesTask = typeof salesTasks.$inferSelect;
export type InsertSalesTask = typeof salesTasks.$inferInsert;

// ─── PHASE 5: MARKETING AUTOMATION ──────────────────────────────────────

export const workflowStatusEnum = pgEnum("workflow_status", ["draft", "active", "paused", "archived"]);
export const workflowTriggerEnum = pgEnum("workflow_trigger", [
  "lead_created", "assessment_completed", "workshop_registered",
  "proposal_generated", "proposal_viewed", "deal_stage_changed",
  "deal_closed_won", "deal_closed_lost", "manual",
]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "completed", "paused", "cancelled"]);
export const emailSendStatusEnum = pgEnum("email_send_status", ["pending", "sent", "delivered", "opened", "clicked", "bounced", "failed", "unsubscribed"]);

/**
 * Marketing automation workflows with trigger-based step sequences.
 */
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  /** Workflow name */
  name: varchar("name", { length: 256 }).notNull(),
  /** Description of what this workflow does */
  description: text("description"),
  /** Event that triggers enrollment */
  trigger: workflowTriggerEnum("trigger").notNull(),
  /** Trigger conditions (e.g., source=lead_magnet, stage=discovery) */
  triggerConditions: jsonb("triggerConditions").$type<Record<string, unknown>>(),
  /** Ordered array of workflow steps */
  steps: jsonb("steps").$type<{
    stepNumber: number;
    type: "email" | "wait" | "condition" | "tag" | "webhook" | "notify";
    config: Record<string, unknown>;
  }[]>().default([]).notNull(),
  /** Current status */
  status: workflowStatusEnum("status").default("draft").notNull(),
  /** Metrics */
  metrics: jsonb("metrics").$type<{
    totalEnrolled: number;
    totalCompleted: number;
    totalActive: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = typeof workflows.$inferInsert;

/**
 * Tracks a lead's progress through a workflow.
 */
export const workflowEnrollments = pgTable("workflowEnrollments", {
  id: serial("id").primaryKey(),
  /** Parent workflow */
  workflowId: integer("workflowId").notNull(),
  /** Enrolled lead */
  leadId: integer("leadId").notNull(),
  /** Current step index (0-based) */
  currentStep: integer("currentStep").default(0).notNull(),
  /** When the next step should execute */
  nextStepAt: timestamp("nextStepAt"),
  /** Enrollment status */
  status: enrollmentStatusEnum("status").default("active").notNull(),
  /** Data accumulated during workflow execution */
  data: jsonb("data").$type<Record<string, unknown>>(),
  /** When enrolled */
  enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
  /** When completed or cancelled */
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("workflowEnrollments_workflowId_idx").on(table.workflowId),
  index("workflowEnrollments_leadId_idx").on(table.leadId),
  index("workflowEnrollments_nextStepAt_idx").on(table.nextStepAt),
]);

export type WorkflowEnrollment = typeof workflowEnrollments.$inferSelect;
export type InsertWorkflowEnrollment = typeof workflowEnrollments.$inferInsert;

/**
 * Reusable email templates for marketing automation.
 */
export const emailTemplates = pgTable("emailTemplates", {
  id: serial("id").primaryKey(),
  /** Template name */
  name: varchar("name", { length: 256 }).notNull(),
  /** Email subject line (supports {{variables}}) */
  subject: varchar("subject", { length: 512 }).notNull(),
  /** HTML body (supports {{variables}}) */
  htmlBody: text("htmlBody").notNull(),
  /** Plain text body (auto-generated if not provided) */
  textBody: text("textBody"),
  /** Available template variables */
  variables: jsonb("variables").$type<string[]>().default([]),
  /** Category for organization */
  category: varchar("category", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Email send log with delivery and engagement tracking.
 */
export const emailSends = pgTable("emailSends", {
  id: serial("id").primaryKey(),
  /** Template used */
  templateId: integer("templateId"),
  /** Recipient lead */
  leadId: integer("leadId").notNull(),
  /** Associated workflow enrollment */
  enrollmentId: integer("enrollmentId"),
  /** Subject line (rendered) */
  subject: varchar("subject", { length: 512 }),
  /** Send status */
  status: emailSendStatusEnum("status").default("pending").notNull(),
  /** External message ID (from SES) */
  externalMessageId: varchar("externalMessageId", { length: 256 }),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Tracking timestamps */
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  /** Unsubscribe tracking */
  unsubscribed: integer("unsubscribed").default(0).notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("emailSends_leadId_idx").on(table.leadId),
  index("emailSends_templateId_idx").on(table.templateId),
  index("emailSends_enrollmentId_idx").on(table.enrollmentId),
]);

export type EmailSend = typeof emailSends.$inferSelect;
export type InsertEmailSend = typeof emailSends.$inferInsert;

// ─── PHASE 6: SERVICE DELIVERY ──────────────────────────────────────────

export const projectStatusEnum = pgEnum("project_status", ["planning", "active", "on_hold", "completed", "cancelled"]);
export const adaptPhaseEnum = pgEnum("adapt_phase", ["assess", "design", "architect", "pilot", "transform"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["pending", "in_progress", "completed", "overdue", "cancelled"]);

/**
 * Client projects — post-sale delivery tracking with ADAPT phases.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  /** Associated closed deal */
  dealId: integer("dealId"),
  /** Associated lead/client */
  leadId: integer("leadId"),
  /** Project name */
  name: varchar("name", { length: 512 }).notNull(),
  /** Project description */
  description: text("description"),
  /** Current status */
  status: projectStatusEnum("status").default("planning").notNull(),
  /** Current ADAPT phase */
  currentPhase: adaptPhaseEnum("currentPhase").default("assess").notNull(),
  /** Contract value in GBP */
  contractValue: integer("contractValue"),
  /** Start date */
  startDate: timestamp("startDate"),
  /** Target end date */
  targetEndDate: timestamp("targetEndDate"),
  /** Actual end date */
  completedAt: timestamp("completedAt"),
  /** Project manager */
  assignedTo: varchar("assignedTo", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("projects_dealId_idx").on(table.dealId),
  index("projects_leadId_idx").on(table.leadId),
]);

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project milestones mapped to ADAPT phases.
 */
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  /** Parent project */
  projectId: integer("projectId").notNull(),
  /** ADAPT phase this milestone belongs to */
  adaptPhase: adaptPhaseEnum("adaptPhase").notNull(),
  /** Milestone title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Description */
  description: text("description"),
  /** Due date */
  dueDate: timestamp("dueDate"),
  /** Completion status */
  status: milestoneStatusEnum("status").default("pending").notNull(),
  /** Deliverables list */
  deliverables: jsonb("deliverables").$type<string[]>().default([]),
  /** When completed */
  completedAt: timestamp("completedAt"),
  /** Sort order within phase */
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("milestones_projectId_idx").on(table.projectId),
]);

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

/**
 * Project updates — client-visible progress log.
 */
export const projectUpdates = pgTable("projectUpdates", {
  id: serial("id").primaryKey(),
  /** Parent project */
  projectId: integer("projectId").notNull(),
  /** Update title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Update content (HTML/markdown) */
  content: text("content").notNull(),
  /** Whether this update is visible in the client portal */
  visibleToClient: integer("visibleToClient").default(1).notNull(),
  /** Author */
  author: varchar("author", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("projectUpdates_projectId_idx").on(table.projectId),
]);

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

/**
 * Client portal access tokens — magic-link style authentication.
 */
export const clientPortalTokens = pgTable("clientPortalTokens", {
  id: serial("id").primaryKey(),
  /** Parent project */
  projectId: integer("projectId").notNull(),
  /** Client lead */
  leadId: integer("leadId").notNull(),
  /** Secure token */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** When the token expires */
  expiresAt: timestamp("expiresAt").notNull(),
  /** Last used */
  lastUsedAt: timestamp("lastUsedAt"),
  /** Whether the token is revoked */
  revoked: integer("revoked").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [
  index("clientPortalTokens_token_idx").on(table.token),
  index("clientPortalTokens_projectId_idx").on(table.projectId),
]);

export type ClientPortalToken = typeof clientPortalTokens.$inferSelect;
export type InsertClientPortalToken = typeof clientPortalTokens.$inferInsert;

/**
 * Time entries for T&M billing on projects.
 */
export const timeEntries = pgTable("timeEntries", {
  id: serial("id").primaryKey(),
  /** Parent project */
  projectId: integer("projectId").notNull(),
  /** Description of work done */
  description: text("description").notNull(),
  /** Hours spent */
  hours: integer("hours").notNull(),
  /** Minutes (for fractional hours, stored as 0-59) */
  minutes: integer("minutes").default(0).notNull(),
  /** Hourly rate in GBP */
  rate: integer("rate"),
  /** Whether this time is billable */
  billable: integer("billable").default(1).notNull(),
  /** Date the work was performed */
  workDate: timestamp("workDate").notNull(),
  /** Who logged the time */
  loggedBy: varchar("loggedBy", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => [
  index("timeEntries_projectId_idx").on(table.projectId),
]);

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;
