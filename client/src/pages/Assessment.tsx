/*
 * Design: Data Cartography — FinanceFlo.ai
 * Assessment: Multi-step quiz funnel with progress visualization
 * The quiz "zooms in" on a map — each question narrows the focus
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QUIZ_BG = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663082250310/SvivZDFlRhDVYiRf.png";

interface QuizQuestion {
  id: string;
  category: string;
  question: string;
  options: { label: string; value: string; score: number }[];
}

const questions: QuizQuestion[] = [
  {
    id: "company_size",
    category: "Company Profile",
    question: "How many entities or companies does your group manage?",
    options: [
      { label: "1 entity (single company)", value: "single", score: 1 },
      { label: "2–5 entities", value: "small_group", score: 2 },
      { label: "6–15 entities", value: "mid_group", score: 3 },
      { label: "16+ entities", value: "large_group", score: 4 },
    ],
  },
  {
    id: "current_system",
    category: "Current Systems",
    question: "What is your primary accounting/ERP system?",
    options: [
      { label: "Spreadsheets / Manual processes", value: "manual", score: 1 },
      { label: "Entry-level (Sage One, Xero, QuickBooks)", value: "entry", score: 2 },
      { label: "Mid-market (Sage 200, Sage 300, Pastel)", value: "midmarket", score: 3 },
      { label: "Enterprise ERP (SAP, Oracle, Sage Intacct)", value: "enterprise", score: 4 },
    ],
  },
  {
    id: "pain_level",
    category: "Pain Assessment",
    question: "How long does your month-end close process take?",
    options: [
      { label: "More than 15 business days", value: "very_slow", score: 1 },
      { label: "10–15 business days", value: "slow", score: 2 },
      { label: "5–10 business days", value: "moderate", score: 3 },
      { label: "Less than 5 business days", value: "fast", score: 4 },
    ],
  },
  {
    id: "consolidation",
    category: "Multi-Company",
    question: "How do you currently handle multi-entity consolidation?",
    options: [
      { label: "Manual spreadsheet consolidation", value: "manual_consol", score: 1 },
      { label: "Partial automation with exports/imports", value: "partial", score: 2 },
      { label: "Semi-automated within our ERP", value: "semi_auto", score: 3 },
      { label: "Fully automated real-time consolidation", value: "full_auto", score: 4 },
    ],
  },
  {
    id: "ai_readiness",
    category: "AI Readiness",
    question: "Where is your organisation on the AI adoption journey?",
    options: [
      { label: "Haven't started — still exploring what AI means for us", value: "exploring", score: 1 },
      { label: "Aware of AI benefits but no concrete plans", value: "aware", score: 2 },
      { label: "Piloting AI tools in some areas (e.g., ChatGPT)", value: "piloting", score: 3 },
      { label: "Actively implementing AI in business processes", value: "implementing", score: 4 },
    ],
  },
  {
    id: "data_quality",
    category: "Data Maturity",
    question: "How would you rate the quality and accessibility of your financial data?",
    options: [
      { label: "Data is scattered across systems, often unreliable", value: "poor", score: 1 },
      { label: "Data exists but requires significant manual cleanup", value: "fair", score: 2 },
      { label: "Reasonably clean data with some automation", value: "good", score: 3 },
      { label: "Clean, centralised, and readily accessible", value: "excellent", score: 4 },
    ],
  },
  {
    id: "budget_timeline",
    category: "Investment",
    question: "What is your expected timeline for a financial system transformation?",
    options: [
      { label: "Within 3 months — urgent need", value: "urgent", score: 4 },
      { label: "3–6 months — planning phase", value: "planning", score: 3 },
      { label: "6–12 months — budgeting for next year", value: "budgeting", score: 2 },
      { label: "12+ months — long-term consideration", value: "longterm", score: 1 },
    ],
  },
  {
    id: "industry",
    category: "Industry",
    question: "Which industry best describes your business?",
    options: [
      { label: "Manufacturing / Distribution", value: "manufacturing", score: 3 },
      { label: "Professional Services / Consulting", value: "services", score: 3 },
      { label: "Property / Construction", value: "property", score: 3 },
      { label: "Other (Retail, Healthcare, Aviation, etc.)", value: "other", score: 3 },
    ],
  },
];

interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
  role: string;
}

export default function Assessment() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; score: number }>>({});
  const [showContact, setShowContact] = useState(false);
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", company: "", phone: "", role: "" });
  const [, navigate] = useLocation();

  const totalSteps = questions.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { value, score } }));
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

  const handleSubmit = () => {
    const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
    const maxScore = totalSteps * 4;
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Store results in sessionStorage for the results page
    sessionStorage.setItem("assessmentResults", JSON.stringify({
      score: percentage,
      totalScore,
      maxScore,
      answers,
      contact,
      timestamp: new Date().toISOString(),
    }));

    navigate("/results");
  };

  const currentQ = questions[step];
  const currentAnswer = currentQ ? answers[currentQ.id] : undefined;

  return (
    <div className="min-h-screen pt-16 relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${QUIZ_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div className="fixed inset-0 z-0 bg-background/90" />

      <div className="relative z-10 container py-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-teal uppercase tracking-widest">AI Readiness Assessment</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3" style={{ fontFamily: "var(--font-heading)" }}>
            Map Your Financial{" "}
            <span className="text-gradient-teal">Transformation</span>
          </h1>
          <p className="text-muted-foreground mt-3">
            Answer {totalSteps} questions to receive your personalised AI readiness score and transformation roadmap.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-muted-foreground">
              {showContact ? "Contact Details" : `Question ${step + 1} of ${totalSteps}`}
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
              <span className="text-xs font-mono text-amber uppercase tracking-wider">{currentQ.category}</span>
              <h2 className="text-xl sm:text-2xl font-semibold mt-2 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = currentAnswer?.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(currentQ.id, opt.value, opt.score)}
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
                  <p className="text-sm text-muted-foreground">Enter your details to receive your personalised results.</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: "name" as const, label: "Full Name", placeholder: "John Smith", type: "text" },
                  { key: "email" as const, label: "Business Email", placeholder: "john@company.com", type: "email" },
                  { key: "company" as const, label: "Company Name", placeholder: "Acme Holdings Ltd", type: "text" },
                  { key: "role" as const, label: "Your Role", placeholder: "CFO, Finance Director, etc.", type: "text" },
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
                  disabled={!contact.name || !contact.email || !contact.company}
                  className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Get My Results
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
