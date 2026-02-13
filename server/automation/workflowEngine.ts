/**
 * Workflow engine for marketing automation.
 * Handles event-driven enrollment, step execution, and enrollment lifecycle.
 */
import { getDb } from "../db";
import { workflows, workflowEnrollments, emailSends, leads } from "../../drizzle/schema";
import { eq, and, lte, sql } from "drizzle-orm";
import { findMatchingWorkflows, type TriggerEvent } from "./triggers";
import { renderEmailTemplate, renderInlineEmail } from "./emailRenderer";
import { sendEmail } from "../integrations/email";

/**
 * Fire a trigger event. Enrolls matching leads into active workflows.
 */
export async function fireTrigger(event: TriggerEvent): Promise<number[]> {
  const matchingIds = await findMatchingWorkflows(event);
  const enrollmentIds: number[] = [];

  for (const workflowId of matchingIds) {
    try {
      const enrollmentId = await enrollLead(workflowId, event.leadId, event.data);
      if (enrollmentId) enrollmentIds.push(enrollmentId);
    } catch (error: any) {
      console.error(`[Workflow] Failed to enroll lead ${event.leadId} in workflow ${workflowId}:`, error.message);
    }
  }

  return enrollmentIds;
}

/**
 * Enroll a lead into a workflow.
 * Prevents duplicate enrollments (same lead + workflow while active).
 */
export async function enrollLead(
  workflowId: number,
  leadId: number,
  data?: Record<string, unknown>
): Promise<number | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check for existing active enrollment
  const existing = await db.select()
    .from(workflowEnrollments)
    .where(and(
      eq(workflowEnrollments.workflowId, workflowId),
      eq(workflowEnrollments.leadId, leadId),
      eq(workflowEnrollments.status, "active")
    ))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Workflow] Lead ${leadId} already enrolled in workflow ${workflowId}`);
    return null;
  }

  // Get the workflow to determine the first step's timing
  const wfRows = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
  if (wfRows.length === 0) throw new Error(`Workflow #${workflowId} not found`);
  const wf = wfRows[0];

  const steps = wf.steps || [];
  const firstStep = steps[0];
  let nextStepAt = new Date();

  // If first step is a wait, schedule accordingly
  if (firstStep?.type === "wait") {
    const delayMs = parseWaitDuration(firstStep.config);
    nextStepAt = new Date(Date.now() + delayMs);
  }

  const rows = await db.insert(workflowEnrollments).values({
    workflowId,
    leadId,
    currentStep: 0,
    nextStepAt,
    status: "active",
    data: data || {},
  }).returning();

  console.log(`[Workflow] Enrolled lead ${leadId} in workflow ${workflowId} (enrollment #${rows[0].id})`);
  return rows[0].id;
}

/**
 * Process due workflow steps.
 * Called by the background worker on an interval.
 */
export async function processDueSteps(batchSize: number = 20): Promise<{ processed: number; errors: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, errors: 0 };

  // Find enrollments with due steps
  const dueEnrollments = await db.select({
    enrollment: workflowEnrollments,
    workflow: workflows,
  })
    .from(workflowEnrollments)
    .innerJoin(workflows, eq(workflowEnrollments.workflowId, workflows.id))
    .where(and(
      eq(workflowEnrollments.status, "active"),
      lte(workflowEnrollments.nextStepAt, new Date()),
      eq(workflows.status, "active"),
    ))
    .limit(batchSize);

  let processed = 0;
  let errors = 0;

  for (const { enrollment, workflow } of dueEnrollments) {
    try {
      await executeStep(enrollment, workflow);
      processed++;
    } catch (error: any) {
      console.error(`[Workflow] Step execution failed for enrollment #${enrollment.id}:`, error.message);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Execute the current step for an enrollment and advance to the next.
 */
async function executeStep(
  enrollment: typeof workflowEnrollments.$inferSelect,
  workflow: typeof workflows.$inferSelect
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const steps = workflow.steps || [];
  const stepIndex = enrollment.currentStep;

  if (stepIndex >= steps.length) {
    // All steps completed
    await completeEnrollment(enrollment.id);
    return;
  }

  const step = steps[stepIndex];

  switch (step.type) {
    case "email": {
      await executeEmailStep(enrollment, step.config);
      break;
    }
    case "wait": {
      // Wait steps are handled by scheduling — advance past them
      break;
    }
    case "condition": {
      const condMet = await evaluateCondition(enrollment, step.config);
      if (!condMet) {
        // Skip to the step specified by config.skipToStep, or complete
        const skipTo = step.config.skipToStep as number | undefined;
        if (skipTo !== undefined && skipTo < steps.length) {
          await advanceToStep(enrollment.id, skipTo, steps);
          return;
        }
        // If no skip target, just advance normally
      }
      break;
    }
    case "tag": {
      // Apply tag to lead data
      const tag = step.config.tag as string;
      if (tag) {
        const data = { ...((enrollment.data as Record<string, unknown>) || {}), [`tag_${tag}`]: true };
        await db.update(workflowEnrollments).set({ data, updatedAt: new Date() })
          .where(eq(workflowEnrollments.id, enrollment.id));
      }
      break;
    }
    case "notify": {
      // Log notification (could integrate with Slack/email to admin)
      const message = step.config.message as string || "Workflow notification";
      console.log(`[Workflow] Notification for enrollment #${enrollment.id}: ${message}`);
      break;
    }
    case "webhook": {
      const url = step.config.url as string;
      if (url) {
        try {
          await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              enrollmentId: enrollment.id,
              workflowId: enrollment.workflowId,
              leadId: enrollment.leadId,
              step: stepIndex,
              data: enrollment.data,
            }),
          });
        } catch (error: any) {
          console.error(`[Workflow] Webhook failed for enrollment #${enrollment.id}:`, error.message);
        }
      }
      break;
    }
  }

  // Advance to next step
  const nextIndex = stepIndex + 1;
  await advanceToStep(enrollment.id, nextIndex, steps);
}

/**
 * Advance enrollment to a specific step index.
 */
async function advanceToStep(
  enrollmentId: number,
  nextIndex: number,
  steps: { stepNumber: number; type: string; config: Record<string, unknown> }[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  if (nextIndex >= steps.length) {
    await completeEnrollment(enrollmentId);
    return;
  }

  // Calculate next step timing
  let nextStepAt = new Date();
  const nextStep = steps[nextIndex];

  if (nextStep.type === "wait") {
    const delayMs = parseWaitDuration(nextStep.config);
    nextStepAt = new Date(Date.now() + delayMs);
    // For wait steps, we schedule past them to the step after
    // The actual processing will skip the wait and advance again
  }

  await db.update(workflowEnrollments).set({
    currentStep: nextIndex,
    nextStepAt,
    updatedAt: new Date(),
  }).where(eq(workflowEnrollments.id, enrollmentId));
}

/**
 * Complete an enrollment.
 */
async function completeEnrollment(enrollmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(workflowEnrollments).set({
    status: "completed",
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(workflowEnrollments.id, enrollmentId));

  console.log(`[Workflow] Enrollment #${enrollmentId} completed`);
}

/**
 * Execute an email step.
 */
async function executeEmailStep(
  enrollment: typeof workflowEnrollments.$inferSelect,
  config: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const templateId = config.templateId as number | undefined;
  const inlineSubject = config.subject as string | undefined;
  const inlineBody = config.body as string | undefined;

  let rendered: { subject: string; htmlBody: string; textBody: string };

  if (templateId) {
    rendered = await renderEmailTemplate(templateId, enrollment.leadId);
  } else if (inlineSubject && inlineBody) {
    rendered = await renderInlineEmail(enrollment.leadId, inlineSubject, inlineBody);
  } else {
    console.error(`[Workflow] Email step missing template or inline content for enrollment #${enrollment.id}`);
    return;
  }

  // Get lead email
  const leadRows = await db.select().from(leads).where(eq(leads.id, enrollment.leadId)).limit(1);
  const lead = leadRows[0];
  if (!lead?.email) {
    console.error(`[Workflow] No email address for lead #${enrollment.leadId}`);
    return;
  }

  // Create email send record
  const sendRows = await db.insert(emailSends).values({
    templateId: templateId || undefined,
    leadId: enrollment.leadId,
    enrollmentId: enrollment.id,
    subject: rendered.subject,
    status: "pending",
  }).returning();

  // Send the email
  const result = await sendEmail({
    to: lead.email,
    subject: rendered.subject,
    htmlBody: rendered.htmlBody,
    textBody: rendered.textBody,
  });

  // Update send record
  if (result.success) {
    await db.update(emailSends).set({
      status: "sent",
      sentAt: new Date(),
      externalMessageId: result.messageId,
    }).where(eq(emailSends.id, sendRows[0].id));
  } else {
    await db.update(emailSends).set({
      status: "failed",
      errorMessage: result.error,
    }).where(eq(emailSends.id, sendRows[0].id));
  }
}

/**
 * Evaluate a condition step against enrollment/lead data.
 */
async function evaluateCondition(
  enrollment: typeof workflowEnrollments.$inferSelect,
  config: Record<string, unknown>
): Promise<boolean> {
  const field = config.field as string;
  const operator = config.operator as string || "equals";
  const value = config.value;

  if (!field) return true;

  // Get data from enrollment or lead
  const data = (enrollment.data as Record<string, unknown>) || {};
  const actual = data[field];

  switch (operator) {
    case "equals":
      return actual === value;
    case "not_equals":
      return actual !== value;
    case "exists":
      return actual !== undefined && actual !== null;
    case "not_exists":
      return actual === undefined || actual === null;
    case "contains":
      return typeof actual === "string" && typeof value === "string" && actual.includes(value);
    default:
      return true;
  }
}

/**
 * Parse a wait step's duration into milliseconds.
 */
function parseWaitDuration(config: Record<string, unknown>): number {
  const amount = (config.amount as number) || 1;
  const unit = (config.unit as string) || "days";

  const multipliers: Record<string, number> = {
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * (multipliers[unit] || multipliers.days);
}

/**
 * Cancel an enrollment.
 */
export async function cancelEnrollment(enrollmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(workflowEnrollments).set({
    status: "cancelled",
    completedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(workflowEnrollments.id, enrollmentId));
}

/**
 * Get workflow metrics.
 */
export async function refreshWorkflowMetrics(workflowId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const stats = await db.select({
    total: sql<number>`count(*)::int`,
    active: sql<number>`count(*) filter (where ${workflowEnrollments.status} = 'active')`,
    completed: sql<number>`count(*) filter (where ${workflowEnrollments.status} = 'completed')`,
  })
    .from(workflowEnrollments)
    .where(eq(workflowEnrollments.workflowId, workflowId));

  await db.update(workflows).set({
    metrics: {
      totalEnrolled: stats[0]?.total ?? 0,
      totalActive: stats[0]?.active ?? 0,
      totalCompleted: stats[0]?.completed ?? 0,
    },
    updatedAt: new Date(),
  }).where(eq(workflows.id, workflowId));
}
