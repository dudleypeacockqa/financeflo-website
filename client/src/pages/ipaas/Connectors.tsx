import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import CTASection from "@/components/sections/CTASection";

interface Connector {
  name: string;
  category: string;
  description: string;
}

const connectors: Connector[] = [
  { name: "Sage Intacct", category: "ERP", description: "Full bi-directional sync with GL, AP, AR, and reporting modules" },
  { name: "Acumatica", category: "ERP", description: "Real-time integration with financials, inventory, and projects" },
  { name: "Odoo", category: "ERP", description: "Connect accounting, CRM, inventory, and manufacturing" },
  { name: "Sage X3", category: "ERP", description: "Enterprise-grade integration with manufacturing and supply chain" },
  { name: "Salesforce", category: "CRM", description: "Sync contacts, opportunities, invoices, and revenue data" },
  { name: "HubSpot", category: "CRM", description: "Marketing attribution, lead-to-revenue tracking, and billing sync" },
  { name: "Stripe", category: "Payments", description: "Automated payment reconciliation and revenue recognition" },
  { name: "GoCardless", category: "Payments", description: "Direct debit management and payment status synchronisation" },
  { name: "Xero", category: "Accounting", description: "Migrate from or integrate with Xero accounting data" },
  { name: "Dext", category: "Accounting", description: "Automated receipt capture and expense categorisation" },
  { name: "Shopify", category: "E-Commerce", description: "Orders, inventory, refunds, and multi-channel sales data" },
  { name: "WooCommerce", category: "E-Commerce", description: "WordPress commerce data sync with financial systems" },
  { name: "Plaid", category: "Banking", description: "Bank feed integration for automated reconciliation" },
  { name: "Open Banking", category: "Banking", description: "PSD2-compliant bank connections for real-time cash visibility" },
  { name: "Slack", category: "Productivity", description: "Automated notifications, approvals, and workflow triggers" },
  { name: "Microsoft 365", category: "Productivity", description: "SharePoint, Teams, and Outlook integration for document management" },
];

const categories = ["All", ...Array.from(new Set(connectors.map((c) => c.category)))];

export default function Connectors() {
  useEffect(() => {
    document.title = "Connectors | FinanceFlo.ai";
  }, []);

  const [active, setActive] = useState("All");
  const filtered = active === "All" ? connectors : connectors.filter((c) => c.category === active);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="iPaaS & Integration"
        title="Connector"
        titleAccent="Library"
        description="Pre-built connectors for the systems that matter most to mid-market finance teams. Every connector includes data mapping, error handling, and monitoring out of the box."
      />

      {/* Filter + Grid */}
      <section className="py-20">
        <div className="container">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-2 text-sm font-mono rounded-md transition-colors ${
                  active === cat
                    ? "bg-teal text-navy-dark font-bold"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Connector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((conn, i) => (
              <motion.div
                key={conn.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="glass-panel p-5 group hover:border-teal/30 transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>{conn.name}</h4>
                  <span className="text-xs font-mono text-teal/70 px-2 py-0.5 border border-teal/20 rounded">{conn.category}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{conn.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Need a Custom"
        titleAccent="Connector?"
        description="Don't see your system? We build custom connectors as part of every integration project. Start with a Constraint Diagnosis to map your integration needs."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "IntelliFlow Platform", href: "/ipaas/intelliflow", variant: "secondary" },
        ]}
      />
    </div>
  );
}
