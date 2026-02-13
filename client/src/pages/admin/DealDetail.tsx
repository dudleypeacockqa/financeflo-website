import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Users,
} from "lucide-react";
import { useRoute } from "wouter";
import { formatDate, StatusBadge, ConstraintBadge } from "@/components/admin/shared";
import { useState } from "react";
import { toast } from "sonner";

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  discovery: "Discovery",
  aiba_diagnostic: "AIBA Diagnostic",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  lead: ["mql", "sql", "closed_lost"],
  mql: ["sql", "closed_lost"],
  sql: ["discovery", "closed_lost"],
  discovery: ["aiba_diagnostic", "proposal_sent", "closed_lost"],
  aiba_diagnostic: ["proposal_sent", "closed_lost"],
  proposal_sent: ["negotiation", "closed_won", "closed_lost"],
  negotiation: ["closed_won", "closed_lost"],
  closed_won: [],
  closed_lost: ["lead"],
};

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  note: MessageSquare,
  call: Phone,
  meeting: Users,
  email: MessageSquare,
  stage_change: ArrowRight,
  task_completed: CheckCircle2,
};

export default function DealDetail() {
  const [, params] = useRoute("/admin/deal/:id");
  const dealId = Number(params?.id);

  const { data: deal, isLoading, refetch } = trpc.pipeline.getDeal.useQuery({ id: dealId }, { enabled: !!dealId });
  const { data: activitiesList } = trpc.pipeline.getActivities.useQuery({ dealId }, { enabled: !!dealId });
  const { data: tasksList, refetch: refetchTasks } = trpc.pipeline.listTasks.useQuery({ dealId, includeCompleted: true }, { enabled: !!dealId });
  const { data: aibaAnalysis } = trpc.aiba.getAnalysis.useQuery(
    { id: deal?.aibaAnalysisId ?? 0 },
    { enabled: !!deal?.aibaAnalysisId }
  );

  const moveMutation = trpc.pipeline.moveStage.useMutation({
    onSuccess: () => { toast.success("Stage updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const addActivityMutation = trpc.pipeline.addActivity.useMutation({
    onSuccess: () => { toast.success("Activity logged"); refetch(); setNewNote(""); },
    onError: (err) => toast.error(err.message),
  });

  const createTaskMutation = trpc.pipeline.createTask.useMutation({
    onSuccess: () => { toast.success("Task created"); refetchTasks(); setNewTaskTitle(""); },
    onError: (err) => toast.error(err.message),
  });

  const completeTaskMutation = trpc.pipeline.completeTask.useMutation({
    onSuccess: () => { toast.success("Task completed"); refetchTasks(); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [newNote, setNewNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (isLoading) {
    return (
      <AdminLayout title="Deal Detail">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      </AdminLayout>
    );
  }

  if (!deal) {
    return (
      <AdminLayout title="Deal Detail">
        <p className="text-muted-foreground">Deal not found.</p>
      </AdminLayout>
    );
  }

  const allowedTransitions = VALID_TRANSITIONS[deal.stage] || [];

  return (
    <AdminLayout title={deal.title} description={deal.lead?.company || undefined}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Info */}
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <StatusBadge status={deal.stage} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Value</p>
                  <p className="text-lg font-bold font-mono text-teal">
                    {deal.value ? `£${deal.value.toLocaleString()}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Probability</p>
                  <p className="text-lg font-bold font-mono">{deal.probability ?? 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weighted</p>
                  <p className="text-lg font-bold font-mono text-amber">
                    {deal.weightedValue ? `£${deal.weightedValue.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p>{deal.lead?.firstName} {deal.lead?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p>{deal.assignedTo || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-mono text-xs">{formatDate(deal.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expected Close</p>
                  <p className="font-mono text-xs">{formatDate(deal.expectedCloseDate)}</p>
                </div>
              </div>

              {/* Stage Transition Buttons */}
              {allowedTransitions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <p className="text-xs text-muted-foreground mb-2">Move to:</p>
                  <div className="flex flex-wrap gap-2">
                    {allowedTransitions.map((stage) => (
                      <Button
                        key={stage}
                        size="sm"
                        variant={stage.startsWith("closed") ? "destructive" : "outline"}
                        className="text-xs"
                        onClick={() => moveMutation.mutate({ dealId: deal.id, newStage: stage })}
                        disabled={moveMutation.isPending}
                      >
                        <ArrowRight className="h-3 w-3 mr-1" />
                        {STAGE_LABELS[stage]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AIBA Analysis Summary */}
          {aibaAnalysis && (
            <Card className="bg-navy-light border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-teal" />
                  AIBA Diagnostic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Readiness Score</p>
                    <p className="text-2xl font-bold font-mono text-teal">{aibaAnalysis.readinessScore}/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Constraint</p>
                    <ConstraintBadge constraint={aibaAnalysis.constraintType || "unknown"} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cost of Inaction</p>
                    <p className="text-lg font-bold font-mono text-destructive">
                      £{(aibaAnalysis.costOfInaction ?? 0).toLocaleString()}/yr
                    </p>
                  </div>
                </div>
                {aibaAnalysis.fourEngines && (
                  <div className="grid grid-cols-4 gap-2">
                    {(["revenue", "operations", "compliance", "data"] as const).map((engine) => {
                      const e = (aibaAnalysis.fourEngines as any)?.[engine];
                      if (!e) return null;
                      return (
                        <div key={engine} className="text-center p-2 rounded bg-background/50">
                          <p className="text-[10px] text-muted-foreground uppercase">{engine}</p>
                          <p className={`text-lg font-bold font-mono ${e.score >= 7 ? "text-teal" : e.score >= 4 ? "text-amber" : "text-destructive"}`}>
                            {e.score}/10
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Note */}
              <div className="flex gap-2 mb-4">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-background/50 border-border/30 text-sm min-h-[60px]"
                />
                <Button
                  size="sm"
                  onClick={() => addActivityMutation.mutate({ dealId: deal.id, type: "note", description: newNote })}
                  disabled={!newNote.trim() || addActivityMutation.isPending}
                  className="self-end"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Note
                </Button>
              </div>

              <div className="space-y-3">
                {activitiesList?.map((activity: any) => {
                  const Icon = ACTIVITY_ICONS[activity.type] || MessageSquare;
                  return (
                    <div key={activity.id} className="flex gap-3 text-sm">
                      <div className="mt-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p>{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {formatDate(activity.createdAt)}
                          {activity.performedBy && ` · ${activity.performedBy}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(!activitiesList || activitiesList.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No activities yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tasks */}
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="New task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="bg-background/50 border-border/30 text-sm h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTaskTitle.trim()) {
                      createTaskMutation.mutate({ dealId: deal.id, title: newTaskTitle });
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => createTaskMutation.mutate({ dealId: deal.id, title: newTaskTitle })}
                  disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-2">
                {tasksList?.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-2 text-sm">
                    <button
                      className={`mt-0.5 h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        task.completed
                          ? "bg-teal border-teal text-white"
                          : "border-border/50 hover:border-teal/50"
                      }`}
                      onClick={() => !task.completed && completeTaskMutation.mutate({ id: task.id })}
                      disabled={!!task.completed}
                    >
                      {task.completed ? <CheckCircle2 className="h-3 w-3" /> : null}
                    </button>
                    <div className="flex-1">
                      <p className={task.completed ? "line-through text-muted-foreground" : ""}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Due: {formatDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {(!tasksList || tasksList.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-3">No tasks.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Deal Notes */}
          {deal.notes && (
            <Card className="bg-navy-light border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
