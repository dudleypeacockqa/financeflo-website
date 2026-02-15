import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const capitalMarketsData: IndustryData = {
  pageTitle: "Capital Markets",
  tagline: "Industries",
  title: "Capital Markets &",
  titleAccent: "Trade Finance",
  description:
    "Trade reconciliation, P&L attribution, risk analytics, and regulatory reporting — built for the speed and complexity of capital markets.",
  painPoints: [
    { icon: Building2, title: "Trade Reconciliation Gaps", description: "Breaks between front, middle, and back office systems create unmatched trades, failed settlements, and manual exception handling at scale." },
    { icon: Clock, title: "Slow P&L Attribution", description: "Daily and intraday P&L demands met with overnight batch processes. Traders and risk managers lack the real-time view they need." },
    { icon: Shield, title: "Regulatory Burden", description: "MiFID II, EMIR, Dodd-Frank, and Basel III reporting requirements growing faster than compliance teams can keep pace." },
    { icon: BarChart3, title: "Risk Analytics Lag", description: "VaR calculations, stress testing, and exposure monitoring run on end-of-day data, not real-time positions." },
  ],
  solutions: [
    { title: "Sage Intacct for Capital Markets", description: "Multi-entity fund accounting, real-time consolidation, and automated regulatory reporting across trading desks.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Risk Analytics", description: "Real-time position monitoring, anomaly detection on trade flows, and predictive risk modelling.", href: "/services/ai-enhancement" },
    { title: "FloSynq Integration", description: "Connect order management, execution platforms, and prime brokers to your back-office systems in real-time.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Capital Markets Firm",
    challenge: "Reconciling 50,000+ daily trades across 6 execution venues with manual exception handling and T+1 P&L reporting.",
    outcome: "Implemented automated trade reconciliation with AI-powered break detection, real-time P&L attribution, and automated regulatory feeds.",
    metrics: [
      { value: "95%", label: "Auto-reconciliation rate" },
      { value: "Real-time", label: "P&L attribution" },
      { value: "70%", label: "Fewer trade breaks" },
      { value: "100%", label: "Regulatory compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Capital Markets Operations?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your capital markets finance operations and get a personalised transformation roadmap.",
};
