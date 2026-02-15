import { Shield, BarChart3, Building2, Lock } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const financialServicesData: IndustryData = {
  pageTitle: "Financial Services",
  tagline: "Industries",
  title: "Financial Services &",
  titleAccent: "Regulatory Finance",
  description:
    "Multi-entity consolidation, regulatory reporting, fund accounting, and real-time risk analytics — purpose-built for the demands of financial services.",
  painPoints: [
    { icon: Shield, title: "Regulatory Complexity", description: "FCA, MiFID II, SOX, and Basel III requirements create a compliance burden that manual processes can't reliably handle." },
    { icon: Building2, title: "Multi-Entity Consolidation", description: "Dozens of legal entities across jurisdictions, each with different reporting requirements and intercompany transactions." },
    { icon: BarChart3, title: "Real-Time Risk Reporting", description: "Boards and regulators demand real-time visibility into exposure, liquidity, and operational risk — not monthly snapshots." },
    { icon: Lock, title: "Audit Trail Gaps", description: "Manual journal entries, spreadsheet-based reconciliation, and email approvals create audit trail blind spots." },
  ],
  solutions: [
    { title: "Sage Intacct for Financial Services", description: "Multi-entity consolidation with SOC 1 Type II compliance, dimensional reporting, and complete audit trails.", href: "/erp/sage-intacct" },
    { title: "AI-Powered Compliance", description: "Automated regulatory reporting, anomaly detection, and continuous compliance monitoring.", href: "/services/ai-enhancement" },
    { title: "Integration Hub", description: "Connect trading platforms, custodians, and market data feeds to your financial management system.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Financial Group",
    challenge: "Manual consolidation of 15 entities across 3 jurisdictions with separate spreadsheets for regulatory reporting.",
    outcome: "Deployed Sage Intacct with automated consolidation, real-time regulatory dashboards, and AI-powered anomaly detection.",
    metrics: [
      { value: "75%", label: "Faster regulatory reporting" },
      { value: "Zero", label: "Audit findings" },
      { value: "15", label: "Entities consolidated" },
      { value: "Real-time", label: "Risk visibility" },
    ],
  },
  ctaTitle: "Transform Your",
  ctaTitleAccent: "Financial Operations?",
  ctaDescription:
    "Take our Constraint Diagnosis to identify regulatory and operational bottlenecks in your financial services organisation.",
};
