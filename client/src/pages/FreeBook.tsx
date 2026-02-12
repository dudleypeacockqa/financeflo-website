/*
 * Free Book Offer — FinanceFlo.ai
 * Lead magnet page for "Connected Intelligence: How AI Unlocks the Full Potential of ERP"
 * by Dudley Peacock. Visitors choose Kindle (link to Amazon) or Physical (shipped).
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Brain,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Layers,
  MapPin,
  ExternalLink,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const COVER_IMG = "/images/connected-intelligence-cover.jpg";
const AMAZON_URL =
  "https://www.amazon.co.uk/Connected-Intelligence-Unlocks-Full-Potential-ebook/dp/B0F9SLV7DP";

type BookFormat = "kindle" | "physical";

const roleOptions = [
  { value: "", label: "Select your role..." },
  { value: "CFO / Finance Director", label: "CFO / Finance Director" },
  { value: "CEO / Managing Director", label: "CEO / Managing Director" },
  { value: "COO / Operations Director", label: "COO / Operations Director" },
  { value: "IT Director / CTO", label: "IT Director / CTO" },
  { value: "Finance Manager", label: "Finance Manager" },
  { value: "Other", label: "Other" },
];

const employeeOptions = [
  { value: "", label: "Select company size..." },
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

const countryOptions = [
  { value: "", label: "Select country..." },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "South Africa", label: "South Africa" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Ireland", label: "Ireland" },
  { value: "Other", label: "Other" },
];

const bookHighlights = [
  {
    icon: Brain,
    text: "How AI transforms ERP from a system of record into a system of intelligence",
  },
  {
    icon: Layers,
    text: "The Connected Intelligence framework for AI + ERP integration",
  },
  {
    icon: Target,
    text: "Practical strategies for CFOs, COOs, and finance leaders",
  },
  {
    icon: BarChart3,
    text: "Why most ERP implementations fail to deliver ROI — and how AI changes that",
  },
  {
    icon: TrendingUp,
    text: "Real-world use cases: predictive analytics, automated reconciliation, intelligent reporting",
  },
  {
    icon: Zap,
    text: "Building an AI roadmap that starts with constraint diagnosis",
  },
];

const INPUT_CLASS =
  "w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors";
const SELECT_CLASS =
  "w-full px-4 py-3 bg-navy-light/50 border border-border/50 rounded-lg text-sm text-foreground focus:border-teal focus:ring-1 focus:ring-teal/30 outline-none transition-colors";

export default function FreeBook() {
  useEffect(() => {
    document.title =
      "Free Book: Connected Intelligence | FinanceFlo.ai";
  }, []);

  const [format, setFormat] = useState<BookFormat>("kindle");
  const [submitted, setSubmitted] = useState(false);

  // Core fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [employees, setEmployees] = useState("");

  // Physical-only fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");

  const createLead = trpc.lead.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";

    const tags: string[] = ["free-book", format];

    // For physical books, encode the shipping address into tags so it reaches GHL
    if (format === "physical") {
      const addressParts = [street, city, postcode, country]
        .filter(Boolean)
        .join(", ");
      tags.push(`address:${addressParts}`);
    }

    try {
      await createLead.mutateAsync({
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        company: company || undefined,
        jobTitle: role || undefined,
        companySize: employees || undefined,
        source: "lead_magnet",
        tags,
      });

      setSubmitted(true);
      toast.success(
        format === "kindle"
          ? "Success! Grab your free Kindle copy below."
          : "Success! Your book is on its way.",
      );
    } catch (err) {
      console.error("[FreeBook] Lead creation failed:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="py-16 border-b border-border/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono text-teal uppercase tracking-widest">
                Free Book — Limited Offer
              </span>
              <h1
                className="text-3xl sm:text-4xl font-bold mt-3 mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Connected Intelligence:{" "}
                <span className="text-gradient-teal">
                  How AI Unlocks the Full Potential of&nbsp;ERP
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                By <strong className="text-foreground">Dudley Peacock</strong>{" "}
                &middot; Published on Amazon (Kindle + Paperback)
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Most ERP implementations fail to deliver their promised ROI.
                This book shows you exactly how AI transforms ERP from a
                system of record into a system of intelligence — with practical
                frameworks you can apply immediately.
              </p>

              <div className="space-y-3 mb-8">
                {bookHighlights.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-teal shrink-0" />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>
                  Written by an active practitioner &middot; Covers ADAPT +
                  QDOAA frameworks
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <img
                src={COVER_IMG}
                alt="Connected Intelligence book cover"
                className="w-full rounded-lg object-contain glow-teal"
                style={{ maxHeight: "440px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              {!submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-8"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Claim Your Free Copy
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Choose your preferred format and fill in the details below.
                  </p>

                  {/* Format Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setFormat("kindle")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                        format === "kindle"
                          ? "bg-teal/15 border-teal text-teal"
                          : "bg-navy-light/30 border-border/50 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Kindle (Digital)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormat("physical")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                        format === "physical"
                          ? "bg-teal/15 border-teal text-teal"
                          : "bg-navy-light/30 border-border/50 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      Physical (Shipped)
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="John Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Business Email */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Business Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="+44 7700 900000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Acme Holdings Ltd"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Role / Position */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Role / Position
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className={SELECT_CLASS}
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Number of Employees */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        Number of Employees
                      </label>
                      <select
                        value={employees}
                        onChange={(e) => setEmployees(e.target.value)}
                        className={SELECT_CLASS}
                      >
                        {employeeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shipping Address — Physical only */}
                    {format === "physical" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 border-t border-border/30 pt-4"
                      >
                        <div className="flex items-center gap-2 text-sm text-teal font-medium">
                          <MapPin className="w-4 h-4" />
                          Shipping Address
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="123 Main Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className={INPUT_CLASS}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              City *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="London"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className={INPUT_CLASS}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                              Postcode / ZIP *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="SW1A 1AA"
                              value={postcode}
                              onChange={(e) => setPostcode(e.target.value)}
                              className={INPUT_CLASS}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">
                            Country *
                          </label>
                          <select
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={SELECT_CLASS}
                          >
                            {countryOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      disabled={createLead.isPending}
                      className="w-full bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber py-6 text-base"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {createLead.isPending ? (
                        "Submitting..."
                      ) : format === "kindle" ? (
                        <>
                          <BookOpen className="w-5 h-5" />
                          Get Your Free Kindle Copy
                        </>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          Ship My Free Copy
                        </>
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    No spam. Unsubscribe anytime. Your data is protected under
                    POPIA and GDPR.
                  </p>
                </motion.div>
              ) : format === "kindle" ? (
                /* Kindle Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 text-center glow-teal"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  <CheckCircle2 className="w-16 h-16 text-teal mx-auto mb-4" />
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Your Free Kindle Copy Awaits!
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Click below to download your free copy from Amazon Kindle.
                  </p>
                  <a
                    href={AMAZON_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber mb-4"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Download on Amazon Kindle
                    </Button>
                  </a>
                  <p className="text-sm text-muted-foreground mb-6">
                    While you're here, take our 5-minute Constraint Diagnosis to
                    discover where your business model breaks at scale.
                  </p>
                  <Link href="/assessment">
                    <Button
                      variant="outline"
                      className="gap-2"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Diagnose Your Constraints
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                /* Physical Success State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-8 text-center glow-teal"
                  style={{ borderRadius: "var(--radius-lg)" }}
                >
                  <CheckCircle2 className="w-16 h-16 text-teal mx-auto mb-4" />
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    Your Book Is on Its Way!
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    We'll ship your copy of{" "}
                    <strong className="text-foreground">
                      Connected Intelligence
                    </strong>{" "}
                    to:
                  </p>
                  <p className="text-sm text-teal font-medium mb-6">
                    {[street, city, postcode, country]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    You'll receive a confirmation email at{" "}
                    <strong className="text-foreground">{email}</strong>. While
                    you wait, take our 5-minute Constraint Diagnosis.
                  </p>
                  <Link href="/assessment">
                    <Button
                      className="bg-amber text-navy-dark font-bold hover:bg-amber/90 gap-2 glow-amber"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      Diagnose Your Constraints
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* "What You'll Learn" */}
            <div>
              <h3
                className="text-xl font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                What You'll Learn
              </h3>
              <div className="space-y-4">
                {[
                  {
                    chapter: "01",
                    title: "From System of Record to System of Intelligence",
                    desc: "Why traditional ERP falls short — and how AI transforms it into a strategic decision engine",
                  },
                  {
                    chapter: "02",
                    title: "The Connected Intelligence Framework",
                    desc: "A practical model for integrating AI capabilities across your existing ERP infrastructure",
                  },
                  {
                    chapter: "03",
                    title: "Strategies for Finance Leaders",
                    desc: "Actionable playbooks for CFOs, COOs, and finance directors driving AI adoption",
                  },
                  {
                    chapter: "04",
                    title: "Why ERP Implementations Fail",
                    desc: "The hidden reasons most ERP projects miss their ROI targets — and how AI changes the equation",
                  },
                  {
                    chapter: "05",
                    title: "Real-World AI + ERP Use Cases",
                    desc: "Predictive analytics, automated reconciliation, intelligent reporting, and more with measurable results",
                  },
                  {
                    chapter: "06",
                    title: "Building Your AI Roadmap",
                    desc: "Start with constraint diagnosis, apply the ADAPT framework, and create a phased rollout plan",
                  },
                ].map((ch, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4"
                  >
                    <span className="text-2xl font-bold text-teal/30 font-mono shrink-0">
                      {ch.chapter}
                    </span>
                    <div>
                      <h4
                        className="font-semibold text-sm"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {ch.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="mt-8 glass-panel p-6" style={{ borderRadius: "var(--radius-lg)" }}>
                <h4
                  className="text-sm font-bold mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  About the Author
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Dudley Peacock</strong> is
                  the founder of FinanceFlo.ai and an active practitioner — not
                  a theorist — in the ERP + AI space. The book covers the same
                  ADAPT and QDOAA frameworks used by FinanceFlo.ai to help
                  mid-market companies unlock real ROI from their technology
                  investments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border/30">
        <div className="container">
          <div
            className="glass-panel p-8 text-center"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <h3
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Want a Personalised Assessment?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              The book gives you the frameworks. Our Constraint Diagnosis gives
              you the specific answers for <em>your</em> organisation —
              including Cost of Inaction, ROI projections, and a prioritised
              roadmap.
            </p>
            <Link href="/assessment">
              <Button
                className="bg-teal text-navy-dark font-bold hover:bg-teal/90 gap-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Take the Constraint Diagnosis
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
