import { Building2, Globe, Shield, Cog, BarChart3, Zap } from "lucide-react";
import type { ERPProductData } from "@/components/templates/ERPProductPage";

export const sageX3Data: ERPProductData = {
  pageTitle: "Sage X3",
  tagline: "ERP Solutions",
  title: "Sage X3:",
  titleAccent: "Enterprise at Scale",
  badge: "Enterprise",
  description:
    "Enterprise resource planning for complex, global operations. Multi-legislation, multi-language, and built for manufacturing, distribution, and process industries at scale.",
  overviewDescription:
    "Sage X3 (formerly Sage Enterprise Management) is Sage's enterprise-tier ERP, designed for organisations with complex manufacturing, distribution, and supply chain operations across multiple countries. Unlike mid-market ERPs, Sage X3 handles multi-legislation compliance, complex costing, and high-volume transaction processing. We implement Sage X3 for clients who have outgrown mid-market platforms and need true enterprise capability without the complexity and cost of SAP or Oracle.",
  stats: [
    { value: "Multi", label: "Legislation support" },
    { value: "Global", label: "Multi-language, multi-currency" },
    { value: "100+", label: "Countries supported" },
    { value: "Enterprise", label: "Grade security" },
  ],
  features: [
    { icon: Building2, title: "Multi-Legislation Compliance", description: "Built-in compliance for local tax, accounting, and regulatory requirements across 100+ countries." },
    { icon: Globe, title: "Global Operations", description: "Multi-language, multi-currency, multi-site management from a single platform with localised business rules." },
    { icon: Shield, title: "Advanced Manufacturing", description: "Complex bill of materials, process manufacturing, quality management, and production scheduling." },
    { icon: Cog, title: "Supply Chain Management", description: "End-to-end supply chain visibility with procurement, warehouse management, and logistics optimisation." },
    { icon: BarChart3, title: "Financial Management", description: "Multi-company accounting, budgeting, cash management, and fixed assets with real-time consolidation." },
    { icon: Zap, title: "Business Intelligence", description: "Embedded analytics, custom reports, and data visualisation for operational and financial decision-making." },
  ],
  useCases: [
    { title: "Process Manufacturing", description: "Formula-based manufacturing with batch tracking, quality control, yield analysis, and regulatory compliance." },
    { title: "Global Distribution", description: "Multi-warehouse inventory management, demand planning, and logistics coordination across international operations." },
    { title: "Multi-Legislation Operations", description: "Run operations across countries with different tax regimes, accounting standards, and regulatory requirements from one system." },
    { title: "Complex Costing", description: "Standard, actual, and FIFO costing methods with landed cost calculations and cost variance analysis." },
  ],
  ctaTitle: "Need Enterprise-Grade",
  ctaTitleAccent: "ERP?",
  ctaDescription:
    "If your operations span multiple countries and you need true enterprise capability, Sage X3 may be the right platform. Start with our Constraint Diagnosis.",
};
