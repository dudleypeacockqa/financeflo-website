import { useEffect } from "react";
import { Shield, Lock, BarChart3, Cog, Eye, Zap } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import FeatureGrid from "@/components/sections/FeatureGrid";
import CTASection from "@/components/sections/CTASection";

const features = [
  { icon: Shield, title: "API Gateway", description: "Centralised gateway that manages authentication, rate limiting, and routing for all your API endpoints." },
  { icon: Lock, title: "OAuth 2.0 & API Keys", description: "Multiple authentication methods with granular permission controls and automatic token rotation." },
  { icon: BarChart3, title: "Usage Analytics", description: "Real-time dashboards showing API call volumes, response times, error rates, and cost attribution." },
  { icon: Cog, title: "Rate Limiting & Throttling", description: "Protect your systems from overload with configurable rate limits per client, per endpoint, and per time window." },
  { icon: Eye, title: "Monitoring & Alerting", description: "Proactive monitoring with automated alerts for anomalies, downtime, and performance degradation." },
  { icon: Zap, title: "Version Management", description: "Run multiple API versions in parallel with automatic deprecation notices and migration tooling." },
];

const securityFeatures = [
  "End-to-end TLS encryption for all API traffic",
  "IP whitelisting and geo-restriction capabilities",
  "Request/response payload validation and sanitisation",
  "Comprehensive audit logging for compliance",
  "DDoS protection and bot detection",
  "SOC 2 Type II compliant infrastructure",
];

export default function ApiManagement() {
  useEffect(() => {
    document.title = "API Management | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="iPaaS & Integration"
        title="API Management:"
        titleAccent="Secure Governance"
        description="Control, monitor, and secure every API in your ecosystem. From authentication and rate limiting to analytics and version management — govern your integrations with confidence."
      />

      <FeatureGrid
        tagline="Capabilities"
        title="Full API Lifecycle Management"
        features={features}
        columns={3}
        accentColor="teal"
      />

      {/* Security Section */}
      <section className="py-20 border-t border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xs font-mono text-amber uppercase tracking-widest">Security</span>
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                Enterprise-Grade API Security
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Financial data demands the highest level of protection. Our API management layer implements defence-in-depth security that meets and exceeds regulatory requirements for financial services.
              </p>
              <div className="space-y-3">
                {securityFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feat}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="glass-panel p-8"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <h3 className="text-xl font-bold mb-4 text-teal" style={{ fontFamily: "var(--font-heading)" }}>
                Why API Governance Matters
              </h3>
              <div className="space-y-4">
                {[
                  { stat: "83%", desc: "of web traffic is API-based — your APIs are your attack surface" },
                  { stat: "5x", desc: "increase in API-related breaches over the past 3 years" },
                  { stat: "£3.4M", desc: "average cost of a data breach in financial services (UK)" },
                  { stat: "Zero", desc: "tolerance for unmonitored API endpoints in regulated industries" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg font-bold text-amber font-mono shrink-0">{item.stat}</span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <CTASection
        title="Secure Your"
        titleAccent="API Ecosystem?"
        description="Start with a Constraint Diagnosis to audit your current API landscape and identify security gaps before they become breaches."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "IntelliFlow Platform", href: "/ipaas/intelliflow", variant: "secondary" },
        ]}
      />
    </div>
  );
}
