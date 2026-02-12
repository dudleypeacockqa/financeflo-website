export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export interface NavDropdown {
  label: string;
  groups: NavGroup[];
}

export interface NavItem {
  label: string;
  href?: string;
  dropdown?: NavGroup[];
}

export const navItems: NavItem[] = [
  {
    label: "Solutions",
    dropdown: [
      {
        heading: "ERP Solutions",
        links: [
          { label: "Sage Intacct", href: "/erp/sage-intacct", description: "AICPA-preferred cloud financial management" },
          { label: "Acumatica", href: "/erp/acumatica", description: "Flexible cloud ERP for growing businesses" },
          { label: "Odoo", href: "/erp/odoo", description: "Open-source modular business suite" },
          { label: "Sage X3", href: "/erp/sage-x3", description: "Enterprise resource planning at scale" },
        ],
      },
      {
        heading: "iPaaS & Integration",
        links: [
          { label: "IntelliFlow iPaaS", href: "/ipaas/intelliflow", description: "AI-powered integration platform" },
          { label: "Integration Strategy", href: "/ipaas/strategy", description: "End-to-end integration methodology" },
          { label: "Connectors", href: "/ipaas/connectors", description: "Pre-built connector library" },
          { label: "API Management", href: "/ipaas/api-management", description: "Secure API governance" },
        ],
      },
      {
        heading: "Services",
        links: [
          { label: "Implementation", href: "/services/implementation", description: "ERP deployment & migration" },
          { label: "AI Enhancement", href: "/services/ai-enhancement", description: "Custom AI solutions for finance" },
          { label: "LeverageFlo.ai", href: "/leverageflo", description: "AI marketing automation" },
        ],
      },
    ],
  },
  {
    label: "Industries",
    dropdown: [
      {
        heading: "Sectors We Serve",
        links: [
          { label: "Construction", href: "/industries/construction", description: "Job costing, project accounting & compliance" },
          { label: "Financial Services", href: "/industries/financial-services", description: "Multi-entity consolidation & regulatory reporting" },
          { label: "Healthcare", href: "/industries/healthcare", description: "Grant management & fund accounting" },
          { label: "E-Commerce", href: "/industries/ecommerce", description: "Omnichannel finance & inventory" },
        ],
      },
    ],
  },
  { label: "ADAPT Framework", href: "/adapt-framework" },
  { label: "How We Deliver", href: "/delivery" },
  {
    label: "Resources",
    dropdown: [
      {
        heading: "Learn",
        links: [
          { label: "Case Studies", href: "/case-studies", description: "Real-world transformation results" },
          { label: "Blog", href: "/blog", description: "Insights on AI & finance" },
          { label: "AI in Finance Report", href: "/lead-magnet", description: "Free downloadable report" },
          { label: "Free Book", href: "/free-book", description: "Get 'Connected Intelligence' free" },
        ],
      },
      {
        heading: "Engage",
        links: [
          { label: "Workshop", href: "/workshop", description: "Hands-on constraint diagnosis" },
          { label: "Assessment", href: "/assessment", description: "AI readiness assessment" },
          { label: "ROI Calculator", href: "/roi-calculator", description: "Calculate your potential savings" },
        ],
      },
    ],
  },
  { label: "About", href: "/about" },
];

export const footerColumns = [
  {
    heading: "ERP Solutions",
    links: [
      { label: "Sage Intacct", href: "/erp/sage-intacct" },
      { label: "Acumatica", href: "/erp/acumatica" },
      { label: "Odoo", href: "/erp/odoo" },
      { label: "Sage X3", href: "/erp/sage-x3" },
      { label: "All Solutions", href: "/solutions" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "IntelliFlow iPaaS", href: "/ipaas/intelliflow" },
      { label: "Implementation", href: "/services/implementation" },
      { label: "AI Enhancement", href: "/services/ai-enhancement" },
      { label: "LeverageFlo.ai", href: "/leverageflo" },
      { label: "ADAPT Framework", href: "/adapt-framework" },
    ],
  },
  {
    heading: "Industries",
    links: [
      { label: "Construction", href: "/industries/construction" },
      { label: "Financial Services", href: "/industries/financial-services" },
      { label: "Healthcare", href: "/industries/healthcare" },
      { label: "E-Commerce", href: "/industries/ecommerce" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Case Studies", href: "/case-studies" },
      { label: "Blog", href: "/blog" },
      { label: "ROI Calculator", href: "/roi-calculator" },
      { label: "AI in Finance Report", href: "/lead-magnet" },
      { label: "Free Book", href: "/free-book" },
      { label: "Workshop", href: "/workshop" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Assessment", href: "/assessment" },
    ],
  },
];
