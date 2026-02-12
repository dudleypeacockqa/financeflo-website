import { describe, expect, it } from "vitest";
import {
  type Region,
  REGION_CONFIGS,
  REGIONS,
  DEFAULT_REGION,
  formatCurrency,
  formatRange,
  getEngagementTiers,
  PRICING_DISCLAIMER,
} from "./pricing";

// ─── REGION CONFIG VALIDATION ──────────────────────────────────────────────

describe("REGION_CONFIGS", () => {
  it("has configs for all supported regions", () => {
    expect(REGIONS).toEqual(["UK", "EU", "ZA", "US", "CA"]);
    for (const r of REGIONS) {
      expect(REGION_CONFIGS[r]).toBeDefined();
      expect(REGION_CONFIGS[r].region).toBe(r);
    }
  });

  it("default region is UK", () => {
    expect(DEFAULT_REGION).toBe("UK");
  });

  it("UK config has correct currency and rates", () => {
    const uk = REGION_CONFIGS.UK;
    expect(uk.currency).toBe("GBP");
    expect(uk.currencySymbol).toBe("£");
    expect(uk.locale).toBe("en-GB");
    expect(uk.taxLabel).toBe("excl. VAT");
    expect(uk.hourlyConsultant).toBe(110);
    expect(uk.hourlySeniorConsultant).toBe(170);
    expect(uk.auditRange).toEqual([5_000, 15_000]);
    expect(uk.retainerRange).toEqual([5_000, 7_500]);
  });

  it("EU config has correct currency and rates", () => {
    const eu = REGION_CONFIGS.EU;
    expect(eu.currency).toBe("EUR");
    expect(eu.currencySymbol).toBe("€");
    expect(eu.hourlyConsultant).toBe(180);
    expect(eu.hourlySeniorConsultant).toBe(180);
    expect(eu.auditRange).toEqual([5_000, 15_000]);
    expect(eu.retainerRange).toEqual([5_000, 7_500]);
  });

  it("ZA config has correct currency and rates", () => {
    const za = REGION_CONFIGS.ZA;
    expect(za.currency).toBe("ZAR");
    expect(za.currencySymbol).toBe("R");
    expect(za.locale).toBe("en-ZA");
    expect(za.hourlyConsultant).toBe(975);
    expect(za.hourlySeniorConsultant).toBe(1_850);
    expect(za.auditRange).toEqual([45_000, 175_000]);
    expect(za.retainerRange).toEqual([30_000, 75_000]);
  });

  it("US config has correct currency and rates", () => {
    const us = REGION_CONFIGS.US;
    expect(us.currency).toBe("USD");
    expect(us.currencySymbol).toBe("$");
    expect(us.locale).toBe("en-US");
    expect(us.taxLabel).toBe("excl. Sales Tax");
    expect(us.hourlyConsultant).toBe(150);
    expect(us.hourlySeniorConsultant).toBe(225);
    expect(us.auditRange).toEqual([7_500, 20_000]);
    expect(us.retainerRange).toEqual([7_500, 12_500]);
  });

  it("CA config has correct currency and rates", () => {
    const ca = REGION_CONFIGS.CA;
    expect(ca.currency).toBe("CAD");
    expect(ca.currencySymbol).toBe("C$");
    expect(ca.locale).toBe("en-CA");
    expect(ca.taxLabel).toBe("excl. GST/HST");
    expect(ca.hourlyConsultant).toBe(185);
    expect(ca.hourlySeniorConsultant).toBe(275);
    expect(ca.auditRange).toEqual([10_000, 25_000]);
    expect(ca.retainerRange).toEqual([10_000, 15_000]);
  });

  it("all configs have non-empty market context strings", () => {
    for (const r of REGIONS) {
      const c = REGION_CONFIGS[r];
      expect(c.marketContext.length).toBeGreaterThan(20);
      expect(c.marketHourlyRange.length).toBeGreaterThan(0);
      expect(c.marketAuditRange.length).toBeGreaterThan(0);
      expect(c.marketRetainerRange.length).toBeGreaterThan(0);
    }
  });
});

// ─── FORMAT CURRENCY ───────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats GBP correctly", () => {
    const result = formatCurrency(5000, "UK");
    expect(result).toContain("5");
    expect(result).toContain("000");
    // Should include pound sign or GBP indicator
    expect(result).toMatch(/£|GBP/);
  });

  it("formats EUR correctly", () => {
    const result = formatCurrency(15000, "EU");
    expect(result).toContain("15");
    // Should include euro sign or EUR indicator
    expect(result).toMatch(/€|EUR/);
  });

  it("formats ZAR correctly", () => {
    const result = formatCurrency(45000, "ZA");
    expect(result).toContain("45");
    // Should include Rand sign or ZAR indicator
    expect(result).toMatch(/R|ZAR/);
  });

  it("formats USD correctly", () => {
    const result = formatCurrency(7500, "US");
    expect(result).toContain("7");
    expect(result).toContain("500");
    expect(result).toMatch(/\$|USD/);
  });

  it("formats CAD correctly", () => {
    const result = formatCurrency(10000, "CA");
    expect(result).toContain("10");
    expect(result).toMatch(/\$|CAD/);
  });

  it("compact mode abbreviates large numbers", () => {
    const result = formatCurrency(150000, "UK", { compact: true });
    expect(result).toContain("150k");
    expect(result).toContain("£");
  });

  it("compact mode handles exact thousands", () => {
    const result = formatCurrency(5000, "UK", { compact: true });
    expect(result).toBe("£5k");
  });

  it("compact mode handles non-exact thousands", () => {
    const result = formatCurrency(7500, "UK", { compact: true });
    expect(result).toBe("£7.5k");
  });

  it("does not compact values below 1000", () => {
    const result = formatCurrency(500, "UK", { compact: true });
    // Should use standard formatting, not compact
    expect(result).not.toContain("k");
  });

  it("handles zero correctly", () => {
    const result = formatCurrency(0, "UK");
    expect(result).toBeDefined();
  });
});

// ─── FORMAT RANGE ──────────────────────────────────────────────────────────

describe("formatRange", () => {
  it("formats UK audit range correctly", () => {
    const result = formatRange([5000, 15000], "UK");
    expect(result).toContain("5");
    expect(result).toContain("15");
    expect(result).toContain("–");
  });

  it("formats ZA audit range correctly", () => {
    const result = formatRange([45000, 175000], "ZA");
    expect(result).toContain("45");
    expect(result).toContain("175");
    expect(result).toContain("–");
  });

  it("compact mode works for ranges", () => {
    const result = formatRange([5000, 15000], "UK", { compact: true });
    expect(result).toContain("5k");
    expect(result).toContain("15k");
  });
});

// ─── ENGAGEMENT TIERS ──────────────────────────────────────────────────────

describe("getEngagementTiers", () => {
  it("returns 3 tiers for UK", () => {
    const tiers = getEngagementTiers("UK");
    expect(tiers).toHaveLength(3);
    expect(tiers[0].name).toBe("AI Operations Audit");
    expect(tiers[1].name).toBe("Quick Wins Sprint");
    expect(tiers[2].name).toBe("Ongoing Retainer");
  });

  it("UK audit tier has correct price range", () => {
    const tiers = getEngagementTiers("UK");
    const audit = tiers[0];
    expect(audit.price).toContain("5");
    expect(audit.price).toContain("15");
    expect(audit.featured).toBe(true);
    expect(audit.tag).toBe("Start Here");
  });

  it("ZA audit tier uses ZAR pricing", () => {
    const tiers = getEngagementTiers("ZA");
    const audit = tiers[0];
    expect(audit.price).toMatch(/R|ZAR/);
    expect(audit.price).toContain("45");
    expect(audit.price).toContain("175");
  });

  it("EU retainer tier uses EUR pricing", () => {
    const tiers = getEngagementTiers("EU");
    const retainer = tiers[2];
    expect(retainer.price).toMatch(/€|EUR/);
    expect(retainer.price).toContain("5");
    expect(retainer.price).toContain("7");
  });

  it("US audit tier uses USD pricing", () => {
    const tiers = getEngagementTiers("US");
    const audit = tiers[0];
    expect(audit.price).toMatch(/\$|USD/);
    expect(audit.price).toContain("7");
    expect(audit.price).toContain("20");
  });

  it("CA retainer tier uses CAD pricing", () => {
    const tiers = getEngagementTiers("CA");
    const retainer = tiers[2];
    expect(retainer.price).toMatch(/\$|CAD/);
    expect(retainer.price).toContain("10");
    expect(retainer.price).toContain("15");
  });

  it("Quick Wins Sprint is always scoped from audit", () => {
    for (const r of REGIONS) {
      const tiers = getEngagementTiers(r);
      expect(tiers[1].price).toBe("Scoped from audit");
    }
  });
});

// ─── PRICING DISCLAIMER ───────────────────────────────────────────────────

describe("PRICING_DISCLAIMER", () => {
  it("contains required legal language", () => {
    expect(PRICING_DISCLAIMER).toContain("indicative");
    expect(PRICING_DISCLAIMER).toContain("not fixed");
    expect(PRICING_DISCLAIMER).toContain("time-and-materials");
    expect(PRICING_DISCLAIMER).toContain("out-of-scope");
    expect(PRICING_DISCLAIMER).toContain("actual hours consumed");
    expect(PRICING_DISCLAIMER).toMatch(/VAT|Sales Tax/);
  });
});
