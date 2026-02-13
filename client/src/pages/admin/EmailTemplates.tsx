import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Edit,
  Eye,
  Loader2,
  Mail,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { formatDate } from "@/components/admin/shared";
import { useState } from "react";
import { toast } from "sonner";

interface TemplateForm {
  id?: number;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  category: string;
  variables: string;
}

const EMPTY_FORM: TemplateForm = {
  name: "",
  subject: "",
  htmlBody: "",
  textBody: "",
  category: "",
  variables: "firstName, lastName, company",
};

export default function EmailTemplates() {
  const { data: templatesList, isLoading, refetch } = trpc.automation.listTemplates.useQuery();
  const [form, setForm] = useState<TemplateForm | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const createMutation = trpc.automation.createTemplate.useMutation({
    onSuccess: () => { toast.success("Template created"); setForm(null); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.automation.updateTemplate.useMutation({
    onSuccess: () => { toast.success("Template updated"); setForm(null); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.automation.deleteTemplate.useMutation({
    onSuccess: () => { toast.success("Template deleted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!form) return;
    if (!form.name.trim() || !form.subject.trim() || !form.htmlBody.trim()) {
      toast.error("Name, subject, and body are required");
      return;
    }

    const data = {
      name: form.name,
      subject: form.subject,
      htmlBody: form.htmlBody,
      textBody: form.textBody || undefined,
      category: form.category || undefined,
      variables: form.variables.split(",").map((v) => v.trim()).filter(Boolean),
    };

    if (form.id) {
      updateMutation.mutate({ id: form.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (template: any) => {
    setForm({
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody || "",
      category: template.category || "",
      variables: (template.variables || []).join(", "),
    });
  };

  const handlePreview = (template: any) => {
    // Simple preview with sample data
    let preview = template.htmlBody;
    preview = preview.replace(/\{\{firstName\}\}/g, "John");
    preview = preview.replace(/\{\{lastName\}\}/g, "Smith");
    preview = preview.replace(/\{\{company\}\}/g, "Acme Ltd");
    preview = preview.replace(/\{\{fullName\}\}/g, "John Smith");
    preview = preview.replace(/\{\{email\}\}/g, "john@acme.com");
    setPreviewHtml(preview);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Email Templates" description="Create and manage reusable email templates for marketing automation.">
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          {!form && (
            <Button onClick={() => setForm({ ...EMPTY_FORM })}>
              <Plus className="h-4 w-4 mr-1" /> New Template
            </Button>
          )}
        </div>

        {/* Preview Modal */}
        {previewHtml && (
          <Card className="bg-navy-light border-teal/30">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4 text-teal" /> Email Preview
                </CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setPreviewHtml(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="bg-white rounded-lg p-4 text-black max-h-[400px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </CardContent>
          </Card>
        )}

        {/* Editor */}
        {form && (
          <Card className="bg-navy-light border-teal/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal" />
                {form.id ? "Edit Template" : "New Template"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Template Name *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50 border-border/30" placeholder="e.g. Welcome Email" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Category</label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-background/50 border-border/30" placeholder="e.g. nurture, welcome, follow-up" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Subject Line * (supports {"{{variables}}"})</label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="bg-background/50 border-border/30" placeholder='e.g. Hey {{firstName}}, your assessment results are ready' />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">HTML Body * (supports {"{{variables}}"})</label>
                <Textarea
                  value={form.htmlBody}
                  onChange={(e) => setForm({ ...form, htmlBody: e.target.value })}
                  className="bg-background/50 border-border/30 min-h-[200px] font-mono text-xs"
                  placeholder="<h2>Hi {{firstName}},</h2><p>Your assessment results...</p>"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Plain Text Body (optional — auto-generated if empty)</label>
                <Textarea
                  value={form.textBody}
                  onChange={(e) => setForm({ ...form, textBody: e.target.value })}
                  className="bg-background/50 border-border/30 min-h-[80px] font-mono text-xs"
                  placeholder="Plain text version..."
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Available Variables (comma-separated)</label>
                <Input value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} className="bg-background/50 border-border/30" />
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                  {form.id ? "Update" : "Create"}
                </Button>
                <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        <Card className="bg-navy-light border-border/30">
          <Table>
            <TableHeader>
              <TableRow className="border-border/20 hover:bg-transparent">
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Subject</TableHead>
                <TableHead className="text-xs">Category</TableHead>
                <TableHead className="text-xs">Variables</TableHead>
                <TableHead className="text-xs">Updated</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-teal mx-auto" />
                  </TableCell>
                </TableRow>
              ) : templatesList?.map((t: any) => (
                <TableRow key={t.id} className="border-border/10 hover:bg-muted/20">
                  <TableCell className="text-sm font-medium">{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">{t.subject}</TableCell>
                  <TableCell>
                    {t.category ? (
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(t.variables || []).length} vars
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatDate(t.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handlePreview(t)} title="Preview">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(t)} title="Edit">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => { if (confirm("Delete this template?")) deleteMutation.mutate({ id: t.id }); }}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!templatesList || templatesList.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No email templates yet. Create your first template.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
}
