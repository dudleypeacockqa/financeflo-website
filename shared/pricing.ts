/**
 * Region-based pricing configuration for FinanceFlo.ai
 *
 * All pricing is indicative and excludes VAT / Sales Tax.
 * Actual costs are based on scope, additional fees for out-of-scope work,
 * and actual hours consumed. Projects are run on a time-and-materials basis.
 *
 * Market research sources (Feb 2026):
 *   UK: nicolalazzari.ai, itjobswatch.co.uk, insightfulai.co.uk
 *   EU: riseworks.io, cleveroad.com, houseblend.io
 *   ZA: payscale.com, consultancy.africa, salaryexpert.com
 *   US: nicolalazzari.ai, orientsoftware.com
 *   CA: consulting.ca, jobbank.gc.ca
 */

export type Region = "UK" | "EU" | "ZA" | "US" | "CA";

export interface RegionConfig {
  region: Region;
  label: string;
  currency: string;
  currencySymbol: string;
  locale: string;
  taxLabel: string;
  /** Hourly rate for a Consultant */
  hourlyConsultant: number;
  /** Hourly rate for a Senior Consultant */
  hourlySeniorConsultant: number;
  /** Audit / AI Operations Audit range [min, max] */
  auditRange: [number, number];
  /** Monthly retainer range [min, max] */
  retainerRange: [number, number];
  /** Market context string shown on proposals / solutions page */
  marketContext: string;
  /** Typical market range string for context (not displayed as our rate) */
  marketHourlyRange: string;
  /** Market audit range string for context */
  marketAuditRange: string;
  /** Market retainer range string for context */
  marketRetainerRange: string;
}

export const REGION_CONFIGS: Record<Region, RegionConfig> = {
  UK: {
    region: "UK",
    label: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    taxLabel: "excl. VAT",
    hourlyConsultant: 110,
    hourlySeniorConsultant: 170,
    auditRange: [5_000, 15_000],
    retainerRange: [5_000, 7_500],
    marketContext:
      "UK AI consulting rates range £80–£200/hr for freelance specialists, with strategy projects from £5k–£15k and agency retainers from £5k–£20k/month (Sources: nicolalazzari.ai, itjobswatch.co.uk, 2026).",
    marketHourlyRange: "£80–£200/hr",
    marketAuditRange: "£5,000–£15,000",
    marketRetainerRange: "£2,000–£8,000/month",
  },
  EU: {
    region: "EU",
    label: "Europe",
    currency: "EUR",
    currencySymbol: "€",
    locale: "de-DE",
    taxLabel: "excl. VAT",
    hourlyConsultant: 180,
    hourlySeniorConsultant: 180,
    auditRange: [5_000, 15_000],
    retainerRange: [5_000, 7_500],
    marketContext:
      "European AI consulting rates range €60–€140/hr, with a 20–30% premium for finance-sector expertise. ERP consulting in Western Europe runs €92–€184/hr (Sources: riseworks.io, houseblend.io, 2026).",
    marketHourlyRange: "€60–€184/hr",
    marketAuditRange: "€5,000–€15,000",
    marketRetainerRange: "€2,000–€8,000/month",
  },
  ZA: {
    region: "ZA",
    label: "South Africa",
    currency: "ZAR",
    currencySymbol: "R",
    locale: "en-ZA",
    taxLabel: "excl. VAT",
    hourlyConsultant: 975,
    hourlySeniorConsultant: 1_850,
    auditRange: [45_000, 175_000],
    retainerRange: [30_000, 75_000],
    marketContext:
      "South African IT consulting rates range R250–R1,400+/hr, with specialist AI/finance consultants commanding premium rates. Strategy consulting firms bill R4M–R5.5M per consultant per year (Sources: consultancy.africa, payscale.com, 2026).",
    marketHourlyRange: "R250–R1,400+/hr",
    marketAuditRange: "R45,000–R175,000",
    marketRetainerRange: "R30,000–R75,000/month",
  },
  US: {
    region: "US",
    label: "United States",
    currency: "USD",
    currencySymbol: "$",
    locale: "en-US",
    taxLabel: "excl. Sales Tax",
    hourlyConsultant: 150,
    hourlySeniorConsultant: 225,
    auditRange: [7_500, 20_000],
    retainerRange: [7_500, 12_500],
    marketContext:
      "US AI consulting rates range $150–$500/hr for finance-sector specialists, with strategy projects from $7.5k–$20k and agency retainers from $7.5k–$25k/month (Sources: nicolalazzari.ai, orientsoftware.com, 2026).",
    marketHourlyRange: "$150–$500/hr",
    marketAuditRange: "$7,500–$20,000",
    marketRetainerRange: "$7,500–$25,000/month",
  },
  CA: {
    region: "CA",
    label: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    locale: "en-CA",
    taxLabel: "excl. GST/HST",
    hourlyConsultant: 185,
    hourlySeniorConsultant: 275,
    auditRange: [10_000, 25_000],
    retainerRange: [10_000, 15_000],
    marketContext:
      "Canadian AI consulting rates range C$135–C$725/hr, with North American finance-sector premiums of 20–30%. Strategy projects from C$10k–C$25k and retainers from C$10k–C$25k/month (Sources: consulting.ca, jobbank.gc.ca, 2026).",
    marketHourlyRange: "C$135–C$725/hr",
    marketAuditRange: "C$10,000–C$25,000",
    marketRetainerRange: "C$10,000–C$25,000/month",
  },
};

/** Default region when none is detected */
export const DEFAULT_REGION: Region = "UK";

/** All supported regions for dropdowns */
export const REGIONS: Region[] = ["UK", "EU", "ZA", "US", "CA"];

/**
 * Format a currency value for display
 */
export function formatCurrency(
  amount: number,
  region: Region,
  options?: { compact?: boolean }
): string {
  const config = REGION_CONFIGS[region];
  if (options?.compact && amount >= 1000) {
    const k = amount / 1000;
    return `${config.currencySymbol}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a range for display (e.g. "£5,000 – £15,000")
 */
export function formatRange(
  range: [number, number],
  region: Region,
  options?: { compact?: boolean }
): string {
  return `${formatCurrency(range[0], region, options)} – ${formatCurrency(range[1], region, options)}`;
}

/**
 * Pricing disclaimer text (must appear on all proposals and pricing pages)
 */
export const PRICING_DISCLAIMER =
  "All pricing is indicative, not fixed, and excludes VAT / Sales Tax. Projects are delivered on a time-and-materials basis. Actual costs depend on project scope, and additional fees may apply for out-of-scope work based on actual hours consumed.";

/**
 * Engagement tiers with region-aware pricing
 */
export function getEngagementTiers(region: Region) {
  const config = REGION_CONFIGS[region];
  return [
    {
      name: "AI Operations Audit",
      price: formatRange(config.auditRange, region),
      description:
        "Current-state process map, ROI stack, prioritised roadmap, and implementation plan. The essential starting point.",
      tag: "Start Here",
      featured: true,
    },
    {
      name: "Quick Wins Sprint",
      price: "Scoped from audit",
      description:
        "Implement top 2–3 highest-ROI automations identified in the audit. Prove value in 4–8 weeks.",
      tag: "Phase 2",
      featured: false,
    },
    {
      name: "Ongoing Retainer",
      price: `${formatRange(config.retainerRange, region)}/mo`,
      description:
        "System health monitoring, performance optimisation, security management, and strategic updates.",
      tag: "Phase 3",
      featured: false,
    },
  ];
}
