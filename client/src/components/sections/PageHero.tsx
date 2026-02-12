import { motion } from "framer-motion";

interface PageHeroProps {
  tagline: string;
  title: string;
  titleAccent?: string;
  description: string;
  badge?: string;
  children?: React.ReactNode;
}

export default function PageHero({ tagline, title, titleAccent, description, badge, children }: PageHeroProps) {
  return (
    <section className="py-16 border-b border-border/30">
      <div className="container">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-mono text-teal uppercase tracking-widest">{tagline}</span>
              {badge && (
                <span className="text-xs font-mono text-amber px-2 py-0.5 border border-amber/30 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mt-3 mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              {title}{" "}
              {titleAccent && <span className="text-gradient-teal">{titleAccent}</span>}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>
            {children && <div className="mt-8">{children}</div>}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
