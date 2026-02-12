# FinanceFlo.ai — Product Requirements Document (PRD)

**Version:** 2.0
**Last Updated:** 12 February 2026
**Author:** Dudley Peacock / Manus AI
**Status:** Active Development

---

## 1. Executive Summary

FinanceFlo.ai is a lead-generation and consulting-sales platform for Dudley Peacock's AI-powered financial transformation consultancy. The platform converts CFOs, Finance Directors, and operational leaders into qualified leads through an interactive AI Readiness Assessment quiz funnel, automated proposal generation, and workshop registration — all integrated with GoHighLevel (GHL) for CRM automation.

The platform operates as a **public-facing marketing and sales tool** (not a SaaS product). It captures leads, diagnoses their operational constraints, generates region-aware proposals with branded PDFs, and feeds everything into the GHL sales pipeline.

---

## 2. Business Context

### 2.1 Company Positioning

> "We redesign how growing companies operate. AI is just one tool in the system."

FinanceFlo.ai is a **consulting hybrid** practice combining structured ERP/Financial Management (Sage Intacct) as the base layer with custom AI solution development layered on top. The practice serves mid-market companies (typically 50–500 employees) across the UK, Europe, and South Africa.

### 2.2 Core Frameworks

The consulting methodology is built on two proprietary frameworks:

**QDOAA Framework** (applied before any AI recommendation):

| Step | Action | Purpose |
|------|--------|---------|
| Q | Question | Why does this step exist? Challenge every assumption. |
| D | Delete | Remove steps that serve no purpose. |
| O | Optimise | Improve remaining steps manually first. |
| A | Accelerate | Make faster without adding people. |
| A | Automate | NOW add AI to what remains. |

**ADAPT Framework** (engagement delivery methodology):

| Phase | Name | Description |
|-------|------|-------------|
| A | Assess | Map constraints, calculate Cost of Inaction, identify quick wins |
| D | Design | Architect optimal Sage Intacct configuration and AI integration roadmap |
| A | Automate | Implement intelligent automation across highest-impact bottlenecks |
| P | Pilot | Deploy targeted AI solutions with measurable KPIs |
| T | Transform | Scale AI across the organisation with continuous optimisation |

### 2.3 Constraint-Based Sales Methodology

Rather than asking "What do you want to automate?", the platform diagnoses "Where does your business model break at scale?" through four constraint types:

| Constraint | Signal | Example |
|-----------|--------|---------|
| **Capacity** | Volume too high, team drowning | Throughput bottleneck, manual data entry overload |
| **Knowledge** | Inconsistent answers, tribal knowledge | Key-person dependency, no single source of truth |
| **Process** | Bad handoffs, messy workflows | Month-end close taking weeks, department bottlenecks |
| **Scale** | Everything breaks if volume doubles | Growth requires proportional cost growth |

### 2.4 Revenue Model

The practice operates on a **build fee + monthly retainer** model with tiered engagement:

1. **AI Operations Audit** (entry point): Current-state process map, ROI stack, prioritised roadmap
2. **Quick Wins Sprint**: Top 2–3 highest-ROI automations from audit, 4–8 weeks
3. **Ongoing Retainer**: System health monitoring, performance optimisation, strategic updates

---

## 3. Regional Pricing

All pricing is **indicative, not fixed**, excludes VAT/Sales Tax, and is delivered on a **time-and-materials basis**. Actual costs depend on project scope, and additional fees may apply for out-of-scope work based on actual hours consumed.

### 3.1 Rate Card by Region

| Service | UK (GBP) | Europe (EUR) | South Africa (ZAR) |
|---------|----------|-------------|-------------------|
| Consultant (hourly) | £110 | €180 | R975 |
| Senior Consultant (hourly) | £170 | €180 | R1,850 |
| AI Operations Audit | £5,000 – £15,000 | €5,000 – €15,000 | R45,000 – R175,000 |
| Monthly Retainer | £5,000 – £7,500 | €5,000 – €7,500 | R30,000 – R75,000 |

### 3.2 Market Validation (Feb 2026)

Pricing has been validated against market research across all three regions:

| Region | Market Hourly Range | Market Audit Range | Market Retainer Range | Sources |
|--------|--------------------|--------------------|----------------------|---------|
| UK | £80–£200/hr | £5,000–£15,000 | £2,000–£8,000/mo | nicolalazzari.ai, itjobswatch.co.uk |
| EU | €60–€184/hr | €5,000–€15,000 | €2,000–€8,000/mo | riseworks.io, houseblend.io |
| ZA | R250–R1,400+/hr | R45,000–R175,000 | R30,000–R75,000/mo | consultancy.africa, payscale.com |

Key premiums justifying rates: finance sector (+20–30%), AI specialisation (+40–60%), Sage Intacct niche (limited supply).

### 3.3 Hourly Rates — Context Only

Hourly rates are **not displayed on the website or in proposals**. They exist as internal reference points for scoping and are included in the pricing configuration for Cost of Inaction calculations and internal ROI modelling only. The website and proposals display only project-based pricing (audit ranges, retainer ranges).

---

## 4. Technical Architecture

### 4.1 Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, shadcn/ui, wouter (routing), Framer Motion |
| Backend | Express 4, tRPC 11, Superjson |
| Database | TiDB (MySQL-compatible), Drizzle ORM |
| Auth | Manus OAuth (session cookie) |
| LLM | Built-in Forge API (proposal generation) |
| Storage | S3 (PDF proposals, assets) |
| CRM | GoHighLevel webhooks (fire-and-forget) |
| Testing | Vitest (50 tests) |

### 4.2 File Structure

```
client/src/
  pages/
    Home.tsx           — Landing page with hero, stats, constraint diagnosis, QDOAA, ADAPT preview, pricing
    Assessment.tsx     — 10-question quiz funnel with constraint scoring + region detection
    Results.tsx        — AI-generated proposal display with region-aware pricing + PDF download
    Solutions.tsx      — Service offerings with region-aware pricing selector
    ADAPTFramework.tsx — Detailed ADAPT methodology page
    LeadMagnet.tsx     — "7 AI Fears" guide download with lead capture
    Workshop.tsx       — Workshop registration funnel
    Delivery.tsx       — 9-step delivery methodology
  components/
    Navbar.tsx         — Site navigation
    Footer.tsx         — Site footer
    ui/                — shadcn/ui component library

server/
  routers.ts           — All tRPC API endpoints
  db.ts                — Database helper functions (Drizzle queries)
  ghl.ts               — GoHighLevel webhook integration
  proposalGenerator.ts — LLM-powered proposal content generation
  pdfGenerator.ts      — Branded HTML-to-PDF proposal generator + S3 upload
  storage.ts           — S3 file storage helpers

shared/
  pricing.ts           — Region-based pricing configuration (UK/EU/ZA)
  const.ts             — Shared constants
  types.ts             — Shared TypeScript types

drizzle/
  schema.ts            — Database schema (5 tables)
```

### 4.3 Database Schema

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | Auth users (admin) | id, openId, name, email, role |
| `leads` | Captured prospects | firstName, lastName, email, company, source, archetype, ghlContactId, UTM params |
| `assessments` | Quiz submissions | leadId, answers (JSON), constraintScores, overallScore, primaryConstraint, costOfInaction, recommendedTier |
| `proposals` | Generated proposals | leadId, assessmentId, title, content (JSON), pdfUrl, status, estimatedValue |
| `workshopRegistrations` | Workshop signups | leadId, workshopId, workshopTitle, status, prepCompleted |
| `webhookEvents` | GHL webhook audit log | eventType, entityId, payload, responseStatus, success |

### 4.4 API Endpoints (tRPC)

| Router | Procedure | Auth | Description |
|--------|-----------|------|-------------|
| `lead.create` | mutation | public | Capture lead + fire GHL webhook |
| `lead.getById` | query | public | Get lead by ID |
| `lead.list` | query | protected | List all leads (admin) |
| `assessment.submit` | mutation | public | Submit quiz + fire GHL webhook |
| `assessment.getById` | query | public | Get assessment by ID |
| `assessment.getByLeadId` | query | public | Get assessments for a lead |
| `proposal.generate` | mutation | public | LLM-generate proposal content |
| `proposal.generatePdf` | mutation | public | Render branded PDF + upload to S3 |
| `proposal.getById` | query | public | Get proposal by ID |
| `proposal.updateStatus` | mutation | protected | Update proposal status (admin) |
| `workshop.register` | mutation | public | Register for workshop + fire GHL webhook |
| `workshop.listByWorkshop` | query | protected | List registrations (admin) |
| `workshop.updateStatus` | mutation | protected | Update registration status (admin) |

---

## 5. User Flows

### 5.1 Quiz Funnel (Primary Conversion Path)

1. Visitor lands on Home page → clicks "Diagnose Your Constraints" CTA
2. Assessment page: 10-question quiz with region detection (Q1 asks location)
3. Contact form captures lead details (name, email, company, job title)
4. Lead is created via `lead.create` → GHL webhook fires
5. Assessment is submitted via `assessment.submit` → GHL webhook fires
6. Redirect to Results page with assessment data in session storage
7. Results page displays constraint diagnosis, Cost of Inaction, and recommended tier
8. "Generate Your Proposal" button triggers `proposal.generate` (LLM) → GHL webhook fires
9. "Download PDF" button triggers `proposal.generatePdf` → branded PDF uploaded to S3
10. CTA to book a strategy call

### 5.2 Workshop Registration

1. Visitor navigates to Workshop page
2. Reads agenda, speaker bio, FAQ, and countdown timer
3. Fills registration form (name, email, company, job title, company size)
4. Lead is created via `lead.create` → GHL webhook fires
5. Registration is created via `workshop.register` → GHL webhook fires
6. Confirmation displayed with next steps

### 5.3 Lead Magnet Download

1. Visitor navigates to Lead Magnet page ("7 AI Fears" guide)
2. Fills email capture form
3. Lead is created via `lead.create` → GHL webhook fires
4. PDF download link provided

---

## 6. Design System

### 6.1 Visual Identity — "Data Cartography"

The design is inspired by cartographic data visualisation and intelligence dashboards. The aesthetic is authoritative, data-driven, and trustworthy — not startup-trendy.

### 6.2 Colour Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--navy` | `oklch(0.15 0.03 260)` / `#0A1628` | Primary background canvas |
| `--navy-dark` | `oklch(0.10 0.03 260)` | Deeper sections |
| `--navy-light` | `oklch(0.20 0.03 260)` | Card backgrounds |
| `--teal` | `oklch(0.78 0.15 175)` / `#00D4AA` | Interactive elements, data highlights |
| `--amber` | `oklch(0.78 0.15 75)` / `#F5A623` | CTAs, warnings, urgency |
| `--cream` | `oklch(0.95 0.01 80)` / `#F0EDE8` | Body text |

### 6.3 Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Headlines | Space Grotesk | Bold (700) | 72/48/32px |
| Body | DM Sans | Regular (400) | 18px |
| Data/Stats | JetBrains Mono | Medium (500) | Variable |
| Captions | DM Sans | Regular (400) | 14px |

### 6.4 Component Patterns

The site uses a dark theme exclusively. Glass-panel effects (`backdrop-blur`, subtle border glow) are used for content cards. Topographic contour line patterns serve as section dividers. Animations are slow and deliberate (200ms, ease-out). Framer Motion handles scroll-triggered reveals.

---

## 7. Integrations

### 7.1 GoHighLevel (GHL)

Every key event fires a webhook to GHL asynchronously (fire-and-forget pattern):

| Event | Trigger | Payload |
|-------|---------|---------|
| `lead_created` | New lead captured | Full lead data + source + UTM params |
| `assessment_completed` | Quiz submitted | Lead ID, scores, constraint, recommended tier |
| `proposal_generated` | Proposal created | Lead ID, assessment ID, title, estimated value |
| `workshop_registered` | Workshop signup | Lead ID, workshop ID, registration details |

The `GHL_WEBHOOK_URL` environment variable must be set for webhooks to fire. All webhook events are logged to the `webhookEvents` table for debugging.

### 7.2 LLM (Proposal Generation)

The built-in Forge API generates structured proposal content including:
- Executive summary anchored to the prospect's specific constraints
- Constraint diagnosis with breakdown scores
- Recommended solution tier with deliverables and timeline
- ROI projection (year 1 savings, year 3 savings, ROI multiple, payback months)
- Region-aware indicative pricing
- Next steps

### 7.3 S3 (PDF Storage)

Generated PDF proposals are rendered as branded HTML, converted to PDF, and uploaded to S3. The URL is stored in the `proposals.pdfUrl` column.

---

## 8. Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | TiDB/MySQL connection string | System-provided |
| `JWT_SECRET` | Session cookie signing | System-provided |
| `VITE_APP_ID` | Manus OAuth app ID | System-provided |
| `OAUTH_SERVER_URL` | Manus OAuth backend | System-provided |
| `BUILT_IN_FORGE_API_URL` | LLM + storage API base URL | System-provided |
| `BUILT_IN_FORGE_API_KEY` | Server-side API key | System-provided |
| `GHL_WEBHOOK_URL` | GoHighLevel webhook endpoint | User-provided |

---

## 9. Testing

The project maintains 50 passing tests across 3 test files:

| File | Tests | Coverage |
|------|-------|----------|
| `server/routes.test.ts` | 26 | All tRPC endpoints: lead CRUD, assessment submission, proposal generation, PDF generation, workshop registration, auth guards |
| `shared/pricing.test.ts` | 23 | Region configs, currency formatting, range formatting, engagement tiers, pricing disclaimer |
| `server/auth.logout.test.ts` | 1 | Auth logout flow |

Run tests with `pnpm test`.

---

## 10. Roadmap

### Completed

- Multi-page marketing website with Data Cartography design
- 10-question AI Readiness Assessment quiz funnel
- Constraint-based scoring engine (capacity, knowledge, process, scale)
- Cost of Inaction calculator
- LLM-powered proposal generation
- Branded PDF proposal export to S3
- Region-based pricing (UK/EU/ZA) across all touchpoints
- Workshop registration funnel
- Lead magnet download page
- GHL webhook integration for all events
- Full tRPC API with 14 endpoints
- 50 passing vitest tests

### Planned

- Admin dashboard page (leads, assessments, proposals management)
- Transactional email delivery for proposals
- Real-time email validation on lead capture forms
- Workshop calendar integration
- A/B testing on quiz funnel conversion
- Analytics dashboard with lead source attribution
