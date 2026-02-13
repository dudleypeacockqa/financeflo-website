import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { formatDate, StatusBadge } from "@/components/admin/shared";
import {
  BarChart3,
  DollarSign,
  Loader2,
  TrendingUp,
  Target,
} from "lucide-react";

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

const STAGE_ORDER = [
  "lead", "mql", "sql", "discovery", "aiba_diagnostic",
  "proposal_sent", "negotiation", "closed_won", "closed_lost",
];

export default function PipelineMetrics() {
  const { data: overview, isLoading } = trpc.pipeline.overview.useQuery();
  const { data: tasks } = trpc.pipeline.listAllTasks.useQuery();

  if (isLoading) {
    return (
      <AdminLayout title="Pipeline Metrics">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      </AdminLayout>
    );
  }

  const stages = overview?.stages ?? [];
  const sortedStages = STAGE_ORDER
    .map((s) => stages.find((st: any) => st.stage === s))
    .filter(Boolean);

  // Compute pipeline metrics
  const activeStages = stages.filter((s: any) => s.stage !== "closed_won" && s.stage !== "closed_lost");
  const activePipelineValue = activeStages.reduce((sum: number, s: any) => sum + (s.totalValue ?? 0), 0);
  const activeWeightedValue = activeStages.reduce((sum: number, s: any) => sum + (s.weightedValue ?? 0), 0);
  const wonStage = stages.find((s: any) => s.stage === "closed_won");
  const lostStage = stages.find((s: any) => s.stage === "closed_lost");
  const wonCount = wonStage?.count ?? 0;
  const lostCount = lostStage?.count ?? 0;
  const winRate = wonCount + lostCount > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  return (
    <AdminLayout title="Pipeline Metrics" description="Sales pipeline analytics, forecasting, and stage breakdown.">
      <div className="space-y-6">
        {/* Top-Level KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Deals", value: overview?.totalDeals ?? 0, icon: BarChart3, color: "text-foreground" },
            { label: "Pipeline Value", value: `£${activePipelineValue.toLocaleString()}`, icon: DollarSign, color: "text-teal" },
            { label: "Weighted Forecast", value: `£${activeWeightedValue.toLocaleString()}`, icon: TrendingUp, color: "text-amber" },
            { label: "Win Rate", value: `${winRate}%`, icon: Target, color: winRate >= 50 ? "text-teal" : "text-amber" },
            { label: "Open Tasks", value: tasks?.length ?? 0, icon: BarChart3, color: "text-blue-400" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-navy-light border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stage Breakdown */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Stage Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-xs">Stage</TableHead>
                  <TableHead className="text-xs text-right">Deals</TableHead>
                  <TableHead className="text-xs text-right">Total Value</TableHead>
                  <TableHead className="text-xs text-right">Weighted Value</TableHead>
                  <TableHead className="text-xs text-right">Avg Deal Size</TableHead>
                  <TableHead className="text-xs">Distribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStages.map((s: any) => {
                  const avgSize = s.count > 0 ? Math.round(s.totalValue / s.count) : 0;
                  const maxCount = Math.max(...stages.map((st: any) => st.count), 1);
                  const barWidth = Math.round((s.count / maxCount) * 100);
                  const isWon = s.stage === "closed_won";
                  const isLost = s.stage === "closed_lost";

                  return (
                    <TableRow key={s.stage} className="border-border/10">
                      <TableCell className="text-sm font-medium">
                        {STAGE_LABELS[s.stage] || s.stage}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{s.count}</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        £{(s.totalValue ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-amber">
                        £{(s.weightedValue ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        £{avgSize.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-background/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${isWon ? "bg-teal" : isLost ? "bg-destructive" : "bg-blue-500"}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedStages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No deals in the pipeline yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-navy-light border-teal/30">
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Revenue (Won)</p>
              <p className="text-3xl font-bold font-mono text-teal">
                £{(wonStage?.totalValue ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{wonCount} deals closed</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-destructive/30">
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Lost Revenue</p>
              <p className="text-3xl font-bold font-mono text-destructive">
                £{(lostStage?.totalValue ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{lostCount} deals lost</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-amber/30">
            <CardContent className="p-6 text-center">
              <p className="text-xs text-muted-foreground mb-1">Weighted Forecast</p>
              <p className="text-3xl font-bold font-mono text-amber">
                £{activeWeightedValue.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">active pipeline</p>
            </CardContent>
          </Card>
        </div>

        {/* Open Tasks */}
        {tasks && tasks.length > 0 && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Open Tasks Across Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20 hover:bg-transparent">
                    <TableHead className="text-xs">Task</TableHead>
                    <TableHead className="text-xs">Deal</TableHead>
                    <TableHead className="text-xs">Stage</TableHead>
                    <TableHead className="text-xs">Due Date</TableHead>
                    <TableHead className="text-xs">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t: any) => (
                    <TableRow key={t.task.id} className="border-border/10">
                      <TableCell className="text-sm">{t.task.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{t.dealTitle}</TableCell>
                      <TableCell><StatusBadge status={t.dealStage} /></TableCell>
                      <TableCell className="font-mono text-xs">
                        {t.task.dueDate ? formatDate(t.task.dueDate) : "—"}
                      </TableCell>
                      <TableCell><StatusBadge status={t.task.priority} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
