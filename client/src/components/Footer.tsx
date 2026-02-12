/*
 * Design: Data Cartography — FinanceFlo.ai
 * Footer: Dark navy, topographic line divider, minimal but authoritative
 */
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border/30 bg-navy-dark">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center">
                <span className="text-navy-dark font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>F</span>
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Finance<span className="text-teal">Flo</span>.ai
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered financial transformation for mid-market companies. Sage Intacct implementation, custom AI solutions, and the ADAPT Framework.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-teal mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Solutions</h4>
            <div className="flex flex-col gap-2">
              <Link href="/solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Sage Intacct</Link>
              <Link href="/solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">AI Development</Link>
              <Link href="/solutions" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Multi-Company Finance</Link>
              <Link href="/adapt-framework" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">ADAPT Framework</Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-teal mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Resources</h4>
            <div className="flex flex-col gap-2">
              <Link href="/lead-magnet" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">AI in Finance Report</Link>
              <Link href="/assessment" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">AI Readiness Assessment</Link>
              <a href="https://financeflo.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Main Website</a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-teal mb-4 uppercase tracking-wider" style={{ fontFamily: "var(--font-heading)" }}>Contact</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Dudley Peacock</span>
              <a href="mailto:dudley@financeflo.ai" className="text-sm text-teal hover:text-teal/80 transition-colors no-underline">dudley@financeflo.ai</a>
              <a href="https://financeflo.ai" target="_blank" rel="noopener noreferrer" className="text-sm text-teal hover:text-teal/80 transition-colors no-underline">financeflo.ai</a>
            </div>
          </div>
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
