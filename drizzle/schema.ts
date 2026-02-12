import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads captured from quiz funnel, lead magnet downloads, workshop registrations, etc.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
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
  source: mysqlEnum("source", ["quiz", "lead_magnet", "workshop", "contact", "referral", "linkedin"]).notNull(),
  /** Archetype from lead gen system: Declared Change, Active Execution, Latent Operational Friction */
  archetype: varchar("archetype", { length: 128 }),
  /** GHL contact ID once synced */
  ghlContactId: varchar("ghlContactId", { length: 128 }),
  /** Tags for segmentation */
  tags: json("tags").$type<string[]>(),
  /** UTM parameters */
  utmSource: varchar("utmSource", { length: 256 }),
  utmMedium: varchar("utmMedium", { length: 256 }),
  utmCampaign: varchar("utmCampaign", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Assessment quiz submissions — stores full quiz answers and computed scores.
 */
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  /** Full quiz answers as JSON */
  answers: json("answers").$type<Record<string, unknown>>().notNull(),
  /** Constraint scores: capacity, knowledge, process, scale */
  constraintScores: json("constraintScores").$type<Record<string, number>>().notNull(),
  /** Overall readiness score 0-100 */
  overallScore: int("overallScore").notNull(),
  /** Primary constraint identified */
  primaryConstraint: varchar("primaryConstraint", { length: 64 }).notNull(),
  /** Cost of Inaction estimate in GBP */
  costOfInaction: int("costOfInaction"),
  /** Recommended engagement tier */
  recommendedTier: mysqlEnum("recommendedTier", ["audit", "quick_wins", "implementation", "retainer"]).notNull(),
  /** Recommended ADAPT phase to start */
  recommendedPhase: varchar("recommendedPhase", { length: 32 }),
  /** Whether proposal has been generated */
  proposalGenerated: int("proposalGenerated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

/**
 * Generated proposals — stores the proposal data and PDF URL.
 */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  assessmentId: int("assessmentId"),
  /** Proposal title */
  title: varchar("title", { length: 512 }).notNull(),
  /** Full proposal content as structured JSON */
  content: json("content").$type<Record<string, unknown>>().notNull(),
  /** S3 URL of generated PDF */
  pdfUrl: varchar("pdfUrl", { length: 1024 }),
  /** Proposal status */
  status: mysqlEnum("status", ["draft", "sent", "viewed", "accepted", "declined"]).default("draft").notNull(),
  /** Total estimated value in GBP */
  estimatedValue: int("estimatedValue"),
  /** When the proposal was sent */
  sentAt: timestamp("sentAt"),
  /** When the proposal was viewed */
  viewedAt: timestamp("viewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;

/**
 * Workshop registrations — for AI in Action for Finance workshop series.
 */
export const workshopRegistrations = mysqlTable("workshopRegistrations", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  /** Which workshop session */
  workshopId: varchar("workshopId", { length: 128 }).notNull(),
  workshopTitle: varchar("workshopTitle", { length: 512 }).notNull(),
  /** Registration status */
  status: mysqlEnum("status", ["registered", "confirmed", "attended", "no_show", "cancelled"]).default("registered").notNull(),
  /** Pre-workshop prep completed */
  prepCompleted: int("prepCompleted").default(0).notNull(),
  /** Post-workshop survey completed */
  surveyCompleted: int("surveyCompleted").default(0).notNull(),
  /** Certificate issued */
  certificateIssued: int("certificateIssued").default(0).notNull(),
  /** GHL event ID */
  ghlEventId: varchar("ghlEventId", { length: 128 }),
  /** Notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkshopRegistration = typeof workshopRegistrations.$inferSelect;
export type InsertWorkshopRegistration = typeof workshopRegistrations.$inferInsert;

/**
 * GHL webhook events log — tracks all webhook calls for debugging.
 */
export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  /** Event type: lead_created, assessment_completed, proposal_sent, workshop_registered */
  eventType: varchar("eventType", { length: 128 }).notNull(),
  /** Related entity ID */
  entityId: int("entityId"),
  /** Full payload sent to GHL */
  payload: json("payload").$type<Record<string, unknown>>().notNull(),
  /** HTTP response status from GHL */
  responseStatus: int("responseStatus"),
  /** Whether the webhook was successful */
  success: int("success").default(0).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
