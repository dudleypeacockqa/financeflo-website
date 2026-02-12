import { Cloud, BarChart3, Cog, Users, Repeat, Shield } from "lucide-react";
import type { ERPProductData } from "@/components/templates/ERPProductPage";

export const acumaticaData: ERPProductData = {
  pageTitle: "Acumatica",
  tagline: "ERP Solutions",
  title: "Acumatica:",
  titleAccent: "Cloud ERP for Growth",
  description:
    "A flexible, consumption-based cloud ERP that scales with your business. Unlimited users, real-time insights, and deep industry editions — all without per-user licensing.",
  overviewDescription:
    "Acumatica is the fastest-growing cloud ERP platform, purpose-built for mid-market companies that need enterprise-grade functionality without enterprise-grade complexity. Its unique consumption-based licensing means you never pay per user — your entire team gets full access. With deep industry editions for construction, distribution, manufacturing, and retail, Acumatica adapts to your workflows rather than forcing you into rigid processes.",
  stats: [
    { value: "Unlimited", label: "Users included" },
    { value: "6", label: "Industry editions" },
    { value: "200+", label: "Third-party integrations" },
    { value: "99.95%", label: "Uptime SLA" },
  ],
  features: [
    { icon: Cloud, title: "Consumption-Based Licensing", description: "No per-user fees. Your entire organisation gets full access, from warehouse floor to C-suite." },
    { icon: BarChart3, title: "Real-Time Dashboards", description: "Role-based dashboards and generic inquiries that give every stakeholder the data they need, when they need it." },
    { icon: Cog, title: "Industry Editions", description: "Purpose-built editions for construction, distribution, manufacturing, retail-commerce, and general business." },
    { icon: Users, title: "Unlimited User Access", description: "Encourage adoption by giving every team member full system access without incremental cost." },
    { icon: Repeat, title: "Multi-Entity & Multi-Currency", description: "Manage multiple companies and currencies from a single instance with consolidated reporting." },
    { icon: Shield, title: "Open Platform", description: "REST APIs, webhooks, and a robust marketplace of ISV solutions make integration straightforward." },
  ],
  useCases: [
    { title: "Distribution & Wholesale", description: "End-to-end supply chain management with warehouse automation, demand forecasting, and real-time inventory visibility." },
    { title: "Construction Project Accounting", description: "AIA billing, change order management, subcontractor compliance, and job cost tracking all in one platform." },
    { title: "Manufacturing Operations", description: "Production management, MRP, scheduling, and quality control integrated with financial management." },
    { title: "Retail & E-Commerce", description: "Omnichannel commerce with POS integration, inventory synchronisation, and unified customer management." },
  ],
  ctaTitle: "Is Acumatica Right for",
  ctaTitleAccent: "Your Business?",
  ctaDescription:
    "Take our Constraint Diagnosis to understand whether Acumatica's flexibility and unlimited-user model is the right fit for your growth trajectory.",
};
