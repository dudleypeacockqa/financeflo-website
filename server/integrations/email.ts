/**
 * Email sending service via AWS SES.
 * Falls back to console logging when SES is not configured.
 */
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { ENV } from "../env";

let _sesClient: SESClient | null = null;

function getSesClient(): SESClient | null {
  if (!ENV.awsAccessKeyId || !ENV.awsSecretAccessKey) return null;
  if (!_sesClient) {
    _sesClient = new SESClient({
      region: ENV.awsRegion,
      credentials: {
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      },
    });
  }
  return _sesClient;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single email via AWS SES.
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  fromAddress?: string;
  replyTo?: string;
}): Promise<EmailSendResult> {
  const client = getSesClient();
  const fromAddress = params.fromAddress || ENV.emailFromAddress || "noreply@financeflo.ai";

  if (!client) {
    // Log to console when SES is not configured (development mode)
    console.log(`[Email] Would send to ${params.to}: "${params.subject}"`);
    console.log(`[Email] Body preview: ${params.htmlBody.slice(0, 200)}...`);
    return { success: true, messageId: `dev-${Date.now()}` };
  }

  try {
    const command = new SendEmailCommand({
      Source: fromAddress,
      Destination: { ToAddresses: [params.to] },
      Message: {
        Subject: { Data: params.subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: params.htmlBody, Charset: "UTF-8" },
          ...(params.textBody ? { Text: { Data: params.textBody, Charset: "UTF-8" } } : {}),
        },
      },
      ...(params.replyTo ? { ReplyToAddresses: [params.replyTo] } : {}),
    });

    const response = await client.send(command);
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error: any) {
    console.error(`[Email] Send failed for ${params.to}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send a batch of emails. Processes sequentially with delay to respect SES rate limits.
 */
export async function sendEmailBatch(
  emails: {
    to: string;
    subject: string;
    htmlBody: string;
    textBody?: string;
  }[],
  delayMs: number = 100
): Promise<{ sent: number; failed: number; results: EmailSendResult[] }> {
  const results: EmailSendResult[] = [];
  let sent = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    if (result.success) sent++;
    else failed++;

    // Throttle to avoid SES rate limits
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return { sent, failed, results };
}
