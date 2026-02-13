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
