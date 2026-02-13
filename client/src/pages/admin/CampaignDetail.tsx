import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function CampaignDetail() {
  const [, params] = useRoute("/admin/campaign/:id");
  const [, navigate] = useLocation();
  const campaignId = params?.id ? parseInt(params.id, 10) : null;

  const { data: campaign, isLoading, refetch } = trpc.outreach.getCampaign.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.outreach.getCampaignMessages.useQuery(
    { campaignId: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: analytics } = trpc.outreach.getCampaignAnalytics.useQuery(
    { campaignId: campaignId! },
    { enabled: !!campaignId }
  );

  const scheduleMutation = trpc.outreach.scheduleCampaign.useMutation({
    onSuccess: (data) => { toast.success(`Scheduled ${data.messageCount} messages`); refetch(); refetchMessages(); },
    onError: (err) => toast.error(err.message),
  });

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

  if (!campaignId) {
    return (
      <AdminLayout title="Campaign" description="Campaign not found.">
        <p className="text-muted-foreground">Invalid campaign ID.</p>
      </AdminLayout>
    );
  }

  const metrics = campaign?.metrics || { totalSent: 0, delivered: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, failed: 0 };

  return (
    <AdminLayout title="Campaign Detail" description="View campaign progress, messages, and analytics.">
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/campaigns")}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Campaigns
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : campaign ? (
          <>
            {/* Campaign Header */}
            <Card className="bg-navy-light border-border/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{campaign.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                        {campaign.channel.replace(/_/g, " ")}
                      </Badge>
                      <StatusBadge status={campaign.status} />
                      {campaign.scheduledAt && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(campaign.scheduledAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-teal hover:bg-teal/90 gap-2"
                        onClick={() => scheduleMutation.mutate({ id: campaign.id })}
                        disabled={scheduleMutation.isPending}
                      >
                        {scheduleMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                        Schedule
                      </Button>
                    )}
                    {(campaign.status === "scheduled" || campaign.status === "paused") && (
                      <Button
                        size="sm"
                        className="bg-teal hover:bg-teal/90 gap-2"
                        onClick={() => startMutation.mutate({ id: campaign.id })}
                      >
                        <Play className="w-3 h-3" /> Start
                      </Button>
                    )}
                    {campaign.status === "running" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber text-amber gap-2"
                        onClick={() => pauseMutation.mutate({ id: campaign.id })}
                      >
                        <Pause className="w-3 h-3" /> Pause
                      </Button>
                    )}
                    {campaign.status !== "completed" && campaign.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-destructive text-destructive gap-2"
                        onClick={() => cancelMutation.mutate({ id: campaign.id })}
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => { refetch(); refetchMessages(); }} className="border-border/40 gap-2">
                      <RefreshCw className="w-3 h-3" /> Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {[
                { label: "Sent", value: metrics.totalSent, color: "text-blue-400" },
                { label: "Delivered", value: metrics.delivered, color: "text-teal" },
                { label: "Opened", value: metrics.opened, color: "text-green-400" },
                { label: "Clicked", value: metrics.clicked, color: "text-purple-400" },
                { label: "Replied", value: metrics.replied, color: "text-amber" },
                { label: "Bounced", value: metrics.bounced, color: "text-orange-400" },
                { label: "Failed", value: metrics.failed, color: "text-destructive" },
              ].map((stat) => (
                <Card key={stat.label} className="bg-navy-light border-border/30">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Step Breakdown */}
            {analytics?.stepBreakdown && analytics.stepBreakdown.length > 0 && (
              <Card className="bg-navy-light border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Step-by-Step Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>Step</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Opened</TableHead>
                        <TableHead>Replied</TableHead>
                        <TableHead>Failed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.stepBreakdown.map((step: any) => (
                        <TableRow key={step.stepNumber} className="border-border/20">
                          <TableCell className="font-mono text-xs">Step {step.stepNumber}</TableCell>
                          <TableCell className="font-mono text-xs">{step.total}</TableCell>
                          <TableCell className="font-mono text-xs text-blue-400">{step.sent}</TableCell>
                          <TableCell className="font-mono text-xs text-teal">{step.delivered}</TableCell>
                          <TableCell className="font-mono text-xs text-green-400">{step.opened}</TableCell>
                          <TableCell className="font-mono text-xs text-amber">{step.replied}</TableCell>
                          <TableCell className="font-mono text-xs text-destructive">{step.failed}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Sequence Steps Config */}
            {campaign.sequenceSteps && campaign.sequenceSteps.length > 0 && (
              <Card className="bg-navy-light border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Sequence Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {campaign.sequenceSteps.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 border border-border/20 rounded-lg p-3">
                      <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-teal">{step.stepNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                            {step.channel.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {step.delayDays === 0 ? "Immediate" : `+${step.delayDays} day${step.delayDays > 1 ? "s" : ""}`}
                          </span>
                        </div>
                        {step.subject && <p className="text-xs text-muted-foreground mb-1">Subject: {step.subject}</p>}
                        <p className="text-xs text-muted-foreground truncate">{step.templateBody}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            {messages && messages.length > 0 && (
              <Card className="bg-navy-light border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm">Messages ({messages.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead>Lead</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Channel</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.slice(0, 50).map((msg: any) => (
                        <TableRow key={msg.id} className="border-border/20">
                          <TableCell className="text-sm">
                            {msg.leadFirstName} {msg.leadLastName}
                            {msg.leadCompany && <span className="text-muted-foreground"> at {msg.leadCompany}</span>}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{msg.stepNumber}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                              {msg.channel.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell><StatusBadge status={msg.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(msg.scheduledAt)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(msg.sentAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {messages.length > 50 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Showing 50 of {messages.length} messages
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">Campaign not found.</p>
        )}
      </div>
    </AdminLayout>
  );
}
