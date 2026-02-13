import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Layers,
  Loader2,
  Play,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function BatchMonitor() {
  const { data: batches, isLoading, refetch } = trpc.leadgen.listBatches.useQuery();
  const { data: lists } = trpc.leadgen.listLists.useQuery();

  const createBatchMutation = trpc.leadgen.createBatch.useMutation({
    onSuccess: () => {
      toast.success("Batch created");
      refetch();
      setNewBatchName("");
      setShowCreate(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const startBatchMutation = trpc.leadgen.startBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`Batch started with ${data.leadCount} leads`);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [selectedListId, setSelectedListId] = useState<number | undefined>(undefined);
  const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

  // Aggregate stats
  const totalLeads = batches?.reduce((sum: number, b: any) => sum + b.totalLeads, 0) ?? 0;
  const totalProcessed = batches?.reduce((sum: number, b: any) => sum + b.processedLeads, 0) ?? 0;
  const totalFailed = batches?.reduce((sum: number, b: any) => sum + b.failedLeads, 0) ?? 0;
  const totalCost = batches?.reduce((sum: number, b: any) => sum + parseFloat(b.totalCostUsd || "0"), 0) ?? 0;

  return (
    <AdminLayout title="Batch Monitor" description="Manage and monitor batch lead research operations.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Batches", value: batches?.length ?? 0, color: "text-foreground" },
            { label: "Total Leads", value: totalLeads, color: "text-blue-400" },
            { label: "Processed", value: totalProcessed, color: "text-teal" },
            { label: "Failed", value: totalFailed, color: "text-destructive" },
            { label: "Total Cost", value: `$${totalCost.toFixed(2)}`, color: "text-amber" },
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
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus className="w-3 h-3" /> New Batch
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

        {/* Create Batch Form */}
        {showCreate && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-sm">Create New Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Batch name (e.g., 'Q1 2026 LinkedIn Outreach')"
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
                className="bg-background/50"
              />
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Lead List (optional)</label>
                <select
                  className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                  value={selectedListId ?? ""}
                  onChange={(e) => setSelectedListId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">All unresearched leads</option>
                  {(lists || []).map((list: any) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.memberCount} members)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowCreate(false); setNewBatchName(""); }}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => createBatchMutation.mutate({ name: newBatchName, listId: selectedListId })}
                  disabled={createBatchMutation.isPending || !newBatchName.trim()}
                  className="bg-teal hover:bg-teal/90 gap-2"
                >
                  {createBatchMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Batches Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : batches && batches.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch: any) => (
                    <>
                      <TableRow key={batch.id} className="border-border/20">
                        <TableCell className="font-mono text-xs text-muted-foreground">#{batch.id}</TableCell>
                        <TableCell className="font-medium">{batch.name}</TableCell>
                        <TableCell><StatusBadge status={batch.status} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full bg-background/50 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal transition-all"
                                style={{
                                  width: batch.totalLeads > 0
                                    ? `${Math.round((batch.processedLeads / batch.totalLeads) * 100)}%`
                                    : "0%",
                                }}
                              />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              {batch.processedLeads}/{batch.totalLeads}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {batch.failedLeads > 0 ? (
                            <span className="text-destructive font-mono text-xs">{batch.failedLeads}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">0</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {batch.totalCostUsd ? `$${batch.totalCostUsd}` : "\u2014"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(batch.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {batch.status === "draft" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-teal hover:text-teal"
                                onClick={() => startBatchMutation.mutate({ batchId: batch.id })}
                                disabled={startBatchMutation.isPending}
                                title="Start batch"
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            {batch.errors && batch.errors.length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-amber hover:text-amber"
                                onClick={() =>
                                  setExpandedBatchId(expandedBatchId === batch.id ? null : batch.id)
                                }
                                title="View errors"
                              >
                                <AlertTriangle className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded error log */}
                      {expandedBatchId === batch.id && batch.errors && batch.errors.length > 0 && (
                        <TableRow key={`${batch.id}-errors`} className="border-border/20 bg-background/30">
                          <TableCell colSpan={8} className="p-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-destructive">Error Log</p>
                              {batch.errors.map((err: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-xs">
                                  <span className="font-mono text-muted-foreground">Lead #{err.leadId}:</span>
                                  <span className="text-destructive">{err.error}</span>
                                </div>
                              ))}
                            </div>
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
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No batches created yet. Create a batch to process leads in bulk.</p>
            </CardContent>
          </Card>
        )}

        {/* Lead Lists Section */}
        <LeadListsSection />
      </div>
    </AdminLayout>
  );
}

function LeadListsSection() {
  const { data: lists, isLoading, refetch } = trpc.leadgen.listLists.useQuery();
  const createListMutation = trpc.leadgen.createList.useMutation({
    onSuccess: () => {
      toast.success("List created");
      refetch();
      setNewListName("");
      setShowCreateList(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Lead Lists</h3>
        <Button
          variant="outline"
          size="sm"
          className="border-border/40 gap-2"
          onClick={() => setShowCreateList(!showCreateList)}
        >
          <Plus className="w-3 h-3" /> New List
        </Button>
      </div>

      {showCreateList && (
        <Card className="bg-navy-light border-border/30">
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="bg-background/50"
            />
            <Input
              placeholder="Description (optional)"
              value={newListDesc}
              onChange={(e) => setNewListDesc(e.target.value)}
              className="bg-background/50"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateList(false)}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => createListMutation.mutate({ name: newListName, description: newListDesc || undefined })}
                disabled={createListMutation.isPending || !newListName.trim()}
                className="bg-teal hover:bg-teal/90"
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-teal" />
        </div>
      ) : lists && lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lists.map((list: any) => (
            <Card key={list.id} className="bg-navy-light border-border/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{list.name}</p>
                  <Badge className="bg-teal/20 text-teal border-0 font-mono text-xs">
                    {list.memberCount} leads
                  </Badge>
                </div>
                {list.description && (
                  <p className="text-xs text-muted-foreground">{list.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{formatDate(list.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">No lead lists created yet.</p>
      )}
    </div>
  );
}
