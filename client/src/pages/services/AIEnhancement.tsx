import { useEffect } from "react";
import { Brain, Zap, TrendingUp, Shield, BarChart3, Cog, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const capabilities = [
  { icon: Brain, title: "Intelligent Automation", description: "ML-powered journal entry automation, invoice processing, and bank reconciliation that learns from your patterns." },
  { icon: TrendingUp, title: "Predictive Analytics", description: "Cash flow forecasting, revenue prediction, and anomaly detection using your historical financial data." },
  { icon: Zap, title: "Process Mining", description: "AI analyses your financial workflows to identify bottlenecks, redundancies, and automation opportunities." },
  { icon: BarChart3, title: "Natural Language Querying", description: "Ask questions about your financial data in plain English and get instant visualisations and answers." },
  { icon: Shield, title: "Fraud Detection", description: "Real-time anomaly detection across transactions, flagging suspicious patterns before they become problems." },
  { icon: Cog, title: "Integration Bots", description: "Custom AI agents that automate data flows between your ERP and existing systems — CRM, banking, payroll." },
];

const qdoaaSteps = [
  { letter: "Q", name: "Question", desc: "Why does this process exist? Challenge every assumption before adding AI." },
  { letter: "D", name: "Delete", desc: "Remove steps that serve no purpose. 30-40% of steps typically get eliminated." },
  { letter: "O", name: "Optimise", desc: "Make remaining steps better — manually first, without technology." },
  { letter: "A", name: "Accelerate", desc: "Make faster without adding people. Streamline handoffs and approvals." },
  { letter: "A", name: "Automate", desc: "NOW add AI to what's left. Not before. This is where AI genuinely helps." },
];

export default function AIEnhancement() {
  useEffect(() => {
    document.title = "AI Enhancement | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Services"
        title="AI Enhancement for"
        titleAccent="Finance Teams"
        description="Custom AI solutions built on top of your ERP, applied only after QDOAA optimisation. We automate the right things — not everything."
      />

      {/* QDOAA Integration */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Before AI</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                QDOAA: Optimise Before You Automate
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "Automating a broken process just gives you a faster broken process." We apply QDOAA to every engagement before deploying any AI solution.
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
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <h3 className="text-xl font-bold mb-4 text-teal" style={{ fontFamily: "var(--font-heading)" }}>
                Why This Approach Works
              </h3>
              <div className="space-y-3">
                {[
                  "70% of AI projects fail because they automate the wrong things",
                  "QDOAA typically eliminates 30-40% of steps before AI is considered",
                  "Smaller, cheaper, more effective AI implementations",
                  "Your team understands the changes because they helped design them",
                  "ROI is proven at each step, not promised at the end",
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

      <FeatureGrid
        tagline="AI Capabilities"
        title="What We Build"
        features={capabilities}
        columns={3}
        accentColor="teal"
      />

      <CTASection
        title="Ready to Enhance Your Finance"
        titleAccent="With AI?"
        description="Start with our Constraint Diagnosis to identify where AI will have the highest impact on your finance operations."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "ADAPT Framework", href: "/adapt-framework", variant: "secondary" },
        ]}
      />
    </div>
  );
}
