import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid, { type FeatureItem } from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

export interface ERPProductData {
  pageTitle: string;
  tagline: string;
  title: string;
  titleAccent: string;
  badge?: string;
  description: string;
  overviewDescription: string;
  stats: { value: string; label: string }[];
  features: FeatureItem[];
  useCases: { title: string; description: string }[];
  ctaTitle: string;
  ctaTitleAccent?: string;
  ctaDescription: string;
}

export default function ERPProductPage({ data }: { data: ERPProductData }) {
  useEffect(() => {
    document.title = `${data.pageTitle} | FinanceFlo.ai`;
  }, [data.pageTitle]);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline={data.tagline}
        title={data.title}
        titleAccent={data.titleAccent}
        description={data.description}
        badge={data.badge}
      />

      {/* Overview + Stats */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{data.overviewDescription}</p>
              <Link href="/assessment">
                <Button className="mt-6 bg-amber text-navy-dark font-semibold hover:bg-amber/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Get a Personalised Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 gap-4"
            >
              {data.stats.map((stat, i) => (
                <div key={i} className="glass-panel p-5 text-center" style={{ borderRadius: "var(--radius)" }}>
                  <div className="text-2xl font-bold text-teal mb-1" style={{ fontFamily: "var(--font-heading)" }}>{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureGrid
        tagline="Key Capabilities"
        title="Features That Matter"
        features={data.features}
        columns={3}
        accentColor="teal"
      />

      {/* Use Cases */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Use Cases</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Built for Real Scenarios
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.useCases.map((uc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>{uc.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title={data.ctaTitle}
        titleAccent={data.ctaTitleAccent}
        description={data.ctaDescription}
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "View All Solutions", href: "/solutions", variant: "secondary" },
        ]}
      />
    </div>
  );
}
