import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ChevronDown,
  ChevronUp,
  FolderSearch,
  Loader2,
  Play,
  RefreshCw,
  Upload,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, StatusBadge, ConstraintBadge, SourceBadge } from "@/components/admin/shared";

export default function LeadResearch() {
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = trpc.admin.leads.useQuery();
  const { data: researchList, isLoading: researchLoading, refetch: refetchResearch } = trpc.leadgen.listResearch.useQuery();

  const researchMutation = trpc.leadgen.researchLead.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetchLeads();
    },
    onError: (err) => toast.error(err.message),
  });

  const importMutation = trpc.leadgen.importLeads.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.imported} leads (${data.skipped} skipped)`);
      refetchLeads();
      setCsvData("");
    },
    onError: (err) => toast.error(err.message),
  });

  const [expandedResearchId, setExpandedResearchId] = useState<number | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [csvData, setCsvData] = useState("");

  function handleCsvImport() {
    if (!csvData.trim()) return;

    const lines = csvData.trim().split("\n");
    if (lines.length < 2) {
      toast.error("CSV must have a header row and at least one data row");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["firstname", "lastname", "email"];
    const missing = requiredHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      toast.error(`Missing required columns: ${missing.join(", ")}`);
      return;
    }

    const leads = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < headers.length) continue;

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      if (!row.email) continue;

      leads.push({
        firstName: row.firstname || row.first_name || "",
        lastName: row.lastname || row.last_name || "",
        email: row.email,
        company: row.company || undefined,
        jobTitle: row.jobtitle || row.job_title || row.title || undefined,
        linkedinUrl: row.linkedinurl || row.linkedin_url || row.linkedin || undefined,
        industry: row.industry || undefined,
        companySize: row.companysize || row.company_size || undefined,
        companyWebsite: row.companywebsite || row.company_website || row.website || undefined,
      });
    }

    if (leads.length === 0) {
      toast.error("No valid leads found in CSV");
      return;
    }

    importMutation.mutate({ leads, source: "linkedin" });
  }

  // Merge leads with their research data
  const enrichedLeads = (leadsData || []).map((lead: any) => {
    const research = (researchList || []).find((r: any) => r.leadId === lead.id);
    return { ...lead, research };
  });

  return (
    <AdminLayout title="Lead Research" description="Research leads with AI-powered LinkedIn scraping, company analysis, and DM sequence generation.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Leads", value: leadsData?.length ?? 0, color: "text-foreground" },
            { label: "Not Researched", value: enrichedLeads.filter((l: any) => l.researchStatus === "none").length, color: "text-muted-foreground" },
            { label: "Researching", value: enrichedLeads.filter((l: any) => l.researchStatus === "researching").length, color: "text-blue-400" },
            { label: "Complete", value: enrichedLeads.filter((l: any) => l.researchStatus === "complete").length, color: "text-teal" },
            { label: "Errors", value: enrichedLeads.filter((l: any) => l.researchStatus === "error").length, color: "text-destructive" },
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
            variant="outline"
            size="sm"
            className="border-border/40 gap-2"
            onClick={() => setShowImport(!showImport)}
          >
            <Upload className="w-3 h-3" /> Import CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refetchLeads(); refetchResearch(); }}
            className="border-border/40 gap-2"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {/* CSV Import */}
        {showImport && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-sm">Import Leads from CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Required columns: <code>firstName</code>, <code>lastName</code>, <code>email</code>.
                Optional: <code>company</code>, <code>jobTitle</code>, <code>linkedinUrl</code>, <code>industry</code>, <code>companySize</code>, <code>companyWebsite</code>.
              </p>
              <Textarea
                placeholder="firstName,lastName,email,company,jobTitle,linkedinUrl&#10;John,Doe,john@example.com,Acme Corp,CFO,https://linkedin.com/in/johndoe"
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                rows={6}
                className="font-mono text-xs bg-background/50"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowImport(false); setCsvData(""); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCsvImport}
                  disabled={importMutation.isPending || !csvData.trim()}
                  className="bg-teal hover:bg-teal/90 gap-2"
                >
                  {importMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Import
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads Table */}
        {leadsLoading || researchLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : enrichedLeads.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Research</TableHead>
                    <TableHead>Archetype</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrichedLeads.map((lead: any) => (
                    <>
                      <TableRow key={lead.id} className="border-border/20">
                        <TableCell className="font-mono text-xs text-muted-foreground">#{lead.id}</TableCell>
                        <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                        <TableCell className="text-sm">{lead.company || "\u2014"}</TableCell>
                        <TableCell className="text-sm">{lead.jobTitle || "\u2014"}</TableCell>
                        <TableCell><SourceBadge source={lead.source} /></TableCell>
                        <TableCell><StatusBadge status={lead.researchStatus || "none"} /></TableCell>
                        <TableCell>
                          {lead.research?.archetype ? (
                            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                              {lead.research.archetype}
                            </Badge>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          {lead.research?.qualityScore != null ? (
                            <span className={`font-mono text-sm font-bold ${
                              lead.research.qualityScore >= 70 ? "text-teal" :
                              lead.research.qualityScore >= 40 ? "text-amber" :
                              "text-destructive"
                            }`}>
                              {lead.research.qualityScore}
                            </span>
                          ) : "\u2014"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {lead.researchStatus === "none" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-teal hover:text-teal"
                                onClick={() => researchMutation.mutate({ leadId: lead.id })}
                                disabled={researchMutation.isPending}
                                title="Start research"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {lead.research && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  setExpandedResearchId(
                                    expandedResearchId === lead.id ? null : lead.id
                                  )
                                }
                                title="View research details"
                              >
                                {expandedResearchId === lead.id ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded research detail */}
                      {expandedResearchId === lead.id && lead.research && (
                        <TableRow key={`${lead.id}-detail`} className="border-border/20 bg-background/30">
                          <TableCell colSpan={9} className="p-4">
                            <ResearchDetail research={lead.research} />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <FolderSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No leads found. Import leads via CSV or capture them through the quiz funnel.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function ResearchDetail({ research }: { research: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile */}
        {research.leadProfile && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="p-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lead Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
                {typeof research.leadProfile === "string"
                  ? research.leadProfile
                  : JSON.stringify(research.leadProfile, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Pain/Gain Analysis */}
        {research.painGainAnalysis && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="p-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pain/Gain Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
                {typeof research.painGainAnalysis === "string"
                  ? research.painGainAnalysis
                  : JSON.stringify(research.painGainAnalysis, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* DM Sequence */}
        {research.dmSequence && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="p-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">DM Sequence</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground max-h-48 overflow-y-auto">
                {typeof research.dmSequence === "string"
                  ? research.dmSequence
                  : JSON.stringify(research.dmSequence, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Status: <StatusBadge status={research.status} /></span>
        {research.constraintType && (
          <span>Constraint: <ConstraintBadge constraint={research.constraintType} /></span>
        )}
        {research.costUsd && <span>Cost: ${research.costUsd}</span>}
        <span>Updated: {formatDate(research.updatedAt)}</span>
        {research.errorMessage && (
          <span className="text-destructive">Error: {research.errorMessage}</span>
        )}
      </div>
    </div>
  );
}
