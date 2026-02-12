import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface CTAAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface CTASectionProps {
  title: string;
  titleAccent?: string;
  description: string;
  actions: CTAAction[];
}

const CTA_BG = "/images/cta-bg.png";

export default function CTASection({ title, titleAccent, description, actions }: CTASectionProps) {
  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ backgroundImage: `url(${CTA_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-navy/85" />
      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            {title}{" "}
            {titleAccent && <span className="text-gradient-amber">{titleAccent}</span>}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions.map((action, i) =>
              action.variant === "secondary" ? (
                <Link key={i} href={action.href}>
                  <Button size="lg" variant="outline" className="border-teal/40 text-teal hover:bg-teal/10 gap-2 text-base">
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Link key={i} href={action.href}>
                  <Button
                    size="lg"
                    className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber text-base px-8"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {action.label}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
