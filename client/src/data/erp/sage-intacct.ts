import { Building2, LineChart, Repeat, Cloud, Lock, Database } from "lucide-react";
import type { ERPProductData } from "@/components/templates/ERPProductPage";

export const sageIntacctData: ERPProductData = {
  pageTitle: "Sage Intacct",
  tagline: "ERP Solutions",
  title: "Sage Intacct:",
  titleAccent: "The AICPA's Choice",
  badge: "AICPA Preferred",
  description:
    "The #1 cloud financial management platform for mid-market organisations. Multi-entity, multi-currency, real-time consolidation — with an open API architecture built for AI integration.",
  overviewDescription:
    "Sage Intacct is trusted by over 20,000 organisations worldwide and recommended by the AICPA as the preferred financial management solution. It provides the robust backbone your AI strategy needs — true multi-entity management, dimensional reporting, and a modern REST API that enables seamless integration with custom AI solutions. We don't just implement Sage Intacct — we configure it to remove the specific constraints blocking your growth.",
  stats: [
    { value: "20,000+", label: "Organisations worldwide" },
    { value: "99.8%", label: "Uptime SLA" },
    { value: "250+", label: "Pre-built integrations" },
    { value: "40%", label: "Faster month-end close" },
  ],
  features: [
    { icon: Building2, title: "Multi-Entity Management", description: "Unlimited entities with real-time consolidation, inter-company transactions, and elimination entries — all automated." },
    { icon: LineChart, title: "Real-Time Reporting", description: "Dimensional reporting across entities, departments, and projects. Custom dashboards that update in real-time." },
    { icon: Repeat, title: "Multi-Currency", description: "Automated currency conversion, revaluation, and reporting across all your international entities." },
    { icon: Cloud, title: "True Cloud Architecture", description: "Born-in-the-cloud platform with 99.8% uptime SLA. Access from anywhere, integrate with everything." },
    { icon: Lock, title: "Audit & Compliance", description: "Complete audit trails, role-based access, and SOC 1 Type II compliance built into every transaction." },
    { icon: Database, title: "Open API Platform", description: "RESTful APIs enable seamless integration with your existing systems, CRM, and custom AI solutions." },
  ],
  useCases: [
    { title: "Multi-Company Consolidation", description: "Automatically consolidate financial data across dozens of entities with different currencies, tax jurisdictions, and reporting requirements." },
    { title: "Project-Based Accounting", description: "Track revenue recognition, costs, and margins across projects and contracts with real-time visibility." },
    { title: "Non-Profit Fund Accounting", description: "Manage grants, restricted funds, and compliance reporting with purpose-built non-profit functionality." },
    { title: "Subscription Revenue Management", description: "Automate ASC 606 revenue recognition for SaaS and subscription-based businesses." },
  ],
  ctaTitle: "Ready to Upgrade to",
  ctaTitleAccent: "Sage Intacct?",
  ctaDescription:
    "Take our 5-minute AI Readiness Assessment to see how Sage Intacct combined with custom AI solutions can remove the constraints blocking your next growth phase.",
};
