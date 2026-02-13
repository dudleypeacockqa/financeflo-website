import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Megaphone,
  Pause,
  Play,
  Plus,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function Campaigns() {
  const { data: campaignsList, isLoading, refetch } = trpc.outreach.listCampaigns.useQuery();
  const [, navigate] = useLocation();

  const startMutation = trpc.outreach.startCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign started"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const pauseMutation = trpc.outreach.pauseCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign paused"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.outreach.cancelCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign cancelled"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // Aggregate stats
  const stats = {
    total: campaignsList?.length ?? 0,
    running: campaignsList?.filter((c: any) => c.status === "running").length ?? 0,
    scheduled: campaignsList?.filter((c: any) => c.status === "scheduled").length ?? 0,
    completed: campaignsList?.filter((c: any) => c.status === "completed").length ?? 0,
    totalSent: campaignsList?.reduce((sum: number, c: any) => sum + (c.metrics?.totalSent ?? 0), 0) ?? 0,
  };

  const channelLabel = (channel: string) => {
    switch (channel) {
      case "linkedin_dm": return "LinkedIn DM";
      case "linkedin_connection": return "LinkedIn Connect";
      case "email": return "Email";
      default: return channel;
    }
  };

  return (
    <AdminLayout title="Campaigns" description="Manage multi-channel outreach campaigns with LinkedIn DMs, connections, and email.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Running", value: stats.running, color: "text-blue-400" },
            { label: "Scheduled", value: stats.scheduled, color: "text-amber" },
            { label: "Completed", value: stats.completed, color: "text-teal" },
            { label: "Messages Sent", value: stats.totalSent, color: "text-purple-400" },
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
          <Button
            size="sm"
            className="bg-teal hover:bg-teal/90 gap-2"
            onClick={() => navigate("/admin/campaign-builder")}
          >
            <Plus className="w-3 h-3" /> New Campaign
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-border/40 gap-2"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {/* Campaigns Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : campaignsList && campaignsList.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Replied</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignsList.map((campaign: any) => (
                    <TableRow
                      key={campaign.id}
                      className="border-border/20 cursor-pointer hover:bg-muted/20"
                      onClick={() => navigate(`/admin/campaign/${campaign.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">#{campaign.id}</TableCell>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                          {channelLabel(campaign.channel)}
                        </Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={campaign.status} /></TableCell>
                      <TableCell className="font-mono text-xs">{campaign.metrics?.totalSent ?? 0}</TableCell>
                      <TableCell className="font-mono text-xs">{campaign.metrics?.delivered ?? 0}</TableCell>
                      <TableCell className="font-mono text-xs">{campaign.metrics?.replied ?? 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {(campaign.status === "scheduled" || campaign.status === "paused") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-teal hover:text-teal"
                              onClick={() => startMutation.mutate({ id: campaign.id })}
                              title="Start"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                          )}
                          {campaign.status === "running" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber hover:text-amber"
                              onClick={() => pauseMutation.mutate({ id: campaign.id })}
                              title="Pause"
                            >
                              <Pause className="w-3 h-3" />
                            </Button>
                          )}
                          {(campaign.status === "draft" || campaign.status === "scheduled" || campaign.status === "running" || campaign.status === "paused") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => cancelMutation.mutate({ id: campaign.id })}
                              title="Cancel"
                            >
                              <XCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
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
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No campaigns yet. Create your first outreach campaign.</p>
              <Button
                size="sm"
                className="bg-teal hover:bg-teal/90 gap-2"
                onClick={() => navigate("/admin/campaign-builder")}
              >
                <Plus className="w-3 h-3" /> Create Campaign
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
