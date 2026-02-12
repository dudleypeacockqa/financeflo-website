import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import CTASection from "@/components/sections/CTASection";

interface CaseStudy {
  title: string;
  industry: string;
  product: string;
  challenge: string;
  outcome: string;
  metrics: { value: string; label: string }[];
}

const caseStudies: CaseStudy[] = [
  {
    title: "Multi-Entity Consolidation for Construction Group",
    industry: "Construction",
    product: "Sage Intacct",
    challenge: "Manual consolidation of 12 entities across 3 countries with spreadsheet-based job costing.",
    outcome: "Automated real-time consolidation with AI-powered cash flow forecasting and project profitability dashboards.",
    metrics: [
      { value: "60%", label: "Faster close" },
      { value: "£1.2M", label: "Cost savings" },
      { value: "12", label: "Entities consolidated" },
      { value: "Real-time", label: "Visibility" },
    ],
  },
  {
    title: "Regulatory Reporting Automation for Fund Manager",
    industry: "Financial Services",
    product: "Sage Intacct",
    challenge: "15 fund entities with manual regulatory reporting and quarterly audit preparation taking 3 weeks.",
    outcome: "Deployed automated consolidation with AI-powered compliance monitoring and one-click audit packs.",
    metrics: [
      { value: "75%", label: "Time saved" },
      { value: "Zero", label: "Audit findings" },
      { value: "15", label: "Funds managed" },
      { value: "1 day", label: "Audit prep" },
    ],
  },
  {
    title: "Omnichannel Commerce Platform Migration",
    industry: "E-Commerce",
    product: "Acumatica",
    challenge: "5 sales channels processed manually with weekly reconciliation and no real-time inventory visibility.",
    outcome: "Unified commerce platform with automated multi-channel reconciliation and demand forecasting.",
    metrics: [
      { value: "95%", label: "Order automation" },
      { value: "5x", label: "Faster reconciliation" },
      { value: "12%", label: "Margin improvement" },
      { value: "Real-time", label: "Inventory sync" },
    ],
  },
  {
    title: "Healthcare Trust Fund Accounting Modernisation",
    industry: "Healthcare",
    product: "Sage Intacct",
    challenge: "50+ restricted grants tracked in spreadsheets with quarterly donor reporting and manual cost allocation.",
    outcome: "Automated fund accounting with AI-powered cost allocation and real-time grant tracking dashboards.",
    metrics: [
      { value: "80%", label: "Faster reporting" },
      { value: "£500K", label: "Annual savings" },
      { value: "50+", label: "Grants automated" },
      { value: "Zero", label: "Compliance issues" },
    ],
  },
];

const industries = ["All", ...Array.from(new Set(caseStudies.map((c) => c.industry)))];
const products = ["All", ...Array.from(new Set(caseStudies.map((c) => c.product)))];

export default function CaseStudies() {
  useEffect(() => {
    document.title = "Case Studies | FinanceFlo.ai";
  }, []);

  const [industry, setIndustry] = useState("All");
  const [product, setProduct] = useState("All");

  const filtered = caseStudies.filter(
    (cs) =>
      (industry === "All" || cs.industry === industry) &&
      (product === "All" || cs.product === product)
  );

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Resources"
        title="Case"
        titleAccent="Studies"
        description="Real-world transformation results from our constraint-first approach. See how mid-market organisations have removed bottlenecks, reduced costs, and accelerated growth."
      />

      <section className="py-20">
        <div className="container">
          {/* Filters */}
          <div className="flex flex-wrap gap-6 mb-8">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest block mb-2">Industry</span>
              <div className="flex flex-wrap gap-2">
                {industries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                      industry === ind
                        ? "bg-teal text-navy-dark font-bold"
                        : "glass-panel text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest block mb-2">Product</span>
              <div className="flex flex-wrap gap-2">
                {products.map((prod) => (
                  <button
                    key={prod}
                    onClick={() => setProduct(prod)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                      product === prod
                        ? "bg-teal text-navy-dark font-bold"
                        : "glass-panel text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {prod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Case Study Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((cs, i) => (
              <motion.div
                key={cs.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                <div className="flex gap-2 mb-3">
                  <span className="text-xs font-mono text-teal/70 px-2 py-0.5 border border-teal/20 rounded">{cs.industry}</span>
                  <span className="text-xs font-mono text-amber/70 px-2 py-0.5 border border-amber/20 rounded">{cs.product}</span>
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>{cs.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-foreground">Challenge:</strong> {cs.challenge}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-foreground">Outcome:</strong> {cs.outcome}
                </p>
                <div className="grid grid-cols-4 gap-3 pt-4 border-t border-border/30">
                  {cs.metrics.map((m, j) => (
                    <div key={j} className="text-center">
                      <div className="text-lg font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>{m.value}</div>
                      <div className="text-xs text-muted-foreground">{m.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No case studies match the selected filters.</p>
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Want Results Like"
        titleAccent="These?"
        description="Take our 5-minute Constraint Diagnosis and see how we can transform your finance operations."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "View Solutions", href: "/solutions", variant: "secondary" },
        ]}
      />
    </div>
  );
}
