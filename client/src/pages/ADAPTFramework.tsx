/*
 * Design: Data Cartography — FinanceFlo.ai
 * ADAPT Framework: Detailed methodology page with phase breakdowns
 */
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Search, Compass, Cog, FlaskConical, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const ADAPT_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/FEyzInVFNQbEObNl.png";
const OVERVIEW_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/NekNNmenRaESBYYw.png";

const phases = [
  {
    letter: "A",
    name: "Assess",
    icon: Search,
    duration: "2–3 weeks",
    tagline: "Understand where you are",
    description: "We conduct a thorough assessment of your current financial systems, data maturity, team capabilities, and business objectives. This phase maps the terrain before we chart the course.",
    deliverables: ["Current State Analysis Report", "Data Maturity Scorecard", "Stakeholder Interview Findings", "Gap Analysis & Opportunity Map"],
    activities: ["Financial systems audit", "Data quality assessment", "Team capability mapping", "Process documentation", "Integration landscape review"],
  },
  {
    letter: "D",
    name: "Design",
    icon: Compass,
    duration: "3–4 weeks",
    tagline: "Chart the optimal path",
    description: "Based on the assessment findings, we design the optimal Sage Intacct configuration, AI integration architecture, and transformation roadmap tailored to your specific needs.",
    deliverables: ["Solution Architecture Document", "Sage Intacct Configuration Blueprint", "AI Integration Roadmap", "Change Management Plan"],
    activities: ["Solution architecture design", "Sage Intacct configuration planning", "AI use case prioritisation", "Integration mapping", "Timeline and milestone planning"],
  },
  {
    letter: "A",
    name: "Automate",
    icon: Cog,
    duration: "6–10 weeks",
    tagline: "Build intelligent foundations",
    description: "We implement Sage Intacct with your custom configuration, migrate data, and deploy the first wave of intelligent automation across your core financial processes.",
    deliverables: ["Configured Sage Intacct Instance", "Data Migration Completion", "Automated Workflows", "Integration Connectors"],
    activities: ["Sage Intacct implementation", "Historical data migration", "Workflow automation setup", "System integration build", "User acceptance testing"],
  },
  {
    letter: "P",
    name: "Pilot",
    icon: FlaskConical,
    duration: "4–6 weeks",
    tagline: "Prove value with quick wins",
    description: "We deploy targeted AI solutions with measurable KPIs. This phase focuses on demonstrating ROI quickly — typically starting with the highest-impact, lowest-risk use cases.",
    deliverables: ["AI Pilot Deployment", "KPI Dashboard", "ROI Measurement Report", "User Training Completion"],
    activities: ["AI model deployment", "Performance monitoring", "User training and adoption", "KPI tracking and reporting", "Iterative refinement"],
  },
  {
    letter: "T",
    name: "Transform",
    icon: Rocket,
    duration: "Ongoing",
    tagline: "Scale and evolve continuously",
    description: "With proven results from the pilot, we scale AI across the organisation. This phase establishes continuous learning loops and positions your finance function as a strategic AI-powered asset.",
    deliverables: ["Scaled AI Solutions", "Continuous Improvement Framework", "Advanced Analytics Suite", "Strategic Roadmap Updates"],
    activities: ["Enterprise-wide AI rollout", "Advanced model training", "Predictive analytics deployment", "Continuous optimisation", "Quarterly strategic reviews"],
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
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                A proven five-phase methodology that transforms your finance function from legacy systems to AI-powered intelligence — without disrupting your business operations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                ADAPT stands for <strong className="text-foreground">Assess, Design, Automate, Pilot, Transform</strong>. Each phase builds on the previous, creating a structured, low-risk path to financial transformation.
              </p>
            </div>
            <div>
              <img
                src={ADAPT_IMG}
                alt="ADAPT Framework"
                className="w-full rounded-lg object-contain glow-teal"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Phase Details */}
      <section className="py-20">
        <div className="container">
          <div className="space-y-16">
            {phases.map((phase, i) => {
              const PhaseIcon = phase.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                >
                  {/* Phase indicator */}
                  <div className="lg:col-span-2 flex lg:flex-col items-center lg:items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-teal font-mono">{phase.letter}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{phase.name}</h3>
                      <span className="text-xs font-mono text-muted-foreground">{phase.duration}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-6">
                    <p className="text-sm text-teal font-semibold mb-2 italic">{phase.tagline}</p>
                    <p className="text-muted-foreground leading-relaxed mb-6">{phase.description}</p>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                        <PhaseIcon className="w-4 h-4 text-teal" /> Key Activities
                      </h4>
                      <ul className="space-y-2">
                        {phase.activities.map((activity, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal/60 shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="lg:col-span-4">
                    <div className="glass-panel p-5" style={{ borderRadius: "var(--radius)" }}>
                      <h4 className="text-sm font-semibold text-amber mb-3" style={{ fontFamily: "var(--font-heading)" }}>Deliverables</h4>
                      <ul className="space-y-2">
                        {phase.deliverables.map((del, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber/60 shrink-0 mt-1.5" />
                            {del}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Overview Image */}
      <section className="py-16 border-t border-border/30">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "var(--font-heading)" }}>
            Framework Overview
          </h2>
          <img
            src={OVERVIEW_IMG}
            alt="ADAPT Framework Overview"
            className="w-full max-w-4xl mx-auto rounded-lg object-contain"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="glass-panel p-8 text-center glow-teal" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Start Your ADAPT Journey
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Take our AI Readiness Assessment to discover which ADAPT phase is right for your organisation, and receive a personalised transformation roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                  Take the Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="https://financeflo.ai" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
                  Book a Strategy Call
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
