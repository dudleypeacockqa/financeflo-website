import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const subscriptionBusinessData: IndustryData = {
  pageTitle: "Subscription Business",
  tagline: "Industries",
  title: "Subscription Business &",
  titleAccent: "Recurring Revenue",
  description:
    "Recurring revenue recognition, churn analytics, SaaS metrics, and billing automation — built for subscription-first business models.",
  painPoints: [
    { icon: Building2, title: "Revenue Recognition Complexity", description: "ASC 606 / IFRS 15 compliance across monthly, annual, and usage-based plans. Upgrades, downgrades, and credits create recognition nightmares." },
    { icon: Clock, title: "Billing & Collections Friction", description: "Failed payments, dunning workflows, and proration calculations handled manually or across disconnected systems." },
    { icon: Shield, title: "Opaque SaaS Metrics", description: "MRR, ARR, churn, LTV, and CAC payback calculated in spreadsheets with inconsistent definitions. Board reporting is unreliable." },
    { icon: BarChart3, title: "Cash Flow Unpredictability", description: "Deferred revenue schedules, annual-to-monthly conversions, and expansion revenue make cash flow forecasting unreliable." },
  ],
  solutions: [
    { title: "Sage Intacct for SaaS", description: "Automated ASC 606 revenue recognition, multi-element arrangements, and real-time SaaS metrics dashboards.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Churn Analytics", description: "Predictive churn scoring, cohort analysis, and expansion revenue identification using machine learning.", href: "/services/ai-enhancement" },
    { title: "FloSynq Integration", description: "Connect Stripe, Chargebee, Salesforce, and your billing stack to your ERP for end-to-end revenue visibility.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder SaaS Company",
    challenge: "Managing 15,000 subscriptions across 3 pricing tiers with spreadsheet-based revenue recognition and manual SaaS metrics.",
    outcome: "Implemented Sage Intacct with automated revenue schedules, real-time MRR/ARR dashboards, and AI-powered churn prediction.",
    metrics: [
      { value: "50%", label: "Faster month-end close" },
      { value: "£3.2M", label: "Revenue leakage identified" },
      { value: "15%", label: "Churn reduction" },
      { value: "100%", label: "ASC 606 compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Subscription Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your subscription business operations and get a personalised transformation roadmap.",
};
