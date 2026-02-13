/**
 * Client portal token management.
 * Generates magic-link tokens for client access to project dashboards.
 */
import { getDb } from "../db";
import { clientPortalTokens, projects, leads } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendEmail } from "../integrations/email";

/**
 * Generate a new portal access token for a client.
 */
export async function generatePortalToken(params: {
  projectId: number;
  leadId: number;
  expiresInDays?: number;
}): Promise<{ token: string; expiresAt: Date }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (params.expiresInDays ?? 30));

  await db.insert(clientPortalTokens).values({
    projectId: params.projectId,
    leadId: params.leadId,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

/**
 * Validate a portal token and return the associated project/lead IDs.
 */
export async function validatePortalToken(token: string): Promise<{
  projectId: number;
  leadId: number;
} | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select()
    .from(clientPortalTokens)
    .where(and(
      eq(clientPortalTokens.token, token),
      eq(clientPortalTokens.revoked, 0),
      sql`${clientPortalTokens.expiresAt} > now()`,
    ))
    .limit(1);

  if (rows.length === 0) return null;

  // Update last used
  await db.update(clientPortalTokens).set({
    lastUsedAt: new Date(),
  }).where(eq(clientPortalTokens.id, rows[0].id));

  return {
    projectId: rows[0].projectId,
    leadId: rows[0].leadId,
  };
}

/**
 * Revoke a portal token.
 */
export async function revokePortalToken(tokenId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clientPortalTokens).set({
    revoked: 1,
  }).where(eq(clientPortalTokens.id, tokenId));
}

/**
 * Send a magic link email to a client for portal access.
 */
export async function sendPortalInvite(params: {
  projectId: number;
  leadId: number;
  baseUrl: string;
}): Promise<{ token: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get lead info
  const leadRows = await db.select().from(leads).where(eq(leads.id, params.leadId)).limit(1);
  if (leadRows.length === 0) throw new Error("Lead not found");
  const lead = leadRows[0];
  if (!lead.email) throw new Error("Lead has no email address");

  // Get project info
  const projectRows = await db.select().from(projects).where(eq(projects.id, params.projectId)).limit(1);
  if (projectRows.length === 0) throw new Error("Project not found");
  const project = projectRows[0];

  // Generate token
  const { token } = await generatePortalToken({
    projectId: params.projectId,
    leadId: params.leadId,
    expiresInDays: 30,
  });

  const portalUrl = `${params.baseUrl}/portal?token=${token}`;

  await sendEmail({
    to: lead.email,
    subject: `Your Project Dashboard: ${project.name}`,
    htmlBody: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #0f0f23; color: #e2e8f0; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px;">FinanceFlo</h1>
    <h2>Hi ${lead.firstName},</h2>
    <p>Your project dashboard for <strong>${project.name}</strong> is ready.</p>
    <p>Click the button below to access your project portal, where you can view milestones, updates, and project progress.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${portalUrl}" style="display: inline-block; padding: 14px 32px; background: #0d9488; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View Project Dashboard
      </a>
    </p>
    <p style="font-size: 12px; color: #64748b;">This link is valid for 30 days. If you need a new link, please contact your project manager.</p>
    <hr style="border: 1px solid #1e293b; margin: 30px 0;">
    <p style="font-size: 12px; color: #64748b; text-align: center;">FinanceFlo | AI-Powered Business Intelligence</p>
  </div>
</body>
</html>`,
  });

  return { token };
}
