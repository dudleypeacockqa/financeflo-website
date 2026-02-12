import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const insuranceData: IndustryData = {
  pageTitle: "Insurance",
  tagline: "Industries",
  title: "Insurance &",
  titleAccent: "Actuarial Finance",
  description:
    "Claims reserving, premium allocation, Solvency II compliance, and actuarial reporting — built for the regulatory rigour of insurance.",
  painPoints: [
    { icon: Building2, title: "Claims Reserve Complexity", description: "IBNR calculations, loss development triangles, and reserve adjustments managed in actuarial models disconnected from the general ledger." },
    { icon: Clock, title: "Slow Premium Accounting", description: "Written, earned, and unearned premium calculations across product lines and reinsurance layers require manual reconciliation every period." },
    { icon: Shield, title: "Solvency II & IFRS 17 Burden", description: "Regulatory capital calculations, risk margin reporting, and contractual service margin tracking demand precision that spreadsheets cannot deliver." },
    { icon: BarChart3, title: "Fragmented Underwriting Data", description: "Policy admin, claims, and finance systems operate in silos. Combined ratios and loss ratios are lagging indicators, not real-time metrics." },
  ],
  solutions: [
    { title: "Sage Intacct for Insurance", description: "Multi-entity premium accounting, automated reserve postings, and real-time combined ratio dashboards.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Claims Analytics", description: "Predictive claims severity scoring, fraud detection, and automated reserve adequacy testing using machine learning.", href: "/services/ai-enhancement" },
    { title: "IntelliFlow Integration", description: "Connect policy admin, claims platforms, and reinsurance systems to your financial ledger in real-time.", href: "/ipaas/intelliflow" },
  ],
  caseStudy: {
    company: "Placeholder Insurance Company",
    challenge: "Managing premium accounting across 8 product lines with spreadsheet-based reserve calculations and manual Solvency II reporting.",
    outcome: "Implemented Sage Intacct with automated premium recognition, AI-powered reserve testing, and real-time regulatory capital dashboards.",
    metrics: [
      { value: "65%", label: "Faster regulatory reporting" },
      { value: "£2.5M", label: "Reserve accuracy improvement" },
      { value: "12 hrs", label: "Weekly actuarial time saved" },
      { value: "100%", label: "Solvency II compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Insurance Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your insurance finance operations and get a personalised transformation roadmap.",
};
