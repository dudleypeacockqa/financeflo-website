import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, RefreshCw, Trash2, Zap, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/components/admin/shared";

export default function PromptManager() {
  const { data: prompts, isLoading, refetch } = trpc.prompts.list.useQuery();
  const createMutation = trpc.prompts.create.useMutation({
    onSuccess: () => { toast.success("Prompt created"); refetch(); setShowCreate(false); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.prompts.delete.useMutation({
    onSuccess: () => { toast.success("Prompt deleted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const testMutation = trpc.prompts.test.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "general" as string,
    description: "",
    systemPrompt: "",
    userPromptTemplate: "",
    maxTokens: "4096",
  });

  const [testId, setTestId] = useState<number | null>(null);
  const [testVars, setTestVars] = useState("");

  function handleCreate() {
    if (!form.name || !form.systemPrompt || !form.userPromptTemplate) {
      toast.error("Name, system prompt, and user template are required");
      return;
    }
    createMutation.mutate({
      ...form,
      category: form.category as any,
      maxTokens: parseInt(form.maxTokens) || 4096,
    });
  }

  function handleTest(id: number) {
    try {
      const variables = testVars ? JSON.parse(testVars) : {};
      testMutation.mutate({ id, variables });
    } catch {
      toast.error("Invalid JSON for test variables");
    }
  }

  return (
    <AdminLayout title="Prompt Manager" description="Manage prompt templates with versioning and testing.">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreate(!showCreate)} className="bg-teal hover:bg-teal/90 gap-2">
            <Plus className="w-4 h-4" /> New Prompt
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/40 gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Create Prompt Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="lead_analysis_v2"
                    className="bg-navy border-border/30 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Category</label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-navy border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead_analysis">Lead Analysis</SelectItem>
                      <SelectItem value="dm_sequence">DM Sequence</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="aiba_diagnostic">AIBA Diagnostic</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Max Tokens</label>
                  <Input
                    value={form.maxTokens}
                    onChange={(e) => setForm({ ...form, maxTokens: e.target.value })}
                    className="bg-navy border-border/30 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What does this prompt do?"
                  className="bg-navy border-border/30"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">System Prompt</label>
                <Textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  rows={4}
                  className="bg-navy border-border/30 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  User Prompt Template <span className="text-muted-foreground/60">(use {"{{variable}}"} for placeholders)</span>
                </label>
                <Textarea
                  value={form.userPromptTemplate}
                  onChange={(e) => setForm({ ...form, userPromptTemplate: e.target.value })}
                  rows={6}
                  className="bg-navy border-border/30 font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-teal hover:bg-teal/90">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)} className="border-border/40">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompt List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : prompts && prompts.length > 0 ? (
          <div className="space-y-3">
            {prompts.map((prompt: any) => (
              <Card key={prompt.id} className="bg-navy-light border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-medium text-sm">{prompt.name}</span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                          {prompt.category}
                        </Badge>
                        <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">
                          v{prompt.version}
                        </Badge>
                        {prompt.isActive ? (
                          <Badge className="bg-teal/20 text-teal border-0 text-[10px]">Active</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{prompt.description || "No description"}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Model: {prompt.model} | Max tokens: {prompt.maxTokens} | Updated: {formatDate(prompt.updatedAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-teal hover:text-teal"
                        onClick={() => setTestId(testId === prompt.id ? null : prompt.id)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate({ id: prompt.id })}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Test Panel */}
                  {testId === prompt.id && (
                    <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground">Test Variables (JSON)</label>
                        <Textarea
                          value={testVars}
                          onChange={(e) => setTestVars(e.target.value)}
                          placeholder={'{"name": "John Doe", "company": "Acme Corp"}'}
                          rows={2}
                          className="bg-navy border-border/30 font-mono text-xs mt-1"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleTest(prompt.id)}
                        disabled={testMutation.isPending}
                        className="bg-teal hover:bg-teal/90 gap-2"
                      >
                        {testMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                        Run Test
                      </Button>

                      {testMutation.data && testId === prompt.id && (
                        <Card className="bg-navy border-teal/30 mt-2">
                          <CardContent className="p-3 space-y-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground font-medium">Rendered Prompt:</p>
                              <p className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{testMutation.data.rendered}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-teal font-medium">Response:</p>
                              <p className="text-xs whitespace-pre-wrap">{testMutation.data.result}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No prompt templates yet. Create one or run the seed script to load defaults.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
