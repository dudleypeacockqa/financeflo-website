import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid, { type FeatureItem } from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

export interface IndustryData {
  pageTitle: string;
  tagline: string;
  title: string;
  titleAccent: string;
  description: string;
  painPoints: FeatureItem[];
  solutions: { title: string; description: string; href: string }[];
  caseStudy: {
    company: string;
    challenge: string;
    outcome: string;
    metrics: { value: string; label: string }[];
  };
  ctaTitle: string;
  ctaTitleAccent?: string;
  ctaDescription: string;
}

export default function IndustryPage({ data }: { data: IndustryData }) {
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
      />

      {/* Pain Points */}
      <FeatureGrid
        tagline="Industry Challenges"
        title="Pain Points We Solve"
        features={data.painPoints}
        columns={2}
        accentColor="amber"
      />

      {/* Solutions */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Our Approach</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Recommended Solutions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.solutions.map((sol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors flex flex-col"
                style={{ borderRadius: "var(--radius)" }}
              >
                <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{sol.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{sol.description}</p>
                <Link href={sol.href}>
                  <Button variant="outline" size="sm" className="border-teal/40 text-teal hover:bg-teal/10 gap-2 w-full">
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Results</span>
            <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Case Study
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-8"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <h3 className="text-xl font-bold mb-2 text-teal" style={{ fontFamily: "var(--font-heading)" }}>
              {data.caseStudy.company}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              <strong className="text-foreground">Challenge:</strong> {data.caseStudy.challenge}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              <strong className="text-foreground">Outcome:</strong> {data.caseStudy.outcome}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.caseStudy.metrics.map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-amber" style={{ fontFamily: "var(--font-heading)" }}>{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection
        title={data.ctaTitle}
        titleAccent={data.ctaTitleAccent}
        description={data.ctaDescription}
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "Explore All Industries", href: "/solutions", variant: "secondary" },
        ]}
      />
    </div>
  );
}
