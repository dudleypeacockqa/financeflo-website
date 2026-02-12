import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
}

interface FeatureGridProps {
  tagline?: string;
  title?: string;
  subtitle?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
  accentColor?: "teal" | "amber";
}

const colsMap = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export default function FeatureGrid({
  tagline,
  title,
  subtitle,
  features,
  columns = 3,
  accentColor = "teal",
}: FeatureGridProps) {
  const iconColor = accentColor === "teal" ? "text-teal" : "text-amber";
  const hoverBorder = accentColor === "teal" ? "hover:border-teal/30" : "hover:border-amber/30";
  const tagBorder = accentColor === "teal" ? "border-teal/20 text-teal/70" : "border-amber/20 text-amber/70";

  return (
    <section className="py-20">
      <div className="container">
        {(tagline || title) && (
          <div className="max-w-3xl mb-12">
            {tagline && (
              <span className={`text-xs font-mono ${iconColor} uppercase tracking-widest`}>{tagline}</span>
            )}
            {title && (
              <h2 className="text-3xl font-bold mt-3 mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                {title}
              </h2>
            )}
            {subtitle && <p className="text-muted-foreground leading-relaxed">{subtitle}</p>}
          </div>
        )}

        <div className={`grid ${colsMap[columns]} gap-6`}>
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`glass-panel p-6 group ${hoverBorder} transition-colors`}
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <feat.icon className={`w-7 h-7 ${iconColor}`} />
                {feat.tag && (
                  <span className={`text-xs font-mono px-2 py-0.5 border rounded ${tagBorder}`}>{feat.tag}</span>
                )}
              </div>
              <h4 className="font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
