/**
 * Project reporting — time summaries, billing, and status reports.
 */
import { getDb } from "../db";
import { timeEntries, projects, milestones } from "../../drizzle/schema";
import { eq, sql, and } from "drizzle-orm";

export interface TimeSummary {
  totalHours: number;
  totalMinutes: number;
  billableHours: number;
  billableMinutes: number;
  nonBillableHours: number;
  nonBillableMinutes: number;
  totalBillableAmount: number;
}

/**
 * Get time summary for a project.
 */
export async function getTimeSummary(projectId: number): Promise<TimeSummary> {
  const db = await getDb();
  if (!db) return {
    totalHours: 0, totalMinutes: 0,
    billableHours: 0, billableMinutes: 0,
    nonBillableHours: 0, nonBillableMinutes: 0,
    totalBillableAmount: 0,
  };

  const stats = await db.select({
    totalHours: sql<number>`coalesce(sum(${timeEntries.hours}), 0)::int`,
    totalMinutes: sql<number>`coalesce(sum(${timeEntries.minutes}), 0)::int`,
    billableHours: sql<number>`coalesce(sum(case when ${timeEntries.billable} = 1 then ${timeEntries.hours} else 0 end), 0)::int`,
    billableMinutes: sql<number>`coalesce(sum(case when ${timeEntries.billable} = 1 then ${timeEntries.minutes} else 0 end), 0)::int`,
    nonBillableHours: sql<number>`coalesce(sum(case when ${timeEntries.billable} = 0 then ${timeEntries.hours} else 0 end), 0)::int`,
    nonBillableMinutes: sql<number>`coalesce(sum(case when ${timeEntries.billable} = 0 then ${timeEntries.minutes} else 0 end), 0)::int`,
    totalBillableAmount: sql<number>`coalesce(sum(
      case when ${timeEntries.billable} = 1
      then (${timeEntries.hours} * coalesce(${timeEntries.rate}, 0)) + (${timeEntries.minutes} * coalesce(${timeEntries.rate}, 0) / 60)
      else 0 end
    ), 0)::int`,
  })
    .from(timeEntries)
    .where(eq(timeEntries.projectId, projectId));

  return stats[0] ?? {
    totalHours: 0, totalMinutes: 0,
    billableHours: 0, billableMinutes: 0,
    nonBillableHours: 0, nonBillableMinutes: 0,
    totalBillableAmount: 0,
  };
}

/**
 * Get project health status based on milestones and timeline.
 */
export async function getProjectHealth(projectId: number): Promise<{
  status: "on_track" | "at_risk" | "behind";
  completionPercentage: number;
  overdueCount: number;
  upcomingCount: number;
}> {
  const db = await getDb();
  if (!db) return { status: "on_track", completionPercentage: 0, overdueCount: 0, upcomingCount: 0 };

  const stats = await db.select({
    total: sql<number>`count(*)::int`,
    completed: sql<number>`count(*) filter (where ${milestones.status} = 'completed')`,
    overdue: sql<number>`count(*) filter (where ${milestones.status} IN ('pending', 'in_progress') and ${milestones.dueDate} < now())`,
    upcoming: sql<number>`count(*) filter (where ${milestones.status} IN ('pending', 'in_progress') and ${milestones.dueDate} >= now() and ${milestones.dueDate} < now() + interval '7 days')`,
  })
    .from(milestones)
    .where(eq(milestones.projectId, projectId));

  const total = stats[0]?.total ?? 0;
  const completed = stats[0]?.completed ?? 0;
  const overdue = stats[0]?.overdue ?? 0;
  const upcoming = stats[0]?.upcoming ?? 0;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  let status: "on_track" | "at_risk" | "behind" = "on_track";
  if (overdue > 2) status = "behind";
  else if (overdue > 0) status = "at_risk";

  return { status, completionPercentage, overdueCount: overdue, upcomingCount: upcoming };
}

/**
 * Generate a project status report as structured data.
 */
export async function generateStatusReport(projectId: number): Promise<{
  project: { name: string; status: string; phase: string; contractValue: number | null };
  health: { status: string; completionPercentage: number; overdueCount: number };
  time: TimeSummary;
  milestonesByPhase: { phase: string; milestones: { title: string; status: string; dueDate: Date | null }[] }[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const projectRows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (projectRows.length === 0) throw new Error("Project not found");
  const project = projectRows[0];

  const health = await getProjectHealth(projectId);
  const time = await getTimeSummary(projectId);

  const allMilestones = await db.select().from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(milestones.sortOrder);

  const phases = ["assess", "design", "architect", "pilot", "transform"];
  const milestonesByPhase = phases.map((phase) => ({
    phase,
    milestones: allMilestones
      .filter((m) => m.adaptPhase === phase)
      .map((m) => ({ title: m.title, status: m.status, dueDate: m.dueDate })),
  }));

  return {
    project: {
      name: project.name,
      status: project.status,
      phase: project.currentPhase,
      contractValue: project.contractValue,
    },
    health,
    time,
    milestonesByPhase,
  };
}
