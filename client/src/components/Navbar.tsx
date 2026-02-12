/*
 * Design: Data Cartography — FinanceFlo.ai
 * Navbar: Mega-menu with NavigationMenu (desktop), Sheet + Accordion (mobile)
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { navItems } from "@/data/navigation";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
          <div className="w-8 h-8 rounded-md bg-teal flex items-center justify-center">
            <span className="text-navy-dark font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>F</span>
          </div>
          <span className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
            Finance<span className="text-teal">Flo</span>.ai
          </span>
        </Link>

        {/* Desktop Nav — Mega Menu */}
        <div className="hidden lg:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) =>
                item.dropdown ? (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuTrigger className="bg-transparent text-sm font-medium text-muted-foreground hover:text-foreground data-[state=open]:text-teal">
                      {item.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="glass-panel p-4 grid gap-4" style={{
                        gridTemplateColumns: `repeat(${item.dropdown.length}, minmax(200px, 1fr))`,
                        width: `${item.dropdown.length * 240}px`,
                      }}>
                        {item.dropdown.map((group) => (
                          <div key={group.heading}>
                            <h4 className="text-xs font-mono text-teal uppercase tracking-widest mb-3 px-2">
                              {group.heading}
                            </h4>
                            <div className="flex flex-col gap-0.5">
                              {group.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="block rounded-md px-2 py-2 no-underline hover:bg-teal/10 transition-colors"
                                >
                                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                                  {link.description && (
                                    <span className="block text-xs text-muted-foreground mt-0.5">{link.description}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.label}>
                    <Link
                      href={item.href!}
                      className={`inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium no-underline transition-colors ${
                        location === item.href
                          ? "text-teal"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="/assessment">
            <Button className="bg-teal text-navy-dark font-semibold hover:bg-teal/90 gap-2" style={{ fontFamily: "var(--font-heading)" }}>
              AI Readiness Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile — Sheet */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="text-foreground p-2">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-navy-dark border-border/50 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-teal flex items-center justify-center">
                    <span className="text-navy-dark font-bold text-sm" style={{ fontFamily: "var(--font-heading)" }}>F</span>
                  </div>
                  <span className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    Finance<span className="text-teal">Flo</span>.ai
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="px-4 pb-6">
                <Accordion type="multiple" className="w-full">
                  {navItems.map((item, idx) =>
                    item.dropdown ? (
                      <AccordionItem key={item.label} value={`nav-${idx}`} className="border-border/30">
                        <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-4">
                            {item.dropdown.map((group) => (
                              <div key={group.heading}>
                                <h5 className="text-xs font-mono text-teal uppercase tracking-widest mb-2">
                                  {group.heading}
                                </h5>
                                <div className="flex flex-col gap-1">
                                  {group.links.map((link) => (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      className="text-sm text-muted-foreground hover:text-foreground no-underline py-1.5 pl-2"
                                      onClick={() => setMobileOpen(false)}
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <div key={item.label} className="border-b border-border/30">
                        <Link
                          href={item.href!}
                          className={`block py-4 text-sm font-medium no-underline ${
                            location === item.href ? "text-teal" : "text-foreground"
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </div>
                    )
                  )}
                </Accordion>

                <div className="mt-6">
                  <Link href="/assessment" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-teal text-navy-dark font-semibold gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                      AI Readiness Assessment
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
