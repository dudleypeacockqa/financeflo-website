/*
 * Design: Data Cartography — FinanceFlo.ai
 * Results: Personalised AI readiness score with recommendations
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowRight, Download, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AssessmentData {
  score: number;
  totalScore: number;
  maxScore: number;
  answers: Record<string, { value: string; score: number }>;
  contact: { name: string; email: string; company: string; phone: string; role: string };
  timestamp: string;
}

function getReadinessLevel(score: number) {
  if (score >= 75) return { level: "Advanced", color: "text-teal", bg: "bg-teal/10", border: "border-teal/30", icon: CheckCircle2, desc: "Your organisation shows strong readiness for AI-powered financial transformation. You have solid foundations in place." };
  if (score >= 50) return { level: "Developing", color: "text-amber", bg: "bg-amber/10", border: "border-amber/30", icon: Zap, desc: "You have good foundations but significant opportunities to accelerate your AI journey with the right partner." };
  return { level: "Emerging", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", icon: AlertTriangle, desc: "Your organisation is at the beginning of the AI journey. This is actually the ideal time to build the right foundations." };
}

function getRecommendations(answers: Record<string, { value: string; score: number }>) {
  const recs: { title: string; desc: string; priority: string }[] = [];

  if (answers.current_system?.score <= 2) {
    recs.push({ title: "Upgrade to Sage Intacct", desc: "Your current system lacks the multi-company, real-time capabilities needed for AI integration. Sage Intacct provides the foundation.", priority: "High" });
  }
  if (answers.consolidation?.score <= 2) {
    recs.push({ title: "Automate Multi-Entity Consolidation", desc: "Manual consolidation is consuming valuable time. Sage Intacct can reduce this from days to minutes with real-time consolidation.", priority: "High" });
  }
  if (answers.ai_readiness?.score <= 2) {
    recs.push({ title: "Start with an AI Readiness Workshop", desc: "Begin your AI journey with a structured assessment. Our ADAPT Framework provides a clear, low-risk path to AI adoption.", priority: "Medium" });
  }
  if (answers.data_quality?.score <= 2) {
    recs.push({ title: "Implement Data Governance", desc: "Clean, centralised data is the foundation for any AI initiative. Start with data quality improvement before AI deployment.", priority: "High" });
  }
  if (answers.pain_level?.score <= 2) {
    recs.push({ title: "Accelerate Month-End Close", desc: "AI-powered automation can reduce your close cycle by 40-60%. Start with automated reconciliation and journal entry posting.", priority: "High" });
  }
  if (answers.company_size?.score >= 3) {
    recs.push({ title: "Multi-Company Intelligence Layer", desc: "With your group structure, an AI-powered consolidation and inter-company transaction engine would deliver immediate ROI.", priority: "Medium" });
  }

  if (recs.length === 0) {
    recs.push({ title: "Advanced AI Integration", desc: "Your foundations are strong. Focus on predictive analytics, cash flow forecasting, and custom ML models for your specific industry.", priority: "Medium" });
  }

  return recs;
}

export default function Results() {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const stored = sessionStorage.getItem("assessmentResults");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      navigate("/assessment");
    }
  }, [navigate]);

  if (!data) return null;

  const readiness = getReadinessLevel(data.score);
  const recommendations = getRecommendations(data.answers);
  const ReadinessIcon = readiness.icon;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container max-w-4xl mx-auto">
        {/* Score Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-mono text-teal uppercase tracking-widest">Assessment Complete</span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-3 mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            {data.contact.company}'s AI Readiness Score
          </h1>
          <p className="text-muted-foreground">Prepared for {data.contact.name}, {data.contact.role}</p>
        </motion.div>

        {/* Score Circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <div className={`relative w-48 h-48 rounded-full ${readiness.bg} ${readiness.border} border-2 flex flex-col items-center justify-center`}>
            <span className={`text-5xl font-bold font-mono ${readiness.color}`}>{data.score}%</span>
            <span className={`text-sm font-semibold mt-1 ${readiness.color}`}>{readiness.level}</span>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`glass-panel p-6 mb-8 flex items-start gap-4`}
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <ReadinessIcon className={`w-6 h-6 ${readiness.color} shrink-0 mt-0.5`} />
          <div>
            <h3 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              {readiness.level} Readiness
            </h3>
            <p className="text-sm text-muted-foreground">{readiness.desc}</p>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Your Personalised Recommendations
          </h2>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="glass-panel p-5 flex items-start gap-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className={`px-2 py-1 text-xs font-mono rounded ${
                  rec.priority === "High" ? "bg-amber/20 text-amber" : "bg-teal/20 text-teal"
                }`}>
                  {rec.priority}
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>{rec.title}</h4>
                  <p className="text-sm text-muted-foreground">{rec.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ADAPT Framework CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel p-8 text-center glow-teal"
          style={{ borderRadius: "var(--radius-lg)" }}
        >
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to Start Your Transformation?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Book a free 30-minute strategy call with Dudley Peacock to discuss your results and explore how the ADAPT Framework can accelerate your AI journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://financeflo.ai" target="_blank" rel="noopener noreferrer">
              <Button className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                Book a Strategy Call
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Link href="/lead-magnet">
              <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
                <Download className="w-4 h-4" />
                Download AI in Finance Report
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
