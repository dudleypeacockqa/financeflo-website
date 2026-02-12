/*
 * Design: Data Cartography — FinanceFlo.ai
 * Footer: 5-column layout with all new navigation links
 */
import { Link } from "wouter";
import { footerColumns } from "@/data/navigation";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-navy-dark">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center">
                <span className="text-navy-dark font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>F</span>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Finance<span className="text-teal">Flo</span>.ai
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered financial transformation for mid-market companies. ERP implementation, iPaaS integration, and custom AI solutions.
            </p>
            <div className="mt-4 flex flex-col gap-1">
              <a href="mailto:dudley@financeflo.ai" className="text-sm text-teal hover:text-teal/80 transition-colors no-underline">
                dudley@financeflo.ai
              </a>
              <a href="https://financeflo.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-teal hover:text-teal/80 transition-colors no-underline">
                financeflo.ai
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4
                className="text-sm font-semibold text-teal mb-4 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {col.heading}
              </h4>
              <div className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} FinanceFlo.ai. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Powered by Sage Intacct &middot; Built with AI
          </p>
        </div>
      </div>
    </footer>
  );
}
