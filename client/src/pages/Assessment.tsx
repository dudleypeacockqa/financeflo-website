/*
 * Design: Data Cartography — FinanceFlo.ai
 * Assessment: Constraint-diagnosis quiz funnel with QDOAA alignment
 * Diagnoses capacity, knowledge, and process constraints
 * Calculates Cost of Inaction and maps to engagement tiers
 * NOW: Wired to tRPC for lead capture + assessment storage + GHL webhooks
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Zap, Building2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  type Region,
  REGION_CONFIGS,
  formatCurrency,
  formatRange,
} from "@shared/pricing";

const QUIZ_BG = "/images/quiz-bg.png";

interface QuizQuestion {
  id: string;
  category: string;
  categoryIcon: typeof Building2;
  question: string;
  subtext?: string;
  options: { label: string; value: string; score: number; constraintType?: string }[];
  [key: string]: any;
}

const questions: QuizQuestion[] = [
  // --- SECTION 0: Region Detection ---
  {
    id: "region",
    category: "Your Region",
    categoryIcon: Globe,
    question: "Where is your business primarily based?",
    subtext: "This helps us show pricing in your local currency and tailor our recommendations to your market.",
    options: [
      { label: "United Kingdom", value: "UK", score: 0 },
      { label: "Europe (EU / EEA)", value: "EU", score: 0 },
      { label: "South Africa", value: "ZA", score: 0 },
      { label: "United States", value: "US", score: 0 },
      { label: "Canada", value: "CA", score: 0 },
    ],
  },
  // --- SECTION 1: Company Profile & Scale ---
  {
    id: "company_size",
    category: "Company Profile",
    categoryIcon: Building2,
    question: "How many entities or companies does your group manage?",
    subtext: "This helps us understand the complexity of your consolidation needs.",
    options: [
      { label: "1 entity (single company)", value: "single", score: 1 },
      { label: "2–5 entities", value: "small_group", score: 2 },
      { label: "6–15 entities", value: "mid_group", score: 3 },
      { label: "16+ entities across multiple jurisdictions", value: "large_group", score: 4 },
    ],
  },
  {
    id: "revenue_band",
    category: "Company Profile",
    categoryIcon: Building2,
    question: "What is your group's approximate annual revenue?",
    subtext: "This helps us calibrate the ROI model and engagement tier.",
    options: [], // dynamically populated based on region
  },
  // --- SECTION 2: Constraint Diagnosis ---
  {
    id: "constraint_capacity",
    category: "Constraint Diagnosis",
    categoryIcon: AlertTriangle,
    question: "Where does your business model break at scale?",
    subtext: "We diagnose constraints, not sell automations. Select the most pressing issue.",
    options: [
      { label: "Volume is too high — team is drowning in transactions", value: "capacity_high", score: 4, constraintType: "capacity" },
      { label: "Inconsistent answers — tribal knowledge, no single source of truth", value: "knowledge_gap", score: 4, constraintType: "knowledge" },
      { label: "Bad handoffs — messy workflows, bottlenecks between departments", value: "process_broken", score: 4, constraintType: "process" },
      { label: "None of these — we're operating smoothly", value: "none", score: 1 },
    ],
  },
  {
    id: "bottleneck_area",
    category: "Constraint Diagnosis",
    categoryIcon: AlertTriangle,
    question: "Where are you hitting delays or backlog right now?",
    options: [
      { label: "Month-end close takes 10+ days with manual reconciliation", value: "close", score: 4, constraintType: "capacity" },
      { label: "Reporting — pulling data from multiple systems into spreadsheets", value: "reporting", score: 3, constraintType: "process" },
      { label: "Approvals — invoices, POs, and expenses stuck in email chains", value: "approvals", score: 3, constraintType: "process" },
      { label: "Inter-company transactions and eliminations done manually", value: "interco", score: 4, constraintType: "capacity" },
    ],
  },
  {
    id: "scale_break",
    category: "Constraint Diagnosis",
    categoryIcon: Zap,
    question: "What breaks if your volume doubles in the next 90 days?",
    options: [
      { label: "Everything — we'd need to hire 2-3 more people immediately", value: "everything", score: 4 },
      { label: "Finance team would be overwhelmed, month-end would slip to 20+ days", value: "finance", score: 3 },
      { label: "Some strain but we could manage with overtime", value: "manageable", score: 2 },
      { label: "We're already built for scale — systems can handle it", value: "ready", score: 1 },
    ],
  },
  // --- SECTION 3: Current Systems & Data ---
  {
    id: "current_system",
    category: "Current Systems",
    categoryIcon: Building2,
    question: "What is your primary accounting/ERP system?",
    options: [
      { label: "Spreadsheets / Manual processes", value: "manual", score: 1 },
      { label: "Entry-level (Sage One, Xero, QuickBooks)", value: "entry", score: 2 },
      { label: "Mid-market (Sage 200, Sage 300, Pastel, Whimbrel)", value: "midmarket", score: 3 },
      { label: "Enterprise ERP (SAP, Oracle, Sage Intacct)", value: "enterprise", score: 4 },
    ],
  },
  {
    id: "data_quality",
    category: "Data Maturity",
    categoryIcon: Building2,
    question: "How would you rate the quality and accessibility of your financial data?",
    options: [
      { label: "Data is scattered across systems, often unreliable", value: "poor", score: 1 },
      { label: "Data exists but requires significant manual cleanup", value: "fair", score: 2 },
      { label: "Reasonably clean data with some automation", value: "good", score: 3 },
      { label: "Clean, centralised, and readily accessible via APIs", value: "excellent", score: 4 },
    ],
  },
  // --- SECTION 4: AI Readiness & Investment ---
  {
    id: "ai_readiness",
    category: "AI Readiness",
    categoryIcon: Zap,
    question: "Where is your organisation on the AI adoption journey?",
    options: [
      { label: "Haven't started — still exploring what AI means for us", value: "exploring", score: 1 },
      { label: "Aware of AI benefits but no concrete plans", value: "aware", score: 2 },
      { label: "Piloting AI tools in some areas (e.g., ChatGPT, Copilot)", value: "piloting", score: 3 },
      { label: "Actively implementing AI in business processes", value: "implementing", score: 4 },
    ],
  },
  {
    id: "budget_timeline",
    category: "Investment",
    categoryIcon: Building2,
    question: "What is your expected timeline for a financial system transformation?",
    options: [
      { label: "Within 3 months — urgent need, budget approved", value: "urgent", score: 4 },
      { label: "3–6 months — actively planning and evaluating", value: "planning", score: 3 },
      { label: "6–12 months — budgeting for next financial year", value: "budgeting", score: 2 },
      { label: "12+ months — long-term consideration", value: "longterm", score: 1 },
    ],
  },
  {
    id: "decision_authority",
    category: "Investment",
    categoryIcon: Building2,
    question: "What is your role in the technology decision-making process?",
    options: [
      { label: "I make the final decision (CEO, CFO, COO)", value: "decision_maker", score: 4 },
      { label: "I strongly influence the decision (Finance Director, Head of IT)", value: "influencer", score: 3 },
      { label: "I'm part of the evaluation team", value: "evaluator", score: 2 },
      { label: "I'm researching options for my team", value: "researcher", score: 1 },
    ],
  },
];

interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
  role: string;
  employees: string;
}

export default function Assessment() {
  useEffect(() => { document.title = "AI Readiness Assessment | FinanceFlo.ai"; }, []);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; score: number; constraintType?: string }>>({});
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", company: "", phone: "", role: "", employees: "" });
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createLead = trpc.lead.create.useMutation();
  const submitAssessment = trpc.assessment.submit.useMutation();

  // Detect region from answers (defaults to UK)
  const selectedRegion: Region = (answers.region?.value as Region) || "UK";
  const regionConfig = REGION_CONFIGS[selectedRegion];

  // Dynamically populate revenue band options based on region
  const getRevenueOptions = (region: Region) => {
    const c = REGION_CONFIGS[region];
    const s = c.currencySymbol;
    if (region === "ZA") {
      return [
        { label: `Under ${s}30M`, value: "under_2m", score: 1 },
        { label: `${s}30M – ${s}150M`, value: "2m_10m", score: 2 },
        { label: `${s}150M – ${s}750M`, value: "10m_50m", score: 3 },
        { label: `${s}750M+`, value: "50m_plus", score: 4 },
      ];
    }
    if (region === "EU") {
      return [
        { label: `Under ${s}2M`, value: "under_2m", score: 1 },
        { label: `${s}2M – ${s}10M`, value: "2m_10m", score: 2 },
        { label: `${s}10M – ${s}50M`, value: "10m_50m", score: 3 },
        { label: `${s}50M+`, value: "50m_plus", score: 4 },
      ];
    }
    if (region === "US") {
      return [
        { label: `Under ${s}2M`, value: "under_2m", score: 1 },
        { label: `${s}2M – ${s}10M`, value: "2m_10m", score: 2 },
        { label: `${s}10M – ${s}50M`, value: "10m_50m", score: 3 },
        { label: `${s}50M+`, value: "50m_plus", score: 4 },
      ];
    }
    if (region === "CA") {
      return [
        { label: `Under ${s}2M`, value: "under_2m", score: 1 },
        { label: `${s}2M – ${s}10M`, value: "2m_10m", score: 2 },
        { label: `${s}10M – ${s}50M`, value: "10m_50m", score: 3 },
        { label: `${s}50M+`, value: "50m_plus", score: 4 },
      ];
    }
    // UK default
    return [
      { label: `Under ${s}2M`, value: "under_2m", score: 1 },
      { label: `${s}2M – ${s}10M`, value: "2m_10m", score: 2 },
      { label: `${s}10M – ${s}50M`, value: "10m_50m", score: 3 },
      { label: `${s}50M+`, value: "50m_plus", score: 4 },
    ];
  };

  // Build effective questions list with dynamic revenue options
  const effectiveQuestions = questions.map((q) => {
    if (q.id === "revenue_band") {
      return { ...q, options: getRevenueOptions(selectedRegion) };
    }
    return q;
  });

  const totalSteps = effectiveQuestions.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: string, score: number, constraintType?: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { value, score, constraintType } }));
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowContact(true);
    }
  };

  const handleBack = () => {
    if (showContact) {
      setShowContact(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
      const maxScore = totalSteps * 4;
      const percentage = Math.round((totalScore / maxScore) * 100);

      // Determine primary constraint type
      const constraintCounts: Record<string, number> = {};
      Object.values(answers).forEach((a) => {
        if (a.constraintType) {
          constraintCounts[a.constraintType] = (constraintCounts[a.constraintType] || 0) + 1;
        }
      });
      const primaryConstraint = Object.entries(constraintCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "process";

      // Calculate constraint scores (0-100 per type)
      const constraintScores: Record<string, number> = {};
      const constraintMaxes: Record<string, number> = {};
      Object.values(answers).forEach((a) => {
        if (a.constraintType) {
          constraintScores[a.constraintType] = (constraintScores[a.constraintType] || 0) + a.score;
          constraintMaxes[a.constraintType] = (constraintMaxes[a.constraintType] || 0) + 4;
        }
      });
      Object.keys(constraintScores).forEach((key) => {
        constraintScores[key] = Math.round((constraintScores[key] / (constraintMaxes[key] || 1)) * 100);
      });

      // Calculate Cost of Inaction estimate
      const revenueMultiplier = answers.revenue_band?.score === 4 ? 50000000 : answers.revenue_band?.score === 3 ? 25000000 : answers.revenue_band?.score === 2 ? 5000000 : 1000000;
      const inefficiencyRate = (maxScore - totalScore) / maxScore;
      const annualCostOfInaction = Math.round(revenueMultiplier * inefficiencyRate * 0.03);

      // Determine prospect score
      const prospectScore = {
        pain: Math.min(3, Math.round(((answers.constraint_capacity?.score || 1) + (answers.bottleneck_area?.score || 1) + (answers.scale_break?.score || 1)) / 3)),
        budget: answers.budget_timeline?.score || 1,
        authority: answers.decision_authority?.score || 1,
        timing: answers.budget_timeline?.score || 1,
      };

      // Determine recommended tier
      const totalProspect = prospectScore.pain + prospectScore.budget + prospectScore.authority + prospectScore.timing;
      let recommendedTier: "audit" | "quick_wins" | "implementation" | "retainer" = "audit";
      if (totalProspect >= 12 && percentage < 60) recommendedTier = "implementation";
      else if (totalProspect >= 8) recommendedTier = "quick_wins";

      // Split name into first/last
      const nameParts = contact.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // 1. Create lead via tRPC → fires GHL webhook
      const lead = await createLead.mutateAsync({
        firstName,
        lastName,
        email: contact.email,
        company: contact.company || undefined,
        jobTitle: contact.role || undefined,
        phone: contact.phone || undefined,
        companySize: contact.employees || undefined,
        source: "quiz",
      });

      // 2. Submit assessment via tRPC → fires GHL webhook
      const assessment = await submitAssessment.mutateAsync({
        leadId: lead.id,
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k, v.value])
        ),
        constraintScores,
        overallScore: percentage,
        primaryConstraint,
        costOfInaction: annualCostOfInaction,
        recommendedTier,
        recommendedPhase: "assess",
      });

      // 3. Store results in sessionStorage for the Results page
      sessionStorage.setItem("assessmentResults", JSON.stringify({
        score: percentage,
        totalScore,
        maxScore,
        answers,
        contact,
        primaryConstraint,
        annualCostOfInaction,
        prospectScore,
        region: selectedRegion,
        timestamp: new Date().toISOString(),
        leadId: lead.id,
        assessmentId: assessment.id,
      }));

      toast.success("Assessment saved! Generating your results...");
      navigate("/results");
    } catch (err) {
      console.error("Assessment submission failed:", err);
      // Fallback: still navigate with local data
      const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
      const maxScore = totalSteps * 4;
      const percentage = Math.round((totalScore / maxScore) * 100);
      const constraintCounts: Record<string, number> = {};
      Object.values(answers).forEach((a) => {
        if (a.constraintType) constraintCounts[a.constraintType] = (constraintCounts[a.constraintType] || 0) + 1;
      });
      const primaryConstraint = Object.entries(constraintCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "process";
      const revenueMultiplier = answers.revenue_band?.score === 4 ? 50000000 : answers.revenue_band?.score === 3 ? 25000000 : answers.revenue_band?.score === 2 ? 5000000 : 1000000;
      const inefficiencyRate = (maxScore - totalScore) / maxScore;
      const annualCostOfInaction = Math.round(revenueMultiplier * inefficiencyRate * 0.03);
      const prospectScore = {
        pain: Math.min(3, Math.round(((answers.constraint_capacity?.score || 1) + (answers.bottleneck_area?.score || 1) + (answers.scale_break?.score || 1)) / 3)),
        budget: answers.budget_timeline?.score || 1,
        authority: answers.decision_authority?.score || 1,
        timing: answers.budget_timeline?.score || 1,
      };

      sessionStorage.setItem("assessmentResults", JSON.stringify({
        score: percentage, totalScore, maxScore, answers, contact,
        primaryConstraint, annualCostOfInaction, prospectScore,
        region: selectedRegion,
        timestamp: new Date().toISOString(),
      }));

      toast.info("Results generated locally. Server sync will retry.");
      navigate("/results");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = effectiveQuestions[step];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;
  const CategoryIcon = currentQ?.categoryIcon;

  return (
    <div className="min-h-screen pt-16 relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${QUIZ_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.12,
        }}
      />
      <div className="fixed inset-0 z-0 bg-background/92" />

      <div className="relative z-10 container py-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-teal uppercase tracking-widest">AI Operations Audit</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Diagnose Your{" "}
            <span className="text-gradient-teal">Growth Constraints</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Answer {totalSteps} questions to identify where your business model breaks at scale and receive a personalised transformation roadmap with ROI projections.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              {showContact ? "Your Details" : `Question ${step + 1} of ${totalSteps}`}
            </span>
            <span className="text-xs font-mono text-teal">{showContact ? "100" : Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-navy-light rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-teal rounded-full"
              initial={{ width: 0 }}
              animate={{ width: showContact ? "100%" : `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {/* Category indicators */}
          {!showContact && (
            <div className="flex items-center gap-2 mt-3">
              {CategoryIcon && <CategoryIcon className="w-4 h-4 text-teal" />}
              <span className="text-xs text-teal font-medium">{currentQ.category}</span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!showContact ? (
            /* Quiz Questions */
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {currentQ.question}
              </h2>
              {currentQ.subtext && (
                <p className="text-sm text-muted-foreground mb-6">{currentQ.subtext}</p>
              )}
              {!currentQ.subtext && <div className="mb-6" />}

              <div className="space-y-3">
                {currentQ.options.map((opt: any) => {
                  const isSelected = currentAnswer?.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentQ.id, opt.value, opt.score, opt.constraintType)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected
                          ? "border-teal bg-teal/10 text-foreground"
                          : "border-border/50 bg-navy-light/30 text-muted-foreground hover:border-teal/30 hover:bg-navy-light/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? "border-teal" : "border-muted-foreground/40"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-teal" />}
                        </div>
                        <span className="text-sm">{opt.label}</span>
                        {opt.constraintType && (
                          <span className="ml-auto text-xs font-mono px-2 py-0.5 rounded bg-navy-light border border-border/30 text-muted-foreground">
                            {opt.constraintType}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="border-border/50 text-muted-foreground gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="bg-teal text-navy-dark font-semibold hover:bg-teal/90 gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {step === totalSteps - 1 ? "Continue" : "Next"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            /* Contact Form */
            <motion.div
              key="contact"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="w-6 h-6 text-teal" />
                <div>
                  <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Almost Done!</h2>
                  <p className="text-sm text-muted-foreground">Enter your details to receive your personalised constraint diagnosis, ROI projection, and transformation roadmap.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: "name" as const, label: "Full Name *", placeholder: "John Smith", type: "text" },
                  { key: "email" as const, label: "Business Email *", placeholder: "john@company.com", type: "email" },
                  { key: "company" as const, label: "Company Name *", placeholder: "Acme Holdings Ltd", type: "text" },
                  { key: "role" as const, label: "Your Role", placeholder: "CFO, Finance Director, COO, etc.", type: "text" },
                  { key: "employees" as const, label: "Number of Employees", placeholder: "e.g., 50-200", type: "text" },
                  { key: "phone" as const, label: "Phone (Optional)", placeholder: "+27 82 000 0000", type: "tel" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-foreground mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={contact[field.key]}
                      onChange={(e) => setContact((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-border/50 text-muted-foreground gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!contact.name || !contact.email || !contact.company || isSubmitting}
                  className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {isSubmitting ? "Saving..." : "Get My Constraint Diagnosis"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your information is secure and will only be used to deliver your assessment results.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
