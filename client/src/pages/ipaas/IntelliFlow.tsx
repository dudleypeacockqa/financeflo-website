import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Brain, Cloud, Shield, Repeat, Database } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const capabilities = [
  { icon: Brain, title: "AI-Powered Routing", description: "Intelligent data routing that learns from patterns and automatically optimises integration flows based on volume and priority." },
  { icon: Zap, title: "Real-Time Sync", description: "Sub-second data synchronisation between systems with conflict resolution and automatic retry logic." },
  { icon: Cloud, title: "Cloud-Native Architecture", description: "Fully managed iPaaS that scales automatically with your integration volume. No infrastructure to manage." },
  { icon: Shield, title: "Enterprise Security", description: "End-to-end encryption, SOC 2 compliance, and role-based access control for every integration." },
  { icon: Repeat, title: "Event-Driven Processing", description: "React to changes in any connected system in real-time with configurable triggers and webhooks." },
  { icon: Database, title: "Data Transformation", description: "Built-in ETL capabilities with visual mapping, custom transformations, and data quality rules." },
];

export default function IntelliFlow() {
  useEffect(() => {
    document.title = "IntelliFlow iPaaS | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="iPaaS & Integration"
        title="IntelliFlow:"
        titleAccent="AI-Powered Integration"
        description="Connect every system in your finance stack with an intelligent integration platform that learns, adapts, and scales with your business. No more brittle point-to-point integrations."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/assessment">
            <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
              Assess Your Integration Needs <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/ipaas/connectors">
            <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
              View Connectors
            </Button>
          </Link>
        </div>
      </PageHero>

      {/* What is iPaaS */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Why iPaaS?</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Integration Platform as a Service
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                iPaaS (Integration Platform as a Service) replaces fragile point-to-point integrations with a managed, scalable platform. Instead of building custom code for every connection, IntelliFlow provides a central hub that connects all your systems — ERP, CRM, banking, payroll, and more.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The AI layer learns your data patterns, optimises routing, detects anomalies, and self-heals when connections fail. This means fewer integration breakdowns, faster data flow, and more time for your team to focus on strategic work.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <h3 className="text-xl font-bold mb-4 text-teal" style={{ fontFamily: "var(--font-heading)" }}>
                The Cost of Bad Integration
              </h3>
              <div className="space-y-4">
                {[
                  { stat: "60%", desc: "of IT budgets spent maintaining existing integrations" },
                  { stat: "3-6 months", desc: "average time to build a single point-to-point integration" },
                  { stat: "40%", desc: "of integration projects exceed budget due to unforeseen complexity" },
                  { stat: "8 hrs/week", desc: "average time finance teams spend on manual data entry between systems" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg font-bold text-amber font-mono shrink-0">{item.stat}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FeatureGrid
        tagline="Capabilities"
        title="What IntelliFlow Does"
        features={capabilities}
        columns={3}
        accentColor="teal"
      />

      <CTASection
        title="Ready to Unify"
        titleAccent="Your Systems?"
        description="Take our Constraint Diagnosis and we'll map your integration landscape, identify the highest-ROI connections, and show you what IntelliFlow can automate."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "Integration Strategy", href: "/ipaas/strategy", variant: "secondary" },
        ]}
      />
    </div>
  );
}
