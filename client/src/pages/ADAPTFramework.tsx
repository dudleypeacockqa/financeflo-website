/*
 * Design: Data Cartography — FinanceFlo.ai
 * ADAPT Framework: Detailed methodology page with QDOAA integration
 */
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, Search, Compass, Zap, Rocket, TrendingUp,
  CheckCircle2, Target, Clock, Shield, Users, Brain
} from "lucide-react";
import { motion } from "framer-motion";

const ADAPT_IMG = "/images/adapt-hero.png";

const phases = [
  {
    letter: "A",
    name: "Assess",
    icon: Search,
    duration: "2-3 weeks",
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    desc: "We map your current-state processes, diagnose constraints, and calculate the real Cost of Inaction. This isn't a generic questionnaire — it's a deep operational audit.",
    deliverables: [
      "Current-state process map (where time and money leak)",
      "Constraint diagnosis (capacity, knowledge, or process)",
      "ROI stack with levers, numbers, and assumptions",
      "Cost of Inaction calculation",
      "Prioritised roadmap (quick wins + bigger plays)",
    ],
    qdoaa: "During Assess, we apply the first two steps of QDOAA: Question why each step exists, and Delete unnecessary steps. This typically eliminates 30-40% of processes before any technology is considered.",
  },
  {
    letter: "D",
    name: "Design",
    icon: Compass,
    duration: "2-4 weeks",
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/30",
    desc: "We architect the optimal solution — Sage Intacct configuration, AI integration points, data migration strategy, and change management plan. Every design decision is tied to a specific constraint.",
    deliverables: [
      "System architecture document",
      "Sage Intacct configuration blueprint",
      "AI solution specifications",
      "Data migration plan with validation rules",
      "Change management & training plan",
    ],
    qdoaa: "Design applies QDOAA step 3: Optimise. We refine the remaining processes to their most efficient form before adding any technology layer.",
  },
  {
    letter: "A",
    name: "Automate",
    icon: Zap,
    duration: "4-12 weeks",
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    desc: "We build and deploy. Sage Intacct goes live, AI solutions are developed, integrations are connected, and your team is trained. This is where constraints start disappearing.",
    deliverables: [
      "Sage Intacct deployment (multi-entity, multi-currency)",
      "Custom AI solution development and testing",
      "System integrations (Whimbrel, CRM, banking, etc.)",
      "Data migration and validation",
      "Team training with Loom walkthroughs",
    ],
    qdoaa: "Automate applies QDOAA steps 4 and 5: Accelerate (make faster without adding people) and then Automate with AI. This ensures AI is applied to optimised processes, not broken ones.",
  },
  {
    letter: "P",
    name: "Pilot",
    icon: Rocket,
    duration: "4-8 weeks",
    color: "text-amber",
    bg: "bg-amber/10",
    border: "border-amber/30",
    desc: "We deploy targeted AI solutions with measurable KPIs. Start with one high-impact use case, prove ROI, then expand. This de-risks the entire transformation.",
    deliverables: [
      "Pilot deployment with defined success metrics",
      "Weekly performance monitoring and reporting",
      "User feedback collection and iteration",
      "ROI validation against audit projections",
      "Go/no-go decision framework for scaling",
    ],
    qdoaa: "The Pilot phase validates that QDOAA was applied correctly. If the pilot doesn't hit projected ROI, we revisit the earlier steps before scaling.",
  },
  {
    letter: "T",
    name: "Transform",
    icon: TrendingUp,
    duration: "Ongoing",
    color: "text-teal",
    bg: "bg-teal/10",
    border: "border-teal/30",
    desc: "Scale AI across the organisation. Transition to our retainer model for ongoing optimisation, monitoring, and strategic evolution. You own the infrastructure — we keep it running.",
    deliverables: [
      "Full-scale deployment across all entities",
      "Ongoing retainer with 5 maintenance pillars",
      "Quarterly strategic reviews and roadmap updates",
      "Continuous AI model retraining and optimisation",
      "New capability development (separate from maintenance)",
    ],
    qdoaa: "Transform is where QDOAA becomes a continuous practice. Your team applies the framework to every new process, ensuring AI is always solving the right problems.",
  },
];

export default function ADAPTFramework() {
  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Methodology</span>
              <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                The ADAPT{" "}
                <span className="text-gradient-teal">Framework</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                A proven five-phase methodology that takes your finance function from legacy systems to AI-powered intelligence — without disrupting your business.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                ADAPT integrates our QDOAA optimisation framework at every phase, ensuring AI is applied to the right problems in the right order. The result: smaller, cheaper, more effective implementations that your team actually adopts.
              </p>
              <Link href="/assessment">
                <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                  Start Your Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div>
              <img
                src={ADAPT_IMG}
                alt="ADAPT Framework Visualization"
                className="w-full rounded-lg object-contain glow-teal"
                style={{ maxHeight: "450px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* QDOAA Integration */}
      <section className="py-12 border-b border-border/30 bg-navy-dark/50">
        <div className="container">
          <div className="glass-panel p-6" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-12 h-12 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-amber" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Built on QDOAA: Question → Delete → Optimise → Accelerate → Automate
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every phase of ADAPT applies the QDOAA framework. Before we add any technology, we question why each step exists, delete what's unnecessary, optimise what remains, and accelerate without adding people. <strong className="text-foreground">Only then do we automate with AI.</strong> This is why our implementations succeed where others fail — we don't automate broken processes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Details */}
      <section className="py-20">
        <div className="container">
          <div className="space-y-16">
            {phases.map((phase, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-8"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Phase Header */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-lg ${phase.bg} ${phase.border} border flex items-center justify-center`}>
                        <span className={`text-2xl font-bold font-mono ${phase.color}`}>{phase.letter}</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{phase.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {phase.duration}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{phase.desc}</p>
                  </div>

                  {/* Deliverables */}
                  <div className="lg:col-span-1">
                    <h4 className="text-sm font-semibold text-foreground mb-3" style={{ fontFamily: "var(--font-heading)" }}>Deliverables</h4>
                    <ul className="space-y-2">
                      {phase.deliverables.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 ${phase.color} shrink-0 mt-0.5`} />
                          <span className="text-muted-foreground">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* QDOAA Integration */}
                  <div className="lg:col-span-1">
                    <div className={`p-4 rounded-lg ${phase.bg} ${phase.border} border`}>
                      <h4 className="text-sm font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading)" }}>QDOAA in This Phase</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{phase.qdoaa}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ADAPT Works */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Results</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Why ADAPT Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: "Constraint-First", desc: "We diagnose before we prescribe. Every intervention targets a specific bottleneck." },
              { icon: Shield, title: "De-Risked", desc: "Start with an audit, prove value with a pilot, then scale. No massive upfront commitments." },
              { icon: Users, title: "Team-Centric", desc: "Your team helps design the solution. Change management is built in, not bolted on." },
              { icon: TrendingUp, title: "ROI-Validated", desc: "Every phase has measurable KPIs. If the numbers don't work, we adjust before scaling." },
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
                <item.icon className="w-8 h-8 text-teal mx-auto mb-3" />
                <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start Your ADAPT Journey?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Take our 5-minute Constraint Diagnosis to identify where your business model breaks at scale and receive a personalised ADAPT roadmap.
          </p>
          <Link href="/assessment">
            <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
              Diagnose Your Constraints
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
