import { Badge } from "@/components/ui/badge";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "\u2014";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/20 text-blue-400",
    viewed: "bg-amber/20 text-amber",
    accepted: "bg-teal/20 text-teal",
    declined: "bg-destructive/20 text-destructive",
    registered: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-teal/20 text-teal",
    attended: "bg-green-500/20 text-green-400",
    no_show: "bg-destructive/20 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
    pending: "bg-amber/20 text-amber",
    processing: "bg-blue-500/20 text-blue-400",
    ready: "bg-teal/20 text-teal",
    error: "bg-destructive/20 text-destructive",
    running: "bg-blue-500/20 text-blue-400",
    completed: "bg-teal/20 text-teal",
    failed: "bg-destructive/20 text-destructive",
  };
  return (
    <Badge className={`${colorMap[status] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function ConstraintBadge({ constraint }: { constraint: string }) {
  const colorMap: Record<string, string> = {
    capacity: "bg-teal/20 text-teal",
    knowledge: "bg-amber/20 text-amber",
    process: "bg-blue-500/20 text-blue-400",
    scale: "bg-purple-500/20 text-purple-400",
  };
  return (
    <Badge className={`${colorMap[constraint] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {constraint}
    </Badge>
  );
}

export function SourceBadge({ source }: { source: string }) {
  const colorMap: Record<string, string> = {
    quiz: "bg-teal/20 text-teal",
    lead_magnet: "bg-amber/20 text-amber",
    workshop: "bg-blue-500/20 text-blue-400",
    contact: "bg-purple-500/20 text-purple-400",
    referral: "bg-green-500/20 text-green-400",
    linkedin: "bg-blue-600/20 text-blue-300",
  };
  return (
    <Badge className={`${colorMap[source] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {source.replace(/_/g, " ")}
    </Badge>
  );
}
