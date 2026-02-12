import { Cog, Globe, Zap, Database, Users, TrendingUp } from "lucide-react";
import type { ERPProductData } from "@/components/templates/ERPProductPage";

export const odooData: ERPProductData = {
  pageTitle: "Odoo",
  tagline: "ERP Solutions",
  title: "Odoo:",
  titleAccent: "Modular & Open Source",
  description:
    "An all-in-one open-source business suite with 80+ integrated apps. From accounting to inventory, CRM to manufacturing — Odoo offers enterprise-grade functionality at a fraction of the cost.",
  overviewDescription:
    "Odoo is the world's most popular open-source ERP, used by over 12 million users globally. Its modular architecture lets you start small and add capabilities as you grow — CRM, accounting, inventory, manufacturing, HR, marketing, and more. With both community (free) and enterprise editions, Odoo is particularly compelling for businesses that want deep customisation without vendor lock-in. We specialise in configuring Odoo for AI-enhanced finance operations.",
  stats: [
    { value: "12M+", label: "Users worldwide" },
    { value: "80+", label: "Integrated apps" },
    { value: "Open", label: "Source code access" },
    { value: "50%", label: "Lower TCO vs proprietary" },
  ],
  features: [
    { icon: Cog, title: "Modular Architecture", description: "Start with what you need and add modules as you grow. No forced bundles, no unused features cluttering your system." },
    { icon: Globe, title: "Multi-Language & Multi-Currency", description: "Built for global operations with localised accounting, tax rules, and reporting for 70+ countries." },
    { icon: Zap, title: "All-in-One Platform", description: "CRM, accounting, inventory, manufacturing, HR, e-commerce, and marketing in a single integrated system." },
    { icon: Database, title: "Open Source Flexibility", description: "Full source code access means unlimited customisation. No vendor lock-in, no proprietary black boxes." },
    { icon: Users, title: "Community Ecosystem", description: "Thousands of community modules and a vast network of developers for specialised requirements." },
    { icon: TrendingUp, title: "Cost-Effective Scaling", description: "The community edition is free. Enterprise edition is significantly cheaper than proprietary alternatives." },
  ],
  useCases: [
    { title: "Start-Up to Scale-Up", description: "Begin with free accounting and CRM, then add inventory, manufacturing, and HR modules as your business matures." },
    { title: "Multi-Channel Retail", description: "Integrate e-commerce, POS, inventory, and accounting in a single system with real-time synchronisation." },
    { title: "Custom Manufacturing", description: "Bill of materials, work orders, quality control, and maintenance management all connected to your financials." },
    { title: "Service Companies", description: "Project management, timesheets, invoicing, and helpdesk in one platform — perfect for professional services." },
  ],
  ctaTitle: "Want to Explore",
  ctaTitleAccent: "Odoo for Your Business?",
  ctaDescription:
    "Take our AI Readiness Assessment and we'll help you determine whether Odoo's modular approach is the right foundation for your AI-enhanced finance operations.",
};
