import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BarChart3, BookOpen, ClipboardList, FileText, Loader2, Users } from "lucide-react";
import { formatDate, SourceBadge } from "@/components/admin/shared";

export default function Admin() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();

  const stats = [
    { label: "Total Leads", value: data?.leads.total ?? 0, icon: Users, color: "text-teal" },
    { label: "Assessments", value: data?.assessments.total ?? 0, icon: ClipboardList, color: "text-amber" },
    { label: "Proposals", value: data?.proposals.total ?? 0, icon: FileText, color: "text-blue-400" },
    { label: "Workshop Regs", value: data?.workshops.total ?? 0, icon: BookOpen, color: "text-purple-400" },
  ];

  return (
    <AdminLayout title="Dashboard" description="Overview of leads, assessments, proposals, and workshops.">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-teal" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="bg-navy-light border-border/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                Recent Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.leads.recent && data.leads.recent.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.leads.recent.slice(0, 5).map((lead: any) => (
                      <TableRow key={lead.id} className="border-border/20">
                        <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                        <TableCell className="font-mono text-xs">{lead.email}</TableCell>
                        <TableCell>{lead.company || "\u2014"}</TableCell>
                        <TableCell><SourceBadge source={lead.source} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-sm py-4 text-center">No leads yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
