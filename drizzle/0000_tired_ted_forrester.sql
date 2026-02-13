CREATE TYPE "public"."activity_type" AS ENUM('note', 'call', 'meeting', 'email', 'stage_change', 'task_completed');--> statement-breakpoint
CREATE TYPE "public"."adapt_phase" AS ENUM('assess', 'design', 'architect', 'pilot', 'transform');--> statement-breakpoint
CREATE TYPE "public"."assessment_tier" AS ENUM('audit', 'quick_wins', 'implementation', 'retainer');--> statement-breakpoint
CREATE TYPE "public"."batch_status" AS ENUM('draft', 'queued', 'running', 'paused', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."deal_stage" AS ENUM('lead', 'mql', 'sql', 'discovery', 'aiba_diagnostic', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'processing', 'ready', 'error');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('transcript', 'meeting_notes', 'framework', 'course_material', 'prompt', 'other');--> statement-breakpoint
CREATE TYPE "public"."email_send_status" AS ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('active', 'completed', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('quiz', 'lead_magnet', 'workshop', 'contact', 'referral', 'linkedin');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('pending', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'in_progress', 'completed', 'overdue', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."outreach_channel" AS ENUM('linkedin_dm', 'linkedin_connection', 'email');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."prompt_category" AS ENUM('lead_analysis', 'dm_sequence', 'proposal', 'aiba_diagnostic', 'research', 'general');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'sent', 'viewed', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."research_status" AS ENUM('none', 'pending', 'researching', 'analyzed', 'sequenced', 'complete', 'error');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."workflow_trigger" AS ENUM('lead_created', 'assessment_completed', 'workshop_registered', 'proposal_generated', 'proposal_viewed', 'deal_stage_changed', 'deal_closed_won', 'deal_closed_lost', 'manual');--> statement-breakpoint
CREATE TYPE "public"."workshop_status" AS ENUM('registered', 'confirmed', 'attended', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer NOT NULL,
	"type" "activity_type" NOT NULL,
	"description" text NOT NULL,
	"metadata" jsonb,
	"performedBy" varchar(256),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aibaAnalyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer,
	"leadId" integer,
	"inputNotes" text,
	"fourEngines" jsonb,
	"constraintType" varchar(64),
	"quickWins" jsonb,
	"strategicRecommendations" jsonb,
	"aiRecommendations" jsonb,
	"costOfInaction" integer,
	"readinessScore" integer,
	"reportPdfUrl" varchar(1024),
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"constraintScores" jsonb NOT NULL,
	"overallScore" integer NOT NULL,
	"primaryConstraint" varchar(64) NOT NULL,
	"costOfInaction" integer,
	"recommendedTier" "assessment_tier" NOT NULL,
	"recommendedPhase" varchar(32),
	"proposalGenerated" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "backgroundJobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(128) NOT NULL,
	"status" "job_status" DEFAULT 'pending' NOT NULL,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"errorMessage" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"maxAttempts" integer DEFAULT 3 NOT NULL,
	"scheduledAt" timestamp DEFAULT now() NOT NULL,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"channel" "outreach_channel" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"listId" integer,
	"sequenceSteps" jsonb,
	"settings" jsonb,
	"metrics" jsonb,
	"heyreachCampaignId" varchar(256),
	"ghlCampaignId" varchar(256),
	"scheduledAt" timestamp,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clientPortalTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"leadId" integer NOT NULL,
	"token" varchar(128) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"lastUsedAt" timestamp,
	"revoked" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clientPortalTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"stage" "deal_stage" DEFAULT 'lead' NOT NULL,
	"title" varchar(512) NOT NULL,
	"value" integer,
	"probability" integer,
	"weightedValue" integer,
	"assignedTo" varchar(256),
	"expectedCloseDate" timestamp,
	"closedAt" timestamp,
	"lossReason" text,
	"notes" text,
	"aibaAnalysisId" integer,
	"proposalId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(512) NOT NULL,
	"type" "document_type" NOT NULL,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"rawContent" text,
	"s3Key" varchar(1024),
	"filename" varchar(512),
	"mimeType" varchar(128),
	"fileSize" integer,
	"tags" jsonb,
	"metadata" jsonb,
	"chunkCount" integer DEFAULT 0 NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emailSends" (
	"id" serial PRIMARY KEY NOT NULL,
	"templateId" integer,
	"leadId" integer NOT NULL,
	"enrollmentId" integer,
	"subject" varchar(512),
	"status" "email_send_status" DEFAULT 'pending' NOT NULL,
	"externalMessageId" varchar(256),
	"errorMessage" text,
	"sentAt" timestamp,
	"deliveredAt" timestamp,
	"openedAt" timestamp,
	"clickedAt" timestamp,
	"unsubscribed" integer DEFAULT 0 NOT NULL,
	"unsubscribedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emailTemplates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"subject" varchar(512) NOT NULL,
	"htmlBody" text NOT NULL,
	"textBody" text,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"category" varchar(64),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeChunks" (
	"id" serial PRIMARY KEY NOT NULL,
	"documentId" integer NOT NULL,
	"chunkIndex" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"tokenCount" integer NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadListMembers" (
	"id" serial PRIMARY KEY NOT NULL,
	"listId" integer NOT NULL,
	"leadId" integer NOT NULL,
	"addedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadLists" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"memberCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadResearch" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"linkedinData" jsonb,
	"companyResearch" jsonb,
	"leadProfile" jsonb,
	"painGainAnalysis" jsonb,
	"archetype" varchar(128),
	"constraintType" varchar(64),
	"dmSequence" jsonb,
	"qualityScore" integer,
	"costUsd" varchar(16),
	"status" "research_status" DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leadResearchBatches" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"status" "batch_status" DEFAULT 'draft' NOT NULL,
	"totalLeads" integer DEFAULT 0 NOT NULL,
	"processedLeads" integer DEFAULT 0 NOT NULL,
	"failedLeads" integer DEFAULT 0 NOT NULL,
	"totalCostUsd" varchar(16),
	"listId" integer,
	"errors" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(128) NOT NULL,
	"lastName" varchar(128) NOT NULL,
	"email" varchar(320) NOT NULL,
	"company" varchar(256),
	"jobTitle" varchar(256),
	"phone" varchar(64),
	"linkedinUrl" varchar(512),
	"companySize" varchar(64),
	"industry" varchar(128),
	"country" varchar(128),
	"source" "lead_source" NOT NULL,
	"archetype" varchar(128),
	"ghlContactId" varchar(128),
	"tags" jsonb,
	"utmSource" varchar(256),
	"utmMedium" varchar(256),
	"utmCampaign" varchar(256),
	"linkedinHeadline" varchar(512),
	"companyWebsite" varchar(512),
	"companyEmployeeCount" integer,
	"enrichedAt" timestamp,
	"researchStatus" "research_status" DEFAULT 'none' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"adaptPhase" "adapt_phase" NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text,
	"dueDate" timestamp,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"deliverables" jsonb DEFAULT '[]'::jsonb,
	"completedAt" timestamp,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreachMessages" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaignId" integer NOT NULL,
	"leadId" integer NOT NULL,
	"stepNumber" integer NOT NULL,
	"channel" "outreach_channel" NOT NULL,
	"status" "message_status" DEFAULT 'pending' NOT NULL,
	"subject" varchar(512),
	"personalizedBody" text,
	"templateBody" text,
	"externalMessageId" varchar(256),
	"errorMessage" text,
	"scheduledAt" timestamp,
	"sentAt" timestamp,
	"deliveredAt" timestamp,
	"openedAt" timestamp,
	"clickedAt" timestamp,
	"repliedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projectUpdates" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"title" varchar(512) NOT NULL,
	"content" text NOT NULL,
	"visibleToClient" integer DEFAULT 1 NOT NULL,
	"author" varchar(256),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer,
	"leadId" integer,
	"name" varchar(512) NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"currentPhase" "adapt_phase" DEFAULT 'assess' NOT NULL,
	"contractValue" integer,
	"startDate" timestamp,
	"targetEndDate" timestamp,
	"completedAt" timestamp,
	"assignedTo" varchar(256),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promptTemplates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"category" "prompt_category" NOT NULL,
	"description" text,
	"systemPrompt" text NOT NULL,
	"userPromptTemplate" text NOT NULL,
	"model" varchar(128) DEFAULT 'claude-sonnet-4-5-20250929' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"maxTokens" integer DEFAULT 4096 NOT NULL,
	"temperature" varchar(8),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promptTemplates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"assessmentId" integer,
	"title" varchar(512) NOT NULL,
	"content" jsonb NOT NULL,
	"pdfUrl" varchar(1024),
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"estimatedValue" integer,
	"sentAt" timestamp,
	"viewedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salesTasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text,
	"dueDate" timestamp,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"completed" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"assignedTo" varchar(256),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeEntries" (
	"id" serial PRIMARY KEY NOT NULL,
	"projectId" integer NOT NULL,
	"description" text NOT NULL,
	"hours" integer NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"rate" integer,
	"billable" integer DEFAULT 1 NOT NULL,
	"workDate" timestamp NOT NULL,
	"loggedBy" varchar(256),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "webhookEvents" (
	"id" serial PRIMARY KEY NOT NULL,
	"eventType" varchar(128) NOT NULL,
	"entityId" integer,
	"payload" jsonb NOT NULL,
	"responseStatus" integer,
	"success" integer DEFAULT 0 NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflowEnrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflowId" integer NOT NULL,
	"leadId" integer NOT NULL,
	"currentStep" integer DEFAULT 0 NOT NULL,
	"nextStepAt" timestamp,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"data" jsonb,
	"enrolledAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"trigger" "workflow_trigger" NOT NULL,
	"triggerConditions" jsonb,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "workflow_status" DEFAULT 'draft' NOT NULL,
	"metrics" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshopRegistrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"workshopId" varchar(128) NOT NULL,
	"workshopTitle" varchar(512) NOT NULL,
	"status" "workshop_status" DEFAULT 'registered' NOT NULL,
	"prepCompleted" integer DEFAULT 0 NOT NULL,
	"surveyCompleted" integer DEFAULT 0 NOT NULL,
	"certificateIssued" integer DEFAULT 0 NOT NULL,
	"ghlEventId" varchar(128),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activities_dealId_idx" ON "activities" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "aibaAnalyses_dealId_idx" ON "aibaAnalyses" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "aibaAnalyses_leadId_idx" ON "aibaAnalyses" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "backgroundJobs_status_scheduledAt_idx" ON "backgroundJobs" USING btree ("status","scheduledAt");--> statement-breakpoint
CREATE INDEX "backgroundJobs_type_idx" ON "backgroundJobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "clientPortalTokens_token_idx" ON "clientPortalTokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "clientPortalTokens_projectId_idx" ON "clientPortalTokens" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "deals_leadId_idx" ON "deals" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "deals_stage_idx" ON "deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "emailSends_leadId_idx" ON "emailSends" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "emailSends_templateId_idx" ON "emailSends" USING btree ("templateId");--> statement-breakpoint
CREATE INDEX "emailSends_enrollmentId_idx" ON "emailSends" USING btree ("enrollmentId");--> statement-breakpoint
CREATE INDEX "knowledgeChunks_documentId_idx" ON "knowledgeChunks" USING btree ("documentId");--> statement-breakpoint
CREATE INDEX "leadListMembers_listId_idx" ON "leadListMembers" USING btree ("listId");--> statement-breakpoint
CREATE INDEX "leadListMembers_leadId_idx" ON "leadListMembers" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "leadResearch_leadId_idx" ON "leadResearch" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "milestones_projectId_idx" ON "milestones" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "outreachMessages_campaignId_idx" ON "outreachMessages" USING btree ("campaignId");--> statement-breakpoint
CREATE INDEX "outreachMessages_leadId_idx" ON "outreachMessages" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "outreachMessages_status_scheduledAt_idx" ON "outreachMessages" USING btree ("status","scheduledAt");--> statement-breakpoint
CREATE INDEX "projectUpdates_projectId_idx" ON "projectUpdates" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "projects_dealId_idx" ON "projects" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "projects_leadId_idx" ON "projects" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "promptTemplates_category_idx" ON "promptTemplates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "salesTasks_dealId_idx" ON "salesTasks" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "timeEntries_projectId_idx" ON "timeEntries" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "workflowEnrollments_workflowId_idx" ON "workflowEnrollments" USING btree ("workflowId");--> statement-breakpoint
CREATE INDEX "workflowEnrollments_leadId_idx" ON "workflowEnrollments" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "workflowEnrollments_nextStepAt_idx" ON "workflowEnrollments" USING btree ("nextStepAt");