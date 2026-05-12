import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string; }

interface AIChatSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const SUGGESTIONS = [
  "Which broker is best for scalping under $500?",
  "Show me the most trusted prop firms",
  "Are there active scam alerts I should know about?",
  "Which signal group has the highest win rate?",
];

const AIChatSheet = ({ open, onOpenChange }: AIChatSheetProps) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/naft-assistant`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMsgs }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Rate limit reached. Try again in a moment.");
        else if (resp.status === 402) toast.error("AI credits exhausted. Top up your workspace.");
        else toast.error("Couldn't reach the assistant. Try again.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) upsert(delta);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e: any) {
      toast.error("Connection error — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-display">NAFT Assistant</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">
              AI
            </span>
          </SheetTitle>
          <p className="text-xs text-muted-foreground text-left">
            Ask anything about brokers, scams, or signals — answers come from NAFT's verified data.
          </p>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Try asking
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full text-left px-3 py-2 text-sm rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all"
                >
                  {s}
                </button>
              ))}
              <Link
                to="/match"
                onClick={() => onOpenChange(false)}
                className="block text-xs text-primary hover:underline mt-3 font-mono"
              >
                → Or take the AI Broker Matcher quiz
              </Link>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-primary/10 text-foreground ml-6 border border-primary/20"
                  : "bg-card border border-border text-foreground mr-6"
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary">
                  <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                </div>
              ) : (
                <span>{m.content}</span>
              )}
            </div>
          ))}

          {loading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-6">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="border-t border-border p-3 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any broker..."
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-foreground"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AIChatSheet;
