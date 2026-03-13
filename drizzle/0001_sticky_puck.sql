CREATE TYPE "public"."generated_document_type" AS ENUM('ai_finance_report', 'assessment_report', 'proposal_pdf');--> statement-breakpoint
CREATE TABLE "generatedDocuments" (
	"id" serial PRIMARY KEY NOT NULL,
	"leadId" integer NOT NULL,
	"assessmentId" integer,
	"proposalId" integer,
	"type" "generated_document_type" NOT NULL,
	"filename" varchar(512) NOT NULL,
	"mimeType" varchar(128) NOT NULL,
	"fileData" "bytea" NOT NULL,
	"fileSize" integer NOT NULL,
	"sha256" varchar(64) NOT NULL,
	"recipientSnapshot" jsonb,
	"sourceUrl" varchar(1024),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "generatedDocuments_leadId_idx" ON "generatedDocuments" USING btree ("leadId");--> statement-breakpoint
CREATE INDEX "generatedDocuments_assessmentId_idx" ON "generatedDocuments" USING btree ("assessmentId");--> statement-breakpoint
CREATE INDEX "generatedDocuments_proposalId_idx" ON "generatedDocuments" USING btree ("proposalId");--> statement-breakpoint
CREATE INDEX "generatedDocuments_type_createdAt_idx" ON "generatedDocuments" USING btree ("type","createdAt");
