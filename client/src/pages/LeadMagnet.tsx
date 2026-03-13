/*
 * Design: Data Cartography — FinanceFlo.ai
 * Lead Magnet: Download page for the AI in Finance report with email capture
 * Updated to align with consulting hybrid model and QDOAA framework
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  Download,
  BookOpen,
  CheckCircle2,
  BarChart3,
  Brain,
  Shield,
  TrendingUp,
  Zap,
  Target,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  AI_FINANCE_REPORT,
  AI_FINANCE_REPORT_HIGHLIGHTS,
  AI_FINANCE_REPORT_SECTIONS,
  buildAiFinanceReportUrl,
} from "@shared/aiFinanceReport";

const BANNER_IMG = "/images/lead-magnet-banner.png";
const FEARS_IMG = "/images/fears-infographic.png";

const reportHighlightIcons = [
  Target,
  Brain,
  Shield,
  BarChart3,
  TrendingUp,
  Zap,
] as const;

const roleOptions = [
  "",
  "CFO / Finance Director",
  "CEO / Managing Director",
  "COO / Operations Director",
  "IT Director / CTO",
  "Finance Manager",
  "Other",
] as const;

export default function LeadMagnet() {
  useEffect(() => { document.title = "AI in Finance Report | FinanceFlo.ai"; }, []);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(
    buildAiFinanceReportUrl({ download: true })
  );
  const createLead = trpc.lead.create.useMutation();

  // If user already completed the assessment, pre-fill and auto-download
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("assessmentResults");
      if (!stored) return;
      const data = JSON.parse(stored);
      const contact = data?.contact;
      if (!contact?.name || !contact?.email) return;

      // We already have their details — skip the form, trigger download
      const url = buildAiFinanceReportUrl({
        company: contact.company || undefined,
        download: true,
        email: contact.email,
        leadId: typeof data?.leadId === "number" ? data.leadId : undefined,
        name: contact.name,
        role: contact.role || undefined,
      });
      setName(contact.name);
      setEmail(contact.email);
      if (contact.company) setCompany(contact.company);
      if (contact.role) setRole(contact.role);
      setDownloadUrl(url);
      setSubmitted(true);
      window.location.assign(url);
      toast.success("Your report download has started.");
    } catch {
      /* sessionStorage unavailable or parse error — show the form */
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || name.trim();
    const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "-";
    try {
      const lead = await createLead.mutateAsync({
        firstName,
        lastName,
        email,
        company: company || undefined,
        jobTitle: role || undefined,
        source: "lead_magnet",
        tags: ["ai-in-finance-report"],
      });

      const nextDownloadUrl = buildAiFinanceReportUrl({
        company: company || undefined,
        download: true,
        email,
        leadId: lead.id,
        name,
        role: role || undefined,
      });

      setDownloadUrl(nextDownloadUrl);
      setSubmitted(true);
      window.location.assign(nextDownloadUrl);
      toast.success("Your report download has started.");
    } catch (err) {
      console.error("[LeadMagnet] Lead creation failed:", err);
      toast.error("We couldn't start the download. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">{AI_FINANCE_REPORT.editionLabel}</span>
              <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {AI_FINANCE_REPORT.title}:{" "}
                <span className="text-gradient-teal">{AI_FINANCE_REPORT.subtitle}</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {AI_FINANCE_REPORT.description}
              </p>

              <div className="space-y-3 mb-8">
                {AI_FINANCE_REPORT_HIGHLIGHTS.map((text, i) => {
                  const Icon = reportHighlightIcons[i];

                  return (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-teal shrink-0" />
                      <span className="text-sm text-foreground">{text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{AI_FINANCE_REPORT.lengthLabel} &middot; {AI_FINANCE_REPORT.readTimeLabel} &middot; {AI_FINANCE_REPORT.updatedLabel}</span>
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
                    Enter your details below to unlock the report immediately, along with a personalised follow-up based on your role.
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
                        {roleOptions.map((option) => (
                          <option key={option || "empty"} value={option}>
                            {option || "Select your role..."}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="submit"
                      disabled={createLead.isPending}
                      className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber py-6 text-base"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {createLead.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Preparing Your Report...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Download the Report
                        </>
                      )}
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
                    Your Report Is Ready
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Your report has been prepared for <strong className="text-foreground">{email}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    If the download did not start automatically, use the button below. Then take the 5-minute Constraint Diagnosis to see where your business model breaks at scale.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      asChild
                      className="bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <a href={downloadUrl}>
                        <Download className="w-4 h-4" />
                        Download Again
                      </a>
                    </Button>
                    <Button
                      asChild
                      className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <Link href="/assessment">
                        Diagnose Your Constraints
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                What's Inside
              </h3>
              <div className="space-y-4">
                {AI_FINANCE_REPORT_SECTIONS.map((ch, i) => (
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
                      <p className="text-xs text-muted-foreground">{ch.description}</p>
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
            <Button
              asChild
              className="bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <Link href="/assessment">
                Take the Constraint Diagnosis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
