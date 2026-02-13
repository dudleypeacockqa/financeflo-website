import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, Users } from "lucide-react";
import { formatDate, SourceBadge } from "@/components/admin/shared";

export default function Leads() {
  const { data, isLoading, refetch } = trpc.admin.leads.useQuery();

  return (
    <AdminLayout title="Leads" description="All captured leads from quiz funnels, workshops, and other sources.">
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>GHL</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((lead: any) => (
                    <TableRow key={lead.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{lead.id}</TableCell>
                      <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                      <TableCell className="font-mono text-xs">{lead.email}</TableCell>
                      <TableCell>{lead.company || "\u2014"}</TableCell>
                      <TableCell className="text-sm">{lead.jobTitle || "\u2014"}</TableCell>
                      <TableCell><SourceBadge source={lead.source} /></TableCell>
                      <TableCell className="text-sm">{lead.country || "\u2014"}</TableCell>
                      <TableCell>
                        {lead.ghlContactId ? (
                          <Badge className="bg-teal/20 text-teal border-0 text-xs">Synced</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0 text-xs">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leads captured yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
