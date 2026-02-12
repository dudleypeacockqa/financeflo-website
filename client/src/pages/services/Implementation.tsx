import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Cog, Rocket, GraduationCap, Shield, TrendingUp, CheckCircle2 } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const methodology = [
  { icon: Target, title: "Constraint Diagnosis", description: "We start by mapping where your business model breaks at scale. No generic discovery — just targeted analysis of your specific bottlenecks." },
  { icon: Cog, title: "Solution Architecture", description: "Design the optimal ERP configuration, data migration strategy, and integration architecture based on your constraints." },
  { icon: Rocket, title: "Phased Deployment", description: "Pilot with one team, prove value, then scale. We never do big-bang rollouts — too risky, too disruptive." },
  { icon: GraduationCap, title: "Embedded Training", description: "30 days of embedded support post-launch. We train for behaviour change, not button clicks." },
  { icon: Shield, title: "Data Migration", description: "Validated data migration with full audit trails. We test, validate, and reconcile before go-live." },
  { icon: TrendingUp, title: "ROI Tracking", description: "Before/after metrics across all five ROI levers: revenue, cost, time, risk, and strategic value." },
];

const tiers = [
  {
    name: "Essentials",
    desc: "For businesses moving to their first cloud ERP with straightforward requirements.",
    features: ["Standard configuration", "Core module setup", "Data migration (1 source)", "Basic training programme", "30-day post-launch support"],
  },
  {
    name: "Professional",
    desc: "For multi-entity businesses with integration needs and customisation requirements.",
    features: ["Custom configuration", "Multi-entity setup", "Data migration (3+ sources)", "Integration with 2-3 systems", "Advanced training with playbooks", "60-day embedded support"],
    featured: true,
  },
  {
    name: "Enterprise",
    desc: "For complex, global operations with multi-legislation, multi-currency requirements.",
    features: ["Full enterprise configuration", "Global multi-entity setup", "Complex data migration", "Full integration hub", "Change management programme", "90-day embedded support", "Quarterly strategic reviews"],
  },
];

export default function Implementation() {
  useEffect(() => {
    document.title = "Implementation Services | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Services"
        title="ERP Implementation"
        titleAccent="That Sticks"
        description="We don't just deploy software — we remove constraints. Every implementation follows our proven 9-step methodology, designed to handle the human side of transformation as rigorously as the technical side."
      />

      <FeatureGrid
        tagline="Methodology"
        title="How We Implement"
        features={methodology}
        columns={3}
        accentColor="teal"
      />

      {/* Service Tiers */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Service Tiers</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Implementation Packages
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every implementation is scoped from an audit. These tiers give you an idea of what's included — actual scope is always customised to your constraints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => (
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
                    Most Common
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{tier.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tier.desc}</p>
                <ul className="space-y-2 flex-1">
                  {tier.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                      <span className="text-foreground">{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Implement"
        titleAccent="Your Solution?"
        description="Start with our Constraint Diagnosis to scope the right implementation approach for your business."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "How We Deliver", href: "/delivery", variant: "secondary" },
        ]}
      />
    </div>
  );
}
