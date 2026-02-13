import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BookOpen, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function Workshops() {
  const { data, isLoading, refetch } = trpc.admin.workshops.useQuery();
  const updateStatus = trpc.workshop.updateStatus.useMutation({
    onSuccess: () => { toast.success("Workshop status updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="Workshops" description="Workshop registrations and attendance tracking.">
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
                    <TableHead>Workshop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prep</TableHead>
                    <TableHead>Survey</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((reg: any) => (
                    <TableRow key={reg.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{reg.id}</TableCell>
                      <TableCell className="font-mono text-xs">#{reg.leadId}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{reg.workshopTitle}</TableCell>
                      <TableCell><StatusBadge status={reg.status} /></TableCell>
                      <TableCell>{reg.prepCompleted ? "\u2713" : "\u2014"}</TableCell>
                      <TableCell>{reg.surveyCompleted ? "\u2713" : "\u2014"}</TableCell>
                      <TableCell>{reg.certificateIssued ? "\u2713" : "\u2014"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(reg.createdAt)}</TableCell>
                      <TableCell>
                        <Select
                          value={reg.status}
                          onValueChange={(value) => {
                            updateStatus.mutate({
                              id: reg.id,
                              status: value as "registered" | "confirmed" | "attended" | "no_show" | "cancelled",
                            });
                          }}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs bg-navy border-border/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="registered">Registered</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="attended">Attended</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
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
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workshop registrations yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
