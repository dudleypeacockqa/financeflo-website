import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  Loader2,
  RefreshCw,
  Users,
  Webhook,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    sent: "bg-blue-500/20 text-blue-400",
    viewed: "bg-amber/20 text-amber",
    accepted: "bg-teal/20 text-teal",
    declined: "bg-destructive/20 text-destructive",
    registered: "bg-blue-500/20 text-blue-400",
    confirmed: "bg-teal/20 text-teal",
    attended: "bg-green-500/20 text-green-400",
    no_show: "bg-destructive/20 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <Badge className={`${colorMap[status] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {status.replace("_", " ")}
    </Badge>
  );
}

function ConstraintBadge({ constraint }: { constraint: string }) {
  const colorMap: Record<string, string> = {
    capacity: "bg-teal/20 text-teal",
    knowledge: "bg-amber/20 text-amber",
    process: "bg-blue-500/20 text-blue-400",
    scale: "bg-purple-500/20 text-purple-400",
  };
  return (
    <Badge className={`${colorMap[constraint] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {constraint}
    </Badge>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colorMap: Record<string, string> = {
    quiz: "bg-teal/20 text-teal",
    lead_magnet: "bg-amber/20 text-amber",
    workshop: "bg-blue-500/20 text-blue-400",
    contact: "bg-purple-500/20 text-purple-400",
    referral: "bg-green-500/20 text-green-400",
    linkedin: "bg-blue-600/20 text-blue-300",
  };
  return (
    <Badge className={`${colorMap[source] || "bg-muted text-muted-foreground"} border-0 font-mono text-xs`}>
      {source.replace("_", " ")}
    </Badge>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-teal" />
      </div>
    );
  }

  const stats = [
    { label: "Total Leads", value: data?.leads.total ?? 0, icon: Users, color: "text-teal" },
    { label: "Assessments", value: data?.assessments.total ?? 0, icon: ClipboardList, color: "text-amber" },
    { label: "Proposals", value: data?.proposals.total ?? 0, icon: FileText, color: "text-blue-400" },
    { label: "Workshop Regs", value: data?.workshops.total ?? 0, icon: BookOpen, color: "text-purple-400" },
  ];

  return (
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

      {/* Recent Leads */}
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
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell><SourceBadge source={lead.source} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">No leads yet. They will appear here once prospects complete the quiz funnel.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── LEADS TAB ────────────────────────────────────────────────────────────────

function LeadsTab() {
  const { data, isLoading, refetch } = trpc.admin.leads.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>All Leads</h2>
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
                    <TableCell>{lead.company || "—"}</TableCell>
                    <TableCell className="text-sm">{lead.jobTitle || "—"}</TableCell>
                    <TableCell><SourceBadge source={lead.source} /></TableCell>
                    <TableCell className="text-sm">{lead.country || "—"}</TableCell>
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
  );
}

// ─── ASSESSMENTS TAB ──────────────────────────────────────────────────────────

function AssessmentsTab() {
  const { data, isLoading, refetch } = trpc.admin.assessments.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>All Assessments</h2>
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
                      {assessment.costOfInaction ? `£${assessment.costOfInaction.toLocaleString()}` : "—"}
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
  );
}

// ─── PROPOSALS TAB ────────────────────────────────────────────────────────────

function ProposalsTab() {
  const { data, isLoading, refetch } = trpc.admin.proposals.useQuery();
  const updateStatus = trpc.proposal.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Proposal status updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>All Proposals</h2>
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
                      {proposal.estimatedValue ? `£${proposal.estimatedValue.toLocaleString()}` : "—"}
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
                        <span className="text-xs text-muted-foreground">—</span>
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
  );
}

// ─── WORKSHOPS TAB ────────────────────────────────────────────────────────────

function WorkshopsTab() {
  const { data, isLoading, refetch } = trpc.admin.workshops.useQuery();
  const updateStatus = trpc.workshop.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Workshop status updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Workshop Registrations</h2>
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
                    <TableCell>{reg.prepCompleted ? "✓" : "—"}</TableCell>
                    <TableCell>{reg.surveyCompleted ? "✓" : "—"}</TableCell>
                    <TableCell>{reg.certificateIssued ? "✓" : "—"}</TableCell>
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
  );
}

// ─── WEBHOOK EVENTS TAB ───────────────────────────────────────────────────────

function WebhookEventsTab() {
  const { data, isLoading, refetch } = trpc.admin.webhookEvents.useQuery();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>GHL Webhook Events</h2>
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
                    <TableCell className="font-mono text-xs">{event.entityId ? `#${event.entityId}` : "—"}</TableCell>
                    <TableCell>
                      {event.success ? (
                        <Badge className="bg-teal/20 text-teal border-0 text-xs">Success</Badge>
                      ) : (
                        <Badge className="bg-destructive/20 text-destructive border-0 text-xs">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{event.responseStatus || "—"}</TableCell>
                    <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                      {event.errorMessage || "—"}
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
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

export default function Admin() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-navy-light border-border/30 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Authentication Required
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-teal" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage leads, assessments, proposals, and workshop registrations. Signed in as{" "}
            <span className="text-teal font-mono">{user.name || user.email}</span>
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-navy-light border border-border/30 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <BarChart3 className="w-3 h-3" /> Overview
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <Users className="w-3 h-3" /> Leads
            </TabsTrigger>
            <TabsTrigger value="assessments" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <ClipboardList className="w-3 h-3" /> Assessments
            </TabsTrigger>
            <TabsTrigger value="proposals" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <FileText className="w-3 h-3" /> Proposals
            </TabsTrigger>
            <TabsTrigger value="workshops" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <BookOpen className="w-3 h-3" /> Workshops
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="data-[state=active]:bg-teal/20 data-[state=active]:text-teal gap-2">
              <Webhook className="w-3 h-3" /> Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="leads"><LeadsTab /></TabsContent>
          <TabsContent value="assessments"><AssessmentsTab /></TabsContent>
          <TabsContent value="proposals"><ProposalsTab /></TabsContent>
          <TabsContent value="workshops"><WorkshopsTab /></TabsContent>
          <TabsContent value="webhooks"><WebhookEventsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
