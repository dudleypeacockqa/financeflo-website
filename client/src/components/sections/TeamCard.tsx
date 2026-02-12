import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { TeamMember } from "@/data/team";

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-panel p-6 text-center"
      style={{ borderRadius: "var(--radius)" }}
    >
      <Avatar className="w-20 h-20 mx-auto mb-4 border border-teal/30">
        {member.image && (
          <AvatarImage
            src={member.image}
            alt={member.name}
            className="object-cover"
          />
        )}
        <AvatarFallback className="bg-teal/10 text-xl font-bold text-teal" style={{ fontFamily: "var(--font-heading)" }}>
          {member.initials}
        </AvatarFallback>
      </Avatar>

      <h4 className="font-semibold text-sm" style={{ fontFamily: "var(--font-heading)" }}>
        {member.name}
      </h4>
      <p className="text-xs text-muted-foreground mt-1">{member.role}</p>

      {member.bio && (
        <div className="mt-3">
          <p className={`text-xs text-muted-foreground leading-relaxed text-left ${expanded ? "" : "line-clamp-2"}`}>
            {member.bio}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-teal hover:text-teal/80 mt-1 font-medium transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        </div>
      )}
    </motion.div>
  );
}
