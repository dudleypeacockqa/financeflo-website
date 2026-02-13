import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  DollarSign,
  FolderOpen,
  Loader2,
  Plus,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDate, StatusBadge } from "@/components/admin/shared";

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

export default function Projects() {
  const { data: projectsList, isLoading } = trpc.delivery.listProjects.useQuery();
  const { data: summary } = trpc.delivery.summary.useQuery();
  const [, navigate] = useLocation();

  return (
    <AdminLayout title="Projects" description="Service delivery tracking with ADAPT phase methodology.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Projects", value: summary?.total ?? 0, color: "text-foreground" },
            { label: "Active", value: summary?.active ?? 0, color: "text-teal" },
            { label: "Completed", value: summary?.completed ?? 0, color: "text-blue-400" },
            { label: "Total Value", value: `£${(summary?.totalValue ?? 0).toLocaleString()}`, color: "text-amber" },
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
          <Button onClick={() => navigate("/admin/project-new")}>
            <Plus className="h-4 w-4 mr-1" /> New Project
          </Button>
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-xs">Project</TableHead>
                  <TableHead className="text-xs">Client</TableHead>
                  <TableHead className="text-xs">Phase</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Value</TableHead>
                  <TableHead className="text-xs">Assigned</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsList?.map((p: any) => (
                  <TableRow
                    key={p.id}
                    className="border-border/10 cursor-pointer hover:bg-muted/20"
                    onClick={() => navigate(`/admin/project/${p.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-teal/60" />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.lead?.company || `${p.lead?.firstName || ""} ${p.lead?.lastName || ""}`.trim() || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${PHASE_COLORS[p.currentPhase] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs uppercase`}>
                        {PHASE_LABELS[p.currentPhase] || p.currentPhase}
                      </Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="font-mono text-sm">
                      {p.contractValue ? `£${p.contractValue.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.assignedTo || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{formatDate(p.updatedAt)}</TableCell>
                  </TableRow>
                ))}
                {(!projectsList || projectsList.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No projects yet. Create your first project or close a deal to get started.
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
