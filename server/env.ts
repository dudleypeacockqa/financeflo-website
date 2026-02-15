export const ENV = {
  get databaseUrl() { return process.env.DATABASE_URL ?? ""; },
  get jwtSecret() { return process.env.JWT_SECRET ?? ""; },
  get adminPassword() { return process.env.ADMIN_PASSWORD ?? ""; },
  get anthropicApiKey() { return process.env.ANTHROPIC_API_KEY ?? ""; },
  get awsAccessKeyId() { return process.env.AWS_ACCESS_KEY_ID ?? ""; },
  get awsSecretAccessKey() { return process.env.AWS_SECRET_ACCESS_KEY ?? ""; },
  get awsRegion() { return process.env.AWS_REGION ?? "eu-west-2"; },
  get awsS3Bucket() { return process.env.AWS_S3_BUCKET ?? ""; },
  get ghlWebhookUrl() { return process.env.GHL_WEBHOOK_URL ?? ""; },
  get isProduction() { return process.env.NODE_ENV === "production"; },

  // Phase 1: Knowledge Base
  get voyageApiKey() { return process.env.VOYAGE_API_KEY ?? ""; },

  // Phase 2: Lead Engine
  get relevanceAiApiKey() { return process.env.RELEVANCE_AI_API_KEY ?? ""; },
  get relevanceAiProjectId() { return process.env.RELEVANCE_AI_PROJECT_ID ?? ""; },
  get perplexityApiKey() { return process.env.PERPLEXITY_API_KEY ?? ""; },

  // Phase 3: Outreach Automation
  get heyreachApiKey() { return process.env.HEYREACH_API_KEY ?? ""; },
  get emailFromAddress() { return process.env.EMAIL_FROM_ADDRESS ?? ""; },
};
