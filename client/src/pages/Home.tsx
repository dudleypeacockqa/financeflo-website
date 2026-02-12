/*
 * Design: Data Cartography — FinanceFlo.ai
 * Home: Constraint-based messaging, growth capacity framing, ADAPT + QDOAA
 * Dark navy canvas, teal accents, amber CTAs, asymmetric layout
 */
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Brain, Building2, Shield, TrendingUp, Zap, Users, Clock, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const HERO_BG = "/images/hero-bg.png";
const ADAPT_IMG = "/images/adapt-hero.png";
const SAGE_IMG = "/images/sage-intacct-hero.png";
const CTA_BG = "/images/cta-bg.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const } }),
};

const stats = [
  { value: "72%", label: "of CFOs say AI is their top priority in 2026", source: "Gartner" },
  { value: "40%", label: "reduction in month-end close time with Sage Intacct", source: "Sage" },
  { value: "3.2x", label: "ROI within 18 months for AI-enabled finance teams", source: "McKinsey" },
];

const constraints = [
  { icon: Users, title: "Capacity Constraint", desc: "Volume too high, team drowning in transactions. You need throughput increase — not more headcount.", color: "text-teal" },
  { icon: Target, title: "Knowledge Constraint", desc: "Inconsistent answers, tribal knowledge, no single source of truth. Decisions are slow and unreliable.", color: "text-amber" },
  { icon: Clock, title: "Process Constraint", desc: "Bad handoffs, messy workflows, bottlenecks between departments. Month-end takes weeks, not days.", color: "text-teal" },
  { icon: Shield, title: "Scale Constraint", desc: "Everything breaks if volume doubles. You can't grow without proportionally growing cost.", color: "text-amber" },
];

const qdoaaSteps = [
  { letter: "Q", name: "Question", desc: "Why does this step exist? Challenge every assumption." },
  { letter: "D", name: "Delete", desc: "Remove steps that serve no purpose. Less is more." },
  { letter: "O", name: "Optimise", desc: "Make remaining steps better — manually first." },
  { letter: "A", name: "Accelerate", desc: "Make faster without adding people." },
  { letter: "A", name: "Automate", desc: "NOW add AI to what's left. Not before." },
];

const adaptPhases = [
  { letter: "A", name: "Assess", desc: "Map your constraints, calculate Cost of Inaction, and identify quick wins" },
  { letter: "D", name: "Design", desc: "Architect the optimal Sage Intacct configuration and AI integration roadmap" },
  { letter: "A", name: "Automate", desc: "Implement intelligent automation across your highest-impact bottlenecks" },
  { letter: "P", name: "Pilot", desc: "Deploy targeted AI solutions with measurable KPIs and prove ROI fast" },
  { letter: "T", name: "Transform", desc: "Scale AI across the organisation with continuous learning and optimisation" },
];

const engagementTiers = [
  { name: "AI Operations Audit", price: "From £5,000", desc: "Current-state process map, ROI stack, prioritised roadmap, implementation plan. The essential starting point.", tag: "Start Here", featured: true },
  { name: "Quick Wins Sprint", price: "Scoped from audit", desc: "Implement top 2-3 highest-ROI automations identified in the audit. Prove value in 4-8 weeks.", tag: "Phase 2" },
  { name: "Ongoing Retainer", price: "From £8,000/mo", desc: "System health monitoring, performance optimisation, security management, and strategic updates.", tag: "Phase 3" },
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    document.title = "FinanceFlo.ai — AI-Powered Financial Transformation";
  }, []);

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/85 to-navy/50" />
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
              We Redesign How Growing Companies{" "}
              <span className="text-gradient-teal">Operate</span>
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-xl"
            >
              Where does your business model break at scale? We diagnose constraints, not sell automations. AI is just one tool in the system.
            </motion.p>
            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2.5}
              className="text-base text-muted-foreground/80 leading-relaxed mb-8 max-w-xl"
            >
              Sage Intacct multi-company financial management + custom AI solutions, delivered through our proven ADAPT Framework.
            </motion.p>

            <motion.div
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/assessment">
                <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
                  Diagnose Your Constraints
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

      {/* ===== CONSTRAINT DIAGNOSIS ===== */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-xs font-mono text-teal uppercase tracking-widest">The Real Problem</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Where Does Your Business Break at Scale?
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              We don't ask "What do you want to automate?" We ask "Where does your business model break?" Every constraint falls into one of these categories:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {constraints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <point.icon className={`w-8 h-8 ${point.color} mb-4`} />
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{point.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== QDOAA FRAMEWORK ===== */}
      <section className="py-16 border-y border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Before AI</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                The QDOAA Framework
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Most consultancies jump straight to AI. We don't. Before we automate anything, we apply QDOAA to ensure AI is solving the <em>right</em> problems — not just adding technology to broken processes.
              </p>
              <div className="space-y-3">
                {qdoaaSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-md bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0">
                      <span className="text-amber font-bold font-mono">{step.letter}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{step.name}</h4>
                      <p className="text-sm text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <h3 className="text-xl font-bold mb-4 text-amber" style={{ fontFamily: "var(--font-heading)" }}>
                Why This Matters
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                "Automating a broken process just gives you a faster broken process." — Every failed AI project ever.
              </p>
              <div className="space-y-3">
                {[
                  "70% of AI projects fail because they automate the wrong things",
                  "QDOAA typically eliminates 30-40% of steps before AI is even considered",
                  "The result: smaller, cheaper, more effective AI implementations",
                  "Your team understands the changes because they helped design them",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ADAPT FRAMEWORK PREVIEW ===== */}
      <section className="py-20">
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
      <section className="py-20 border-t border-border/30">
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
                We don't replace what works — we integrate, enhance, and build AI layers on top. Sage Intacct provides the multi-company, multi-currency backbone. Our AI solutions remove the constraints blocking your next growth phase.
              </p>
              <div className="space-y-4">
                {[
                  { icon: TrendingUp, text: "Real-time multi-entity consolidation and reporting" },
                  { icon: Zap, text: "AI-powered anomaly detection and cash flow forecasting" },
                  { icon: Brain, text: "Machine learning for automated journal entries and reconciliation" },
                  { icon: BarChart3, text: "Natural language querying — ask questions, get instant answers" },
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

      {/* ===== ENGAGEMENT TIERS ===== */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs font-mono text-teal uppercase tracking-widest">How We Work</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Start Small, Prove Value, Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every engagement starts with an audit. We diagnose before we prescribe. No multi-year contracts. No massive upfront commitments. Just proven results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {engagementTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={`glass-panel p-6 relative ${tier.featured ? "border-teal/40 glow-teal" : ""}`}
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-teal text-navy-dark text-xs font-bold rounded-full">
                    Recommended
                  </div>
                )}
                <span className="text-xs font-mono text-muted-foreground">{tier.tag}</span>
                <h3 className="text-xl font-bold mt-2 mb-1" style={{ fontFamily: "var(--font-heading)" }}>{tier.name}</h3>
                <p className="text-lg font-semibold text-amber mb-3">{tier.price}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tier.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== INDUSTRIES WE SERVE ===== */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Sectors We Serve</span>
            <h2 className="text-3xl font-bold mt-3" style={{ fontFamily: "var(--font-heading)" }}>
              Industries We Serve
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Construction", href: "/industries/construction", desc: "Job costing & project accounting" },
              { name: "Financial Services", href: "/industries/financial-services", desc: "Multi-entity & regulatory" },
              { name: "Healthcare", href: "/industries/healthcare", desc: "Fund accounting & grants" },
              { name: "E-Commerce", href: "/industries/ecommerce", desc: "Omnichannel finance" },
            ].map((ind, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link href={ind.href} className="no-underline">
                  <div className="glass-panel p-5 text-center group hover:border-teal/30 transition-colors" style={{ borderRadius: "var(--radius)" }}>
                    <h4 className="font-semibold text-foreground mb-1" style={{ fontFamily: "var(--font-heading)" }}>{ind.name}</h4>
                    <p className="text-xs text-muted-foreground">{ind.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        className="relative py-24 overflow-hidden"
        style={{ backgroundImage: `url(${CTA_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-navy/85" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              What Is Doing Nothing{" "}
              <span className="text-gradient-amber">Costing You</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Take our 5-minute Constraint Diagnosis to discover where your business model breaks at scale, calculate your Cost of Inaction, and receive a personalised transformation roadmap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
                  Diagnose Your Constraints
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
