/*
 * Design: Data Cartography — FinanceFlo.ai
 * Solutions: Service offerings — Sage Intacct, AI Development, Integration
 */
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BarChart3, Brain, Building2, Cloud, Cog, Database, LineChart, Lock, Repeat, Shield, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

const SAGE_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/tPdbnfOAsVngxSte.png";

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

export default function Solutions() {
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
              We combine Sage Intacct's best-in-class financial management platform with custom AI solutions tailored to your business. No generic implementations — every solution is designed around your specific workflows and goals.
            </p>
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
                  Sage One (Sage Business Cloud Accounting) is designed for small businesses with a single entity. When you manage multiple companies, need real-time consolidation, multi-currency support, and dimensional reporting, Sage Intacct is the clear choice. It scales with your group without the limitations.
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
              Built on top of Sage Intacct, our AI solutions use machine learning, natural language processing, and reinforcement learning to transform your finance function from reactive to predictive.
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
              <Button className="bg-teal text-navy-dark font-semibold hover:bg-teal/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                Assess Your Integration Needs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
