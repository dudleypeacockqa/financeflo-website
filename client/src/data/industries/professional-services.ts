import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const professionalServicesData: IndustryData = {
  pageTitle: "Professional Services",
  tagline: "Industries",
  title: "Professional Services &",
  titleAccent: "Project Profitability",
  description:
    "Time & billing, project profitability, WIP tracking, and utilisation analytics — built for the margin pressures of professional services.",
  painPoints: [
    { icon: Building2, title: "Time & Billing Leakage", description: "Unbilled time, write-offs, and delayed invoicing erode margins. Manual timesheet consolidation means revenue leaks go undetected for weeks." },
    { icon: Clock, title: "WIP Visibility Gaps", description: "Work-in-progress balances across engagements are opaque. Partners lack real-time visibility into which projects are profitable and which are burning." },
    { icon: Shield, title: "Utilisation Blind Spots", description: "Billable vs. non-billable time, bench costs, and resource allocation tracked in disconnected systems. Capacity planning is guesswork." },
    { icon: BarChart3, title: "Revenue Recognition Complexity", description: "Percentage-of-completion, milestone-based, and fixed-fee arrangements each with unique ASC 606 requirements. Manual calculations are error-prone." },
  ],
  solutions: [
    { title: "Sage Intacct for Professional Services", description: "Project accounting, real-time WIP dashboards, and automated revenue recognition across engagement types.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Utilisation Analytics", description: "Predictive resource planning, margin forecasting, and automated write-off detection using machine learning.", href: "/services/ai-enhancement" },
    { title: "IntelliFlow Integration", description: "Connect your PSA, CRM, and timesheet systems to your ERP for end-to-end project financial visibility.", href: "/ipaas/intelliflow" },
  ],
  caseStudy: {
    company: "Placeholder Professional Services Firm",
    challenge: "Managing 500+ active engagements across 3 practice areas with spreadsheet-based WIP tracking and manual utilisation reporting.",
    outcome: "Implemented Sage Intacct with real-time project profitability dashboards, automated revenue recognition, and AI-powered resource planning.",
    metrics: [
      { value: "45%", label: "Faster month-end close" },
      { value: "£1.4M", label: "Recovered unbilled revenue" },
      { value: "18%", label: "Utilisation improvement" },
      { value: "100%", label: "ASC 606 compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Professional Services Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your professional services operations and get a personalised transformation roadmap.",
};
