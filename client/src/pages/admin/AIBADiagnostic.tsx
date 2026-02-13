import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  BrainCircuit,
  Download,
  FileText,
  Loader2,
  Play,
  TrendingDown,
} from "lucide-react";
import { formatDate, StatusBadge, ConstraintBadge } from "@/components/admin/shared";
import { useState } from "react";
import { toast } from "sonner";

export default function AIBADiagnostic() {
  const { data: analysesList, isLoading, refetch } = trpc.aiba.listAnalyses.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: selectedAnalysis } = trpc.aiba.getAnalysis.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId }
  );

  // New diagnostic form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    notes: "",
    companyName: "",
    industry: "",
    leadId: "",
    dealId: "",
  });

  const runMutation = trpc.aiba.runDiagnostic.useMutation({
    onSuccess: (result) => {
      toast.success(`Diagnostic complete. Analysis #${result.analysisId}`);
      setShowForm(false);
      setFormData({ notes: "", companyName: "", industry: "", leadId: "", dealId: "" });
      setSelectedId(result.analysisId);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const reportMutation = trpc.aiba.generateReportHtml.useMutation({
    onSuccess: (result) => {
      // Open report in new window
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(result.html);
        w.document.close();
      }
      toast.success("Report generated");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="AIBA Diagnostics" description="AI Business Analysis — 4 Engines diagnostic framework with constraint classification.">
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center gap-2 justify-end">
          <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "destructive" : "default"}>
            {showForm ? "Cancel" : <><Play className="h-4 w-4 mr-1" /> New Diagnostic</>}
          </Button>
        </div>

        {/* New Diagnostic Form */}
        {showForm && (
          <Card className="bg-navy-light border-teal/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-teal" />
                Run AIBA Diagnostic
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Company Name</label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-background/50 border-border/30"
                    placeholder="e.g. Acme Ltd"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Industry</label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="bg-background/50 border-border/30"
                    placeholder="e.g. Manufacturing"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Lead ID</label>
                    <Input
                      value={formData.leadId}
                      onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                      className="bg-background/50 border-border/30"
                      placeholder="Optional"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Deal ID</label>
                    <Input
                      value={formData.dealId}
                      onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                      className="bg-background/50 border-border/30"
                      placeholder="Optional"
                      type="number"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Discovery Notes / Transcript *</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-background/50 border-border/30 min-h-[150px]"
                  placeholder="Paste discovery call notes, meeting transcript, or business context here..."
                />
              </div>
              <Button
                onClick={() =>
                  runMutation.mutate({
                    notes: formData.notes,
                    companyName: formData.companyName || undefined,
                    industry: formData.industry || undefined,
                    leadId: formData.leadId ? Number(formData.leadId) : undefined,
                    dealId: formData.dealId ? Number(formData.dealId) : undefined,
                  })
                }
                disabled={!formData.notes.trim() || runMutation.isPending}
              >
                {runMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Running Diagnostic...</>
                ) : (
                  <><BrainCircuit className="h-4 w-4 mr-1" /> Run 4 Engines Analysis</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analysis Detail */}
        {selectedAnalysis && selectedAnalysis.fourEngines && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-teal" />
                  Analysis #{selectedAnalysis.id}
                  {selectedAnalysis.lead?.company && ` — ${selectedAnalysis.lead.company}`}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reportMutation.mutate({ analysisId: selectedAnalysis.id })}
                  disabled={reportMutation.isPending}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {reportMutation.isPending ? "Generating..." : "View Report"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Headline Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Readiness Score</p>
                  <p className={`text-3xl font-bold font-mono ${(selectedAnalysis.readinessScore ?? 0) >= 70 ? "text-teal" : (selectedAnalysis.readinessScore ?? 0) >= 40 ? "text-amber" : "text-destructive"}`}>
                    {selectedAnalysis.readinessScore}/100
                  </p>
                </div>
                <div className="text-center p-3 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Constraint</p>
                  <div className="mt-1">
                    <ConstraintBadge constraint={selectedAnalysis.constraintType || "unknown"} />
                  </div>
                </div>
                <div className="text-center p-3 rounded bg-background/50">
                  <p className="text-xs text-muted-foreground">Cost of Inaction</p>
                  <p className="text-2xl font-bold font-mono text-destructive">
                    £{(selectedAnalysis.costOfInaction ?? 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">per year</p>
                </div>
              </div>

              {/* 4 Engines Grid */}
              <div className="grid grid-cols-2 gap-4">
                {(["revenue", "operations", "compliance", "data"] as const).map((engine) => {
                  const e = (selectedAnalysis.fourEngines as any)?.[engine];
                  if (!e) return null;
                  const scoreClass = e.score >= 7 ? "text-teal" : e.score >= 4 ? "text-amber" : "text-destructive";
                  return (
                    <Card key={engine} className="bg-background/30 border-border/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold capitalize">{engine} Engine</h4>
                          <span className={`text-xl font-bold font-mono ${scoreClass}`}>{e.score}/10</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Findings</p>
                            <ul className="text-xs space-y-0.5 mt-1">
                              {e.findings?.map((f: string, i: number) => (
                                <li key={i} className="text-muted-foreground">• {f}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Opportunities</p>
                            <ul className="text-xs space-y-0.5 mt-1">
                              {e.opportunities?.map((o: string, i: number) => (
                                <li key={i} className="text-teal/80">• {o}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Wins */}
              {selectedAnalysis.quickWins && (selectedAnalysis.quickWins as any[]).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Quick Wins (&lt; 30 days)</h4>
                  <div className="space-y-2">
                    {(selectedAnalysis.quickWins as any[]).map((qw: any, i: number) => (
                      <div key={i} className="bg-teal/5 border border-teal/20 rounded p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{qw.title}</p>
                          <Badge variant="outline" className="text-[10px]">{qw.effort} effort</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{qw.description}</p>
                        <p className="text-xs text-teal mt-1">Impact: {qw.estimatedImpact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Recommendations */}
              {selectedAnalysis.aiRecommendations && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">AI Opportunity Mapping</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {(["ml", "agentic", "rl"] as const).map((type) => {
                      const rec = (selectedAnalysis.aiRecommendations as any)?.[type];
                      if (!rec) return null;
                      const labels: Record<string, string> = {
                        ml: "Machine Learning",
                        agentic: "Agentic AI",
                        rl: "Reinforcement Learning",
                      };
                      return (
                        <Card key={type} className={`border-border/20 ${rec.applicable ? "bg-teal/5" : "bg-background/20"}`}>
                          <CardContent className="p-3">
                            <p className="text-xs font-semibold">{labels[type]}</p>
                            <Badge variant="outline" className={`text-[10px] mt-1 ${rec.applicable ? "text-teal border-teal/30" : "text-muted-foreground"}`}>
                              {rec.applicable ? "Applicable" : "Not Applicable"}
                            </Badge>
                            {rec.useCases?.length > 0 && (
                              <ul className="text-[11px] text-muted-foreground mt-2 space-y-0.5">
                                {rec.useCases.map((u: string, i: number) => (
                                  <li key={i}>• {u}</li>
                                ))}
                              </ul>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analyses List */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">All Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/20 hover:bg-transparent">
                    <TableHead className="text-xs">ID</TableHead>
                    <TableHead className="text-xs">Company</TableHead>
                    <TableHead className="text-xs">Constraint</TableHead>
                    <TableHead className="text-xs">Readiness</TableHead>
                    <TableHead className="text-xs">Cost of Inaction</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysesList?.map((a: any) => (
                    <TableRow
                      key={a.id}
                      className={`border-border/10 cursor-pointer transition-colors ${selectedId === a.id ? "bg-teal/5" : "hover:bg-muted/20"}`}
                      onClick={() => setSelectedId(a.id)}
                    >
                      <TableCell className="font-mono text-xs">#{a.id}</TableCell>
                      <TableCell className="text-sm">{a.leadCompany || "—"}</TableCell>
                      <TableCell>
                        {a.constraintType ? <ConstraintBadge constraint={a.constraintType} /> : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {a.readinessScore !== null ? `${a.readinessScore}/100` : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-destructive">
                        {a.costOfInaction ? `£${a.costOfInaction.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell><StatusBadge status={a.status} /></TableCell>
                      <TableCell className="font-mono text-xs">{formatDate(a.createdAt)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" className="text-xs h-7">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!analysesList || analysesList.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No analyses yet. Run your first AIBA diagnostic above.
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
