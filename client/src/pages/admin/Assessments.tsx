import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { formatDate, ConstraintBadge } from "@/components/admin/shared";

export default function Assessments() {
  const { data, isLoading, refetch } = trpc.admin.assessments.useQuery();

  return (
    <AdminLayout title="Assessments" description="Quiz submissions with constraint scores and recommendations.">
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/40 gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : data && data.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Lead ID</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Primary Constraint</TableHead>
                    <TableHead>Cost of Inaction</TableHead>
                    <TableHead>Recommended Tier</TableHead>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((assessment: any) => (
                    <TableRow key={assessment.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{assessment.id}</TableCell>
                      <TableCell className="font-mono text-xs">#{assessment.leadId}</TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-teal">{assessment.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/100</span>
                      </TableCell>
                      <TableCell><ConstraintBadge constraint={assessment.primaryConstraint} /></TableCell>
                      <TableCell className="font-mono text-sm">
                        {assessment.costOfInaction ? `\u00A3${assessment.costOfInaction.toLocaleString()}` : "\u2014"}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber/20 text-amber border-0 font-mono text-xs">
                          {assessment.recommendedTier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.proposalGenerated ? (
                          <Badge className="bg-teal/20 text-teal border-0 text-xs">Generated</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0 text-xs">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(assessment.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assessments submitted yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
