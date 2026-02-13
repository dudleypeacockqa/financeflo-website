export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "eu-west-2",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  ghlWebhookUrl: process.env.GHL_WEBHOOK_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Phase 1: Knowledge Base
  voyageApiKey: process.env.VOYAGE_API_KEY ?? "",

  // Phase 2: Lead Engine
  relevanceAiApiKey: process.env.RELEVANCE_AI_API_KEY ?? "",
  relevanceAiProjectId: process.env.RELEVANCE_AI_PROJECT_ID ?? "",
  perplexityApiKey: process.env.PERPLEXITY_API_KEY ?? "",

  // Phase 3: Outreach Automation
  heyreachApiKey: process.env.HEYREACH_API_KEY ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "",
};
