/*
 * Design: Data Cartography — FinanceFlo.ai
 * Lead Magnet: Download page for the AI in Finance report with email capture
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Download, BookOpen, CheckCircle2, BarChart3, Brain, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const BANNER_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/uOwtfbsyjFlQFgor.png";
const FEARS_IMG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/noaoriVwTUguNzHy.png";

const reportHighlights = [
  { icon: BarChart3, text: "Market data: AI in finance projected to reach $61.3B by 2031" },
  { icon: Brain, text: "The ADAPT Framework for structured AI adoption" },
  { icon: Shield, text: "Top 5 challenges CFOs face with AI implementation" },
  { icon: TrendingUp, text: "10 practical AI use cases with real ROI metrics" },
];

export default function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
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
              <span className="text-xs font-mono text-teal uppercase tracking-widest">Free Report</span>
              <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                Navigating the AI Revolution:{" "}
                <span className="text-gradient-teal">A CFO's Strategic Guide</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                A comprehensive guide to AI-powered financial transformation in 2026. Backed by research from Gartner, McKinsey, and Deloitte, this report gives you the strategic framework to lead your organisation's AI journey.
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
        <div className="container max-w-4xl mx-auto">
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
                    Enter your details below and we'll send the report straight to your inbox.
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
                    No spam. Unsubscribe anytime. Your data is protected.
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
                  <p className="text-muted-foreground mb-6">
                    Check your inbox at <strong className="text-foreground">{email}</strong> for the download link.
                  </p>
                  <Link href="/assessment">
                    <Button className="bg-teal text-navy-dark font-semibold hover:bg-teal/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                      Take the AI Readiness Assessment
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
                  { chapter: "01", title: "The State of AI in Finance 2026", desc: "Market size, adoption rates, and the forces driving change" },
                  { chapter: "02", title: "Top 5 Challenges CFOs Face", desc: "From data silos to change resistance — and how to overcome each" },
                  { chapter: "03", title: "The ADAPT Framework", desc: "Our proven methodology for structured, low-risk AI adoption" },
                  { chapter: "04", title: "10 Practical AI Use Cases", desc: "Real implementations with measurable ROI across finance functions" },
                  { chapter: "05", title: "Building Your AI Roadmap", desc: "Step-by-step guide to creating your organisation's transformation plan" },
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
    </div>
  );
}
