import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { formatDate } from "@/components/admin/shared";

export default function Timesheet() {
  const { data: projectsList, isLoading } = trpc.delivery.listProjects.useQuery();

  // Collect time entries from all projects
  // We show a per-project summary table
  return (
    <AdminLayout title="Timesheets" description="Time tracking across all projects.">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        ) : (
          <>
            {/* Per-project summary */}
            <Card className="bg-navy-light border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber" />
                  Project Time Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/20 hover:bg-transparent">
                      <TableHead className="text-xs">Project</TableHead>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Phase</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Contract</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsList?.map((p: any) => (
                      <ProjectTimeRow key={p.id} project={p} />
                    ))}
                    {(!projectsList || projectsList.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No projects yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function ProjectTimeRow({ project }: { project: any }) {
  const { data: timeSummary } = trpc.delivery.getTimeSummary.useQuery({ projectId: project.id });
  const { data: entries } = trpc.delivery.listTimeEntries.useQuery({ projectId: project.id, limit: 10 });

  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow className="border-border/10 cursor-pointer hover:bg-muted/20" onClick={() => setExpanded(!expanded)}>
        <TableCell className="text-sm font-medium">{project.name}</TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {project.lead?.company || "—"}
        </TableCell>
        <TableCell>
          <Badge className="bg-blue-500/20 text-blue-400 border-0 font-mono text-xs uppercase">
            {project.currentPhase}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge className={`border-0 font-mono text-xs ${project.status === "active" ? "bg-teal/20 text-teal" : "bg-muted text-muted-foreground"}`}>
            {project.status}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono text-sm">
          {project.contractValue ? `£${project.contractValue.toLocaleString()}` : "—"}
        </TableCell>
      </TableRow>

      {expanded && timeSummary && (
        <TableRow className="border-border/10">
          <TableCell colSpan={5} className="bg-background/30 p-4">
            <div className="grid grid-cols-4 gap-4 mb-3">
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Total Time</p>
                <p className="text-sm font-bold font-mono">{timeSummary.totalHours}h {timeSummary.totalMinutes}m</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Billable</p>
                <p className="text-sm font-bold font-mono text-teal">{timeSummary.billableHours}h {timeSummary.billableMinutes}m</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Non-Billable</p>
                <p className="text-sm font-bold font-mono text-muted-foreground">{timeSummary.nonBillableHours}h {timeSummary.nonBillableMinutes}m</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">Billable Amount</p>
                <p className="text-sm font-bold font-mono text-amber">£{timeSummary.totalBillableAmount.toLocaleString()}</p>
              </div>
            </div>

            {entries && entries.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/10 hover:bg-transparent">
                    <TableHead className="text-[10px]">Description</TableHead>
                    <TableHead className="text-[10px]">Hours</TableHead>
                    <TableHead className="text-[10px]">Date</TableHead>
                    <TableHead className="text-[10px]">Billable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e: any) => (
                    <TableRow key={e.id} className="border-border/5">
                      <TableCell className="text-xs">{e.description}</TableCell>
                      <TableCell className="text-xs font-mono">{e.hours}h {e.minutes}m</TableCell>
                      <TableCell className="text-xs font-mono">{formatDate(e.workDate)}</TableCell>
                      <TableCell>
                        {e.billable ? (
                          <Badge className="bg-teal/20 text-teal border-0 text-[10px]">Yes</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">No</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Need useState for the expandable rows
import { useState } from "react";
