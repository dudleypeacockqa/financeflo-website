import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { ExternalLink, FileText, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function Proposals() {
  const { data, isLoading, refetch } = trpc.admin.proposals.useQuery();
  const updateStatus = trpc.proposal.updateStatus.useMutation({
    onSuccess: () => { toast.success("Proposal status updated"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="Proposals" description="Generated proposals with status tracking and PDF links.">
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
                    <TableHead>Title</TableHead>
                    <TableHead>Est. Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Viewed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((proposal: any) => (
                    <TableRow key={proposal.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{proposal.id}</TableCell>
                      <TableCell className="font-mono text-xs">#{proposal.leadId}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{proposal.title}</TableCell>
                      <TableCell className="font-mono text-sm text-teal">
                        {proposal.estimatedValue ? `\u00A3${proposal.estimatedValue.toLocaleString()}` : "\u2014"}
                      </TableCell>
                      <TableCell><StatusBadge status={proposal.status} /></TableCell>
                      <TableCell>
                        {proposal.pdfUrl ? (
                          <a href={proposal.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="h-7 px-2 border-teal/30 text-teal gap-1">
                              <ExternalLink className="w-3 h-3" /> PDF
                            </Button>
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">{"\u2014"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(proposal.sentAt)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(proposal.viewedAt)}</TableCell>
                      <TableCell>
                        <Select
                          value={proposal.status}
                          onValueChange={(value) => {
                            updateStatus.mutate({
                              id: proposal.id,
                              status: value as "draft" | "sent" | "viewed" | "accepted" | "declined",
                            });
                          }}
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs bg-navy border-border/30">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
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
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No proposals generated yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
