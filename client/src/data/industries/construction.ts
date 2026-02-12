import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const constructionData: IndustryData = {
  pageTitle: "Construction",
  tagline: "Industries",
  title: "Construction &",
  titleAccent: "Project Accounting",
  description:
    "Job costing, project-based revenue recognition, subcontractor compliance, and multi-entity consolidation — built for the complexity of construction finance.",
  painPoints: [
    { icon: Building2, title: "Fragmented Job Costing", description: "Costs spread across spreadsheets, emails, and disconnected systems. No real-time visibility into project profitability until it's too late." },
    { icon: Clock, title: "Slow Month-End Close", description: "Manual reconciliation of subcontractor invoices, change orders, and retention payments adds weeks to your close process." },
    { icon: Shield, title: "Compliance Risk", description: "CIS deductions, prevailing wage requirements, and certified payroll reporting create compliance blind spots." },
    { icon: BarChart3, title: "Cash Flow Uncertainty", description: "Long payment cycles, retention holdbacks, and change order disputes make cash flow forecasting unreliable." },
  ],
  solutions: [
    { title: "Sage Intacct for Construction", description: "Multi-entity consolidation, job costing, and AIA billing with real-time project profitability dashboards.", href: "/erp/sage-intacct" },
    { title: "Acumatica Construction Edition", description: "Project accounting, change order management, and subcontractor compliance in one platform.", href: "/erp/acumatica" },
    { title: "IntelliFlow Integration", description: "Connect your estimating, project management, and field systems to your ERP in real-time.", href: "/ipaas/intelliflow" },
  ],
  caseStudy: {
    company: "Placeholder Construction Co.",
    challenge: "Managing 200+ active projects across 3 entities with spreadsheet-based job costing and manual AIA billing.",
    outcome: "Implemented Sage Intacct with automated AIA billing, real-time job cost dashboards, and AI-powered cash flow forecasting.",
    metrics: [
      { value: "60%", label: "Faster month-end close" },
      { value: "£2.1M", label: "Cash flow improvement" },
      { value: "8 hrs", label: "Weekly time saved" },
      { value: "100%", label: "CIS compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Construction Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your construction finance operations and get a personalised transformation roadmap.",
};
