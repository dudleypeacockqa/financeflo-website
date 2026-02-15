import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, BarChart3, Cog, Rocket, Shield, TrendingUp } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const steps = [
  { num: "01", title: "Discovery & Audit", description: "Map your current integration landscape — every connection, every manual handoff, every data silo. Identify what's broken, what's fragile, and what's costing you money." },
  { num: "02", title: "Architecture Design", description: "Design a hub-and-spoke integration architecture that eliminates point-to-point fragility and creates a single source of truth across all systems." },
  { num: "03", title: "Priority Mapping", description: "Rank integrations by business impact — which connections will save the most time, reduce the most errors, and unlock the highest-value automation?" },
  { num: "04", title: "Implementation Roadmap", description: "Phased deployment plan that delivers quick wins first, then progressively connects your entire ecosystem without disrupting operations." },
  { num: "05", title: "Testing & Validation", description: "End-to-end integration testing with data validation, error scenario simulation, and performance benchmarking before go-live." },
  { num: "06", title: "Monitoring & Optimisation", description: "Ongoing monitoring with AI-powered alerting, performance dashboards, and continuous optimisation of data flows." },
];

const benefits = [
  { icon: Target, title: "Eliminate Data Silos", description: "Every system speaks the same language with a single source of truth across your organisation." },
  { icon: BarChart3, title: "Real-Time Visibility", description: "See the flow of data across your entire ecosystem with monitoring dashboards and alerting." },
  { icon: Cog, title: "Reduce Manual Work", description: "Automate the data entry, reconciliation, and reporting that drains your team's time." },
  { icon: Rocket, title: "Accelerate Decision-Making", description: "When data flows freely, decisions happen faster. No more waiting for exports and spreadsheets." },
  { icon: Shield, title: "Improve Data Quality", description: "Validation rules, transformation logic, and deduplication ensure clean data everywhere." },
  { icon: TrendingUp, title: "Scale Without Breaking", description: "Add new systems, partners, and data sources without rebuilding your integration layer." },
];

export default function Strategy() {
  useEffect(() => {
    document.title = "Integration Strategy | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="iPaaS & Integration"
        title="Integration Strategy:"
        titleAccent="End-to-End Methodology"
        description="A structured approach to connecting your systems that starts with business outcomes, not technology. We map your data flows, identify bottlenecks, and build an integration architecture that scales."
      />

      {/* Steps */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">The Process</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              6-Step Integration Methodology
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                <span className="text-xs font-mono text-teal">{step.num}</span>
                <h4 className="font-semibold mt-2 mb-2" style={{ fontFamily: "var(--font-heading)" }}>{step.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid
        tagline="Benefits"
        title="Why a Strategic Approach Matters"
        features={benefits}
        columns={3}
        accentColor="teal"
      />

      <CTASection
        title="Ready to Connect"
        titleAccent="Your Ecosystem?"
        description="Start with our Constraint Diagnosis to map your integration landscape and identify the highest-impact connections."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "View FloSynq", href: "/ipaas/flosynq", variant: "secondary" },
        ]}
      />
    </div>
  );
}
