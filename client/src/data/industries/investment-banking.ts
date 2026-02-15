import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const investmentBankingData: IndustryData = {
  pageTitle: "Investment Banking",
  tagline: "Industries",
  title: "Investment Banking &",
  titleAccent: "Deal Accounting",
  description:
    "Deal accounting, fee tracking, fund administration, and compliance reporting — built for the pace and precision of investment banking.",
  painPoints: [
    { icon: Building2, title: "Complex Deal Accounting", description: "M&A advisory fees, underwriting revenue, and syndication income each with unique recognition rules. Manual tracking across deal stages is error-prone." },
    { icon: Clock, title: "Slow Fee Reconciliation", description: "Advisory fees, success fees, and retainers tracked in spreadsheets. Revenue recognition tied to deal milestones with no automated triggers." },
    { icon: Shield, title: "Regulatory Compliance Load", description: "FCA, SEC, and MiFID II requirements demand audit trails, conflict checks, and capital adequacy reporting that manual processes cannot reliably deliver." },
    { icon: BarChart3, title: "Pipeline Visibility Gaps", description: "Deal pipeline, fee forecasting, and banker productivity metrics assembled manually. No real-time view of expected revenue or resource utilisation." },
  ],
  solutions: [
    { title: "Sage Intacct for Investment Banking", description: "Multi-entity deal accounting, milestone-based revenue recognition, and real-time fee tracking dashboards.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Deal Analytics", description: "Predictive deal scoring, fee forecasting, and automated compliance monitoring using machine learning.", href: "/services/ai-enhancement" },
    { title: "FloSynq Integration", description: "Connect your CRM, deal room, and compliance systems to your ERP for end-to-end deal lifecycle visibility.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Investment Bank",
    challenge: "Tracking 200+ active mandates across 4 divisions with spreadsheet-based fee tracking and manual compliance reporting.",
    outcome: "Implemented Sage Intacct with milestone-based revenue recognition, automated compliance feeds, and AI-powered pipeline analytics.",
    metrics: [
      { value: "60%", label: "Faster fee reconciliation" },
      { value: "£4.1M", label: "Revenue leakage recovered" },
      { value: "10 hrs", label: "Weekly compliance time saved" },
      { value: "100%", label: "Regulatory compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Investment Banking Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your investment banking operations and get a personalised transformation roadmap.",
};
