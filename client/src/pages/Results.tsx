/*
 * Design: Data Cartography — FinanceFlo.ai
 * Results: Constraint diagnosis, Cost of Inaction calculator, ROI projections,
 * tiered engagement recommendations, and proposal generation
 * NOW: Wired to tRPC for proposal generation + PDF download + GHL webhooks
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  ArrowRight, Download, CheckCircle2, AlertTriangle, Zap,
  DollarSign, TrendingUp, Clock, Shield, Users, Target,
  Calendar, Phone, FileText, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  type Region,
  REGION_CONFIGS,
  formatCurrency,
  formatRange,
  PRICING_DISCLAIMER,
} from "@shared/pricing";

interface ProspectScore {
  pain: number;
  budget: number;
  authority: number;
  timing: number;
}

interface AssessmentData {
  score: number;
  totalScore: number;
  maxScore: number;
  answers: Record<string, { value: string; score: number; constraintType?: string }>;
  contact: { name: string; email: string; company: string; phone: string; role: string; employees: string };
  primaryConstraint: string;
  annualCostOfInaction: number;
  prospectScore: ProspectScore;
  timestamp: string;
  leadId?: number;
  assessmentId?: number;
  region?: Region;
}

function getReadinessLevel(score: number) {
  if (score >= 75) return { level: "Advanced", color: "text-teal", bg: "bg-teal/10", border: "border-teal/30", icon: CheckCircle2, desc: "Your organisation shows strong readiness for AI-powered financial transformation. You have solid foundations — the opportunity is to accelerate and scale." };
  if (score >= 50) return { level: "Developing", color: "text-amber", bg: "bg-amber/10", border: "border-amber/30", icon: Zap, desc: "You have good foundations but significant constraints are limiting growth. The right intervention now prevents compounding costs." };
  return { level: "Emerging", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", icon: AlertTriangle, desc: "Your organisation has critical constraints that are actively costing money. This is actually the ideal time to build the right foundations before problems compound." };
}

function getConstraintLabel(type: string) {
  switch (type) {
    case "capacity": return { label: "Capacity Constraint", desc: "Volume is too high — your team is drowning. You need throughput increase without hiring.", icon: Users };
    case "knowledge": return { label: "Knowledge Constraint", desc: "Inconsistent answers, tribal knowledge, no single source of truth. You need systematised intelligence.", icon: Target };
    case "process": return { label: "Process Constraint", desc: "Bad handoffs, messy workflows, bottlenecks between departments. You need streamlined operations.", icon: Clock };
    default: return { label: "Operational Constraint", desc: "Multiple constraint types identified. A comprehensive audit will prioritise the highest-impact interventions.", icon: Shield };
  }
}

function getROILevers(answers: Record<string, { value: string; score: number; constraintType?: string }>, annualCost: number, region: Region = "UK") {
  const levers: { icon: typeof DollarSign; title: string; value: string; desc: string }[] = [];
  const fmt = (n: number) => `${formatCurrency(n, region)}/yr`;

  if (answers.bottleneck_area?.value === "close" || answers.bottleneck_area?.value === "interco") {
    levers.push({ icon: Clock, title: "Time Saved", value: fmt(Math.round(annualCost * 0.35)), desc: "Reduce month-end close by 40-60% through automated reconciliation, consolidation, and journal entry posting." });
  }
  if (answers.scale_break?.score && answers.scale_break.score >= 3) {
    levers.push({ icon: Users, title: "Throughput Increase", value: fmt(Math.round(annualCost * 0.30)), desc: "Handle 2-3x transaction volume without proportional headcount increase. Scale capacity, not cost." });
  }
  levers.push({ icon: TrendingUp, title: "Revenue Optimisation", value: fmt(Math.round(annualCost * 0.15)), desc: "Faster reporting enables better decision-making. Predictive analytics identifies revenue opportunities earlier." });
  levers.push({ icon: DollarSign, title: "Risk Avoidance", value: fmt(Math.round(annualCost * 0.10)), desc: "Protect existing revenue through compliance automation, fraud detection, and audit-ready financial controls." });

  return levers;
}

function getEngagementTier(score: number, prospectScore: ProspectScore, region: Region = "UK") {
  const totalProspect = prospectScore.pain + prospectScore.budget + prospectScore.authority + prospectScore.timing;
  const config = REGION_CONFIGS[region];
  const auditPrice = formatRange(config.auditRange, region);
  const retainerPrice = `${formatRange(config.retainerRange, region)}/mo`;

  if (totalProspect >= 12 && score < 60) {
    return {
      tier: "Full Transformation",
      tagline: "Audit \u2192 Implementation \u2192 Ongoing Retainer",
      desc: "Your constraint severity and readiness profile indicate maximum ROI from a comprehensive engagement. Start with an AI Operations Audit, move to implementation, and transition to ongoing optimisation.",
      phases: [
        { name: "Phase 1: AI Operations Audit", duration: "2-3 weeks", price: auditPrice, desc: "Current-state process map, ROI stack, prioritised roadmap, implementation plan" },
        { name: "Phase 2: Implementation", duration: "8-16 weeks", price: "Scoped from audit", desc: "Sage Intacct deployment, AI automation, data migration, team training" },
        { name: "Phase 3: Ongoing Retainer", duration: "Monthly", price: retainerPrice, desc: "System health monitoring, performance optimisation, security management, strategic updates" },
      ],
    };
  }
  if (totalProspect >= 8) {
    return {
      tier: "Strategic Engagement",
      tagline: "Audit + Quick Wins Implementation",
      desc: "Your profile shows strong potential for quick wins. Start with an audit to identify the highest-impact, lowest-risk interventions, then implement the top 2-3 opportunities.",
      phases: [
        { name: "Phase 1: AI Operations Audit", duration: "2-3 weeks", price: auditPrice, desc: "Constraint diagnosis, ROI calculation, prioritised roadmap" },
        { name: "Phase 2: Quick Wins Sprint", duration: "4-8 weeks", price: "Scoped from audit", desc: "Implement top 2-3 highest-ROI automations identified in audit" },
      ],
    };
  }
  return {
    tier: "Discovery Engagement",
    tagline: "AI Operations Audit + ROI Roadmap",
    desc: "The ideal starting point. A focused audit that maps your current constraints, calculates the real cost of inaction, and delivers a prioritised transformation roadmap.",
    phases: [
      { name: "AI Operations Audit", duration: "2-3 weeks", price: auditPrice, desc: "Current-state process map, ROI stack with assumptions, prioritised roadmap, implementation plan" },
    ],
  };
}

export default function Results() {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [, navigate] = useLocation();
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalUrl, setProposalUrl] = useState<string | null>(null);

  const generateProposal = trpc.proposal.generate.useMutation();
  const generatePdf = trpc.proposal.generatePdf.useMutation();

  useEffect(() => { document.title = "Assessment Results | FinanceFlo.ai"; }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentResults");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      navigate("/assessment");
    }
  }, [navigate]);

  const handleGenerateProposal = async () => {
    if (!data?.leadId || !data?.assessmentId) {
      toast.error("Assessment data incomplete. Please retake the assessment.");
      return;
    }

    setProposalLoading(true);
    try {
      // 1. Generate proposal content via LLM
      const proposal = await generateProposal.mutateAsync({
        leadId: data.leadId,
        assessmentId: data.assessmentId,
      });

      toast.success("Proposal generated! Creating PDF...");

      // 2. Generate PDF and upload to S3
      const { pdfUrl } = await generatePdf.mutateAsync({
        proposalId: proposal.id,
      });

      setProposalUrl(pdfUrl);
      toast.success("Your personalised proposal is ready!");
    } catch (err) {
      console.error("Proposal generation failed:", err);
      toast.error("Proposal generation failed. Please try again or contact us directly.");
    } finally {
      setProposalLoading(false);
    }
  };

  if (!data) return null;

  const region: Region = data.region || "UK";
  const regionConfig = REGION_CONFIGS[region];
  const readiness = getReadinessLevel(data.score);
  const constraint = getConstraintLabel(data.primaryConstraint);
  const roiLevers = getROILevers(data.answers, data.annualCostOfInaction, region);
  const engagement = getEngagementTier(data.score, data.prospectScore, region);
  const ReadinessIcon = readiness.icon;
  const ConstraintIcon = constraint.icon;

  const totalROI = roiLevers.reduce((sum, l) => {
    const numStr = l.value.replace(/[^0-9]/g, "");
    return sum + parseInt(numStr || "0");
  }, 0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-5xl mx-auto">
        {/* Score Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-mono text-teal uppercase tracking-widest">Constraint Diagnosis Complete</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {data.contact.company}'s Transformation Roadmap
          </h1>
          <p className="text-muted-foreground">Prepared for {data.contact.name}{data.contact.role ? `, ${data.contact.role}` : ""}</p>
        </motion.div>

        {/* Score + Constraint Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Score Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 flex flex-col items-center justify-center"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className={`relative w-40 h-40 rounded-full ${readiness.bg} ${readiness.border} border-2 flex flex-col items-center justify-center mb-4`}>
              <span className={`text-4xl font-bold font-mono ${readiness.color}`}>{data.score}%</span>
              <span className={`text-sm font-semibold mt-1 ${readiness.color}`}>{readiness.level}</span>
            </div>
            <div className="flex items-start gap-3 text-center">
              <div>
                <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>AI Readiness: {readiness.level}</h3>
                <p className="text-sm text-muted-foreground">{readiness.desc}</p>
              </div>
            </div>
          </motion.div>

          {/* Primary Constraint */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber/10 border border-amber/30 flex items-center justify-center">
                <ConstraintIcon className="w-6 h-6 text-amber" />
              </div>
              <div>
                <span className="text-xs font-mono text-amber uppercase tracking-wider">Primary Constraint</span>
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>{constraint.label}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{constraint.desc}</p>

            {/* QDOAA Framework hint */}
            <div className="p-4 bg-navy-light/50 rounded-lg border border-border/30">
              <h4 className="text-xs font-mono text-teal uppercase tracking-wider mb-2">Our Approach: QDOAA</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Before applying AI, we follow the <strong className="text-foreground">QDOAA Framework</strong>: Question why each step exists → Delete unnecessary steps → Optimise what remains → Accelerate without adding people → <em>Then</em> Automate with AI. This ensures AI is applied to the right problems.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cost of Inaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-8 mb-12 glow-amber"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Cost of Inaction</span>
              <h2 className="text-2xl font-bold mt-1" style={{ fontFamily: "var(--font-heading)" }}>
                Estimated Annual Cost of Doing Nothing
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your revenue band, constraint severity, and current system maturity, maintaining the status quo costs your organisation approximately:
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-4xl sm:text-5xl font-bold text-amber font-mono">
                {formatCurrency(data.annualCostOfInaction, region)}
              </span>
              <p className="text-sm text-muted-foreground mt-1">per year</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              This estimate includes: wasted salary on manual processes, lost revenue from delayed reporting, compliance risk exposure, and opportunity cost of not scaling. Actual figures will be validated during the AI Operations Audit.
            </p>
          </div>
        </motion.div>

        {/* ROI Levers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">ROI Projection</span>
              <h2 className="text-2xl font-bold mt-1" style={{ fontFamily: "var(--font-heading)" }}>
                5 Value Levers for {data.contact.company}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Total Projected Annual ROI</span>
              <p className="text-2xl font-bold text-teal font-mono">{formatCurrency(totalROI, region)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roiLevers.map((lever, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="glass-panel p-5"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <lever.icon className="w-5 h-5 text-teal" />
                  <span className="text-lg font-bold text-teal font-mono">{lever.value}</span>
                </div>
                <h4 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-heading)" }}>{lever.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{lever.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-8 mb-12"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <span className="text-xs font-mono text-teal uppercase tracking-widest">Recommended Engagement</span>
          <h2 className="text-2xl font-bold mt-1 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {engagement.tier}
          </h2>
          <p className="text-sm text-amber font-medium mb-4">{engagement.tagline}</p>
          <p className="text-sm text-muted-foreground mb-6">{engagement.desc}</p>

          <div className="space-y-4">
            {engagement.phases.map((phase, i) => (
              <div key={i} className="p-4 bg-navy-light/50 rounded-lg border border-border/30 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
                  <span className="text-teal font-bold font-mono text-sm">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{phase.name}</h4>
                  <p className="text-xs text-muted-foreground">{phase.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {phase.duration}
                  </div>
                  <span className="text-sm font-semibold text-amber">{phase.price}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Readiness Summary — simplified, no internal scores exposed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-6 mb-12"
          style={{ borderRadius: "var(--radius)" }}
        >
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            What Happens Next
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Review Your Roadmap", desc: "Save this page or download your proposal for your team." },
              { step: "2", title: "Book a Strategy Call", desc: "Discuss findings with Dudley — no obligation, no pitch deck." },
              { step: "3", title: "Start With an Audit", desc: "Validate these numbers with a hands-on AI Operations Audit." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal/10 border border-teal/30 flex items-center justify-center shrink-0">
                  <span className="text-teal font-bold font-mono text-sm">{item.step}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Proposal Generation + CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-panel p-8 text-center glow-teal"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Eliminate Your Constraints?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {proposalUrl
              ? "Your personalised transformation proposal is ready. Download it now or book a strategy call to discuss the findings."
              : "Generate a personalised transformation proposal with detailed ROI projections, or book a free strategy call with Dudley Peacock."
            }
          </p>
          {/* Primary CTA — always visible */}
          <a href="mailto:dudley@financeflo.ai?subject=Strategy%20Call%20Request&body=Hi%20Dudley%2C%0A%0AI%20just%20completed%20the%20AI%20Readiness%20Assessment%20and%20would%20like%20to%20book%20a%20strategy%20call%20to%20discuss%20the%20findings.%0A%0AThanks" rel="noopener noreferrer">
            <Button size="lg" className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8" style={{ fontFamily: "var(--font-heading)" }}>
              <Phone className="w-5 h-5" />
              Book a Free Strategy Call
            </Button>
          </a>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
            {proposalUrl ? (
              <a href={proposalUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
                  <Download className="w-4 h-4" />
                  Download Your Proposal
                </Button>
              </a>
            ) : data.leadId && data.assessmentId ? (
              <Button
                onClick={handleGenerateProposal}
                disabled={proposalLoading}
                variant="outline"
                className="border-teal/40 text-teal hover:bg-teal/10 gap-2"
              >
                {proposalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Proposal PDF
                  </>
                )}
              </Button>
            ) : null}
            <Link href="/free-book">
              <Button variant="outline" className="border-border/50 text-muted-foreground hover:text-foreground hover:bg-navy-light/50 gap-2">
                <Download className="w-4 h-4" />
                Free Book: Connected Intelligence
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            {data.leadId
              ? `Assessment saved (ID: ${data.assessmentId}). Your personalised report will be emailed to ${data.contact.email}.`
              : `A copy of this assessment has been saved. Your personalised report will be emailed to ${data.contact.email}.`
            }
          </p>
        </motion.div>
      </div>
    </div>
  );
}
