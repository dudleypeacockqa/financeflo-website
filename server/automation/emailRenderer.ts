/**
 * Email template rendering for marketing automation.
 * Renders templates with lead/assessment data and applies branded HTML wrapper.
 */
import { getDb } from "../db";
import { emailTemplates, leads } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Render an email template with lead data.
 */
export async function renderEmailTemplate(
  templateId: number,
  leadId: number,
  extraVars?: Record<string, string>
): Promise<{ subject: string; htmlBody: string; textBody: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const templateRows = await db.select().from(emailTemplates).where(eq(emailTemplates.id, templateId)).limit(1);
  if (templateRows.length === 0) throw new Error(`Email template #${templateId} not found`);
  const template = templateRows[0];

  const leadRows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  const lead = leadRows[0];

  // Build variable map
  const vars: Record<string, string> = {
    firstName: lead?.firstName || "there",
    lastName: lead?.lastName || "",
    fullName: lead ? `${lead.firstName} ${lead.lastName}`.trim() : "there",
    email: lead?.email || "",
    company: lead?.company || "",
    unsubscribeUrl: `{{BASE_URL}}/api/unsubscribe?lid=${leadId}&t={{TOKEN}}`,
    currentYear: new Date().getFullYear().toString(),
    ...extraVars,
  };

  const subject = substituteVars(template.subject, vars);
  const rawHtml = substituteVars(template.htmlBody, vars);
  const htmlBody = wrapInBrandedLayout(rawHtml, subject);
  const textBody = template.textBody
    ? substituteVars(template.textBody, vars)
    : stripHtml(rawHtml);

  return { subject, htmlBody, textBody };
}

/**
 * Render an inline email body (not from a template) with lead data.
 */
export async function renderInlineEmail(
  leadId: number,
  subject: string,
  body: string,
  extraVars?: Record<string, string>
): Promise<{ subject: string; htmlBody: string; textBody: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const leadRows = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  const lead = leadRows[0];

  const vars: Record<string, string> = {
    firstName: lead?.firstName || "there",
    lastName: lead?.lastName || "",
    fullName: lead ? `${lead.firstName} ${lead.lastName}`.trim() : "there",
    email: lead?.email || "",
    company: lead?.company || "",
    unsubscribeUrl: `{{BASE_URL}}/api/unsubscribe?lid=${leadId}`,
    currentYear: new Date().getFullYear().toString(),
    ...extraVars,
  };

  const renderedSubject = substituteVars(subject, vars);
  const rawHtml = substituteVars(body, vars);
  const htmlBody = wrapInBrandedLayout(rawHtml, renderedSubject);
  const textBody = stripHtml(rawHtml);

  return { subject: renderedSubject, htmlBody, textBody };
}

/**
 * Replace {{variable}} placeholders with values.
 */
function substituteVars(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return vars[key] ?? match;
  });
}

/**
 * Strip HTML tags for plain text email body.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Wrap email content in FinanceFlo branded HTML layout.
 */
function wrapInBrandedLayout(content: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${preheader}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f0f23; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 24px 0; border-bottom: 2px solid #0d9488; }
    .header img { max-width: 180px; }
    .header h1 { color: #0d9488; font-size: 24px; margin: 12px 0 0; }
    .content { padding: 32px 0; line-height: 1.6; font-size: 16px; }
    .content a { color: #0d9488; text-decoration: underline; }
    .cta-button { display: inline-block; padding: 12px 28px; background: #0d9488; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0; }
    .footer { border-top: 1px solid #1e293b; padding: 24px 0; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #64748b; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>FinanceFlo</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>FinanceFlo | AI-Powered Business Intelligence</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}
