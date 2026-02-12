/*
 * Design: Data Cartography — FinanceFlo.ai
 * Delivery: 6 Pillars of delivery methodology
 * 9-step implementation, communication, conflict resolution, expertise, boundaries, PM
 */
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, Target, BarChart3, Users, Paintbrush, Eye, Rocket,
  GraduationCap, TrendingUp, Repeat, MessageSquare, Shield, Brain,
  Clock, Clipboard, ChevronDown, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const CTA_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/luQdnSsPNQfzyaRb.png";

/* ── 9-Step Implementation Journey ── */
const implementationSteps = [
  {
    num: "01", icon: Target, title: "Anchor to Burning Pain",
    summary: "We never lead with features. Every engagement starts by quantifying the specific pain — time lost, money wasted, risk exposure.",
    detail: "We answer three questions with real numbers: What's broken right now? What's it costing weekly/monthly? If we don't fix this in 90 days, what gets worse? This becomes your one-slide business case.",
    phase: "Assess",
  },
  {
    num: "02", icon: BarChart3, title: "Data-Driven Urgency",
    summary: "We paint the 'stay the same' path as expensive and risky using competitor benchmarks and industry data.",
    detail: "We build a competitor comparison showing what automated finance teams achieve versus manual ones — translating into money saved, morale improved, risk reduced, and accuracy increased.",
    phase: "Assess",
  },
  {
    num: "03", icon: Users, title: "Map Power Stakeholders",
    summary: "For every person your project touches, we document what they want, what they fear, and what makes them a hero.",
    detail: "Champions, gatekeepers, and end users each get a profile. We sanity-check champions to ensure alignment on realistic outcomes. We identify resistors early and address identity/ego/fear concerns — not just logic.",
    phase: "Design",
  },
  {
    num: "04", icon: Paintbrush, title: "Co-Design the MVP",
    summary: "We run 2-3 co-design sessions with your team to build ownership and capture the real day-to-day pain.",
    detail: "We ask: 'What sucks right now?', 'What's missing?', 'What would feel magical but realistic?' We record verbatim quotes and reuse them in proposals and demos: 'You said X, so we built Y.'",
    phase: "Design",
  },
  {
    num: "05", icon: Eye, title: "Pre-Sell the Outcome",
    summary: "Before launch, we ship a 2-5 minute walkthrough so your team can visualise the future workflow.",
    detail: "A click-through demo showing instant value, ending with a clear timeline: 'This is ready in X weeks, here's how access works.' People adopt what they understand and can visualise.",
    phase: "Automate",
  },
  {
    num: "06", icon: Rocket, title: "Pilot → Advocates → Virality",
    summary: "We never roll out to everyone at once. One team, one visible win, then internal demand pulls expansion.",
    detail: "Pick one team, solve their biggest pain first, document before/after results. Pilot users become your loudest internal marketing channel — 'Ops team asks next', 'Other regions want it.'",
    phase: "Pilot",
  },
  {
    num: "07", icon: GraduationCap, title: "Train for Adoption",
    summary: "We don't train on button clicks — we train for behaviour change with 30 days of embedded support.",
    detail: "Simplified workflows (less choice, less complexity), fast blocker removal, async help via Slack/Loom, weekly office hours, and playbooks/checklists. If UX is genuinely bad, we fix it — we don't blame 'resistance.'",
    phase: "Pilot",
  },
  {
    num: "08", icon: TrendingUp, title: "Measure & Show ROI Loudly",
    summary: "We set '2-4 week proof' metrics and report them visibly — time saved, tasks automated, errors reduced.",
    detail: "Before/after tracking across all five ROI levers: revenue increase, cost reduction, time savings, risk mitigation, and strategic value. Results shown in a simple dashboard or one-page update.",
    phase: "Transform",
  },
  {
    num: "09", icon: Repeat, title: "Iterate, Simplify, Handoff",
    summary: "The system works without us — and keeps working. Fewer steps, fewer choices, clearer defaults.",
    detail: "Post-launch 'what's breaking?' loop. Final handoff includes playbooks, FAQs, ownership documentation, clear escalation paths, and transition to retainer for ongoing evolution.",
    phase: "Transform",
  },
];

/* ── 6 Delivery Pillars ── */
const deliveryPillars = [
  {
    icon: Rocket, title: "Implementation Delivery", count: "9 steps",
    desc: "Pain-first anchoring, co-design, pilot-then-scale. Every solution is adopted because users helped build it.",
    highlights: ["Burning pain quantification", "Co-design sessions with verbatim quotes", "Pilot → advocates → internal virality", "30-day embedded adoption support"],
  },
  {
    icon: MessageSquare, title: "Communication Excellence", count: "8 steps",
    desc: "Clarity beats complexity. We translate tech into business impact for every audience level.",
    highlights: ["30-second value pitch", "2-layer explanations (non-tech + tech)", "Active listening with 60-second recaps", "Mirroring to uncover hidden constraints"],
  },
  {
    icon: Shield, title: "Conflict Resolution", count: "8 steps",
    desc: "Evidence over ego. We handle disagreements with data, not opinions.",
    highlights: ["Evidence packs before challenging", "Validate → Risk → Collaborate method", "Document and escalate professionally", "Business constraint awareness"],
  },
  {
    icon: Brain, title: "Expertise Management", count: "6 steps",
    desc: "Outcomes over encyclopedic knowledge. We deliver results, not vocabulary.",
    highlights: ["'I'll double-check and confirm' protocol", "Clear definition of done", "Statement of Work as shield", "Blocker documentation from day one"],
  },
  {
    icon: Clock, title: "Work-Life Boundaries", count: "6 steps",
    desc: "Burnout kills quality. We protect delivery quality through clear boundaries.",
    highlights: ["Working arrangement locked before kickoff", "Crystal clear availability windows", "Overtime defined in SOW", "Workload proven with metrics, not vibes"],
  },
  {
    icon: Clipboard, title: "Project Management", count: "9 steps",
    desc: "Visibility, documentation, leading not chasing. Every decision is tracked.",
    highlights: ["PM ownership clarified at kickoff", "6-line recap after every meeting", "Scope tracked religiously", "Lead, don't chase — outcome-focused updates"],
  },
];

/* ── Expandable Step Card ── */
function StepCard({ step, index }: { step: typeof implementationSteps[0]; index: number }) {
  const [open, setOpen] = useState(false);
  const phaseColor = step.phase === "Assess" ? "text-teal" :
    step.phase === "Design" ? "text-amber" :
    step.phase === "Automate" ? "text-teal" :
    step.phase === "Pilot" ? "text-amber" : "text-teal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-panel overflow-hidden group"
      style={{ borderRadius: "var(--radius)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-5 flex items-start gap-4 text-left"
      >
        <div className="shrink-0 w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center">
          <step.icon className="w-5 h-5 text-teal" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{step.num}</span>
            <span className={`text-xs font-mono ${phaseColor} uppercase tracking-wider`}>{step.phase}</span>
          </div>
          <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-heading)" }}>{step.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.summary}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="px-5 pb-5 pl-19"
        >
          <div className="border-t border-border/30 pt-4 ml-14">
            <p className="text-sm text-foreground/80 leading-relaxed">{step.detail}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Delivery() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">How We Deliver</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Delivery That{" "}
              <span className="text-gradient-teal">Actually Sticks</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most AI and ERP projects fail not because of technology, but because of politics, poor adoption, and invisible constraints. Our delivery methodology is built from hundreds of real engagements — designed to handle the human side of transformation as rigorously as the technical side.
            </p>
          </div>
        </div>
      </section>

      {/* Core Promise */}
      <section className="py-12 border-b border-border/30 bg-navy-dark/50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: "9", label: "Implementation Steps", sub: "Pain → Adoption → Handoff" },
              { stat: "6", label: "Delivery Pillars", sub: "Covering every engagement dimension" },
              { stat: "46", label: "Actionable Practices", sub: "Concrete scripts, templates, and checklists" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-panel p-6 text-center"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="text-3xl font-bold text-teal mb-1" style={{ fontFamily: "var(--font-heading)" }}>{item.stat}</div>
                <div className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-heading)" }}>{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9-Step Implementation Journey */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">The Journey</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              9-Step Implementation Model
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              From burning pain to self-sustaining system. Each step is mapped to an ADAPT Framework phase, ensuring your transformation follows a proven path from diagnosis to full adoption.
            </p>
          </div>

          <div className="space-y-3">
            {implementationSteps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 6 Delivery Pillars */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Complete Framework</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              6 Delivery Pillars
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementation is just one pillar. Our methodology covers every dimension of a consulting engagement — from how we communicate to how we handle conflict, manage expertise, protect boundaries, and run projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliveryPillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <pillar.icon className="w-7 h-7 text-teal" />
                  <span className="text-xs font-mono text-teal/70 px-2 py-0.5 border border-teal/20 rounded">{pillar.count}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pillar.desc}</p>
                <ul className="space-y-2">
                  {pillar.highlights.map((h, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Principles</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              What Makes This Different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Pain Before Features",
                desc: "We never pitch technology first. Every conversation starts with 'What's broken, what's it costing, and what gets worse in 90 days?' If we can't quantify the pain, we don't proceed.",
              },
              {
                title: "Co-Design, Not Cave-Building",
                desc: "Your team helps design the solution. This builds ownership, surfaces real requirements, and creates 5x adoption rates compared to 'surprise at launch' approaches.",
              },
              {
                title: "Evidence Over Ego",
                desc: "When disagreements arise, we bring data — screenshots, logs, metrics, benchmarks. We validate what's good in their thinking, point out specific risks with evidence, then offer a combined path.",
              },
              {
                title: "Document Everything",
                desc: "After every key meeting: 6-line recap with decisions, actions, owners, deadlines, open questions, and blockers. Verbal agreements disappear when pressure hits.",
              },
              {
                title: "Lead, Don't Chase",
                desc: "We replace 'just checking in' with 'To hit milestone on time, I need X by Y. If not, we'll slip by Z days.' Every update moves the ball forward.",
              },
              {
                title: "Handoff That Works",
                desc: "We're not 'done' at handover — we're done when it runs with your people. Playbooks, FAQs, clear ownership, escalation paths, and 30 days of embedded support.",
              },
            ].map((principle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                <h3 className="font-semibold text-lg mb-2 text-amber" style={{ fontFamily: "var(--font-heading)" }}>{principle.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{principle.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 border-t border-border/30 relative"
        style={{
          backgroundImage: `url(${CTA_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-navy-dark/85" />
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Experience Delivery That Sticks?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Take our free AI Readiness Assessment to diagnose your constraints and see exactly how our 9-step implementation model would apply to your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/assessment">
              <Button className="bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2 glow-teal px-8 py-3 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                Take the Assessment
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/solutions">
              <Button className="bg-transparent border border-amber/50 text-amber font-semibold hover:bg-amber/10 gap-2 px-8 py-3 text-base" style={{ fontFamily: "var(--font-heading)" }}>
                View Solutions & Pricing
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
