import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface SequenceStep {
  stepNumber: number;
  channel: string;
  delayDays: number;
  subject?: string;
  templateBody: string;
}

export default function CampaignBuilder() {
  const [, navigate] = useLocation();
  const { data: lists } = trpc.leadgen.listLists.useQuery();

  const createMutation = trpc.outreach.createCampaign.useMutation({
    onSuccess: (campaign) => {
      toast.success("Campaign created");
      navigate(`/admin/campaign/${campaign.id}`);
    },
    onError: (err) => toast.error(err.message),
  });

  const [name, setName] = useState("");
  const [channel, setChannel] = useState<"linkedin_dm" | "linkedin_connection" | "email">("linkedin_dm");
  const [listId, setListId] = useState<number | undefined>(undefined);
  const [dailyLimit, setDailyLimit] = useState(50);
  const [sendWindowStart, setSendWindowStart] = useState("09:00");
  const [sendWindowEnd, setSendWindowEnd] = useState("17:00");
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [steps, setSteps] = useState<SequenceStep[]>([
    { stepNumber: 1, channel: "linkedin_connection", delayDays: 0, templateBody: "Hi {{firstName}}, {{AI_PERSONALIZE}}" },
  ]);

  function addStep() {
    const lastStep = steps[steps.length - 1];
    setSteps([...steps, {
      stepNumber: steps.length + 1,
      channel: channel === "email" ? "email" : "linkedin_dm",
      delayDays: (lastStep?.delayDays ?? 0) + 3,
      subject: channel === "email" ? "" : undefined,
      templateBody: "",
    }]);
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return;
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-number
    newSteps.forEach((s, i) => (s.stepNumber = i + 1));
    setSteps(newSteps);
  }

  function updateStep(index: number, field: keyof SequenceStep, value: string | number) {
    const newSteps = [...steps];
    (newSteps[index] as any)[field] = value;
    setSteps(newSteps);
  }

  function handleCreate() {
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    if (steps.some((s) => !s.templateBody.trim())) {
      toast.error("All steps must have message content");
      return;
    }

    createMutation.mutate({
      name,
      channel,
      listId,
      sequenceSteps: steps,
      settings: {
        dailyLimit,
        sendWindowStart,
        sendWindowEnd,
        timezone: "Europe/London",
        skipWeekends,
      },
    });
  }

  return (
    <AdminLayout title="Campaign Builder" description="Create a new outreach campaign with multi-step sequences.">
      <div className="space-y-6 max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/campaigns")}
        >
          <ArrowLeft className="w-3 h-3" /> Back to Campaigns
        </Button>

        {/* Campaign Details */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader>
            <CardTitle className="text-sm">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Campaign Name</label>
              <Input
                placeholder="e.g., Q1 2026 CFO Outreach"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Primary Channel</label>
                <select
                  className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                >
                  <option value="linkedin_dm">LinkedIn DM</option>
                  <option value="linkedin_connection">LinkedIn Connection</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Lead List</label>
                <select
                  className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                  value={listId ?? ""}
                  onChange={(e) => setListId(e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Select a list...</option>
                  {(lists || []).map((list: any) => (
                    <option key={list.id} value={list.id}>
                      {list.name} ({list.memberCount} leads)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Send Settings */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader>
            <CardTitle className="text-sm">Send Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Daily Limit</label>
                <Input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="bg-background/50"
                  min={1}
                  max={200}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Send Window Start</label>
                <Input
                  type="time"
                  value={sendWindowStart}
                  onChange={(e) => setSendWindowStart(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Send Window End</label>
                <Input
                  type="time"
                  value={sendWindowEnd}
                  onChange={(e) => setSendWindowEnd(e.target.value)}
                  className="bg-background/50"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={skipWeekends}
                onChange={(e) => setSkipWeekends(e.target.checked)}
                className="rounded border-border/40"
              />
              Skip weekends
            </label>
          </CardContent>
        </Card>

        {/* Sequence Steps */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Sequence Steps</CardTitle>
            <Button variant="outline" size="sm" className="gap-2 border-border/40" onClick={addStep}>
              <Plus className="w-3 h-3" /> Add Step
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="border border-border/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Step {step.stepNumber}</span>
                  {steps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeStep(idx)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Channel</label>
                    <select
                      className="w-full rounded-md border border-border/40 bg-background/50 px-3 py-2 text-sm"
                      value={step.channel}
                      onChange={(e) => updateStep(idx, "channel", e.target.value)}
                    >
                      <option value="linkedin_connection">LinkedIn Connection Request</option>
                      <option value="linkedin_dm">LinkedIn DM</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Delay (days after previous)</label>
                    <Input
                      type="number"
                      value={step.delayDays}
                      onChange={(e) => updateStep(idx, "delayDays", Number(e.target.value))}
                      className="bg-background/50"
                      min={0}
                    />
                  </div>
                </div>
                {(step.channel === "email") && (
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Subject Line</label>
                    <Input
                      placeholder="Email subject line"
                      value={step.subject || ""}
                      onChange={(e) => updateStep(idx, "subject", e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Message Template</label>
                  <Textarea
                    placeholder="Use {{firstName}}, {{company}}, {{title}}, {{industry}}, {{headline}} for variables. Use {{AI_PERSONALIZE}} for AI-generated content."
                    value={step.templateBody}
                    onChange={(e) => updateStep(idx, "templateBody", e.target.value)}
                    rows={4}
                    className="font-mono text-xs bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variables: {"{{firstName}}"}, {"{{company}}"}, {"{{title}}"}, {"{{industry}}"}, {"{{headline}}"}, {"{{AI_PERSONALIZE}}"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Create Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/campaigns")} className="border-border/40">
            Cancel
          </Button>
          <Button
            className="bg-teal hover:bg-teal/90 gap-2"
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Create Campaign
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
