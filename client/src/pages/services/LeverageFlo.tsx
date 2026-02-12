import { useEffect } from "react";
import { Brain, Zap, BarChart3, Users, Target, Repeat } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const features = [
  { icon: Brain, title: "AI Content Generation", description: "Generate blog posts, case studies, social media content, and email sequences tailored to your industry and audience." },
  { icon: Target, title: "Lead Scoring & Routing", description: "AI-powered lead qualification that scores prospects based on constraint severity and routes them to the right engagement tier." },
  { icon: Zap, title: "Campaign Automation", description: "Multi-channel campaign orchestration — email, social, content, and retargeting — driven by AI-optimised timing and targeting." },
  { icon: BarChart3, title: "Attribution Analytics", description: "Full-funnel attribution from first touch to closed deal. Understand which channels and content drive real revenue." },
  { icon: Users, title: "Audience Segmentation", description: "Dynamic segmentation based on behaviour, industry, company size, and constraint profile — not just demographics." },
  { icon: Repeat, title: "CRM Integration", description: "Bi-directional sync with your CRM, ERP, and marketing platforms via IntelliFlow for a single view of every prospect." },
];

export default function LeverageFlo() {
  useEffect(() => {
    document.title = "LeverageFlo.ai | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Services"
        title="LeverageFlo.ai:"
        titleAccent="AI Marketing Automation"
        description="AI-powered marketing automation purpose-built for B2B professional services. Generate content, score leads, automate campaigns, and track attribution — all integrated with your business systems."
      />

      <FeatureGrid
        tagline="Capabilities"
        title="What LeverageFlo Does"
        features={features}
        columns={3}
        accentColor="amber"
      />

      {/* Ecosystem Integration */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="glass-panel p-8 text-center" style={{ borderRadius: "var(--radius-lg)" }}>
            <span className="text-xs font-mono text-teal uppercase tracking-widest">Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Integrated With Your Entire Stack
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              LeverageFlo connects to your CRM, ERP, email platform, social channels, and analytics tools via IntelliFlow. No data silos — every interaction is tracked, attributed, and actionable.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Sage Intacct", "Salesforce", "HubSpot", "GoHighLevel", "Mailchimp", "LinkedIn", "Google Ads", "Slack"].map((tool) => (
                <span key={tool} className="glass-panel px-4 py-2 text-sm text-muted-foreground font-mono" style={{ borderRadius: "var(--radius)" }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to Automate Your"
        titleAccent="Marketing?"
        description="LeverageFlo.ai is available as part of our ongoing retainer. Start with a Constraint Diagnosis to understand your marketing and sales automation opportunities."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "View All Solutions", href: "/solutions", variant: "secondary" },
        ]}
      />
    </div>
  );
}
