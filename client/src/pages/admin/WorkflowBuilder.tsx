import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowDown,
  Clock,
  Loader2,
  Mail,
  Plus,
  Save,
  Trash2,
  Webhook,
  Bell,
  GitBranch,
  Tag,
} from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const TRIGGER_OPTIONS = [
  { value: "lead_created", label: "Lead Created" },
  { value: "assessment_completed", label: "Assessment Completed" },
  { value: "workshop_registered", label: "Workshop Registered" },
  { value: "proposal_generated", label: "Proposal Generated" },
  { value: "proposal_viewed", label: "Proposal Viewed" },
  { value: "deal_stage_changed", label: "Deal Stage Changed" },
  { value: "deal_closed_won", label: "Deal Closed Won" },
  { value: "deal_closed_lost", label: "Deal Closed Lost" },
  { value: "manual", label: "Manual Enrollment" },
];

const STEP_TYPES = [
  { type: "email", label: "Send Email", icon: Mail, color: "text-blue-400" },
  { type: "wait", label: "Wait", icon: Clock, color: "text-amber" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "text-purple-400" },
  { type: "tag", label: "Add Tag", icon: Tag, color: "text-teal" },
  { type: "webhook", label: "Webhook", icon: Webhook, color: "text-orange-400" },
  { type: "notify", label: "Notify Admin", icon: Bell, color: "text-cyan-400" },
] as const;

interface WorkflowStep {
  stepNumber: number;
  type: "email" | "wait" | "condition" | "tag" | "webhook" | "notify";
  config: Record<string, unknown>;
}

export default function WorkflowBuilder() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const editId = params.get("id") ? Number(params.get("id")) : null;
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState("lead_created");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  const { data: existingWorkflow } = trpc.automation.getWorkflow.useQuery(
    { id: editId ?? 0 },
    { enabled: !!editId }
  );

  const { data: templates } = trpc.automation.listTemplates.useQuery();

  useEffect(() => {
    if (existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description || "");
      setTrigger(existingWorkflow.trigger);
      setSteps((existingWorkflow.steps as WorkflowStep[]) || []);
    }
  }, [existingWorkflow]);

  const createMutation = trpc.automation.createWorkflow.useMutation({
    onSuccess: (wf) => {
      toast.success("Workflow created");
      navigate("/admin/workflows");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.automation.updateWorkflow.useMutation({
    onSuccess: () => {
      toast.success("Workflow updated");
      navigate("/admin/workflows");
    },
    onError: (err) => toast.error(err.message),
  });

  const addStep = (type: WorkflowStep["type"]) => {
    const defaults: Record<string, Record<string, unknown>> = {
      email: { subject: "", body: "" },
      wait: { amount: 1, unit: "days" },
      condition: { field: "", operator: "equals", value: "" },
      tag: { tag: "" },
      webhook: { url: "" },
      notify: { message: "" },
    };

    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, type, config: defaults[type] || {} },
    ]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 }));
    setSteps(updated);
  };

  const updateStepConfig = (index: number, key: string, value: unknown) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], config: { ...updated[index].config, [key]: value } };
    setSteps(updated);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Workflow name is required"); return; }
    if (editId) {
      updateMutation.mutate({ id: editId, name, description: description || undefined, trigger: trigger as any, steps });
    } else {
      createMutation.mutate({ name, description: description || undefined, trigger: trigger as any, steps });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title={editId ? "Edit Workflow" : "New Workflow"} description="Design automation workflow with trigger, steps, and conditions.">
      <div className="space-y-6 max-w-3xl">
        {/* Basics */}
        <Card className="bg-navy-light border-border/30">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground">Workflow Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50 border-border/30" placeholder="e.g. Quiz Funnel Nurture" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background/50 border-border/30 min-h-[60px]" placeholder="What does this workflow do?" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Trigger Event *</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full rounded-md bg-background/50 border border-border/30 px-3 py-2 text-sm"
              >
                {TRIGGER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Workflow Steps</h3>
            <p className="text-xs text-muted-foreground">{steps.length} step{steps.length !== 1 ? "s" : ""}</p>
          </div>

          {steps.map((step, index) => {
            const stepType = STEP_TYPES.find((t) => t.type === step.type);
            const StepIcon = stepType?.icon || Mail;

            return (
              <div key={index}>
                {index > 0 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                )}
                <Card className="bg-navy-light border-border/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StepIcon className={`h-4 w-4 ${stepType?.color}`} />
                        <span className="text-sm font-medium">Step {index + 1}: {stepType?.label}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => removeStep(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {step.type === "email" && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground">Template (optional)</label>
                          <select
                            value={(step.config.templateId as string) || ""}
                            onChange={(e) => updateStepConfig(index, "templateId", e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full rounded-md bg-background/50 border border-border/30 px-3 py-1.5 text-sm"
                          >
                            <option value="">Use inline content</option>
                            {templates?.map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        {!step.config.templateId && (
                          <>
                            <Input
                              placeholder="Subject line"
                              value={(step.config.subject as string) || ""}
                              onChange={(e) => updateStepConfig(index, "subject", e.target.value)}
                              className="bg-background/50 border-border/30 text-sm"
                            />
                            <Textarea
                              placeholder="Email body (HTML, supports {{firstName}}, {{company}} etc.)"
                              value={(step.config.body as string) || ""}
                              onChange={(e) => updateStepConfig(index, "body", e.target.value)}
                              className="bg-background/50 border-border/30 text-sm min-h-[80px]"
                            />
                          </>
                        )}
                      </div>
                    )}

                    {step.type === "wait" && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={(step.config.amount as number) || 1}
                          onChange={(e) => updateStepConfig(index, "amount", Number(e.target.value))}
                          className="bg-background/50 border-border/30 text-sm w-20"
                        />
                        <select
                          value={(step.config.unit as string) || "days"}
                          onChange={(e) => updateStepConfig(index, "unit", e.target.value)}
                          className="rounded-md bg-background/50 border border-border/30 px-3 py-1.5 text-sm"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                          <option value="weeks">Weeks</option>
                        </select>
                      </div>
                    )}

                    {step.type === "condition" && (
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="Field name"
                          value={(step.config.field as string) || ""}
                          onChange={(e) => updateStepConfig(index, "field", e.target.value)}
                          className="bg-background/50 border-border/30 text-sm"
                        />
                        <select
                          value={(step.config.operator as string) || "equals"}
                          onChange={(e) => updateStepConfig(index, "operator", e.target.value)}
                          className="rounded-md bg-background/50 border border-border/30 px-3 py-1.5 text-sm"
                        >
                          <option value="equals">Equals</option>
                          <option value="not_equals">Not Equals</option>
                          <option value="exists">Exists</option>
                          <option value="not_exists">Not Exists</option>
                          <option value="contains">Contains</option>
                        </select>
                        <Input
                          placeholder="Value"
                          value={(step.config.value as string) || ""}
                          onChange={(e) => updateStepConfig(index, "value", e.target.value)}
                          className="bg-background/50 border-border/30 text-sm"
                        />
                      </div>
                    )}

                    {step.type === "tag" && (
                      <Input
                        placeholder="Tag name"
                        value={(step.config.tag as string) || ""}
                        onChange={(e) => updateStepConfig(index, "tag", e.target.value)}
                        className="bg-background/50 border-border/30 text-sm"
                      />
                    )}

                    {step.type === "webhook" && (
                      <Input
                        placeholder="Webhook URL"
                        value={(step.config.url as string) || ""}
                        onChange={(e) => updateStepConfig(index, "url", e.target.value)}
                        className="bg-background/50 border-border/30 text-sm"
                      />
                    )}

                    {step.type === "notify" && (
                      <Input
                        placeholder="Notification message"
                        value={(step.config.message as string) || ""}
                        onChange={(e) => updateStepConfig(index, "message", e.target.value)}
                        className="bg-background/50 border-border/30 text-sm"
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Add Step Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            {STEP_TYPES.map((st) => (
              <Button
                key={st.type}
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => addStep(st.type)}
              >
                <st.icon className={`h-3 w-3 mr-1 ${st.color}`} />
                {st.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            {editId ? "Update Workflow" : "Create Workflow"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/workflows")}>Cancel</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
