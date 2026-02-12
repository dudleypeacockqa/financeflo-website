/*
 * Design: Data Cartography — FinanceFlo.ai
 * Solutions: Sage Intacct, AI Development, Pricing Tiers, Maintenance Pillars
 * Region-aware pricing (UK/EU/ZA)
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, BarChart3, Brain, Building2, Cloud, Cog, Database,
  LineChart, Lock, Repeat, Shield, TrendingUp, Zap, Eye,
  GraduationCap, RefreshCw, CheckCircle2, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import {
  type Region,
  REGIONS,
  REGION_CONFIGS,
  getEngagementTiers,
  PRICING_DISCLAIMER,
} from "@shared/pricing";

const SAGE_IMG = "/images/sage-intacct-hero.png";

const sageFeatures = [
  { icon: Building2, title: "Multi-Entity Management", desc: "Manage unlimited entities with real-time consolidation, inter-company transactions, and elimination entries — all automated." },
  { icon: LineChart, title: "Real-Time Reporting", desc: "Dimensional reporting across entities, departments, and projects. Custom dashboards that update in real-time." },
  { icon: Repeat, title: "Multi-Currency", desc: "Automated currency conversion, revaluation, and reporting across all your international entities." },
  { icon: Cloud, title: "True Cloud Architecture", desc: "Born-in-the-cloud platform with 99.8% uptime SLA. Access from anywhere, integrate with everything." },
  { icon: Lock, title: "Audit & Compliance", desc: "Complete audit trails, role-based access, and SOC 1 Type II compliance built into every transaction." },
  { icon: Database, title: "Open API Platform", desc: "RESTful APIs enable seamless integration with your existing systems, CRM, and custom AI solutions." },
];

const aiSolutions = [
  { icon: Brain, title: "Intelligent Automation", desc: "ML-powered journal entry automation, invoice processing, and bank reconciliation that learns from your patterns.", tag: "ML/AI" },
  { icon: TrendingUp, title: "Predictive Analytics", desc: "Cash flow forecasting, revenue prediction, and anomaly detection using your historical financial data.", tag: "Predictive" },
  { icon: Zap, title: "Process Mining", desc: "AI analyses your financial workflows to identify bottlenecks, redundancies, and automation opportunities.", tag: "Optimisation" },
  { icon: BarChart3, title: "Custom AI Dashboards", desc: "Natural language querying of your financial data. Ask questions in plain English, get instant visualisations.", tag: "NLP" },
  { icon: Shield, title: "Fraud Detection", desc: "Real-time anomaly detection across transactions, flagging suspicious patterns before they become problems.", tag: "Security" },
  { icon: Cog, title: "Integration Bots", desc: "Custom AI agents that automate data flows between Sage Intacct and your existing systems (Whimbrel, CRM, etc.).", tag: "RPA" },
];

const maintenancePillars = [
  { icon: Eye, title: "System Health Monitoring & Alerting", desc: "Proactive monitoring of all integrations, API health, data pipeline integrity, and system performance." },
  { icon: TrendingUp, title: "Performance & Cost Optimisation", desc: "Monthly review of API costs, query performance, model accuracy, and infrastructure efficiency." },
  { icon: Shield, title: "Security & Compliance Management", desc: "Regular security audits, access reviews, compliance checks, and vulnerability assessments." },
  { icon: RefreshCw, title: "Future-Proofing & Strategic Updates", desc: "Stay ahead with new Sage Intacct features, AI model retraining, and technology roadmap updates." },
  { icon: GraduationCap, title: "User Adoption & Training", desc: "Ongoing training programmes, documentation updates, and change management support for your team." },
];

function detectDefaultRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("Africa/Johannesburg") || tz.startsWith("Africa/Cape") || tz.startsWith("Africa/Harare")) return "ZA";
    if (tz.startsWith("Europe/London") || tz.startsWith("Europe/Belfast")) return "UK";
    if (tz.startsWith("Europe/")) return "EU";
  } catch {
    // ignore
  }
  return "UK";
}

export default function Solutions() {
  const [region, setRegion] = useState<Region>(detectDefaultRegion);
  const config = REGION_CONFIGS[region];
  const tiers = getEngagementTiers(region);

  const pricingTiers = [
    {
      ...tiers[0],
      period: "one-time",
      features: [
        "Current-state process map (where time/money leaks)",
        "ROI stack (levers + numbers + assumptions)",
        "Prioritised roadmap (quick wins + bigger plays)",
        "Implementation plan (phases, owners, timeline)",
        "Cost of Inaction calculation",
      ],
      cta: "Start With an Audit",
    },
    {
      name: "Implementation",
      price: "Scoped from audit",
      period: "project-based",
      description: "Build and deploy. Time & materials or fixed-price based on audit findings.",
      features: [
        "Sage Intacct configuration & deployment",
        "Data migration & validation",
        "Custom AI solution development",
        "Integration with existing systems",
        "Team training & documentation",
        "Full handoff with Loom walkthroughs",
      ],
      cta: "Get Scoped",
      tag: "Phase 2",
      featured: false,
    },
    {
      ...tiers[2],
      period: "monthly",
      features: [
        "All 5 maintenance pillars included",
        "Defined monthly hours + scope",
        "Priority support & availability windows",
        "Monthly performance reports",
        "Quarterly strategic reviews",
        "New builds always separate (keeps expansion alive)",
      ],
      cta: "Discuss Retainer",
    },
  ];

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="max-w-3xl">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Solutions</span>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Enterprise Finance,{" "}
              <span className="text-gradient-teal">Mid-Market Fit</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We combine Sage Intacct's best-in-class financial management with custom AI solutions to remove the constraints blocking your next growth phase. No generic implementations — every solution is designed around your specific workflows and goals.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Model */}
      <section className="py-12 border-b border-border/30 bg-navy-dark/50">
        <div className="container">
          <div className="glass-panel p-6 flex flex-col sm:flex-row items-start gap-6" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="w-12 h-12 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-teal" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: "var(--font-heading)" }}>Our Delivery Model: You Own It, We Maintain It</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You own the infrastructure and pay hosting + API costs directly. We keep admin access for upgrades, fixes, and optimisation (contract-defined). Full handoff happens with documentation, Loom walkthroughs, and training. This means you're never locked in — but we stay embedded as your strategic technology partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sage Intacct Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3">
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Core Platform</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Sage Intacct:{" "}
                <span className="text-gradient-amber">The Foundation</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Sage Intacct is the AICPA's preferred financial management solution, trusted by over 20,000 organisations worldwide. It provides the multi-company, multi-currency backbone that your AI strategy needs.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sageFeatures.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="glass-panel p-5 group hover:border-amber/30 transition-colors"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <feat.icon className="w-6 h-6 text-amber mb-3" />
                    <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-heading)" }}>{feat.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              <img
                src={SAGE_IMG}
                alt="Sage Intacct Integration"
                className="w-full rounded-lg object-contain"
                style={{ maxHeight: "400px" }}
              />
              <div className="glass-panel p-5 mt-6" style={{ borderRadius: "var(--radius)" }}>
                <h4 className="font-semibold text-sm mb-2 text-amber" style={{ fontFamily: "var(--font-heading)" }}>Why Not Just Sage One?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sage One is designed for single-entity small businesses. When you manage multiple companies, need real-time consolidation, multi-currency support, dimensional reporting, and API-first architecture for AI integration — Sage Intacct is the clear choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Solutions Section */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">AI Layer</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Custom AI Solutions
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Built on top of Sage Intacct, our AI solutions use machine learning, natural language processing, and reinforcement learning to transform your finance function from reactive to predictive. Every solution is applied <em>after</em> QDOAA optimisation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSolutions.map((sol, i) => (
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
                  <sol.icon className="w-7 h-7 text-teal" />
                  <span className="text-xs font-mono text-teal/70 px-2 py-0.5 border border-teal/20 rounded">{sol.tag}</span>
                </div>
                <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{sol.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Maintenance Pillars */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Ongoing Support</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              5 Maintenance Pillars
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our retainer model covers five critical pillars that keep your systems healthy, secure, and evolving. Maintenance isn't new builds — it's strategic stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenancePillars.map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                <pillar.icon className="w-7 h-7 text-amber mb-4" />
                <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{pillar.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Tiers — Region-Aware */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Transparent Engagement Models
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              We price like consultants, not vendors. The anchor is always: "What is this problem costing you?" Our pricing reflects the severity of your constraints, not just the complexity of the solution.
            </p>

            {/* Region Selector */}
            <div className="inline-flex items-center gap-2 glass-panel px-4 py-2" style={{ borderRadius: "var(--radius)" }}>
              <Globe className="w-4 h-4 text-teal" />
              <span className="text-xs text-muted-foreground mr-2">Your region:</span>
              {REGIONS.map((r) => {
                const c = REGION_CONFIGS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      region === r
                        ? "bg-teal text-navy-dark font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-navy-light/50"
                    }`}
                  >
                    {c.label} ({c.currencySymbol})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`glass-panel p-6 relative flex flex-col ${tier.featured ? "border-teal/40 glow-teal" : ""}`}
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-teal text-navy-dark text-xs font-bold rounded-full">
                    Start Here
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold text-amber">{tier.price}</span>
                    <span className="text-xs text-muted-foreground">{tier.period}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{tier.description}</p>
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                      <span className="text-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/assessment">
                  <Button
                    className={`w-full gap-2 ${tier.featured ? "bg-teal text-navy-dark font-bold hover:bg-teal/90" : "bg-navy-light border border-border/50 text-foreground hover:bg-navy-light/80"}`}
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Market Context & Disclaimer */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground/70 max-w-2xl mx-auto">
              {config.marketContext}
            </p>
            <p className="text-xs text-muted-foreground/50 max-w-2xl mx-auto italic">
              {PRICING_DISCLAIMER}
            </p>
          </div>
        </div>
      </section>

      {/* Integration Note */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="glass-panel p-8 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              We Work With Your Existing Systems
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Already using Whimbrel, Sage 200, or another platform? We don't replace what works — we integrate, enhance, and build AI layers on top. Your team keeps the tools they know while gaining powerful new capabilities.
            </p>
            <Link href="/assessment">
              <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                Diagnose Your Constraints
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
