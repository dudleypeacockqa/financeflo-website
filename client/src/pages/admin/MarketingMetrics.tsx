import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Loader2,
  Mail,
  MailOpen,
  MousePointerClick,
  Send,
  TrendingUp,
  UserMinus,
} from "lucide-react";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function MarketingMetrics() {
  const { data: emailStats, isLoading: loadingStats } = trpc.automation.getEmailAnalytics.useQuery();
  const { data: recentSends, isLoading: loadingSends } = trpc.automation.listEmailSends.useQuery({ limit: 25 });
  const { data: workflowsList } = trpc.automation.listWorkflows.useQuery();

  if (loadingStats) {
    return (
      <AdminLayout title="Marketing Metrics">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-teal" />
        </div>
      </AdminLayout>
    );
  }

  const total = emailStats?.total ?? 0;
  const sent = emailStats?.sent ?? 0;
  const delivered = emailStats?.delivered ?? 0;
  const opened = emailStats?.opened ?? 0;
  const clicked = emailStats?.clicked ?? 0;
  const bounced = emailStats?.bounced ?? 0;
  const unsubscribed = emailStats?.unsubscribed ?? 0;

  const deliveryRate = sent > 0 ? Math.round((delivered / sent) * 100) : 0;
  const openRate = delivered > 0 ? Math.round((opened / delivered) * 100) : 0;
  const clickRate = opened > 0 ? Math.round((clicked / opened) * 100) : 0;
  const bounceRate = sent > 0 ? Math.round((bounced / sent) * 100) : 0;

  return (
    <AdminLayout title="Marketing Metrics" description="Email analytics, delivery rates, and workflow performance.">
      <div className="space-y-6">
        {/* Email KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Emails Sent", value: sent, icon: Send, color: "text-blue-400" },
            { label: "Delivered", value: `${delivered} (${deliveryRate}%)`, icon: Mail, color: "text-teal" },
            { label: "Opened", value: `${opened} (${openRate}%)`, icon: MailOpen, color: "text-amber" },
            { label: "Clicked", value: `${clicked} (${clickRate}%)`, icon: MousePointerClick, color: "text-purple-400" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-navy-light border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <kpi.icon className="h-4 w-4 text-muted-foreground/40" />
                </div>
                <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Bounce Rate</p>
              <p className={`text-2xl font-bold font-mono ${bounceRate > 5 ? "text-destructive" : "text-teal"}`}>{bounceRate}%</p>
              <p className="text-[10px] text-muted-foreground">{bounced} bounced</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Unsubscribed</p>
              <p className="text-2xl font-bold font-mono text-amber">{unsubscribed}</p>
              <p className="text-[10px] text-muted-foreground">{total > 0 ? Math.round((unsubscribed / total) * 100) : 0}% rate</p>
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold font-mono text-destructive">{emailStats?.failed ?? 0}</p>
              <p className="text-[10px] text-muted-foreground">delivery errors</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Performance */}
        {workflowsList && workflowsList.length > 0 && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal" />
                Workflow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20 hover:bg-transparent">
                    <TableHead className="text-xs">Workflow</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Enrolled</TableHead>
                    <TableHead className="text-xs text-right">Active</TableHead>
                    <TableHead className="text-xs text-right">Completed</TableHead>
                    <TableHead className="text-xs text-right">Completion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowsList.map((wf: any) => {
                    const enrolled = wf.metrics?.totalEnrolled ?? 0;
                    const completed = wf.metrics?.totalCompleted ?? 0;
                    const completionRate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

                    return (
                      <TableRow key={wf.id} className="border-border/10">
                        <TableCell className="text-sm font-medium">{wf.name}</TableCell>
                        <TableCell><StatusBadge status={wf.status} /></TableCell>
                        <TableCell className="text-right font-mono text-sm">{enrolled}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-blue-400">{wf.metrics?.totalActive ?? 0}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-teal">{completed}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-background/50 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-teal" style={{ width: `${completionRate}%` }} />
                            </div>
                            <span className="text-xs font-mono">{completionRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Recent Email Sends */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-400" />
              Recent Email Sends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSends ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20 hover:bg-transparent">
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Sent</TableHead>
                    <TableHead className="text-xs">Opened</TableHead>
                    <TableHead className="text-xs">Clicked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSends?.map((s: any) => (
                    <TableRow key={s.send.id} className="border-border/10">
                      <TableCell className="text-sm">
                        {s.leadFirstName} {s.leadLastName}
                        {s.leadEmail && (
                          <span className="text-[10px] text-muted-foreground ml-1">({s.leadEmail})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {s.send.subject || "—"}
                      </TableCell>
                      <TableCell><StatusBadge status={s.send.status} /></TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(s.send.sentAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(s.send.openedAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(s.send.clickedAt)}</TableCell>
                    </TableRow>
                  ))}
                  {(!recentSends || recentSends.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No emails sent yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
