import { pgTable, serial, text, varchar, integer, timestamp, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

// ─── ENUMS ────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const leadSourceEnum = pgEnum("lead_source", ["quiz", "lead_magnet", "workshop", "contact", "referral", "linkedin"]);
export const assessmentTierEnum = pgEnum("assessment_tier", ["audit", "quick_wins", "implementation", "retainer"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "sent", "viewed", "accepted", "declined"]);
export const workshopStatusEnum = pgEnum("workshop_status", ["registered", "confirmed", "attended", "no_show", "cancelled"]);

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
