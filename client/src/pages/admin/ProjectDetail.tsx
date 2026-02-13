import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  Mail,
  Milestone as MilestoneIcon,
  Plus,
  Send,
} from "lucide-react";
import { useRoute } from "wouter";
import { formatDate, StatusBadge } from "@/components/admin/shared";
import { useState } from "react";
import { toast } from "sonner";

const PHASE_LABELS: Record<string, string> = {
  assess: "Assess",
  design: "Design",
  architect: "Architect",
  pilot: "Pilot",
  transform: "Transform",
};

const PHASE_COLORS: Record<string, string> = {
  assess: "bg-blue-500/20 text-blue-400",
  design: "bg-purple-500/20 text-purple-400",
  architect: "bg-amber/20 text-amber",
  pilot: "bg-cyan-500/20 text-cyan-400",
  transform: "bg-teal/20 text-teal",
};

const HEALTH_COLORS: Record<string, string> = {
  on_track: "text-teal",
  at_risk: "text-amber",
  behind: "text-destructive",
};

export default function ProjectDetail() {
  const [, params] = useRoute("/admin/project/:id");
  const projectId = Number(params?.id);

  const { data: project, isLoading, refetch } = trpc.delivery.getProject.useQuery({ id: projectId }, { enabled: !!projectId });
  const { data: milestonesList, refetch: refetchMilestones } = trpc.delivery.listMilestones.useQuery({ projectId }, { enabled: !!projectId });
  const { data: updatesList, refetch: refetchUpdates } = trpc.delivery.listUpdates.useQuery({ projectId }, { enabled: !!projectId });
  const { data: timeList, refetch: refetchTime } = trpc.delivery.listTimeEntries.useQuery({ projectId }, { enabled: !!projectId });

  const advanceMutation = trpc.delivery.advancePhase.useMutation({
    onSuccess: (r) => { toast.success(`Advanced to ${r.newPhase}`); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const completeMilestoneMutation = trpc.delivery.completeMilestone.useMutation({
    onSuccess: () => { toast.success("Milestone completed"); refetchMilestones(); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const addUpdateMutation = trpc.delivery.addUpdate.useMutation({
    onSuccess: () => { toast.success("Update posted"); refetchUpdates(); setUpdateTitle(""); setUpdateContent(""); },
    onError: (err) => toast.error(err.message),
  });

  const logTimeMutation = trpc.delivery.logTime.useMutation({
    onSuccess: () => { toast.success("Time logged"); refetchTime(); refetch(); setTimeDesc(""); setTimeHours(""); },
    onError: (err) => toast.error(err.message),
  });

  const sendInviteMutation = trpc.delivery.sendInvite.useMutation({
    onSuccess: () => toast.success("Portal invite sent"),
    onError: (err) => toast.error(err.message),
  });

  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [timeDesc, setTimeDesc] = useState("");
  const [timeHours, setTimeHours] = useState("");

  if (isLoading) {
    return (
      <AdminLayout title="Project Detail">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Project Detail">
        <p className="text-muted-foreground">Project not found.</p>
      </AdminLayout>
    );
  }

  // Group milestones by phase
  const phases = ["assess", "design", "architect", "pilot", "transform"];
  const milestonesByPhase = phases.map((phase) => ({
    phase,
    milestones: (milestonesList ?? []).filter((m: any) => m.adaptPhase === phase),
  }));

  return (
    <AdminLayout title={project.name} description={project.lead?.company || undefined}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Header */}
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Phase</p>
                  <Badge className={`${PHASE_COLORS[project.currentPhase]} border-0 font-mono text-xs uppercase mt-1`}>
                    {PHASE_LABELS[project.currentPhase]}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <div className="mt-1"><StatusBadge status={project.status} /></div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Health</p>
                  <p className={`text-lg font-bold ${HEALTH_COLORS[project.health?.status || "on_track"]}`}>
                    {(project.health?.status || "on_track").replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completion</p>
                  <p className="text-lg font-bold font-mono">{project.health?.completionPercentage ?? 0}%</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Contract Value</p>
                  <p className="font-mono text-teal">{project.contractValue ? `£${project.contractValue.toLocaleString()}` : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Billable Amount</p>
                  <p className="font-mono text-amber">£{(project.time?.totalBillableAmount ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="font-mono">{project.time?.totalHours ?? 0}h {project.time?.totalMinutes ?? 0}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p>{project.assignedTo || "—"}</p>
                </div>
              </div>

              {/* Advance Phase */}
              {project.currentPhase !== "transform" && project.status !== "completed" && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <Button
                    size="sm"
                    onClick={() => advanceMutation.mutate({ id: project.id })}
                    disabled={advanceMutation.isPending}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    Advance to {PHASE_LABELS[phases[phases.indexOf(project.currentPhase) + 1]]}
                  </Button>
                  {project.lead?.email && project.leadId && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2"
                      onClick={() => sendInviteMutation.mutate({ projectId: project.id, leadId: project.leadId!, baseUrl: window.location.origin })}
                      disabled={sendInviteMutation.isPending}
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      Send Portal Invite
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ADAPT Phase Progress */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">ADAPT Phase Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 mb-4">
                {phases.map((phase, i) => {
                  const progress = project.milestoneProgress?.find((p: any) => p.phase === phase);
                  const isCurrent = phase === project.currentPhase;
                  const isPast = phases.indexOf(phase) < phases.indexOf(project.currentPhase);
                  return (
                    <div key={phase} className="flex-1">
                      <div className={`h-2 rounded-full ${isPast ? "bg-teal" : isCurrent ? "bg-amber" : "bg-muted/30"}`}>
                        {isCurrent && progress && (
                          <div className="h-2 rounded-full bg-teal" style={{ width: `${progress.percentage}%` }} />
                        )}
                      </div>
                      <p className={`text-[10px] text-center mt-1 ${isCurrent ? "text-amber font-semibold" : isPast ? "text-teal" : "text-muted-foreground/40"}`}>
                        {PHASE_LABELS[phase]}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Milestones by phase */}
              {milestonesByPhase.map(({ phase, milestones: ms }) => (
                ms.length > 0 && (
                  <div key={phase} className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      {PHASE_LABELS[phase]}
                    </p>
                    <div className="space-y-2">
                      {ms.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-3 text-sm">
                          <button
                            className={`h-5 w-5 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                              m.status === "completed" ? "bg-teal border-teal text-white" :
                              m.status === "overdue" ? "border-destructive text-destructive" :
                              "border-border/50 hover:border-teal/50"
                            }`}
                            onClick={() => m.status !== "completed" && completeMilestoneMutation.mutate({ id: m.id })}
                            disabled={m.status === "completed"}
                          >
                            {m.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={m.status === "completed" ? "line-through text-muted-foreground" : ""}>
                              {m.title}
                            </p>
                            {m.dueDate && (
                              <p className={`text-[10px] font-mono ${m.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                                Due: {formatDate(m.dueDate)}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={m.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>

          {/* Updates */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Project Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <Input placeholder="Update title" value={updateTitle} onChange={(e) => setUpdateTitle(e.target.value)} className="bg-background/50 border-border/30 text-sm" />
                <Textarea placeholder="Update content..." value={updateContent} onChange={(e) => setUpdateContent(e.target.value)} className="bg-background/50 border-border/30 text-sm min-h-[60px]" />
                <Button
                  size="sm"
                  onClick={() => addUpdateMutation.mutate({ projectId: project.id, title: updateTitle, content: updateContent })}
                  disabled={!updateTitle.trim() || !updateContent.trim() || addUpdateMutation.isPending}
                >
                  <Send className="h-3 w-3 mr-1" /> Post Update
                </Button>
              </div>

              <div className="space-y-3">
                {updatesList?.map((u: any) => (
                  <div key={u.id} className="border-l-2 border-teal/30 pl-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{u.title}</p>
                      {u.visibleToClient ? (
                        <Badge variant="outline" className="text-[10px] text-teal border-teal/30">Client visible</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{u.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                      {formatDate(u.createdAt)}{u.author && ` · ${u.author}`}
                    </p>
                  </div>
                ))}
                {(!updatesList || updatesList.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No updates yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Log Time */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber" /> Log Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Description" value={timeDesc} onChange={(e) => setTimeDesc(e.target.value)} className="bg-background/50 border-border/30 text-sm" />
              <Input placeholder="Hours" type="number" min="0" value={timeHours} onChange={(e) => setTimeHours(e.target.value)} className="bg-background/50 border-border/30 text-sm" />
              <Button
                size="sm"
                className="w-full"
                onClick={() => logTimeMutation.mutate({
                  projectId: project.id,
                  description: timeDesc,
                  hours: Number(timeHours),
                  workDate: new Date().toISOString(),
                })}
                disabled={!timeDesc.trim() || !timeHours || logTimeMutation.isPending}
              >
                <Plus className="h-3 w-3 mr-1" /> Log Time
              </Button>
            </CardContent>
          </Card>

          {/* Recent Time Entries */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeList?.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="text-sm">
                    <p className="truncate">{t.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{t.hours}h {t.minutes}m</span>
                      <span>{formatDate(t.workDate)}</span>
                    </div>
                  </div>
                ))}
                {(!timeList || timeList.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-3">No time logged.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
