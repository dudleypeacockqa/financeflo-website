import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Bot, Loader2, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { documentTitle: string; chunkIndex: number; similarity?: number }[];
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [entityType, setEntityType] = useState<string>("none");
  const [entityId, setEntityId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    },
    onError: (err) => {
      toast.error(err.message);
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    chatMutation.mutate({
      messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      entityType: entityType !== "none" ? (entityType as "lead" | "deal" | "project") : undefined,
      entityId: entityType !== "none" && entityId ? parseInt(entityId, 10) : undefined,
    });
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <AdminLayout title="AI Chat" description="Ask questions about FinanceFlo knowledge, leads, deals, and projects.">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Context Selector */}
        <div className="flex items-center gap-2 mb-4">
          <Select value={entityType} onValueChange={(v) => { setEntityType(v); if (v === "none") setEntityId(""); }}>
            <SelectTrigger className="w-40 bg-navy border-border/30">
              <SelectValue placeholder="Context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">General KB</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="deal">Deal</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
          {entityType !== "none" && (
            <Input
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder={`${entityType} ID`}
              className="w-24 bg-navy border-border/30"
              type="number"
            />
          )}
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearChat} className="border-border/40 gap-1 ml-auto">
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>

        {/* Messages */}
        <Card className="flex-1 bg-navy-light border-border/30 overflow-hidden">
          <CardContent className="p-4 h-full overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Bot className="w-12 h-12 mb-4 opacity-40" />
                <p className="text-sm">Ask anything about FinanceFlo's frameworks, methodology, or your CRM data.</p>
                <div className="flex flex-wrap gap-2 mt-4 max-w-lg justify-center">
                  {[
                    "What is the AIBA diagnostic?",
                    "Explain the CKPS framework",
                    "What are our pricing tiers?",
                    "Describe the ADAPT methodology",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="px-3 py-1.5 text-xs rounded-full bg-navy border border-border/30 hover:border-teal/50 hover:text-teal transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-teal" />
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.role === "user" ? "order-first" : ""}`}>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-teal/20 text-foreground"
                            : "bg-navy border border-border/20"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.sources.map((s, j) => (
                            <Badge key={j} className="bg-muted text-muted-foreground border-0 text-[10px]">
                              {s.documentTitle}
                              {s.similarity ? ` (${(s.similarity * 100).toFixed(0)}%)` : ""}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-blue-400" />
                      </div>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-teal" />
                    </div>
                    <div className="bg-navy border border-border/20 rounded-lg px-3 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input */}
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="bg-navy border-border/30"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={chatMutation.isPending || !input.trim()}
            className="bg-teal hover:bg-teal/90 gap-2"
          >
            {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
