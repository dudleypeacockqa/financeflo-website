import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Clock,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useSearch } from "wouter";
import { Link } from "wouter";

const PHASE_LABELS: Record<string, string> = {
  assess: "Assess",
  design: "Design",
  architect: "Architect",
  pilot: "Pilot",
  transform: "Transform",
};

export default function ProjectDashboard() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";

  const { data, isLoading, error } = trpc.delivery.portalAccess.useQuery(
    { token },
    { enabled: !!token }
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-navy-light border-border/30 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Access Required
            </h2>
            <p className="text-muted-foreground">
              Please use the link provided in your email to access the project portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-navy-light border-border/30 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Link Expired
            </h2>
            <p className="text-muted-foreground">
              This access link has expired or is invalid. Please contact your project manager for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project, milestones, updates, progress } = data;
  const phases = ["assess", "design", "architect", "pilot", "transform"];
  const overallProgress = progress.reduce((sum: number, p: any) => sum + p.completed, 0);
  const totalMilestones = progress.reduce((sum: number, p: any) => sum + p.total, 0);
  const completionPct = totalMilestones > 0 ? Math.round((overallProgress / totalMilestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy-light border-b border-border/30 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-6 w-6 text-teal" />
            <div>
              <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {project.name}
              </h1>
              <p className="text-xs text-muted-foreground">Project Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-teal">FinanceFlo</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Phase</p>
              <Badge className="bg-teal/20 text-teal border-0 font-mono text-xs uppercase mt-1">
                {PHASE_LABELS[project.currentPhase]}
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-bold capitalize">{project.status.replace(/_/g, " ")}</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold font-mono text-teal">{completionPct}%</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Milestones Done</p>
              <p className="text-lg font-bold font-mono">{overallProgress}/{totalMilestones}</p>
            </CardContent>
          </Card>
        </div>

        {/* ADAPT Phase Progress Bar */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">ADAPT Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {phases.map((phase) => {
                const p = progress.find((pr: any) => pr.phase === phase);
                const isCurrent = phase === project.currentPhase;
                const isPast = phases.indexOf(phase) < phases.indexOf(project.currentPhase);
                return (
                  <div key={phase} className="flex-1">
                    <div className={`h-3 rounded-full ${isPast ? "bg-teal" : isCurrent ? "bg-amber/40" : "bg-muted/20"}`}>
                      {isCurrent && p && (
                        <div className="h-3 rounded-full bg-teal transition-all" style={{ width: `${p.percentage}%` }} />
                      )}
                    </div>
                    <p className={`text-[10px] text-center mt-1 ${isCurrent ? "text-amber font-semibold" : isPast ? "text-teal" : "text-muted-foreground/40"}`}>
                      {PHASE_LABELS[phase]}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal" /> Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {milestones.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    <div className={`h-4 w-4 rounded-full flex-shrink-0 flex items-center justify-center ${
                      m.status === "completed" ? "bg-teal" :
                      m.status === "overdue" ? "bg-destructive" :
                      m.status === "in_progress" ? "bg-amber" :
                      "bg-muted/30"
                    }`}>
                      {m.status === "completed" && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className={m.status === "completed" ? "line-through text-muted-foreground" : ""}>
                        {m.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase">{PHASE_LABELS[m.adaptPhase]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber" /> Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {updates.map((u: any) => (
                  <div key={u.id} className="border-l-2 border-teal/30 pl-3">
                    <p className="text-sm font-medium">{u.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{u.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                      {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
                {updates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No updates yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-6 px-6 mt-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">FinanceFlo | AI-Powered Business Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
