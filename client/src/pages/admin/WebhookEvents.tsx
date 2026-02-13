import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Loader2, RefreshCw, Webhook } from "lucide-react";
import { formatDate } from "@/components/admin/shared";

export default function WebhookEvents() {
  const { data, isLoading, refetch } = trpc.admin.webhookEvents.useQuery();

  return (
    <AdminLayout title="Webhook Events" description="GHL webhook event log for debugging integrations.">
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
                    <TableHead>Event Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>HTTP Code</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((event: any) => (
                    <TableRow key={event.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{event.id}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 font-mono text-xs">
                          {event.eventType}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.entityId ? `#${event.entityId}` : "\u2014"}</TableCell>
                      <TableCell>
                        {event.success ? (
                          <Badge className="bg-teal/20 text-teal border-0 text-xs">Success</Badge>
                        ) : (
                          <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{event.responseStatus || "\u2014"}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                        {event.errorMessage || "\u2014"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <Webhook className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No webhook events logged yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
