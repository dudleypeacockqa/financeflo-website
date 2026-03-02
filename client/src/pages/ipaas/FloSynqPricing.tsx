/**
 * FloSynq Subscription Pricing Page
 *
 * Multi-currency pricing for FloSynq iPaaS subscription tiers with
 * region-aware display, monthly/annual toggle, and add-on pricing.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  Star,
  Crown,
  Sparkles,
  Database,
  ArrowLeftRight,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  type Region,
  REGIONS,
  REGION_CONFIGS,
} from "@shared/pricing";
import {
  FLOSYNQ_PLANS,
  FLOSYNQ_ADDONS,
  FLOSYNQ_PRICING_DISCLAIMER,
  TRIAL_DAYS,
  TRIAL_DESCRIPTION,
  formatFloSynqPrice,
  getAnnualSaving,
  type FloSynqPlanConfig,
} from "@shared/flosynq-pricing";
import PageHero from "@/components/sections/PageHero";
import CTASection from "@/components/sections/CTASection";

/* ─── Region Detection ───────────────────────────────────────── */

const CANADA_TIMEZONES = [
  "America/Toronto", "America/Vancouver", "America/Montreal",
  "America/Winnipeg", "America/Edmonton", "America/Halifax",
  "America/St_Johns", "America/Regina",
];

const US_TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "America/Phoenix", "America/Anchorage",
  "America/Adak", "Pacific/Honolulu", "America/Detroit",
  "America/Indiana", "America/Boise",
];

function detectDefaultRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("Africa/Johannesburg") || tz.startsWith("Africa/Cape") || tz.startsWith("Africa/Harare")) return "ZA";
    if (CANADA_TIMEZONES.some((ct) => tz.startsWith(ct))) return "CA";
    if (US_TIMEZONES.some((ut) => tz.startsWith(ut))) return "US";
    if (tz.startsWith("Europe/London") || tz.startsWith("Europe/Belfast")) return "UK";
    if (tz.startsWith("Europe/")) return "EU";
  } catch {
    // ignore
  }
  return "UK";
}

/* ─── Plan Icon Map ──────────────────────────────────────────── */

function PlanIcon({ plan }: { plan: FloSynqPlanConfig }) {
  const iconClass = "w-6 h-6";
  switch (plan.id) {
    case "quick_start":
      return <Zap className={`${iconClass} text-teal`} />;
    case "accelerator":
      return <Star className={`${iconClass} text-amber`} />;
    case "enterprise_premium":
      return <Crown className={`${iconClass} text-teal`} />;
  }
}

/* ─── Component ──────────────────────────────────────────────── */

const TENANT_PORTAL_URL = "https://app.flosynq.ai";

export default function FloSynqPricing() {
  useEffect(() => {
    document.title = "FloSynq Pricing | FinanceFlo.ai";
  }, []);

  const [region, setRegion] = useState<Region>(detectDefaultRegion);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="FloSynq iPaaS"
        title="Simple, Transparent"
        titleAccent="Pricing"
        description="Connect your finance systems with AI-powered integration. Every plan includes a 14-day free trial with full Accelerator-tier features — no credit card required."
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={TENANT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
            <Button
              className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
          <Link href="/ipaas/flosynq">
            <Button variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2">
              Learn About FloSynq
            </Button>
          </Link>
        </div>
      </PageHero>

      {/* Controls: Region + Billing Period */}
      <section className="py-8 border-b border-border/30">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Region selector */}
            <div className="inline-flex items-center gap-2 glass-panel px-4 py-2" style={{ borderRadius: "var(--radius)" }}>
              <Globe className="w-4 h-4 text-teal" />
              <span className="text-xs text-muted-foreground mr-1">Region:</span>
              {REGIONS.map((r) => {
                const c = REGION_CONFIGS[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 text-xs font-mono rounded transition-colors ${
                      region === r
                        ? "bg-teal text-navy-dark font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-navy-light/50"
                    }`}
                  >
                    {c.label} ({c.currencySymbol})
                  </button>
                );
              })}
            </div>

            {/* Billing period toggle */}
            <div className="inline-flex items-center glass-panel p-1" style={{ borderRadius: "var(--radius)" }}>
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 text-xs font-mono rounded transition-colors ${
                  billingPeriod === "monthly"
                    ? "bg-teal text-navy-dark font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annual")}
                className={`px-4 py-1.5 text-xs font-mono rounded transition-colors ${
                  billingPeriod === "annual"
                    ? "bg-teal text-navy-dark font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <span className="ml-1.5 text-amber text-[10px]">Save up to 17%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FLOSYNQ_PLANS.map((plan, i) => {
              const price =
                billingPeriod === "monthly" && plan.monthlyGBP !== null
                  ? formatFloSynqPrice(plan.monthlyGBP, region)
                  : formatFloSynqPrice(plan.annualGBP, region);

              const period =
                billingPeriod === "monthly" && plan.monthlyGBP !== null
                  ? "/mo"
                  : "/yr";

              const saving = getAnnualSaving(plan);
              const isAnnualOnly = plan.monthlyGBP === null;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className={`glass-panel p-6 relative flex flex-col ${
                    plan.featured ? "border-teal/40 glow-teal" : ""
                  }`}
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-teal text-navy-dark text-xs font-bold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <PlanIcon plan={plan} />
                    <div>
                      <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>
                        {price}
                      </span>
                      <span className="text-sm text-muted-foreground">{period}</span>
                    </div>
                    {isAnnualOnly && billingPeriod === "monthly" && (
                      <p className="text-xs text-amber mt-1">Annual billing only</p>
                    )}
                    {!isAnnualOnly && billingPeriod === "annual" && saving !== null && (
                      <p className="text-xs text-teal mt-1">
                        Save {saving}% vs monthly ({formatFloSynqPrice(plan.monthlyGBP, region)}/mo)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        <span className="text-foreground">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === "enterprise_premium" ? (
                    <Link href="/contact">
                      <Button
                        className="w-full gap-2 bg-navy-light border border-border/50 text-foreground hover:bg-navy-light/80"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  ) : (
                    <a href={TENANT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                      <Button
                        className={`w-full gap-2 ${
                          plan.featured
                            ? "bg-teal text-navy-dark font-bold hover:bg-teal/90"
                            : "bg-navy-light border border-border/50 text-foreground hover:bg-navy-light/80"
                        }`}
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Trial banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="glass-panel p-6 mt-8 max-w-5xl mx-auto text-center"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber" />
              <h4 className="font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                {TRIAL_DAYS}-Day Free Trial
              </h4>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {TRIAL_DESCRIPTION}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Add-Ons</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Extend Your Platform
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Unlock additional capabilities with powerful add-ons. Some features are included in higher tiers — check the plan comparison above.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FLOSYNQ_ADDONS.map((addon, i) => (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-panel p-6 flex flex-col"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {addon.id === "dataview" ? (
                    <Database className="w-6 h-6 text-teal" />
                  ) : (
                    <ArrowLeftRight className="w-6 h-6 text-teal" />
                  )}
                  <h4 className="font-semibold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                    {addon.name}
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{addon.description}</p>

                <div className="flex items-baseline gap-3 mb-3">
                  <div>
                    <span className="text-xl font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>
                      {formatFloSynqPrice(
                        billingPeriod === "monthly" ? addon.monthlyGBP : addon.annualGBP,
                        region,
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      {billingPeriod === "monthly" ? "/mo" : "/yr"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Plus className="w-3 h-3" />
                  Available for:{" "}
                  {addon.availableFor
                    .map((p) => FLOSYNQ_PLANS.find((pp) => pp.id === p)?.name ?? p)
                    .join(", ")}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Comparison</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Compare Plans
            </h2>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-3 px-4 text-muted-foreground font-normal">Feature</th>
                  {FLOSYNQ_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-3 px-4 font-semibold"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Connected Applications", values: ["2", "5", "15"] },
                  { label: "Integration Workflows", values: ["3", "10", "10 per app (150)"] },
                  { label: "Users", values: ["Unlimited admin", "Unlimited", "Unlimited admin"] },
                  { label: "Data Retention", values: ["90 days", "365 days", "Unlimited"] },
                  { label: "Sandbox Environment", values: ["✓", "✓", "✓"] },
                  { label: "Live Environment", values: ["✓", "✓", "✓"] },
                  { label: "AI-Powered Routing", values: ["—", "✓", "✓"] },
                  { label: "Anomaly Detection", values: ["—", "✓", "✓"] },
                  { label: "DataView (Live Data Explorer)", values: ["Add-on", "Included", "Included"] },
                  { label: "DataShift (Data Migration)", values: ["Add-on", "Add-on", "Included"] },
                  { label: "Custom Connectors", values: ["—", "—", "✓"] },
                  { label: "SLA Guarantees", values: ["—", "—", "✓"] },
                  { label: "Support", values: ["Email", "Priority", "Dedicated"] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/20 hover:bg-navy-light/30 transition-colors">
                    <td className="py-3 px-4 text-foreground">{row.label}</td>
                    {row.values.map((val, j) => (
                      <td key={j} className="py-3 px-4 text-center">
                        {val === "✓" ? (
                          <CheckCircle2 className="w-4 h-4 text-teal inline-block" />
                        ) : val === "—" ? (
                          <span className="text-muted-foreground/50">—</span>
                        ) : val === "Included" ? (
                          <span className="text-teal font-medium">{val}</span>
                        ) : val === "Add-on" ? (
                          <span className="text-amber text-xs font-mono">{val}</span>
                        ) : (
                          <span className="text-foreground">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-t border-border/30">
        <div className="container">
          <p className="text-xs text-muted-foreground/50 max-w-3xl mx-auto text-center italic">
            {FLOSYNQ_PRICING_DISCLAIMER}
          </p>
        </div>
      </section>

      <CTASection
        title="Ready to Automate"
        titleAccent="Your Finance Stack?"
        description="Start your 14-day free trial today. Connect your systems, build workflows, and see FloSynq in action — no credit card required."
        actions={[
          { label: "Start Free Trial", href: TENANT_PORTAL_URL },
          { label: "Book a Demo", href: "/contact", variant: "secondary" },
        ]}
      />
    </div>
  );
}
