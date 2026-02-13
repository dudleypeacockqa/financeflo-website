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
  // Auth
  { path: "/admin/login", component: lazy(() => import("./pages/AdminLogin")) },
  // Admin (sidebar layout)
  { path: "/admin", component: lazy(() => import("./pages/Admin")) },
  { path: "/admin/leads", component: lazy(() => import("./pages/admin/Leads")) },
  { path: "/admin/lead-research", component: lazy(() => import("./pages/admin/LeadResearch")) },
  { path: "/admin/batch-monitor", component: lazy(() => import("./pages/admin/BatchMonitor")) },
  { path: "/admin/lead-profile/:id", component: lazy(() => import("./pages/admin/LeadProfile")) },
  { path: "/admin/assessments", component: lazy(() => import("./pages/admin/Assessments")) },
  { path: "/admin/proposals", component: lazy(() => import("./pages/admin/Proposals")) },
  { path: "/admin/workshops", component: lazy(() => import("./pages/admin/Workshops")) },
  { path: "/admin/webhooks", component: lazy(() => import("./pages/admin/WebhookEvents")) },
  { path: "/admin/knowledge-base", component: lazy(() => import("./pages/admin/KnowledgeBase")) },
  { path: "/admin/prompt-manager", component: lazy(() => import("./pages/admin/PromptManager")) },
  { path: "/admin/jobs", component: lazy(() => import("./pages/admin/BackgroundJobs")) },
  { path: "/admin/campaigns", component: lazy(() => import("./pages/admin/Campaigns")) },
  { path: "/admin/campaign-builder", component: lazy(() => import("./pages/admin/CampaignBuilder")) },
  { path: "/admin/campaign/:id", component: lazy(() => import("./pages/admin/CampaignDetail")) },
  // Phase 4: Sales Pipeline & AIBA
  { path: "/admin/pipeline", component: lazy(() => import("./pages/admin/Pipeline")) },
  { path: "/admin/pipeline-metrics", component: lazy(() => import("./pages/admin/PipelineMetrics")) },
  { path: "/admin/deal/:id", component: lazy(() => import("./pages/admin/DealDetail")) },
  { path: "/admin/aiba-diagnostics", component: lazy(() => import("./pages/admin/AIBADiagnostic")) },
  // Phase 5: Marketing Automation
  { path: "/admin/workflows", component: lazy(() => import("./pages/admin/Workflows")) },
  { path: "/admin/workflow-builder", component: lazy(() => import("./pages/admin/WorkflowBuilder")) },
  { path: "/admin/email-templates", component: lazy(() => import("./pages/admin/EmailTemplates")) },
  { path: "/admin/marketing-metrics", component: lazy(() => import("./pages/admin/MarketingMetrics")) },
  // AIBA (public)
  { path: "/aiba", component: lazy(() => import("./pages/aiba/Overview")) },
  { path: "/aiba/diagnostic", component: lazy(() => import("./pages/aiba/Diagnostic")) },
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
