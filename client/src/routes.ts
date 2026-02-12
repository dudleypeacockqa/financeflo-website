import { lazy } from "react";

export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const routes: RouteConfig[] = [
  { path: "/", component: lazy(() => import("./pages/Home")) },
  { path: "/solutions", component: lazy(() => import("./pages/Solutions")) },
  { path: "/adapt-framework", component: lazy(() => import("./pages/ADAPTFramework")) },
  { path: "/assessment", component: lazy(() => import("./pages/Assessment")) },
  { path: "/results", component: lazy(() => import("./pages/Results")) },
  { path: "/lead-magnet", component: lazy(() => import("./pages/LeadMagnet")) },
  { path: "/free-book", component: lazy(() => import("./pages/FreeBook")) },
  { path: "/delivery", component: lazy(() => import("./pages/Delivery")) },
  { path: "/workshop", component: lazy(() => import("./pages/Workshop")) },
  { path: "/admin/login", component: lazy(() => import("./pages/AdminLogin")) },
  { path: "/admin", component: lazy(() => import("./pages/Admin")) },
  // ERP
  { path: "/erp/sage-intacct", component: lazy(() => import("./pages/erp/SageIntacct")) },
  { path: "/erp/acumatica", component: lazy(() => import("./pages/erp/Acumatica")) },
  { path: "/erp/odoo", component: lazy(() => import("./pages/erp/Odoo")) },
  { path: "/erp/sage-x3", component: lazy(() => import("./pages/erp/SageX3")) },
  // iPaaS
  { path: "/ipaas/intelliflow", component: lazy(() => import("./pages/ipaas/IntelliFlow")) },
  { path: "/ipaas/strategy", component: lazy(() => import("./pages/ipaas/Strategy")) },
  { path: "/ipaas/connectors", component: lazy(() => import("./pages/ipaas/Connectors")) },
  { path: "/ipaas/api-management", component: lazy(() => import("./pages/ipaas/ApiManagement")) },
  // Industries
  { path: "/industries/construction", component: lazy(() => import("./pages/industries/Construction")) },
  { path: "/industries/financial-services", component: lazy(() => import("./pages/industries/FinancialServices")) },
  { path: "/industries/healthcare", component: lazy(() => import("./pages/industries/Healthcare")) },
  { path: "/industries/ecommerce", component: lazy(() => import("./pages/industries/Ecommerce")) },
  { path: "/industries/family-office", component: lazy(() => import("./pages/industries/FamilyOffice")) },
  { path: "/industries/capital-markets", component: lazy(() => import("./pages/industries/CapitalMarkets")) },
  { path: "/industries/subscription-business", component: lazy(() => import("./pages/industries/SubscriptionBusiness")) },
  { path: "/industries/investment-banking", component: lazy(() => import("./pages/industries/InvestmentBanking")) },
  { path: "/industries/insurance", component: lazy(() => import("./pages/industries/Insurance")) },
  { path: "/industries/professional-services", component: lazy(() => import("./pages/industries/ProfessionalServices")) },
  // Company
  { path: "/about", component: lazy(() => import("./pages/company/About")) },
  { path: "/contact", component: lazy(() => import("./pages/company/Contact")) },
  // Services
  { path: "/services/implementation", component: lazy(() => import("./pages/services/Implementation")) },
  { path: "/services/ai-enhancement", component: lazy(() => import("./pages/services/AIEnhancement")) },
  { path: "/leverageflo", component: lazy(() => import("./pages/services/LeverageFlo")) },
  // Resources
  { path: "/case-studies", component: lazy(() => import("./pages/resources/CaseStudies")) },
  { path: "/blog", component: lazy(() => import("./pages/resources/Blog")) },
  { path: "/roi-calculator", component: lazy(() => import("./pages/resources/ROICalculator")) },
  // Catch-all
  { path: "/404", component: lazy(() => import("./pages/NotFound")) },
];
