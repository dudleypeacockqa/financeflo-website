import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Cog, Loader2, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function BackgroundJobs() {
  const { data: jobs, isLoading, refetch } = trpc.jobs.list.useQuery();
  const { data: stats } = trpc.jobs.stats.useQuery();
  const cancelMutation = trpc.jobs.cancel.useMutation({
    onSuccess: () => { toast.success("Job cancelled"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const statCards = [
    { label: "Pending", value: stats?.pending ?? 0, color: "text-amber" },
    { label: "Running", value: stats?.running ?? 0, color: "text-blue-400" },
    { label: "Completed", value: stats?.completed ?? 0, color: "text-teal" },
    { label: "Failed", value: stats?.failed ?? 0, color: "text-destructive" },
  ];

  return (
    <AdminLayout title="Background Jobs" description="Monitor async job processing: embeddings, research, campaigns.">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-navy-light border-border/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/40 gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job: any) => (
                    <TableRow key={job.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{job.id}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 font-mono text-xs">
                          {job.type}
                        </Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={job.status} /></TableCell>
                      <TableCell className="font-mono text-xs">{job.attempts}/{job.maxAttempts}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(job.scheduledAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(job.completedAt)}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                        {job.errorMessage || "\u2014"}
                      </TableCell>
                      <TableCell>
                        {(job.status === "pending" || job.status === "running") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => cancelMutation.mutate({ id: job.id })}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <Cog className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No background jobs yet. They will appear when documents are processed or leads are researched.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
