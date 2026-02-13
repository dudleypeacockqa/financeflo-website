import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TeamMember } from "@/data/team";

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

function toTeamSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toBasePath(src: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
  return `${cleanBase}${cleanSrc}`;
}

export default function TeamCard({ member, index }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasLoggedFallbackRef = useRef(false);
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">("loading");

  const imageCandidates = useMemo(() => {
    const slug = toTeamSlug(member.name);
    const candidates = new Set<string>();

    if (member.image) {
      candidates.add(member.image);
      candidates.add(toBasePath(member.image));
    }

    const guessed = [
      `/images/team/${slug}.jpg`,
      `/images/team/${slug}.jpeg`,
      `/images/team/${slug}.png`,
    ];

    guessed.forEach(path => {
      candidates.add(path);
      candidates.add(toBasePath(path));
    });

    return Array.from(candidates);
  }, [member.image, member.name]);

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState<string>(imageCandidates[0] || "");

  useEffect(() => {
    setCandidateIndex(0);
    setCurrentImage(imageCandidates[0] || "");
    setImgStatus(imageCandidates.length > 0 ? "loading" : "error");
    hasLoggedFallbackRef.current = false;
  }, [imageCandidates]);

  const handleImageError = () => {
    const nextIndex = candidateIndex + 1;

    if (nextIndex < imageCandidates.length) {
      setCandidateIndex(nextIndex);
      setCurrentImage(imageCandidates[nextIndex] || "");
      setImgStatus("loading");
      return;
    }

    if (
      import.meta.env.DEV &&
      !hasLoggedFallbackRef.current &&
      typeof console !== "undefined"
    ) {
      console.warn(
        `[TeamCard] Falling back to initials for "${member.name}". Tried:`,
        imageCandidates
      );
      hasLoggedFallbackRef.current = true;
    }

    setImgStatus("error");
  };

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
        {currentImage && (
          <img
            src={currentImage}
            alt={member.name}
            className="aspect-square size-full object-cover"
            style={{ display: imgStatus === "loaded" ? "block" : "none" }}
            onLoad={() => setImgStatus("loaded")}
            onError={handleImageError}
          />
        )}
        {imgStatus !== "loaded" && (
          <AvatarFallback className="bg-teal/10 text-xl font-bold text-teal" style={{ fontFamily: "var(--font-heading)" }}>
            {member.initials}
          </AvatarFallback>
        )}
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
