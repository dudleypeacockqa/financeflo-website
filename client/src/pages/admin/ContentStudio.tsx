import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ClipboardCopy, Loader2, Pen, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const CONTENT_TYPES = [
  { value: "blog_post", label: "Blog Post" },
  { value: "linkedin_post", label: "LinkedIn Post" },
  { value: "email_sequence", label: "Email Sequence" },
  { value: "case_study_outline", label: "Case Study Outline" },
] as const;

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "educational", label: "Educational" },
] as const;

const LENGTHS = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
] as const;

export default function ContentStudio() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("blog_post");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");

  const generateMutation = trpc.ai.generateContent.useMutation({
    onError: (err) => toast.error(err.message),
  });

  function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    generateMutation.mutate({
      contentType: contentType as any,
      topic: topic.trim(),
      tone: tone as any,
      length: length as any,
    });
  }

  function handleCopy() {
    if (generateMutation.data?.content) {
      navigator.clipboard.writeText(generateMutation.data.content);
      toast.success("Content copied to clipboard");
    }
  }

  return (
    <AdminLayout title="Content Studio" description="Generate KB-grounded content for blogs, LinkedIn, emails, and case studies.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Pen className="h-4 w-4 text-teal" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., How AIBA helps CFOs identify constraints"
                  className="bg-navy border-border/30"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Content Type</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="bg-navy border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-navy border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Length</label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger className="bg-navy border-border/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending || !topic.trim()}
                className="w-full bg-teal hover:bg-teal/90 gap-2"
              >
                {generateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate Content
              </Button>
            </CardContent>
          </Card>

          {/* Sources */}
          {generateMutation.data?.sources && generateMutation.data.sources.length > 0 && (
            <Card className="bg-navy-light border-border/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">KB Sources Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {generateMutation.data.sources.map((s, i) => (
                    <Badge key={i} className="bg-muted text-muted-foreground border-0 text-[10px]">
                      {s.documentTitle}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-2">
          {generateMutation.isPending ? (
            <Card className="bg-navy-light border-border/30">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-teal mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Generating content...</p>
                </div>
              </CardContent>
            </Card>
          ) : generateMutation.data ? (
            <Card className="bg-navy-light border-border/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{generateMutation.data.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-teal/20 text-teal border-0 text-[10px]">
                        {contentType.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {generateMutation.data.wordCount} words
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 border-border/40">
                    <ClipboardCopy className="w-3 h-3" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                  {generateMutation.data.content}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-navy-light border-border/30">
              <CardContent className="flex items-center justify-center py-20">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">Configure settings and click Generate to create KB-grounded content.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
