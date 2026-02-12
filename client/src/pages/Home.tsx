/*
 * Design: Data Cartography — FinanceFlo.ai
 * Home: Hero with topographic bg, stats bar, ADAPT preview, social proof, CTA
 * Dark navy canvas, teal accents, amber CTAs, asymmetric layout
 */
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Brain, Building2, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

const HERO_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/gqIatARolILotQkG.png";
const ADAPT_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/FEyzInVFNQbEObNl.png";
const SAGE_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/tPdbnfOAsVngxSte.png";
const CTA_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/luQdnSsPNQfzyaRb.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const } }),
};

const stats = [
  { value: "72%", label: "of CFOs say AI is their top priority in 2026", source: "Gartner" },
  { value: "40%", label: "reduction in month-end close time with Sage Intacct", source: "Sage" },
  { value: "3.2x", label: "ROI within 18 months for AI-enabled finance teams", source: "McKinsey" },
];

const painPoints = [
  { icon: Building2, title: "Multi-Company Chaos", desc: "Managing 5+ entities on disconnected systems with no consolidated view" },
  { icon: BarChart3, title: "Manual Reporting", desc: "Spending days on month-end close instead of strategic analysis" },
  { icon: Shield, title: "Compliance Risk", desc: "Audit trails scattered across spreadsheets and legacy platforms" },
  { icon: Brain, title: "AI Uncertainty", desc: "Knowing AI matters but unsure where to start or who to trust" },
];

const adaptPhases = [
  { letter: "A", name: "Assess", desc: "Evaluate your current financial systems, data maturity, and AI readiness" },
  { letter: "D", name: "Design", desc: "Architect the optimal Sage Intacct configuration and AI integration roadmap" },
  { letter: "A", name: "Automate", desc: "Implement intelligent automation across AP, AR, consolidation, and reporting" },
  { letter: "P", name: "Pilot", desc: "Deploy targeted AI solutions with measurable KPIs and quick wins" },
  { letter: "T", name: "Transform", desc: "Scale AI across the organisation with continuous learning and optimisation" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/80 to-navy/40" />
        <div className="container relative z-10 pt-24 pb-16">
          <div className="max-w-2xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-teal border border-teal/30 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                AI-Powered Financial Transformation
              </span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your Finance Team Deserves{" "}
              <span className="text-gradient-teal">Intelligent Systems</span>
              {" "}Not More Spreadsheets
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl"
            >
              FinanceFlo.ai combines Sage Intacct's multi-company financial management with custom AI solutions to transform how mid-market companies manage, report, and forecast their finances.
            </motion.p>

            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/assessment">
                <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
                  Take the AI Readiness Assessment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/solutions">
                <Button size="lg" variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2 text-base">
                  Explore Solutions
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-border/30 bg-navy-dark/80">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-start gap-4"
              >
                <span className="text-3xl font-bold text-teal font-mono shrink-0">{stat.value}</span>
                <div>
                  <p className="text-sm text-foreground leading-snug">{stat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">Source: {stat.source}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono text-teal uppercase tracking-widest">The Challenge</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Sound Familiar?
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Mid-market finance teams face unique pressures. You need enterprise-grade capabilities without enterprise-grade complexity or cost.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <point.icon className="w-8 h-8 text-teal mb-4 group-hover:text-amber transition-colors" />
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ADAPT FRAMEWORK PREVIEW ===== */}
      <section className="py-20 border-y border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Methodology</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                The ADAPT Framework
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                A proven five-phase methodology that takes your finance function from legacy systems to AI-powered intelligence — without disrupting your business.
              </p>
              <div className="space-y-4">
                {adaptPhases.map((phase, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
                      <span className="text-teal font-bold font-mono">{phase.letter}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{phase.name}</h4>
                      <p className="text-sm text-muted-foreground">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/adapt-framework">
                <Button variant="outline" className="mt-8 border-teal/40 text-teal hover:bg-teal/10 gap-2">
                  Learn More About ADAPT
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={ADAPT_IMG}
                alt="ADAPT Framework Visualization"
                className="w-full rounded-lg object-contain glow-teal"
                style={{ maxHeight: "500px" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SAGE INTACCT + AI SECTION ===== */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <img
                src={SAGE_IMG}
                alt="Sage Intacct Multi-Company Integration"
                className="w-full rounded-lg object-contain"
                style={{ maxHeight: "450px" }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Core Platform</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Sage Intacct + AI:{" "}
                <span className="text-gradient-amber">The Foundation</span>
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Sage Intacct provides the multi-company, multi-currency financial management backbone. FinanceFlo.ai layers intelligent automation, predictive analytics, and custom AI solutions on top.
              </p>
              <div className="space-y-4">
                {[
                  { icon: TrendingUp, text: "Real-time multi-entity consolidation and reporting" },
                  { icon: Zap, text: "AI-powered anomaly detection and cash flow forecasting" },
                  { icon: Brain, text: "Machine learning for automated journal entries and reconciliation" },
                  { icon: Shield, text: "Built-in audit trails with role-based access controls" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-amber shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/solutions">
                <Button className="mt-8 bg-amber text-navy-dark font-semibold hover:bg-amber/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  View All Solutions
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ backgroundImage: `url(${CTA_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-navy/80" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              Ready to Map Your{" "}
              <span className="text-gradient-teal">AI Journey</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Take our 5-minute AI Readiness Assessment and receive a personalised transformation roadmap with specific recommendations for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
                  Start Your Assessment
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/lead-magnet">
                <Button size="lg" variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2 text-base">
                  Download Free AI Report
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
