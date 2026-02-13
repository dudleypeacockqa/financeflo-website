import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Library, Loader2, Plus, RefreshCw, Search, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate, StatusBadge } from "@/components/admin/shared";

export default function KnowledgeBase() {
  const { data: docs, isLoading, refetch } = trpc.knowledge.list.useQuery();
  const uploadMutation = trpc.knowledge.upload.useMutation({
    onSuccess: () => { toast.success("Document uploaded and queued for processing"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => { toast.success("Document deleted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState<string>("transcript");
  const [rawContent, setRawContent] = useState("");
  const [tags, setTags] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { data: searchResults, isFetching: searching } = trpc.knowledge.search.useQuery(
    { query: searchInput },
    { enabled: searchInput.length > 0 }
  );

  const ragMutation = trpc.knowledge.testRag.useMutation({
    onError: (err: any) => toast.error(err.message),
  });

  function handleUpload() {
    if (!title.trim() || !rawContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    uploadMutation.mutate({
      title: title.trim(),
      type: docType as any,
      rawContent: rawContent.trim(),
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
    });
    setTitle("");
    setRawContent("");
    setTags("");
    setShowUpload(false);
  }

  function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearchInput(searchQuery.trim());
  }

  return (
    <AdminLayout title="Knowledge Base" description="Upload documents, manage content, and test semantic search.">
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowUpload(!showUpload)} className="bg-teal hover:bg-teal/90 gap-2">
            <Plus className="w-4 h-4" /> Upload Document
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-border/40 gap-2">
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <Card className="bg-navy-light border-border/30">
            <CardHeader>
              <CardTitle className="text-base">Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Document title"
                    className="bg-navy border-border/30"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger className="bg-navy border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transcript">Transcript</SelectItem>
                      <SelectItem value="meeting_notes">Meeting Notes</SelectItem>
                      <SelectItem value="framework">Framework</SelectItem>
                      <SelectItem value="course_material">Course Material</SelectItem>
                      <SelectItem value="prompt">Prompt</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="aiba, sales, consulting"
                  className="bg-navy border-border/30"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Content</label>
                <Textarea
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Paste document content here (text, SRT subtitles, etc.)"
                  rows={10}
                  className="bg-navy border-border/30 font-mono text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="bg-teal hover:bg-teal/90 gap-2">
                  {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload & Process
                </Button>
                <Button variant="outline" onClick={() => setShowUpload(false)} className="border-border/40">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-teal" />
          </div>
        ) : docs && docs.length > 0 ? (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Chunks</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc: any) => (
                    <TableRow key={doc.id} className="border-border/20">
                      <TableCell className="font-mono text-xs text-muted-foreground">#{doc.id}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{doc.title}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 font-mono text-xs">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell><StatusBadge status={doc.status} /></TableCell>
                      <TableCell className="font-mono text-xs">{doc.chunkCount}</TableCell>
                      <TableCell className="text-xs">
                        {doc.tags?.map((tag: string) => (
                          <Badge key={tag} className="bg-muted text-muted-foreground border-0 text-[10px] mr-1">
                            {tag}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate({ id: doc.id })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-navy-light border-border/30">
            <CardContent className="py-12 text-center">
              <Library className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No documents uploaded yet. Upload transcripts, meeting notes, or frameworks to build the knowledge base.</p>
            </CardContent>
          </Card>
        )}

        {/* Search Test */}
        <Card className="bg-navy-light border-border/30">
          <CardHeader>
            <CardTitle className="text-base">Search Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge base..."
                className="bg-navy border-border/30"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching} className="gap-2">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!searchQuery.trim()) return;
                  ragMutation.mutate({ query: searchQuery.trim() });
                }}
                disabled={ragMutation.isPending}
                className="border-border/40 gap-2"
              >
                {ragMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Test RAG
              </Button>
            </div>

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{searchResults.length} results found</p>
                {searchResults.map((result: any, i: number) => (
                  <Card key={i} className="bg-navy border-border/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-blue-500/20 text-blue-400 border-0 text-[10px]">
                          {result.documentTitle}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">chunk #{result.chunkIndex}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">{result.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {ragMutation.data && (
              <Card className="bg-navy border-teal/30">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-teal mb-2">RAG Response:</p>
                  <p className="text-sm whitespace-pre-wrap">{ragMutation.data.answer}</p>
                  {ragMutation.data.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/20">
                      <p className="text-[10px] text-muted-foreground">
                        Sources: {ragMutation.data.sources.map((s: any) => s.documentTitle).join(", ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
