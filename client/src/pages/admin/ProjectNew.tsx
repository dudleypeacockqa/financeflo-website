import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ProjectNew() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const createMutation = trpc.delivery.createProject.useMutation({
    onSuccess: (result) => {
      toast.success("Project created");
      navigate(`/admin/project/${result.projectId}`);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <AdminLayout title="New Project" description="Create a standalone service delivery project.">
      <Card className="bg-navy-light border-border/30 max-w-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-teal" /> Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Project Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AIBA Implementation - Acme Corp"
              className="bg-background/50 border-border/30 text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief project description..."
              className="bg-background/50 border-border/30 text-sm min-h-[80px] mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Contract Value (£)</label>
              <Input
                type="number"
                min="0"
                value={contractValue}
                onChange={(e) => setContractValue(e.target.value)}
                placeholder="0"
                className="bg-background/50 border-border/30 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Assigned To</label>
              <Input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Team member name"
                className="bg-background/50 border-border/30 text-sm mt-1"
              />
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <Button
              onClick={() => createMutation.mutate({
                name,
                description: description || undefined,
                contractValue: contractValue ? Number(contractValue) : undefined,
                assignedTo: assignedTo || undefined,
                seedMilestones: true,
              })}
              disabled={!name.trim() || createMutation.isPending}
            >
              Create Project
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/projects")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
