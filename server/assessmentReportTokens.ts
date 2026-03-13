import crypto from "crypto";

const DEFAULT_REPORT_TTL_MS = 1000 * 60 * 60 * 24 * 90;

interface AssessmentReportTokenPayload {
  assessmentId: number;
  exp: number;
}

function getTokenSecret(): string {
  return (
    process.env.REPORT_TOKEN_SECRET ||
    process.env.JWT_SECRET ||
    "financeflo-dev-report-secret"
  );
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getTokenSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createAssessmentReportToken(
  assessmentId: number,
  ttlMs = DEFAULT_REPORT_TTL_MS
): string {
  const payload: AssessmentReportTokenPayload = {
    assessmentId,
    exp: Date.now() + ttlMs,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function readAssessmentReportToken(
  token: string
): AssessmentReportTokenPayload | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);

  if (
    actualBytes.length !== expectedBytes.length ||
    !crypto.timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<AssessmentReportTokenPayload>;

    if (
      typeof payload.assessmentId !== "number" ||
      !Number.isInteger(payload.assessmentId) ||
      payload.assessmentId <= 0 ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now()
    ) {
      return null;
    }

    return {
      assessmentId: payload.assessmentId,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
