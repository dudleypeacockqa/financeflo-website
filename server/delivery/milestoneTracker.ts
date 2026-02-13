/**
 * Milestone tracking with ADAPT phase mapping.
 * Manages milestones within projects across the five ADAPT phases.
 */
import { getDb } from "../db";
import { milestones, projects } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const ADAPT_PHASES = ["assess", "design", "architect", "pilot", "transform"] as const;

const DEFAULT_MILESTONES: Record<string, { title: string; deliverables: string[] }[]> = {
  assess: [
    { title: "Current State Analysis", deliverables: ["System audit report", "Process flow documentation", "Pain point catalogue"] },
    { title: "AIBA Diagnostic Complete", deliverables: ["4 Engines analysis report", "Constraint classification", "Cost of inaction estimate"] },
  ],
  design: [
    { title: "Solution Architecture", deliverables: ["Technical design document", "Integration diagram", "Data flow mapping"] },
    { title: "Project Plan Approved", deliverables: ["Detailed project plan", "Resource allocation", "Risk register"] },
  ],
  architect: [
    { title: "Core Build Complete", deliverables: ["Development environment", "Core modules built", "Unit tests passing"] },
    { title: "Integration Testing", deliverables: ["Integration test results", "API documentation", "Performance benchmarks"] },
  ],
  pilot: [
    { title: "Pilot Deployment", deliverables: ["Pilot environment live", "User training materials", "Feedback collection plan"] },
    { title: "Pilot Review", deliverables: ["Pilot results report", "Issue resolution log", "Go/no-go recommendation"] },
  ],
  transform: [
    { title: "Full Deployment", deliverables: ["Production deployment", "Data migration complete", "User access provisioned"] },
    { title: "Handover & Close", deliverables: ["Operations manual", "Support handover", "Project closure report"] },
  ],
};

/**
 * Seed default ADAPT milestones for a project.
 */
export async function seedDefaultMilestones(projectId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let count = 0;

  for (const phase of ADAPT_PHASES) {
    const phaseMilestones = DEFAULT_MILESTONES[phase];
    for (let i = 0; i < phaseMilestones.length; i++) {
      const ms = phaseMilestones[i];
      await db.insert(milestones).values({
        projectId,
        adaptPhase: phase,
        title: ms.title,
        deliverables: ms.deliverables,
        sortOrder: count,
      });
      count++;
    }
  }

  return count;
}

/**
 * Complete a milestone.
 */
export async function completeMilestone(milestoneId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(milestones).set({
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(milestones.id, milestoneId));
}

/**
 * Get milestone progress for a project, grouped by ADAPT phase.
 */
export async function getMilestoneProgress(projectId: number): Promise<{
  phase: string;
  total: number;
  completed: number;
  percentage: number;
}[]> {
  const db = await getDb();
  if (!db) return [];

  const stats = await db.select({
    phase: milestones.adaptPhase,
    total: sql<number>`count(*)::int`,
    completed: sql<number>`count(*) filter (where ${milestones.status} = 'completed')`,
  })
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .groupBy(milestones.adaptPhase);

  return ADAPT_PHASES.map((phase) => {
    const s = stats.find((st) => st.phase === phase);
    const total = s?.total ?? 0;
    const completed = s?.completed ?? 0;
    return {
      phase,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });
}

/**
 * Check for overdue milestones and update their status.
 */
export async function markOverdueMilestones(projectId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.update(milestones).set({
    status: "overdue",
    updatedAt: new Date(),
  }).where(and(
    eq(milestones.projectId, projectId),
    eq(milestones.status, "pending"),
    sql`${milestones.dueDate} < now()`,
  )).returning();

  return result.length;
}
