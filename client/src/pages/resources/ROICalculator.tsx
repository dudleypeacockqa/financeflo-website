import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import PageHero from "@/components/sections/PageHero";
import {
  type Region,
  REGIONS,
  REGION_CONFIGS,
  formatCurrency,
} from "@shared/pricing";

function detectDefaultRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.startsWith("Africa/Johannesburg") || tz.startsWith("Africa/Cape") || tz.startsWith("Africa/Harare")) return "ZA";
    if (tz.startsWith("Europe/London") || tz.startsWith("Europe/Belfast")) return "UK";
    if (tz.startsWith("Europe/")) return "EU";
  } catch {
    // ignore
  }
  return "UK";
}

export default function ROICalculator() {
  useEffect(() => {
    document.title = "ROI Calculator | FinanceFlo.ai";
  }, []);

  const [region, setRegion] = useState<Region>(detectDefaultRegion);
  const [employees, setEmployees] = useState(10);
  const [manualHours, setManualHours] = useState(20);
  const [monthEndDays, setMonthEndDays] = useState(10);
  const [errorRate, setErrorRate] = useState(5);

  const config = REGION_CONFIGS[region];

  // Simple ROI calculations
  const hourlyRate = config.hourlyConsultant;
  const annualManualCost = employees * manualHours * 52 * (hourlyRate * 0.5); // Use 50% of consultant rate as employee cost
  const automationSavings = annualManualCost * 0.4; // 40% reduction
  const closeDaysSaved = Math.round(monthEndDays * 0.4);
  const errorReduction = Math.round(errorRate * 0.6);
  const projectedROI = Math.round((automationSavings / config.auditRange[0]) * 100);

  const recommendedTier = annualManualCost > config.auditRange[1] * 5 ? "Enterprise" : annualManualCost > config.auditRange[1] * 2 ? "Professional" : "Essentials";

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Resources"
        title="ROI"
        titleAccent="Calculator"
        description="Estimate the potential return on investment from AI-enhanced finance operations. Adjust the sliders to match your current situation and see projected savings."
      />

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-panel p-8" style={{ borderRadius: "var(--radius-lg)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="w-6 h-6 text-teal" />
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Your Current State</h3>
                </div>

                {/* Region Selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground block mb-2">Region</label>
                  <div className="flex gap-2">
                    {REGIONS.map((r) => {
                      const c = REGION_CONFIGS[r];
                      return (
                        <button
                          key={r}
                          onClick={() => setRegion(r)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                            region === r
                              ? "bg-teal text-navy-dark font-bold"
                              : "glass-panel text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {c.label} ({c.currencySymbol})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Finance team size</label>
                      <span className="text-sm font-mono text-teal">{employees}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={50}
                      value={employees}
                      onChange={(e) => setEmployees(Number(e.target.value))}
                      className="w-full accent-teal"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Manual hours per person/week</label>
                      <span className="text-sm font-mono text-teal">{manualHours}h</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      value={manualHours}
                      onChange={(e) => setManualHours(Number(e.target.value))}
                      className="w-full accent-teal"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Current month-end close (days)</label>
                      <span className="text-sm font-mono text-teal">{monthEndDays} days</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={20}
                      value={monthEndDays}
                      onChange={(e) => setMonthEndDays(Number(e.target.value))}
                      className="w-full accent-teal"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-foreground">Error/rework rate (%)</label>
                      <span className="text-sm font-mono text-teal">{errorRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={errorRate}
                      onChange={(e) => setErrorRate(Number(e.target.value))}
                      className="w-full accent-teal"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="glass-panel p-8 border-teal/30" style={{ borderRadius: "var(--radius-lg)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-amber" />
                  <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Projected Savings</h3>
                </div>

                <div className="space-y-6">
                  <div className="glass-panel p-5 text-center" style={{ borderRadius: "var(--radius)" }}>
                    <div className="text-3xl font-bold text-amber mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                      {formatCurrency(Math.round(automationSavings), region)}
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated annual savings</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-4 text-center" style={{ borderRadius: "var(--radius)" }}>
                      <div className="text-2xl font-bold text-teal" style={{ fontFamily: "var(--font-heading)" }}>{closeDaysSaved}</div>
                      <div className="text-xs text-muted-foreground">Days faster close</div>
                    </div>
                    <div className="glass-panel p-4 text-center" style={{ borderRadius: "var(--radius)" }}>
                      <div className="text-2xl font-bold text-teal" style={{ fontFamily: "var(--font-heading)" }}>{errorReduction}%</div>
                      <div className="text-xs text-muted-foreground">Error reduction</div>
                    </div>
                    <div className="glass-panel p-4 text-center" style={{ borderRadius: "var(--radius)" }}>
                      <div className="text-2xl font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>{projectedROI}%</div>
                      <div className="text-xs text-muted-foreground">Projected ROI (Year 1)</div>
                    </div>
                    <div className="glass-panel p-4 text-center" style={{ borderRadius: "var(--radius)" }}>
                      <div className="text-lg font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>{recommendedTier}</div>
                      <div className="text-xs text-muted-foreground">Recommended tier</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/30">
                    <p className="text-xs text-muted-foreground/70 mb-4 italic">
                      These are indicative projections based on industry averages. Actual results depend on your specific constraints and implementation scope.
                    </p>
                    <Link href="/assessment">
                      <Button className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber" style={{ fontFamily: "var(--font-heading)" }}>
                        Get a Personalised Assessment
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
