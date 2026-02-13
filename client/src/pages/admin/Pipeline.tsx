import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  DollarSign,
  Loader2,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { formatDate, StatusBadge } from "@/components/admin/shared";
import { useState } from "react";
import { toast } from "sonner";

const STAGE_ORDER = [
  "lead", "mql", "sql", "discovery", "aiba_diagnostic",
  "proposal_sent", "negotiation", "closed_won", "closed_lost",
];

const STAGE_LABELS: Record<string, string> = {
  lead: "Lead",
  mql: "MQL",
  sql: "SQL",
  discovery: "Discovery",
  aiba_diagnostic: "AIBA Diagnostic",
  proposal_sent: "Proposal Sent",
  negotiation: "Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const STAGE_COLORS: Record<string, string> = {
  lead: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  mql: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  sql: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  discovery: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  aiba_diagnostic: "bg-amber/20 text-amber border-amber/30",
  proposal_sent: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  negotiation: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  closed_won: "bg-teal/20 text-teal border-teal/30",
  closed_lost: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function Pipeline() {
  const { data: dealsList, isLoading, refetch } = trpc.pipeline.listDeals.useQuery();
  const { data: overview } = trpc.pipeline.overview.useQuery();
  const [, navigate] = useLocation();

  const moveMutation = trpc.pipeline.moveStage.useMutation({
    onSuccess: () => { toast.success("Deal moved"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // Group deals by stage for Kanban view
  const dealsByStage: Record<string, any[]> = {};
  for (const stage of STAGE_ORDER) {
    dealsByStage[stage] = [];
  }
  for (const deal of dealsList ?? []) {
    if (dealsByStage[deal.stage]) {
      dealsByStage[deal.stage].push(deal);
    }
  }

  // Active stages (exclude closed for the main board)
  const activeStages = STAGE_ORDER.filter((s) => s !== "closed_won" && s !== "closed_lost");

  return (
    <AdminLayout title="Sales Pipeline" description="Track deals from lead to close with Kanban board view.">
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Deals", value: overview?.totalDeals ?? 0, color: "text-foreground" },
            { label: "Pipeline Value", value: `£${(overview?.totalValue ?? 0).toLocaleString()}`, color: "text-teal" },
            { label: "Weighted Value", value: `£${(overview?.totalWeightedValue ?? 0).toLocaleString()}`, color: "text-amber" },
            { label: "Active Stages", value: overview?.stages?.filter((s: any) => s.stage !== "closed_won" && s.stage !== "closed_lost").length ?? 0, color: "text-blue-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-navy-light border-border/30">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Closed stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-navy-light border-teal/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Closed Won</p>
                <p className="text-xl font-bold text-teal">{dealsByStage.closed_won.length} deals</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal/40" />
            </CardContent>
          </Card>
          <Card className="bg-navy-light border-destructive/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Closed Lost</p>
                <p className="text-xl font-bold text-destructive">{dealsByStage.closed_lost.length} deals</p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive/40" />
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-teal" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: `${activeStages.length * 260}px` }}>
              {activeStages.map((stage) => (
                <div key={stage} className="w-[250px] flex-shrink-0">
                  <div className={`rounded-t-lg border-t-2 px-3 py-2 ${STAGE_COLORS[stage]}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {STAGE_LABELS[stage]}
                      </span>
                      <Badge variant="outline" className="text-[10px] border-current/30">
                        {dealsByStage[stage].length}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2 min-h-[100px]">
                    {dealsByStage[stage].map((deal: any) => (
                      <Card
                        key={deal.id}
                        className="bg-navy-light border-border/30 cursor-pointer hover:border-teal/40 transition-colors"
                        onClick={() => navigate(`/admin/deal/${deal.id}`)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <p className="text-sm font-medium truncate">{deal.title}</p>
                          {deal.lead?.company && (
                            <p className="text-xs text-muted-foreground truncate">{deal.lead.company}</p>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            {deal.value ? (
                              <span className="text-teal font-mono">£{deal.value.toLocaleString()}</span>
                            ) : (
                              <span className="text-muted-foreground">No value</span>
                            )}
                            <span className="text-muted-foreground">{deal.probability}%</span>
                          </div>
                          {deal.assignedTo && (
                            <p className="text-[10px] text-muted-foreground/60">{deal.assignedTo}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {dealsByStage[stage].length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground/40">
                        No deals
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
