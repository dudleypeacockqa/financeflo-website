export interface SiteBrandConfig {
  displayName: string;
  siteUrl: string;
  logo: {
    leading: string;
    accent: string;
    suffix: string;
  };
  footerDescription: string;
  footerTagline: string;
  contactEmail: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
}

const FINANCEFLO_BRAND: SiteBrandConfig = {
  displayName: "FinanceFlo.ai",
  siteUrl: "https://financeflo.ai",
  logo: {
    leading: "Finance",
    accent: "Flo",
    suffix: ".ai",
  },
  footerDescription:
    "AI-powered financial transformation for mid-market companies. ERP implementation, iPaaS integration, and custom AI solutions.",
  footerTagline: "Powered by Sage Intacct · Built with AI",
  contactEmail: "dudley@financeflo.ai",
  primaryCtaLabel: "AI Readiness Assessment",
  primaryCtaHref: "/assessment",
};

const FLOSYNQ_BRAND: SiteBrandConfig = {
  displayName: "FloSynq.ai",
  siteUrl: "https://flosynq.ai",
  logo: {
    leading: "Flo",
    accent: "Synq",
    suffix: ".ai",
  },
  footerDescription:
    "AI-powered integration platform for ERP, CRM, banking, payroll, and operational systems that need reliable real-time data flow.",
  footerTagline: "AI-native iPaaS for modern operations",
  contactEmail: "dudley@financeflo.ai",
  primaryCtaLabel: "Assess Your Integration Needs",
  primaryCtaHref: "/assessment",
};

function normaliseHostname(hostname: string) {
  return hostname.toLowerCase().replace(/\.$/, "");
}

export function getCurrentHostname() {
  if (typeof window === "undefined") {
    return "";
  }

  return normaliseHostname(window.location.hostname);
}

export function isFloSynqHost(hostname = getCurrentHostname()) {
  const currentHost = normaliseHostname(hostname);

  return currentHost === "flosynq.ai" || currentHost === "www.flosynq.ai";
}

export function getSiteBrand(hostname = getCurrentHostname()) {
  return isFloSynqHost(hostname) ? FLOSYNQ_BRAND : FINANCEFLO_BRAND;
}

export function replaceBrandInTitle(title: string, hostname = getCurrentHostname()) {
  if (!isFloSynqHost(hostname) || !title) {
    return title;
  }

  return title.replaceAll("FinanceFlo.ai", "FloSynq.ai");
}
