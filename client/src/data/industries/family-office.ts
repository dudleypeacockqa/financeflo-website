import { Building2, Clock, Shield, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const familyOfficeData: IndustryData = {
  pageTitle: "Family Office",
  tagline: "Industries",
  title: "Family Office &",
  titleAccent: "Wealth Reporting",
  description:
    "Multi-entity consolidation, beneficiary tracking, tax planning, and investment reporting — built for the complexity of family office finance.",
  painPoints: [
    { icon: Building2, title: "Multi-Entity Complexity", description: "Trusts, holding companies, LLPs, and SPVs spread across jurisdictions. No single view of total family wealth or consolidated performance." },
    { icon: Clock, title: "Manual Wealth Reporting", description: "Quarterly reports for principals assembled from spreadsheets, custodian portals, and fund administrator statements. Weeks of effort every cycle." },
    { icon: Shield, title: "Tax & Compliance Risk", description: "Cross-border tax obligations, beneficial ownership registers, and trustee reporting requirements create gaps that manual processes cannot close." },
    { icon: BarChart3, title: "Opaque Investment Performance", description: "Illiquid holdings, co-investments, and alternative assets make true performance attribution and benchmarking nearly impossible." },
  ],
  solutions: [
    { title: "Sage Intacct for Family Office", description: "Multi-entity consolidation, inter-company eliminations, and real-time wealth dashboards across all structures.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Reporting", description: "Automated capital call tracking, distribution waterfalls, and beneficiary reporting with natural language querying.", href: "/services/ai-enhancement" },
    { title: "FloSynq Integration", description: "Connect custodians, fund administrators, and banking platforms to your ERP for live portfolio visibility.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Family Office",
    challenge: "Managing 12 entities across 4 jurisdictions with spreadsheet-based consolidation and manual beneficiary reporting.",
    outcome: "Implemented Sage Intacct with automated inter-company eliminations, real-time wealth dashboards, and AI-powered tax scenario modelling.",
    metrics: [
      { value: "75%", label: "Faster quarterly reporting" },
      { value: "£1.8M", label: "Tax savings identified" },
      { value: "12 hrs", label: "Weekly time saved" },
      { value: "100%", label: "Regulatory compliance" },
    ],
  },
  ctaTitle: "Modernise Your",
  ctaTitleAccent: "Family Office Finance?",
  ctaDescription:
    "Take our 5-minute Constraint Diagnosis to identify the specific bottlenecks in your family office operations and get a personalised transformation roadmap.",
};
