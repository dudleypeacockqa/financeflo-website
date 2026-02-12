/*
 * Design: Data Cartography — FinanceFlo.ai
 * Navbar: Fixed top, glass-panel effect, teal accent on active links
 * Typography: Space Grotesk for brand, DM Sans for nav items
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/solutions", label: "Solutions" },
  { href: "/adapt-framework", label: "ADAPT Framework" },
  { href: "/delivery", label: "How We Deliver" },
  { href: "/workshop", label: "Workshop" },
  { href: "/lead-magnet", label: "Resources" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center">
            <span className="text-navy-dark font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>F</span>
          </div>
          <span className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Finance<span className="text-teal">Flo</span>.ai
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors no-underline ${
                location === link.href
                  ? "text-teal"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/assessment">
            <Button className="bg-teal text-navy-dark font-semibold hover:bg-teal/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              AI Readiness Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-border/50"
          >
            <div className="container py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium no-underline ${
                    location === link.href ? "text-teal" : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/assessment" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-teal text-navy-dark font-semibold gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  AI Readiness Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
