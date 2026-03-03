/**
 * FloSynq iPaaS Subscription Pricing
 *
 * Multi-currency pricing for FloSynq integration platform subscription tiers.
 * GBP is the base currency. Exchange rates (fixed for display):
 *   USD $1.25 : £1 · CAD CA$1.50 : £1 · ZAR R25 : £1 · EUR €1.10 : £1
 *
 * All Stripe/Clerk charges are in USD. Display prices are converted at the
 * stated exchange rates. Disclaimer required on all pricing pages.
 */

import { type Region, REGION_CONFIGS, formatCurrency } from "./pricing";

/* ─── Plan Tiers ─────────────────────────────────────────────── */

export type FloSynqPlan = "quick_start" | "accelerator" | "enterprise_premium";

export interface FloSynqPlanConfig {
  id: FloSynqPlan;
  name: string;
  tagline: string;
  /** null = annual only (no monthly option) */
  monthlyGBP: number | null;
  annualGBP: number;
  applications: number | string;
  workflows: number | string;
  users: string;
  dataRetention: string;
  dataViewIncluded: boolean;
  dataShiftIncluded: boolean;
  features: string[];
  /** Whether to highlight this plan as recommended */
  featured: boolean;
  cta: string;
  ctaVariant: "primary" | "secondary";
}

export const FLOSYNQ_PLANS: FloSynqPlanConfig[] = [
  {
    id: "quick_start",
    name: "Quick Start",
    tagline: "Get connected fast",
    monthlyGBP: 295,
    annualGBP: 2_950,
    applications: 2,
    workflows: 3,
    users: "Unlimited admin",
    dataRetention: "90 days",
    dataViewIncluded: false,
    dataShiftIncluded: false,
    features: [
      "2 connected applications",
      "3 integration workflows",
      "Unlimited admin users",
      "90-day data retention",
      "Real-time sync",
      "Email support",
      "Sandbox environment",
    ],
    featured: false,
    cta: "Start Free Trial",
    ctaVariant: "secondary",
  },
  {
    id: "accelerator",
    name: "Accelerator",
    tagline: "Scale your integrations",
    monthlyGBP: null, // annual only
    annualGBP: 5_250,
    applications: 5,
    workflows: 10,
    users: "Unlimited",
    dataRetention: "365 days",
    dataViewIncluded: true,
    dataShiftIncluded: false,
    features: [
      "5 connected applications",
      "10 integration workflows",
      "Unlimited users",
      "365-day data retention",
      "DataView live data explorer included",
      "AI-powered routing & anomaly detection",
      "Priority support",
      "Sandbox + Live environments",
    ],
    featured: true,
    cta: "Start Free Trial",
    ctaVariant: "primary",
  },
  {
    id: "enterprise_premium",
    name: "Enterprise Premium",
    tagline: "Full platform access",
    monthlyGBP: 995,
    annualGBP: 12_750,
    applications: 15,
    workflows: "10 per app (150 total)",
    users: "Unlimited admin",
    dataRetention: "Unlimited",
    dataViewIncluded: true,
    dataShiftIncluded: true,
    features: [
      "15 connected applications",
      "10 workflows per app (150 total)",
      "Unlimited admin users",
      "Unlimited data retention",
      "DataView live data explorer included",
      "DataShift data migration included",
      "AI-powered routing & anomaly detection",
      "Dedicated support & onboarding",
      "Custom connector development",
      "SLA guarantees",
    ],
    featured: false,
    cta: "Contact Sales",
    ctaVariant: "secondary",
  },
];

/* ─── Add-Ons ────────────────────────────────────────────────── */

export interface FloSynqAddon {
  id: string;
  name: string;
  description: string;
  monthlyGBP: number;
  annualGBP: number;
  /** Plans that can purchase this add-on (not included by default) */
  availableFor: FloSynqPlan[];
}

export const FLOSYNQ_ADDONS: FloSynqAddon[] = [
  {
    id: "dataview",
    name: "DataView",
    description:
      "Live data explorer — view, filter, search, and export data from any connected application in real-time without moving the data.",
    monthlyGBP: 99,
    annualGBP: 995,
    availableFor: ["quick_start"],
  },
  {
    id: "datashift",
    name: "DataShift",
    description:
      "Universal data migration — extract, transform, and load data between any connected systems with AI-assisted field mapping.",
    monthlyGBP: 199,
    annualGBP: 1_995,
    availableFor: ["quick_start", "accelerator"],
  },
];

/* ─── Exchange Rates (GBP base) ──────────────────────────────── */

const EXCHANGE_RATES: Record<Region, number> = {
  UK: 1, // GBP (base)
  US: 1.25, // USD
  CA: 1.5, // CAD
  ZA: 25, // ZAR
  EU: 1.1, // EUR
};

/* ─── Price Conversion Utilities ─────────────────────────────── */

/**
 * Convert a GBP price to the target region's currency.
 */
export function convertToRegion(gbpAmount: number, region: Region): number {
  const rate = EXCHANGE_RATES[region];
  return Math.round(gbpAmount * rate);
}

/**
 * Format a FloSynq subscription price for display.
 * Returns the formatted price string in the region's currency.
 */
export function formatFloSynqPrice(
  gbpAmount: number | null,
  region: Region,
  options?: { compact?: boolean },
): string {
  if (gbpAmount === null) return "—";
  const converted = convertToRegion(gbpAmount, region);
  return formatCurrency(converted, region, options);
}

/**
 * Get the annual saving percentage when comparing monthly vs annual billing.
 */
export function getAnnualSaving(plan: FloSynqPlanConfig): number | null {
  if (plan.monthlyGBP === null) return null;
  const monthlyTotal = plan.monthlyGBP * 12;
  const saving = ((monthlyTotal - plan.annualGBP) / monthlyTotal) * 100;
  return Math.round(saving);
}

/* ─── Disclaimer ─────────────────────────────────────────────── */

export const FLOSYNQ_PRICING_DISCLAIMER =
  "All prices exclude VAT / Sales Tax. Subscription charges are processed in USD at the prevailing exchange rate at time of purchase. Displayed prices in local currencies are indicative based on fixed exchange rates and may differ from the actual charge.";

/* ─── Trial ──────────────────────────────────────────────────── */

export const TRIAL_DAYS = 14;
export const TRIAL_DESCRIPTION =
  "Every plan starts with a 14-day free trial with full Accelerator-tier features. No credit card required.";
