import { Shield, Clock, BarChart3, Users } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const healthcareData: IndustryData = {
  pageTitle: "Healthcare",
  tagline: "Industries",
  title: "Healthcare &",
  titleAccent: "Fund Accounting",
  description:
    "Grant management, restricted fund accounting, NHS/payer reconciliation, and regulatory compliance — designed for healthcare organisations and non-profits.",
  painPoints: [
    { icon: Shield, title: "Grant & Fund Compliance", description: "Tracking restricted vs unrestricted funds, grant conditions, and donor reporting requirements across multiple funding sources." },
    { icon: Clock, title: "Revenue Cycle Complexity", description: "NHS block contracts, cost-per-case reimbursement, and private payer billing create a fragmented revenue recognition challenge." },
    { icon: BarChart3, title: "Cost Allocation", description: "Allocating shared costs across programmes, grants, and cost centres accurately and consistently." },
    { icon: Users, title: "Workforce Cost Management", description: "Agency staff, bank shifts, and complex pay structures make workforce costing unpredictable." },
  ],
  solutions: [
    { title: "Sage Intacct for Healthcare", description: "Fund accounting, grant tracking, and dimensional reporting for healthcare and non-profit organisations.", href: "/erp/sage-intacct" },
    { title: "AI Cost Allocation", description: "Machine learning-powered cost allocation that learns from historical patterns and adapts to changing structures.", href: "/services/ai-enhancement" },
    { title: "System Integration", description: "Connect PAS, RIS, HR, and rostering systems to your financial management platform.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Healthcare Trust",
    challenge: "Manual fund tracking across 50+ restricted grants with spreadsheet-based cost allocation and quarterly donor reporting.",
    outcome: "Implemented Sage Intacct with automated fund accounting, AI-powered cost allocation, and real-time grant tracking dashboards.",
    metrics: [
      { value: "80%", label: "Faster grant reporting" },
      { value: "50+", label: "Grants tracked automatically" },
      { value: "£500K", label: "Annual savings" },
      { value: "Zero", label: "Compliance issues" },
    ],
  },
  ctaTitle: "Streamline Your",
  ctaTitleAccent: "Healthcare Finance?",
  ctaDescription:
    "Take our Constraint Diagnosis to identify the bottlenecks in your healthcare financial operations and get a personalised roadmap.",
};
