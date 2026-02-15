import { TrendingUp, Repeat, Globe, BarChart3 } from "lucide-react";
import type { IndustryData } from "@/components/templates/IndustryPage";

export const ecommerceData: IndustryData = {
  pageTitle: "E-Commerce",
  tagline: "Industries",
  title: "E-Commerce &",
  titleAccent: "Omnichannel Finance",
  description:
    "Multi-channel revenue reconciliation, inventory costing, marketplace fee management, and real-time profitability analytics — built for the speed of modern commerce.",
  painPoints: [
    { icon: TrendingUp, title: "Revenue Reconciliation", description: "Orders from Shopify, Amazon, eBay, and wholesale all land in different formats with different fee structures." },
    { icon: Repeat, title: "Inventory Costing", description: "Landed cost calculations, FIFO/average costing, and multi-warehouse stock valuation across channels." },
    { icon: Globe, title: "Multi-Currency Complexity", description: "International sales in multiple currencies with VAT/sales tax rules varying by jurisdiction and marketplace." },
    { icon: BarChart3, title: "Profitability Blindness", description: "Marketplace fees, shipping costs, returns, and promotion spend make true product-level profitability invisible." },
  ],
  solutions: [
    { title: "Acumatica Commerce Edition", description: "Native Shopify, Amazon, and BigCommerce integration with real-time inventory and financial sync.", href: "/erp/acumatica" },
    { title: "Odoo All-in-One", description: "E-commerce, inventory, accounting, and CRM in a single platform with modular pricing.", href: "/erp/odoo" },
    { title: "FloSynq Commerce Hub", description: "Connect all your sales channels, fulfilment systems, and financial platform in real-time.", href: "/ipaas/flosynq" },
  ],
  caseStudy: {
    company: "Placeholder Commerce Ltd.",
    challenge: "5 sales channels processed manually into Xero with weekly reconciliation. No real-time inventory visibility or product-level profitability.",
    outcome: "Migrated to Acumatica with FloSynq integration hub, automated multi-channel reconciliation, and AI-powered demand forecasting.",
    metrics: [
      { value: "95%", label: "Automation of order processing" },
      { value: "5x", label: "Faster reconciliation" },
      { value: "Real-time", label: "Inventory visibility" },
      { value: "12%", label: "Margin improvement" },
    ],
  },
  ctaTitle: "Scale Your",
  ctaTitleAccent: "E-Commerce Finance?",
  ctaDescription:
    "Take our Constraint Diagnosis to identify the bottlenecks preventing your e-commerce finance from scaling with your growth.",
};
