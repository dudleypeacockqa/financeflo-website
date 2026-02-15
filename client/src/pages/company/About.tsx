import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Brain, Shield, Users, TrendingUp, Zap } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import CTASection from "@/components/sections/CTASection";
import { teamMembers } from "@/data/team";
import TeamCard from "@/components/sections/TeamCard";

const values = [
  { icon: Target, title: "Constraint-First Thinking", description: "We diagnose before we prescribe. Every engagement starts with understanding where your business model breaks at scale." },
  { icon: Brain, title: "AI That Solves Real Problems", description: "We apply QDOAA before any automation. AI is a tool in the system, not the system itself." },
  { icon: Shield, title: "Evidence Over Ego", description: "When disagreements arise, we bring data — not opinions. Every recommendation is backed by numbers." },
  { icon: Users, title: "Co-Design, Not Cave-Building", description: "Your team helps design the solution. This builds ownership and creates 5x adoption rates." },
  { icon: TrendingUp, title: "Prove Value Early", description: "Every engagement starts small and proves ROI before scaling. No multi-year contracts. No massive upfront commitments." },
  { icon: Zap, title: "You Own It, We Maintain It", description: "Full handoff with documentation. You're never locked in — but we stay embedded as your strategic partner." },
];

const timeline = [
  { year: "2020", event: "Founded FinanceFlo with a focus on Sage Intacct implementation for mid-market companies" },
  { year: "2022", event: "Expanded into AI-enhanced finance operations, developing the QDOAA framework" },
  { year: "2023", event: "Launched the ADAPT Framework for structured business transformation" },
  { year: "2024", event: "Introduced FloSynq iPaaS and expanded ERP portfolio to include Acumatica and Odoo" },
  { year: "2025", event: "Launched LeverageFlo.ai marketing automation and industry-specific solutions" },
];

export default function About() {
  useEffect(() => {
    document.title = "About Us | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="About Us"
        title="We Redesign How Growing Companies"
        titleAccent="Operate"
        description="FinanceFlo.ai is a specialist consulting firm focused on removing the constraints that prevent mid-market companies from scaling. We combine ERP implementation, custom AI solutions, and the ADAPT Framework to transform finance operations."
      />

      {/* Mission */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="glass-panel p-8 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Make AI work for mid-market finance teams — not the other way around.
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              70% of AI projects fail because they automate the wrong things. We exist to ensure yours succeeds — by diagnosing constraints first, optimising processes second, and applying AI only where it genuinely removes bottlenecks.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Our Values</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              How We Work
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <val.icon className="w-7 h-7 text-teal mb-4" />
                <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{val.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Team</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              The People Behind FinanceFlo
            </h2>
            <p className="text-muted-foreground">
              Our diverse team of ERP specialists, AI experts, and business consultants work together to deliver transformational results for mid-market companies.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, i) => (
              <TeamCard key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Our Journey</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Timeline
            </h2>
          </div>
          <div className="max-w-2xl space-y-6">
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex gap-6 items-start"
              >
                <div className="shrink-0 w-16 text-right">
                  <span className="text-lg font-bold text-teal font-mono">{item.year}</span>
                </div>
                <div className="flex-1 glass-panel p-4" style={{ borderRadius: "var(--radius)" }}>
                  <p className="text-sm text-foreground">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Work"
        titleAccent="With Us?"
        description="Start with our free AI Readiness Assessment to diagnose your constraints and see how we can help."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "Contact Us", href: "/contact", variant: "secondary" },
        ]}
      />
    </div>
  );
}
