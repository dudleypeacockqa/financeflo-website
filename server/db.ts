import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertLead, leads,
  InsertAssessment, assessments,
  InsertProposal, proposals,
  InsertWorkshopRegistration, workshopRegistrations,
  InsertWebhookEvent, webhookEvents,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USER HELPERS ───────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── LEAD HELPERS ───────────────────────────────────────────────────────────

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(lead);
  const insertId = result[0].insertId;
  const rows = await db.select().from(leads).where(eq(leads.id, insertId)).limit(1);
  return rows[0];
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLeadByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listLeads(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit);
}

export async function updateLeadGhlId(leadId: number, ghlContactId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set({ ghlContactId }).where(eq(leads.id, leadId));
}

// ─── ASSESSMENT HELPERS ─────────────────────────────────────────────────────

export async function createAssessment(assessment: InsertAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assessments).values(assessment);
  const insertId = result[0].insertId;
  const rows = await db.select().from(assessments).where(eq(assessments.id, insertId)).limit(1);
  return rows[0];
}

export async function getAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAssessmentsByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.leadId, leadId)).orderBy(desc(assessments.createdAt));
}

export async function markAssessmentProposalGenerated(assessmentId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(assessments).set({ proposalGenerated: 1 }).where(eq(assessments.id, assessmentId));
}

// ─── PROPOSAL HELPERS ───────────────────────────────────────────────────────

export async function createProposal(proposal: InsertProposal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(proposals).values(proposal);
  const insertId = result[0].insertId;
  const rows = await db.select().from(proposals).where(eq(proposals.id, insertId)).limit(1);
  return rows[0];
}

export async function getProposalById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProposalsByLeadId(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.leadId, leadId)).orderBy(desc(proposals.createdAt));
}

export async function updateProposalStatus(proposalId: number, status: "draft" | "sent" | "viewed" | "accepted" | "declined") {
  const db = await getDb();
  if (!db) return;
  const updateData: Record<string, unknown> = { status };
  if (status === "sent") updateData.sentAt = new Date();
  if (status === "viewed") updateData.viewedAt = new Date();
  await db.update(proposals).set(updateData).where(eq(proposals.id, proposalId));
}

export async function updateProposalPdfUrl(proposalId: number, pdfUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(proposals).set({ pdfUrl }).where(eq(proposals.id, proposalId));
}

// ─── WORKSHOP HELPERS ───────────────────────────────────────────────────────

export async function createWorkshopRegistration(reg: InsertWorkshopRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(workshopRegistrations).values(reg);
  const insertId = result[0].insertId;
  const rows = await db.select().from(workshopRegistrations).where(eq(workshopRegistrations.id, insertId)).limit(1);
  return rows[0];
}

export async function getWorkshopRegistrationsByWorkshopId(workshopId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workshopRegistrations).where(eq(workshopRegistrations.workshopId, workshopId)).orderBy(desc(workshopRegistrations.createdAt));
}

export async function updateWorkshopStatus(regId: number, status: "registered" | "confirmed" | "attended" | "no_show" | "cancelled") {
  const db = await getDb();
  if (!db) return;
  await db.update(workshopRegistrations).set({ status }).where(eq(workshopRegistrations.id, regId));
}

// ─── WEBHOOK EVENT HELPERS ──────────────────────────────────────────────────

export async function logWebhookEvent(event: InsertWebhookEvent) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log webhook event: database not available");
    return;
  }
  await db.insert(webhookEvents).values(event);
}
