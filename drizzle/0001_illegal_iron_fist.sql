CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`answers` json NOT NULL,
	`constraintScores` json NOT NULL,
	`overallScore` int NOT NULL,
	`primaryConstraint` varchar(64) NOT NULL,
	`costOfInaction` int,
	`recommendedTier` enum('audit','quick_wins','implementation','retainer') NOT NULL,
	`recommendedPhase` varchar(32),
	`proposalGenerated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(128) NOT NULL,
	`lastName` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(256),
	`jobTitle` varchar(256),
	`phone` varchar(64),
	`linkedinUrl` varchar(512),
	`companySize` varchar(64),
	`industry` varchar(128),
	`country` varchar(128),
	`source` enum('quiz','lead_magnet','workshop','contact','referral','linkedin') NOT NULL,
	`archetype` varchar(128),
	`ghlContactId` varchar(128),
	`tags` json,
	`utmSource` varchar(256),
	`utmMedium` varchar(256),
	`utmCampaign` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`assessmentId` int,
	`title` varchar(512) NOT NULL,
	`content` json NOT NULL,
	`pdfUrl` varchar(1024),
	`status` enum('draft','sent','viewed','accepted','declined') NOT NULL DEFAULT 'draft',
	`estimatedValue` int,
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhookEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` varchar(128) NOT NULL,
	`entityId` int,
	`payload` json NOT NULL,
	`responseStatus` int,
	`success` int NOT NULL DEFAULT 0,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhookEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workshopRegistrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leadId` int NOT NULL,
	`workshopId` varchar(128) NOT NULL,
	`workshopTitle` varchar(512) NOT NULL,
	`status` enum('registered','confirmed','attended','no_show','cancelled') NOT NULL DEFAULT 'registered',
	`prepCompleted` int NOT NULL DEFAULT 0,
	`surveyCompleted` int NOT NULL DEFAULT 0,
	`certificateIssued` int NOT NULL DEFAULT 0,
	`ghlEventId` varchar(128),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workshopRegistrations_id` PRIMARY KEY(`id`)
);
