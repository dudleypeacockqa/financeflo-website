import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Pause,
  Play,
  Plus,
  Archive,
  Workflow,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDate, StatusBadge } from "@/components/admin/shared";
import { toast } from "sonner";

const TRIGGER_LABELS: Record<string, string> = {
  lead_created: "Lead Created",
  assessment_completed: "Assessment Completed",
  workshop_registered: "Workshop Registered",
  proposal_generated: "Proposal Generated",
  proposal_viewed: "Proposal Viewed",
  deal_stage_changed: "Deal Stage Changed",
  deal_closed_won: "Deal Closed Won",
  deal_closed_lost: "Deal Closed Lost",
  manual: "Manual",
};

export default function Workflows() {
  const { data: workflowsList, isLoading, refetch } = trpc.automation.listWorkflows.useQuery();
  const [, navigate] = useLocation();

  const activateMutation = trpc.automation.activateWorkflow.useMutation({
    onSuccess: () => { toast.success("Workflow activated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const pauseMutation = trpc.automation.pauseWorkflow.useMutation({
    onSuccess: () => { toast.success("Workflow paused"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const archiveMutation = trpc.automation.archiveWorkflow.useMutation({
    onSuccess: () => { toast.success("Workflow archived"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const stats = {
    total: workflowsList?.length ?? 0,
    active: workflowsList?.filter((w: any) => w.status === "active").length ?? 0,
    paused: workflowsList?.filter((w: any) => w.status === "paused").length ?? 0,
    totalEnrolled: workflowsList?.reduce((sum: number, w: any) => sum + (w.metrics?.totalEnrolled ?? 0), 0) ?? 0,
    totalCompleted: workflowsList?.reduce((sum: number, w: any) => sum + (w.metrics?.totalCompleted ?? 0), 0) ?? 0,
  };

  return (
    <AdminLayout title="Workflows" description="Marketing automation workflows with trigger-based email sequences.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-teal" },
            { label: "Paused", value: stats.paused, color: "text-amber" },
            { label: "Enrolled", value: stats.totalEnrolled, color: "text-blue-400" },
            { label: "Completed", value: stats.totalCompleted, color: "text-purple-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-navy-light border-border/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={() => navigate("/admin/workflow-builder")}>
            <Plus className="h-4 w-4 mr-1" /> New Workflow
          </Button>
        </div>

        {/* Workflows Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Trigger</TableHead>
                  <TableHead className="text-xs">Steps</TableHead>
                  <TableHead className="text-xs">Enrolled</TableHead>
                  <TableHead className="text-xs">Completed</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflowsList?.map((wf: any) => (
                  <TableRow key={wf.id} className="border-border/10 hover:bg-muted/20">
                    <TableCell>
                      <button
                        className="text-sm font-medium hover:text-teal transition-colors text-left"
                        onClick={() => navigate(`/admin/workflow-builder?id=${wf.id}`)}
                      >
                        {wf.name}
                      </button>
                      {wf.description && (
                        <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">{wf.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {TRIGGER_LABELS[wf.trigger] || wf.trigger}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{wf.steps?.length ?? 0}</TableCell>
                    <TableCell className="font-mono text-sm">{wf.metrics?.totalEnrolled ?? 0}</TableCell>
                    <TableCell className="font-mono text-sm">{wf.metrics?.totalCompleted ?? 0}</TableCell>
                    <TableCell><StatusBadge status={wf.status} /></TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(wf.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {wf.status === "active" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => pauseMutation.mutate({ id: wf.id })}
                            title="Pause"
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        ) : wf.status !== "archived" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-teal"
                            onClick={() => activateMutation.mutate({ id: wf.id })}
                            title="Activate"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        ) : null}
                        {wf.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            onClick={() => archiveMutation.mutate({ id: wf.id })}
                            title="Archive"
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!workflowsList || workflowsList.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No workflows yet. Create your first automation workflow.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
