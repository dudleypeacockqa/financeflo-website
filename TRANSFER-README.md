# FinanceFlo.ai MVP — Cursor IDE Transfer Guide

This package contains the complete FinanceFlo.ai MVP web application, ready for development in Cursor IDE.

## Quick Start

```bash
# 1. Extract the archive
unzip financeflo-mvp-transfer.zip -d financeflo-mvp
cd financeflo-mvp

# 2. Install dependencies
pnpm install

# 3. Copy environment template and fill in values
cp .env.example .env
# Edit .env with your actual values (see Environment Variables below)

# 4. Push database schema
pnpm db:push

# 5. Start development server
pnpm dev
```

## Environment Variables

Create a `.env` file with these variables:

```env
# Database (TiDB/MySQL)
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# Authentication (Manus OAuth)
JWT_SECRET=your-jwt-secret
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# Owner info
OWNER_OPEN_ID=your-open-id
OWNER_NAME=your-name

# Built-in APIs (LLM, Storage, etc.)
BUILT_IN_FORGE_API_URL=your-forge-api-url
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key
VITE_FRONTEND_FORGE_API_URL=your-frontend-forge-url

# GoHighLevel Webhook (optional)
GHL_WEBHOOK_URL=your-ghl-webhook-url

# App branding
VITE_APP_TITLE=FinanceFlo.ai
VITE_APP_LOGO=/financeflo-logo.svg
```

## Project Structure

```
financeflo-mvp/
├── .claude.md              # Cursor/Claude Code project context
├── docs/PRD.md             # Product Requirements Document v2.0
├── TRANSFER-README.md      # This file
├── todo.md                 # Feature tracking
│
├── client/                 # React 19 + Tailwind 4 frontend
│   ├── src/
│   │   ├── pages/          # All page components
│   │   │   ├── Home.tsx        # Landing page (ATLAS-VM messaging)
│   │   │   ├── Assessment.tsx  # Quiz funnel with region detection
│   │   │   ├── Results.tsx     # AI proposal + PDF generation
│   │   │   ├── Solutions.tsx   # Region-aware pricing display
│   │   │   ├── Workshop.tsx    # Workshop registration funnel
│   │   │   ├── Admin.tsx       # Admin dashboard (leads/assessments/proposals)
│   │   │   ├── ADAPTFramework.tsx
│   │   │   ├── Delivery.tsx
│   │   │   └── LeadMagnet.tsx
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Theme context
│   │   ├── lib/trpc.ts     # tRPC client binding
│   │   └── index.css       # Design tokens (navy/teal/amber)
│   └── public/             # Static assets
│
├── server/                 # Express + tRPC backend
│   ├── routers.ts          # All tRPC procedures (14 endpoints)
│   ├── db.ts               # Database query helpers
│   ├── ghl.ts              # GoHighLevel webhook integration
│   ├── proposalGenerator.ts # LLM-powered proposal generation
│   ├── pdfGenerator.ts     # HTML-to-PDF proposal generator
│   ├── storage.ts          # S3 file storage helpers
│   └── _core/              # Framework internals (don't edit)
│
├── shared/                 # Shared types and constants
│   ├── pricing.ts          # Region pricing config (UK/EU/ZA)
│   ├── types.ts            # Shared TypeScript types
│   └── const.ts            # Shared constants
│
├── drizzle/                # Database schema and migrations
│   └── schema.ts           # 5 tables: leads, assessments, proposals, workshops, webhookEvents
│
└── research/               # Market research documents
    ├── pricing-research-all-regions.md
    └── uk-pricing-research.md
```

## Key Features

1. **Quiz Funnel** (`/assessment`): 12-question constraint diagnosis with region detection
2. **AI Proposals** (`/results`): LLM-generated proposals with region-aware pricing
3. **PDF Export**: Branded PDF proposals uploaded to S3
4. **Workshop Funnel** (`/workshop`): Registration with GHL webhook
5. **Admin Dashboard** (`/admin`): Leads, assessments, proposals, workshops, webhook logs
6. **GHL Integration**: Webhooks fire on lead_created, assessment_completed, proposal_generated, workshop_registered
7. **Region Pricing**: UK (GBP), EU (EUR), ZA (ZAR) with market-validated rates

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run vitest tests (50+ tests)
pnpm db:push      # Push database schema changes
pnpm lint         # Run ESLint
pnpm format       # Run Prettier
```

## Cursor IDE Tips

- The `.claude.md` file provides full project context to Claude in Cursor
- Use `@docs/PRD.md` to reference the PRD in Cursor chat
- Use `@shared/pricing.ts` when working on pricing-related features
- The `todo.md` tracks all features and their completion status

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, wouter
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: TiDB (MySQL-compatible)
- **Storage**: S3 (via built-in helpers)
- **LLM**: Built-in Forge API (OpenAI-compatible)
- **Testing**: Vitest
