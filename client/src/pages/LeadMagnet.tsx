/*
 * Design: Data Cartography — FinanceFlo.ai
 * Lead Magnet: Download page for the AI in Finance report with email capture
 * Updated to align with consulting hybrid model and QDOAA framework
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, BookOpen, CheckCircle2, BarChart3, Brain, Shield, TrendingUp, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BANNER_IMG = "/images/lead-magnet-banner.png";
const FEARS_IMG = "/images/fears-infographic.png";

const reportHighlights = [
  { icon: Target, text: "Constraint-based diagnosis: identify where your business breaks at scale" },
  { icon: Brain, text: "The ADAPT + QDOAA Frameworks for structured AI adoption" },
  { icon: Shield, text: "Top 5 challenges CFOs face — and how to overcome each" },
  { icon: BarChart3, text: "Cost of Inaction calculator methodology and ROI levers" },
  { icon: TrendingUp, text: "10 practical AI use cases with real ROI metrics" },
  { icon: Zap, text: "Why 70% of AI projects fail — and how to be in the 30%" },
];

export default function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    // In production, this would POST to GHL webhook
    setSubmitted(true);
    toast.success("Check your email for the download link!");
  };

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">Free Report — 2026 Edition</span>
              <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Navigating the AI Revolution:{" "}
                <span className="text-gradient-teal">A CFO's Strategic Guide</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Most AI projects fail because they automate the wrong things. This report shows you how to diagnose constraints first, apply the QDOAA framework, and build AI solutions that actually deliver ROI.
              </p>

              <div className="space-y-3 mb-8">
                {reportHighlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-teal shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>32 pages &middot; 15 min read &middot; Updated February 2026</span>
              </div>
            </div>

            <div>
              <img
                src={BANNER_IMG}
                alt="AI in Finance Report"
                className="w-full rounded-lg object-contain glow-teal"
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Download Form */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              {!submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-8"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Download Your Free Copy
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Enter your details below and we'll send the report straight to your inbox, along with a personalised follow-up based on your role.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Business Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Company Name</label>
                      <input
                        type="text"
                        placeholder="Acme Holdings Ltd"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Your Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                      >
                        <option value="">Select your role...</option>
                        <option value="cfo">CFO / Finance Director</option>
                        <option value="ceo">CEO / Managing Director</option>
                        <option value="coo">COO / Operations Director</option>
                        <option value="it">IT Director / CTO</option>
                        <option value="finance_manager">Finance Manager</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber py-6 text-base"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Download className="w-5 h-5" />
                      Download the Report
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam. Unsubscribe anytime. Your data is protected under POPIA and GDPR.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 text-center glow-teal"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  <CheckCircle2 className="w-16 h-16 text-teal mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                    Report Sent!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Check your inbox at <strong className="text-foreground">{email}</strong> for the download link.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    While you wait, take our 5-minute Constraint Diagnosis to discover where your business model breaks at scale.
                  </p>
                  <Link href="/assessment">
                    <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                      Diagnose Your Constraints
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                What's Inside
              </h3>
              <div className="space-y-4">
                {[
                  { chapter: "01", title: "The State of AI in Finance 2026", desc: "Market size ($61.3B by 2031), adoption rates, and why 72% of CFOs say AI is their top priority" },
                  { chapter: "02", title: "Why 70% of AI Projects Fail", desc: "The critical mistake of automating broken processes — and the QDOAA alternative" },
                  { chapter: "03", title: "The ADAPT Framework", desc: "Our proven five-phase methodology: Assess, Design, Automate, Pilot, Transform" },
                  { chapter: "04", title: "Constraint Diagnosis", desc: "How to identify capacity, knowledge, and process constraints before applying technology" },
                  { chapter: "05", title: "10 Practical AI Use Cases", desc: "Real implementations with measurable ROI: from automated reconciliation to predictive cash flow" },
                  { chapter: "06", title: "Cost of Inaction Calculator", desc: "The methodology for calculating what doing nothing is actually costing your organisation" },
                  { chapter: "07", title: "Building Your AI Roadmap", desc: "Step-by-step guide from audit to implementation to ongoing retainer" },
                ].map((ch, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-2xl font-bold text-teal/30 font-mono shrink-0">{ch.chapter}</span>
                    <div>
                      <h4 className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{ch.title}</h4>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <img
                  src={FEARS_IMG}
                  alt="Why Finance Teams Fear AI"
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: "300px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div className="glass-panel p-8 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Want a Personalised Assessment?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              The report gives you the framework. Our Constraint Diagnosis gives you the specific answers for <em>your</em> organisation — including Cost of Inaction, ROI projections, and a prioritised roadmap.
            </p>
            <Link href="/assessment">
              <Button className="bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                Take the Constraint Diagnosis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
