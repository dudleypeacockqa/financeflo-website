import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Brain,
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Play,
  User,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { formatDate, StatusBadge, ConstraintBadge, SourceBadge } from "@/components/admin/shared";

export default function LeadProfile() {
  const [, params] = useRoute("/admin/lead-profile/:id");
  const [, navigate] = useLocation();
  const leadId = params?.id ? parseInt(params.id, 10) : null;

  const { data: leadsData } = trpc.admin.leads.useQuery();
  const { data: research, isLoading: researchLoading } = trpc.leadgen.getResearch.useQuery(
    { leadId: leadId! },
    { enabled: !!leadId }
  );

  const researchMutation = trpc.leadgen.researchLead.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error(err.message),
  });

  const lead = leadsData?.find((l: any) => l.id === leadId);

  if (!leadId) {
    return (
      <AdminLayout title="Lead Profile" description="Lead not found.">
        <p className="text-muted-foreground">Invalid lead ID.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Lead Profile" description="Detailed view of a lead with research results and engagement history.">
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/lead-research")}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Lead Research
        </Button>

        {!lead ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : (
          <>
            {/* Lead Info Header */}
            <Card className="bg-navy-light border-border/30">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-teal" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{lead.firstName} {lead.lastName}</h2>
                        <p className="text-sm text-muted-foreground">{lead.jobTitle || "No title"} at {lead.company || "Unknown company"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {lead.email}
                      </span>
                      {lead.linkedinUrl && (
                        <a
                          href={lead.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" /> LinkedIn
                        </a>
                      )}
                      {lead.companyWebsite && (
                        <a
                          href={lead.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          <Building2 className="w-3 h-3" /> Website
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceBadge source={lead.source} />
                    <StatusBadge status={lead.researchStatus || "none"} />
                  </div>
                </div>

                {/* Lead details grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-border/20">
                  <div>
                    <p className="text-xs text-muted-foreground">Industry</p>
                    <p className="text-sm font-medium">{lead.industry || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Company Size</p>
                    <p className="text-sm font-medium">{lead.companySize || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Country</p>
                    <p className="text-sm font-medium">{lead.country || "\u2014"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(lead.createdAt)}</p>
                  </div>
                  {lead.linkedinHeadline && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">LinkedIn Headline</p>
                      <p className="text-sm">{lead.linkedinHeadline}</p>
                    </div>
                  )}
                  {lead.archetype && (
                    <div>
                      <p className="text-xs text-muted-foreground">Archetype</p>
                      <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs mt-1">
                        {lead.archetype}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Research Results */}
            {researchLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-teal" />
              </div>
            ) : research ? (
              <div className="space-y-4">
                {/* Research metadata */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Research Status:</span>
                  <StatusBadge status={research.status} />
                  {research.constraintType && (
                    <>
                      <span className="text-muted-foreground">Constraint:</span>
                      <ConstraintBadge constraint={research.constraintType} />
                    </>
                  )}
                  {research.qualityScore != null && (
                    <span className={`font-mono font-bold ${
                      research.qualityScore >= 70 ? "text-teal" :
                      research.qualityScore >= 40 ? "text-amber" :
                      "text-destructive"
                    }`}>
                      Score: {research.qualityScore}/100
                    </span>
                  )}
                  {research.costUsd && (
                    <span className="text-muted-foreground">Cost: ${research.costUsd}</span>
                  )}
                </div>

                {/* Research sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {research.leadProfile && (
                    <ResearchCard
                      title="Lead Profile"
                      icon={User}
                      data={research.leadProfile}
                    />
                  )}
                  {research.painGainAnalysis && (
                    <ResearchCard
                      title="Pain/Gain Analysis (4 Engines)"
                      icon={Brain}
                      data={research.painGainAnalysis}
                    />
                  )}
                  {research.companyResearch && (
                    <ResearchCard
                      title="Company Research"
                      icon={Building2}
                      data={research.companyResearch}
                    />
                  )}
                  {research.dmSequence && (
                    <ResearchCard
                      title="DM Sequence"
                      icon={MessageSquare}
                      data={research.dmSequence}
                    />
                  )}
                  {research.linkedinData && (
                    <ResearchCard
                      title="LinkedIn Data"
                      icon={ExternalLink}
                      data={research.linkedinData}
                    />
                  )}
                </div>

                {research.errorMessage && (
                  <Card className="bg-destructive/10 border-destructive/30">
                    <CardContent className="p-4">
                      <p className="text-sm text-destructive font-medium">Error</p>
                      <p className="text-xs text-destructive/80 mt-1">{research.errorMessage}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-navy-light border-border/30">
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No research data yet for this lead.</p>
                  <Button
                    size="sm"
                    className="bg-teal hover:bg-teal/90 gap-2"
                    onClick={() => researchMutation.mutate({ leadId: leadId! })}
                    disabled={researchMutation.isPending}
                  >
                    {researchMutation.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Start Research
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function ResearchCard({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: React.ElementType;
  data: any;
}) {
  return (
    <Card className="bg-navy-light border-border/30">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Icon className="w-3 h-3" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-64 overflow-y-auto">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
