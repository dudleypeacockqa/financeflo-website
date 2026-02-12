import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import PageHero from "@/components/sections/PageHero";
import CTASection from "@/components/sections/CTASection";

const posts = [
  {
    title: "Why 70% of AI Projects Fail — And How QDOAA Prevents It",
    excerpt: "Most AI projects fail not because the technology doesn't work, but because it automates the wrong things. Here's how our QDOAA framework ensures you're solving the right problems.",
    category: "AI Strategy",
    readTime: "8 min",
    date: "Coming Soon",
  },
  {
    title: "The CFO's Guide to Sage Intacct Multi-Entity Management",
    excerpt: "Managing multiple entities shouldn't mean managing multiple spreadsheets. A practical guide to real-time consolidation, inter-company transactions, and dimensional reporting.",
    category: "ERP",
    readTime: "12 min",
    date: "Coming Soon",
  },
  {
    title: "Constraint-Based Thinking: A New Framework for Finance Transformation",
    excerpt: "Stop asking 'what do you want to automate?' and start asking 'where does your business model break at scale?' An introduction to constraint-based consulting.",
    category: "Strategy",
    readTime: "10 min",
    date: "Coming Soon",
  },
  {
    title: "iPaaS vs Custom Integration: When to Use Each Approach",
    excerpt: "Not every integration needs a managed platform, and not every connection should be custom-coded. A decision framework for choosing the right approach.",
    category: "Integration",
    readTime: "6 min",
    date: "Coming Soon",
  },
  {
    title: "Cost of Inaction: How to Quantify Doing Nothing",
    excerpt: "The most expensive decision in business is often doing nothing. Learn how to calculate your Cost of Inaction and build an unassailable business case for transformation.",
    category: "Business Case",
    readTime: "7 min",
    date: "Coming Soon",
  },
  {
    title: "Building an AI-Ready Finance Team: Skills, Structure, and Culture",
    excerpt: "AI doesn't replace your finance team — it amplifies them. But only if they're ready. A guide to building the skills, structure, and culture for AI adoption.",
    category: "Team Building",
    readTime: "9 min",
    date: "Coming Soon",
  },
];

export default function Blog() {
  useEffect(() => {
    document.title = "Blog | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Resources"
        title="Blog &"
        titleAccent="Insights"
        description="Practical insights on AI-powered finance transformation, ERP implementation, and constraint-based consulting. Written for CFOs, finance leaders, and operations teams."
      />

      <section className="py-20">
        <div className="container">
          {/* Coming Soon Banner */}
          <div className="glass-panel p-6 mb-8 text-center border-amber/30" style={{ borderRadius: "var(--radius-lg)" }}>
            <span className="text-xs font-mono text-amber uppercase tracking-widest">Coming Soon</span>
            <p className="text-muted-foreground mt-2">
              We're preparing our first batch of articles. Subscribe to be notified when they go live.
            </p>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="glass-panel p-6 group hover:border-teal/30 transition-colors flex flex-col"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-teal/70 px-2 py-0.5 border border-teal/20 rounded">{post.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                </div>
                <h3 className="font-semibold mb-2 text-foreground" style={{ fontFamily: "var(--font-heading)" }}>{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{post.excerpt}</p>
                <div className="mt-4 pt-3 border-t border-border/30">
                  <span className="text-xs text-amber font-mono">{post.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Can't Wait?"
        titleAccent="Get Started Now"
        description="While our blog is in development, take our AI Readiness Assessment for an immediate, personalised constraint diagnosis."
        actions={[
          { label: "Diagnose Your Constraints", href: "/assessment" },
          { label: "Download AI Report", href: "/lead-magnet", variant: "secondary" },
        ]}
      />
    </div>
  );
}
