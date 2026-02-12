import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PageHero from "@/components/sections/PageHero";

export default function Contact() {
  useEffect(() => {
    document.title = "Contact | FinanceFlo.ai";
  }, []);

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Contact"
        title="Get in"
        titleAccent="Touch"
        description="Whether you have a question about our services, need a custom proposal, or want to discuss your specific constraints — we're here to help."
      />

      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-8"
                style={{ borderRadius: "var(--radius-lg)" }}
              >
                {submitted ? (
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold text-teal mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                      Thank You
                    </h3>
                    <p className="text-muted-foreground">
                      We've received your message and will get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">First Name</label>
                        <Input placeholder="Jane" className="bg-navy-dark border-border/50" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Last Name</label>
                        <Input placeholder="Smith" className="bg-navy-dark border-border/50" required />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                      <Input type="email" placeholder="jane@company.com" className="bg-navy-dark border-border/50" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                      <Input placeholder="Company Ltd" className="bg-navy-dark border-border/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                      <textarea
                        placeholder="Tell us about your constraints and what you're looking for..."
                        rows={5}
                        className="w-full rounded-md border border-border/50 bg-navy-dark px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/50"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Send Message
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Contact Info */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <div className="glass-panel p-6" style={{ borderRadius: "var(--radius)" }}>
                  <Mail className="w-6 h-6 text-teal mb-3" />
                  <h4 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>Email</h4>
                  <a href="mailto:dudley@financeflo.ai" className="text-sm text-teal hover:text-teal/80 no-underline">
                    dudley@financeflo.ai
                  </a>
                </div>

                <div className="glass-panel p-6" style={{ borderRadius: "var(--radius)" }}>
                  <Phone className="w-6 h-6 text-teal mb-3" />
                  <h4 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>Phone</h4>
                  <p className="text-sm text-muted-foreground">Available by appointment</p>
                </div>

                <div className="glass-panel p-6" style={{ borderRadius: "var(--radius)" }}>
                  <MapPin className="w-6 h-6 text-teal mb-3" />
                  <h4 className="font-semibold mb-1" style={{ fontFamily: "var(--font-heading)" }}>Location</h4>
                  <p className="text-sm text-muted-foreground">United Kingdom</p>
                  <p className="text-xs text-muted-foreground mt-1">Remote-first — we work with clients globally</p>
                </div>

                <div className="glass-panel p-6" style={{ borderRadius: "var(--radius)" }}>
                  <h4 className="font-semibold mb-2 text-amber" style={{ fontFamily: "var(--font-heading)" }}>
                    Prefer to start with an assessment?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Our 5-minute AI Readiness Assessment gives you a personalised constraint diagnosis — no call needed.
                  </p>
                  <a href="/assessment" className="text-sm text-teal hover:text-teal/80 no-underline font-medium">
                    Take the Assessment →
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
