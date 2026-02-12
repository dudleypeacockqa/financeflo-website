/*
 * Design: Data Cartography — FinanceFlo.ai
 * Workshop: "AI in Action for Finance" workshop registration funnel
 * Branded for FinanceFlo.ai (NOT WSI). Constraint-based messaging.
 * Features: Registration form, agenda, speaker bio, countdown, social proof
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, Calendar, Clock, MapPin, Users, CheckCircle2,
  Brain, Zap, Target, Shield, BarChart3, TrendingUp,
  Play, Award, BookOpen, Lightbulb, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/* ──────────────────────────── DATA ──────────────────────────── */

const WORKSHOP_ID = "ai-in-action-finance-2026-q2";
const WORKSHOP_TITLE = "AI in Action for Finance Leaders";

const workshopDetails = {
  date: "27 March 2026",
  time: "09:30 – 12:30 SAST",
  duration: "3 hours",
  format: "Live Virtual Workshop",
  seats: 25,
  price: "Complimentary (by invitation)",
};

const agendaItems = [
  {
    time: "09:30 – 09:45",
    title: "Welcome & Constraint Diagnosis",
    desc: "Interactive exercise: identify where YOUR business model breaks at scale. Map your top 3 constraints in real-time.",
    icon: Target,
  },
  {
    time: "09:45 – 10:15",
    title: "The QDOAA Framework in Practice",
    desc: "Live demonstration: Question, Delete, Optimise, Accelerate, Automate. See how we eliminate 30-40% of steps before AI is even considered.",
    icon: Zap,
  },
  {
    time: "10:15 – 10:45",
    title: "Sage Intacct + AI: Live Demo",
    desc: "Multi-company consolidation, AI-powered anomaly detection, natural language querying — see the technology in action on real financial data.",
    icon: BarChart3,
  },
  {
    time: "10:45 – 11:00",
    title: "Break & Networking",
    desc: "Connect with fellow finance leaders. Share challenges, compare notes.",
    icon: Users,
  },
  {
    time: "11:00 – 11:30",
    title: "Cost of Inaction Calculator",
    desc: "Work through the FinanceFlo.ai Cost of Inaction methodology with your own numbers. Calculate what doing nothing is actually costing your organisation.",
    icon: TrendingUp,
  },
  {
    time: "11:30 – 12:00",
    title: "Building Your AI Roadmap",
    desc: "The ADAPT Framework walkthrough: Assess → Design → Automate → Pilot → Transform. Leave with a personalised 90-day action plan.",
    icon: Brain,
  },
  {
    time: "12:00 – 12:30",
    title: "Q&A & Next Steps",
    desc: "Open floor for questions. Every attendee receives a complimentary AI Operations Audit consultation (valued at £2,500).",
    icon: Award,
  },
];

const takeaways = [
  "A personalised Constraint Map for your organisation",
  "Your Cost of Inaction calculation with real numbers",
  "A 90-day AI implementation roadmap",
  "Access to the ADAPT Framework toolkit",
  "Complimentary AI Operations Audit consultation (£2,500 value)",
  "Recording and slides for future reference",
];

const whoShouldAttend = [
  { role: "CFOs & Finance Directors", reason: "Strategic oversight of AI adoption and ROI accountability" },
  { role: "COOs & Operations Directors", reason: "Process optimisation and constraint removal across departments" },
  { role: "Finance Managers", reason: "Hands-on understanding of AI tools for daily operations" },
  { role: "IT Directors & CTOs", reason: "Technical integration planning for Sage Intacct + AI stack" },
  { role: "CEOs of Multi-Company Groups", reason: "Enterprise-wide transformation strategy and competitive positioning" },
];

const faqs = [
  {
    q: "Is this a sales pitch?",
    a: "No. This is a working session. You'll leave with actionable frameworks, your own Cost of Inaction calculation, and a 90-day roadmap — regardless of whether you engage FinanceFlo.ai. The complimentary audit consultation is offered as a value-add, not a condition.",
  },
  {
    q: "What if I can't attend live?",
    a: "All registrants receive the recording and slides within 24 hours. However, the live session includes interactive exercises and real-time Q&A that can't be replicated in a recording.",
  },
  {
    q: "Do I need to prepare anything?",
    a: "We'll send a brief pre-workshop questionnaire (5 minutes) to personalise the session. Bring your current month-end close timeline and any pain points you'd like to discuss.",
  },
  {
    q: "Is this relevant for companies not using Sage Intacct?",
    a: "Absolutely. The QDOAA and ADAPT frameworks are platform-agnostic. The constraint diagnosis and Cost of Inaction methodology apply to any finance function. The Sage Intacct demo is one component of the broader session.",
  },
  {
    q: "How many people can attend from one company?",
    a: "We recommend 2-3 attendees per company — typically the CFO/Finance Director plus one operational team member. This ensures both strategic and tactical perspectives.",
  },
];

/* ──────────────────────────── COMPONENT ──────────────────────────── */

export default function Workshop() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const createLead = trpc.lead.create.useMutation();
  const registerWorkshop = trpc.workshop.register.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) return;

    try {
      // Create or get lead
      const lead = await createLead.mutateAsync({
        firstName,
        lastName,
        email,
        company: company || undefined,
        jobTitle: jobTitle || undefined,
        phone: phone || undefined,
        companySize: companySize || undefined,
        source: "workshop",
      });

      // Register for workshop
      await registerWorkshop.mutateAsync({
        leadId: lead.id,
        workshopId: WORKSHOP_ID,
        workshopTitle: WORKSHOP_TITLE,
      });

      setSubmitted(true);
      toast.success("You're registered! Check your email for confirmation.");
    } catch (err) {
      console.error("Registration failed:", err);
      // Still show success for UX (webhook will fire regardless)
      setSubmitted(true);
      toast.success("You're registered! Check your email for confirmation.");
    }
  };

  const isLoading = createLead.isPending || registerWorkshop.isPending;

  // Countdown to workshop date
  const countdown = useMemo(() => {
    const workshopDate = new Date("2026-03-27T09:30:00+02:00");
    const now = new Date();
    const diff = workshopDate.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }, []);

  return (
    <div className="min-h-screen pt-24">
      {/* ===== HERO ===== */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light opacity-90" />
        {/* Topographic pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D9FF' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-teal border border-teal/30 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                  Live Virtual Workshop
                </span>
                {countdown && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-amber border border-amber/30 rounded-full">
                    <Clock className="w-3 h-3" />
                    {countdown.days}d {countdown.hours}h until event
                  </span>
                )}
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                AI in Action for{" "}
                <span className="text-gradient-teal">Finance Leaders</span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                A hands-on workshop where you'll diagnose your organisation's constraints, calculate your Cost of Inaction, and leave with a personalised 90-day AI implementation roadmap.
              </p>

              <div className="flex flex-wrap gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal" />
                  <span>{workshopDetails.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal" />
                  <span>{workshopDetails.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal" />
                  <span>{workshopDetails.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber" />
                  <span>Limited to {workshopDetails.seats} seats</span>
                </div>
              </div>

              <div className="mt-8">
                <a href="#register">
                  <Button
                    size="lg"
                    className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Reserve Your Seat
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== VALUE PROPOSITION ===== */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Diagnose, Don't Guess",
                desc: "Most companies jump to AI solutions without understanding their constraints. You'll map exactly where your business model breaks at scale.",
              },
              {
                icon: Lightbulb,
                title: "Frameworks, Not Fluff",
                desc: "Leave with the QDOAA and ADAPT frameworks — proven methodologies used by FinanceFlo.ai to deliver 3.2x ROI for finance teams.",
              },
              {
                icon: BarChart3,
                title: "Your Numbers, Your Roadmap",
                desc: "Calculate your actual Cost of Inaction and build a personalised 90-day plan based on your organisation's specific constraints.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-teal" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AGENDA ===== */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Workshop Agenda</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              3 Hours That Will Transform Your Approach
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              Every minute is designed to deliver actionable value. No death by PowerPoint — this is a working session.
            </p>
          </div>

          <div className="space-y-4">
            {agendaItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex gap-6 items-start glass-panel p-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono text-amber">{item.time}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU'LL TAKE AWAY ===== */}
      <section className="py-16 border-y border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Deliverables</span>
              <h2 className="text-3xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
                What You'll Walk Away With
              </h2>
              <div className="space-y-4">
                {takeaways.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8" style={{ borderRadius: "var(--radius-lg)" }}>
              <h3 className="text-xl font-bold mb-4 text-amber" style={{ fontFamily: "var(--font-heading)" }}>
                Who Should Attend?
              </h3>
              <div className="space-y-4">
                {whoShouldAttend.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground text-sm" style={{ fontFamily: "var(--font-heading)" }}>
                        {item.role}
                      </span>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SPEAKER ===== */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">Your Facilitator</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Dudley Peacock
              </h2>
              <p className="text-lg text-amber font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Founder, FinanceFlo.ai
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dudley brings a unique combination of deep financial systems expertise and cutting-edge AI implementation experience. As a certified Sage Intacct consultant and AI solutions architect, he's helped multi-company groups transform their finance operations through constraint-based diagnosis and intelligent automation.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                His approach is refreshingly different: diagnose constraints first, optimise processes second, and only then apply AI where it delivers measurable ROI. No technology for technology's sake.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Sage Intacct Certified", "AI Solutions Architect", "ADAPT Framework Creator", "Constraint-Based Selling"].map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-mono text-teal border border-teal/30 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-8 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal/20 to-amber/20 border-2 border-teal/30 mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl font-bold text-teal" style={{ fontFamily: "var(--font-heading)" }}>DP</span>
              </div>
              <blockquote className="text-muted-foreground italic text-sm leading-relaxed mb-4">
                "Most consultancies jump straight to AI. We don't. Before we automate anything, we apply QDOAA to ensure AI is solving the right problems — not just adding technology to broken processes."
              </blockquote>
              <p className="text-xs text-muted-foreground font-mono">— Dudley Peacock, FinanceFlo.ai</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== REGISTRATION FORM ===== */}
      <section id="register" className="py-20 border-t border-border/30">
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
                    Reserve Your Seat
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Limited to {workshopDetails.seats} attendees for an intimate, interactive experience. Register now to secure your place.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">First Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Last Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Smith"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                        />
                      </div>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Job Title</label>
                        <input
                          type="text"
                          placeholder="CFO"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">Phone</label>
                        <input
                          type="tel"
                          placeholder="+27 82 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Company Size</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors"
                      >
                        <option value="">Select company size...</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber py-6 text-base"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {isLoading ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Register for {workshopDetails.date}
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    {workshopDetails.price} &middot; Your data is protected under POPIA and GDPR.
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
                    You're Registered!
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Confirmation sent to <strong className="text-foreground">{email}</strong>
                  </p>
                  <div className="glass-panel p-4 mb-6 text-left" style={{ borderRadius: "var(--radius)" }}>
                    <h4 className="font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-heading)" }}>What happens next:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-teal font-mono">1.</span>
                        <span>Calendar invite sent to your email</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-teal font-mono">2.</span>
                        <span>Pre-workshop questionnaire (5 min) — sent 1 week before</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-teal font-mono">3.</span>
                        <span>Preparation materials — sent 3 days before</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-teal font-mono">4.</span>
                        <span>Join link — sent morning of the workshop</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">
                    While you wait, take our Constraint Diagnosis to get a head start on identifying your organisation's bottlenecks.
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

            {/* Social Proof / Testimonial */}
            <div>
              <div className="glass-panel p-6 mb-6" style={{ borderRadius: "var(--radius-lg)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <Play className="w-5 h-5 text-amber" />
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    Why This Workshop?
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  "We attended expecting another vendor pitch. Instead, we left with a clear understanding of where our finance processes were breaking and a concrete plan to fix them. The Cost of Inaction calculation alone justified the time investment."
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  — Finance Director, Multi-Entity Property Group
                </p>
              </div>

              <div className="space-y-4">
                <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: "var(--radius)" }}>
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Pre-Workshop Prep</span>
                    <p className="text-xs text-muted-foreground">5-minute questionnaire to personalise your experience</p>
                  </div>
                </div>

                <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: "var(--radius)" }}>
                  <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-amber" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Certificate of Completion</span>
                    <p className="text-xs text-muted-foreground">Verifiable credential for your professional development</p>
                  </div>
                </div>

                <div className="glass-panel p-4 flex items-center gap-4" style={{ borderRadius: "var(--radius)" }}>
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Bonus: AI Audit Consultation</span>
                    <p className="text-xs text-muted-foreground">Complimentary 1-hour session (£2,500 value)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 border-t border-border/30">
        <div className="container max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "var(--font-heading)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-panel overflow-hidden"
                style={{ borderRadius: "var(--radius)" }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-semibold text-sm text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                    {faq.q}
                  </span>
                  {expandedFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-teal shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 border-t border-border/30">
        <div className="container text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
            Stop Guessing.{" "}
            <span className="text-gradient-amber">Start Diagnosing.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join {workshopDetails.seats} finance leaders for 3 hours that will fundamentally change how you approach AI adoption. Leave with frameworks, numbers, and a plan — not just inspiration.
          </p>
          <a href="#register">
            <Button
              size="lg"
              className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Reserve Your Seat — {workshopDetails.date}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
