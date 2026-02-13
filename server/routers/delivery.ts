import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  projects, milestones, projectUpdates, timeEntries,
  clientPortalTokens, leads,
} from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { createProjectFromDeal, createProject, advancePhase, updateProjectStatus, getProjectSummary } from "../delivery/projectManager";
import { seedDefaultMilestones, completeMilestone, getMilestoneProgress, markOverdueMilestones } from "../delivery/milestoneTracker";
import { generatePortalToken, validatePortalToken, revokePortalToken, sendPortalInvite } from "../delivery/clientPortal";
import { getTimeSummary, getProjectHealth } from "../delivery/reporting";

export const deliveryRouter = router({
  // ─── PROJECTS ─────────────────────────────────────────────────────────

  /** Create a project from a closed deal */
  createFromDeal: adminProcedure
    .input(z.object({
      dealId: z.number(),
      name: z.string().optional(),
      assignedTo: z.string().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      seedMilestones: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, targetEndDate, seedMilestones: seed, ...rest } = input;
      const result = await createProjectFromDeal({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
      });

      if (seed !== false) {
        await seedDefaultMilestones(result.projectId);
      }

      return result;
    }),

  /** Create a standalone project */
  createProject: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      leadId: z.number().optional(),
      contractValue: z.number().optional(),
      assignedTo: z.string().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      seedMilestones: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { startDate, targetEndDate, seedMilestones: seed, ...rest } = input;
      const result = await createProject({
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
      });

      if (seed !== false) {
        await seedDefaultMilestones(result.projectId);
      }

      return result;
    }),

  /** Get project by ID with health and time summary */
  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db.select({
        project: projects,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
        leadCompany: leads.company,
      })
        .from(projects)
        .leftJoin(leads, eq(projects.leadId, leads.id))
        .where(eq(projects.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;

      const health = await getProjectHealth(input.id);
      const time = await getTimeSummary(input.id);
      const milestoneProgress = await getMilestoneProgress(input.id);

      return {
        ...rows[0].project,
        lead: {
          firstName: rows[0].leadFirstName,
          lastName: rows[0].leadLastName,
          email: rows[0].leadEmail,
          company: rows[0].leadCompany,
        },
        health,
        time,
        milestoneProgress,
      };
    }),

  /** List all projects */
  listProjects: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input?.status) conditions.push(eq(projects.status, input.status as any));

      const query = db.select({
        project: projects,
        leadCompany: leads.company,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
      })
        .from(projects)
        .leftJoin(leads, eq(projects.leadId, leads.id))
        .orderBy(desc(projects.updatedAt))
        .limit(input?.limit ?? 50);

      const rows = conditions.length > 0
        ? await query.where(and(...conditions))
        : await query;

      return rows.map((r) => ({
        ...r.project,
        lead: { company: r.leadCompany, firstName: r.leadFirstName, lastName: r.leadLastName },
      }));
    }),

  /** Update project status */
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      await updateProjectStatus(input.id, input.status);
      return { updated: true };
    }),

  /** Advance to next ADAPT phase */
  advancePhase: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const newPhase = await advancePhase(input.id);
      return { newPhase };
    }),

  /** Update project fields */
  updateProject: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      assignedTo: z.string().optional(),
      contractValue: z.number().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, startDate, targetEndDate, ...fields } = input;
      const update: Record<string, unknown> = { ...fields, updatedAt: new Date() };
      if (startDate) update.startDate = new Date(startDate);
      if (targetEndDate) update.targetEndDate = new Date(targetEndDate);

      await db.update(projects).set(update).where(eq(projects.id, id));
      return { updated: true };
    }),

  /** Get project overview stats */
  summary: protectedProcedure.query(async () => {
    return getProjectSummary();
  }),

  // ─── MILESTONES ───────────────────────────────────────────────────────

  /** List milestones for a project */
  listMilestones: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      await markOverdueMilestones(input.projectId);

      return db.select().from(milestones)
        .where(eq(milestones.projectId, input.projectId))
        .orderBy(milestones.sortOrder);
    }),

  /** Create a milestone */
  createMilestone: adminProcedure
    .input(z.object({
      projectId: z.number(),
      adaptPhase: z.enum(["assess", "design", "architect", "pilot", "transform"]),
      title: z.string().min(1),
      description: z.string().optional(),
      dueDate: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { dueDate, ...fields } = input;
      const rows = await db.insert(milestones).values({
        ...fields,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      }).returning();

      return rows[0];
    }),

  /** Complete a milestone */
  completeMilestone: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await completeMilestone(input.id);
      return { completed: true };
    }),

  /** Update milestone status */
  updateMilestone: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["pending", "in_progress", "completed", "overdue", "cancelled"]).optional(),
      dueDate: z.string().optional(),
      deliverables: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, dueDate, status, ...fields } = input;
      const update: Record<string, unknown> = { ...fields, updatedAt: new Date() };
      if (dueDate) update.dueDate = new Date(dueDate);
      if (status) {
        update.status = status;
        if (status === "completed") update.completedAt = new Date();
      }

      await db.update(milestones).set(update).where(eq(milestones.id, id));
      return { updated: true };
    }),

  /** Seed default milestones */
  seedMilestones: adminProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ input }) => {
      const count = await seedDefaultMilestones(input.projectId);
      return { seeded: count };
    }),

  // ─── PROJECT UPDATES ──────────────────────────────────────────────────

  /** Add a project update */
  addUpdate: adminProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1),
      content: z.string().min(1),
      visibleToClient: z.boolean().optional(),
      author: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(projectUpdates).values({
        projectId: input.projectId,
        title: input.title,
        content: input.content,
        visibleToClient: input.visibleToClient !== false ? 1 : 0,
        author: input.author,
      }).returning();

      return rows[0];
    }),

  /** List updates for a project */
  listUpdates: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select().from(projectUpdates)
        .where(eq(projectUpdates.projectId, input.projectId))
        .orderBy(desc(projectUpdates.createdAt));
    }),

  // ─── TIME ENTRIES ─────────────────────────────────────────────────────

  /** Log time on a project */
  logTime: adminProcedure
    .input(z.object({
      projectId: z.number(),
      description: z.string().min(1),
      hours: z.number().min(0),
      minutes: z.number().min(0).max(59).optional(),
      rate: z.number().optional(),
      billable: z.boolean().optional(),
      workDate: z.string(),
      loggedBy: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const rows = await db.insert(timeEntries).values({
        projectId: input.projectId,
        description: input.description,
        hours: input.hours,
        minutes: input.minutes || 0,
        rate: input.rate,
        billable: input.billable !== false ? 1 : 0,
        workDate: new Date(input.workDate),
        loggedBy: input.loggedBy,
      }).returning();

      return rows[0];
    }),

  /** List time entries for a project */
  listTimeEntries: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select().from(timeEntries)
        .where(eq(timeEntries.projectId, input.projectId))
        .orderBy(desc(timeEntries.workDate))
        .limit(input.limit ?? 100);
    }),

  /** Get time summary for a project */
  getTimeSummary: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return getTimeSummary(input.projectId);
    }),

  /** Delete a time entry */
  deleteTimeEntry: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(timeEntries).where(eq(timeEntries.id, input.id));
      return { deleted: true };
    }),

  // ─── CLIENT PORTAL ────────────────────────────────────────────────────

  /** Generate a portal access token */
  generateToken: adminProcedure
    .input(z.object({
      projectId: z.number(),
      leadId: z.number(),
      expiresInDays: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return generatePortalToken(input);
    }),

  /** Send a portal invite email */
  sendInvite: adminProcedure
    .input(z.object({
      projectId: z.number(),
      leadId: z.number(),
      baseUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      return sendPortalInvite(input);
    }),

  /** Revoke a portal token */
  revokeToken: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await revokePortalToken(input.id);
      return { revoked: true };
    }),

  /** List portal tokens for a project */
  listTokens: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db.select({
        token: clientPortalTokens,
        leadFirstName: leads.firstName,
        leadLastName: leads.lastName,
        leadEmail: leads.email,
      })
        .from(clientPortalTokens)
        .leftJoin(leads, eq(clientPortalTokens.leadId, leads.id))
        .where(eq(clientPortalTokens.projectId, input.projectId))
        .orderBy(desc(clientPortalTokens.createdAt));
    }),

  // ─── CLIENT-FACING QUERIES (public, token-authenticated) ─────────────

  /** Validate token and get portal data */
  portalAccess: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const result = await validatePortalToken(input.token);
      if (!result) return null;

      const db = await getDb();
      if (!db) return null;

      // Get project
      const projectRows = await db.select().from(projects).where(eq(projects.id, result.projectId)).limit(1);
      if (projectRows.length === 0) return null;

      // Get milestones
      const projectMilestones = await db.select().from(milestones)
        .where(eq(milestones.projectId, result.projectId))
        .orderBy(milestones.sortOrder);

      // Get client-visible updates
      const updates = await db.select().from(projectUpdates)
        .where(and(
          eq(projectUpdates.projectId, result.projectId),
          eq(projectUpdates.visibleToClient, 1),
        ))
        .orderBy(desc(projectUpdates.createdAt));

      // Get milestone progress
      const progress = await getMilestoneProgress(result.projectId);

      return {
        project: projectRows[0],
        milestones: projectMilestones,
        updates,
        progress,
      };
    }),
});
