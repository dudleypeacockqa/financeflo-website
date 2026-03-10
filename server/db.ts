import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  InsertUser, users,
  InsertLead, leads,
  InsertAssessment, assessments,
  InsertProposal, proposals,
  InsertWorkshopRegistration, workshopRegistrations,
  InsertWebhookEvent, webhookEvents,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
let _dbInitPromise: Promise<ReturnType<typeof drizzle> | null> | null = null;

async function bootstrapKnowledgeSearch(pool: pg.Pool): Promise<void> {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector');
  } catch (error) {
    console.warn("[Database] Skipping pgvector bootstrap:", error);
    return;
  }

  try {
    const result = await pool.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'knowledgeChunks'
      ) AS "exists"
    `);

    if (!result.rows[0]?.exists) {
      console.warn(
        '[Database] Skipping knowledge chunk index bootstrap: "knowledgeChunks" table not found'
      );
      return;
    }

    await pool.query(`
      CREATE INDEX IF NOT EXISTS "knowledgeChunks_embedding_hnsw_idx"
      ON "knowledgeChunks" USING hnsw (embedding vector_cosine_ops)
      WITH (m = 16, ef_construction = 64)
    `);
  } catch (error) {
    console.warn("[Database] Skipping knowledge chunk index bootstrap:", error);
  }
}

export async function getDb() {
  if (_db) {
    return _db;
  }

  if (_dbInitPromise) {
    return _dbInitPromise;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  _dbInitPromise = (async () => {
    const pool = new pg.Pool({ connectionString });

    try {
      await pool.query("SELECT 1");
      const db = drizzle(pool);

      _db = db;
      void bootstrapKnowledgeSearch(pool);

      return db;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      await pool.end().catch(() => {});
      return null;
    }
  })();

  try {
    return await _dbInitPromise;
  } finally {
    _dbInitPromise = null;
  }
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
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    updateSet.updatedAt = new Date();
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
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
  const rows = await db.insert(leads).values(lead).returning();
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
  await db.update(leads).set({ ghlContactId, updatedAt: new Date() }).where(eq(leads.id, leadId));
}

// ─── ASSESSMENT HELPERS ─────────────────────────────────────────────────────

export async function createAssessment(assessment: InsertAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(assessments).values(assessment).returning();
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
  const rows = await db.insert(proposals).values(proposal).returning();
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
  const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === "sent") updateData.sentAt = new Date();
  if (status === "viewed") updateData.viewedAt = new Date();
  await db.update(proposals).set(updateData).where(eq(proposals.id, proposalId));
}

export async function updateProposalPdfUrl(proposalId: number, pdfUrl: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(proposals).set({ pdfUrl, updatedAt: new Date() }).where(eq(proposals.id, proposalId));
}

// ─── WORKSHOP HELPERS ───────────────────────────────────────────────────────

export async function createWorkshopRegistration(reg: InsertWorkshopRegistration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.insert(workshopRegistrations).values(reg).returning();
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
  await db.update(workshopRegistrations).set({ status, updatedAt: new Date() }).where(eq(workshopRegistrations.id, regId));
}

// ─── ADMIN LIST HELPERS ────────────────────────────────────────────────────

export async function listAssessments(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).orderBy(desc(assessments.createdAt)).limit(limit);
}

export async function listProposals(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).orderBy(desc(proposals.createdAt)).limit(limit);
}

export async function listWorkshopRegistrations(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workshopRegistrations).orderBy(desc(workshopRegistrations.createdAt)).limit(limit);
}

export async function listWebhookEvents(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhookEvents).orderBy(desc(webhookEvents.createdAt)).limit(limit);
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
