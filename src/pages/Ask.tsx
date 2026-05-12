import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Send, Loader2, MessageSquare, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { faqSchema } from "@/components/seo/JsonLd";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string; }

const SAMPLE_QS = [
  "Best forex broker for $500 scalping in UK with FCA regulation",
  "Which prop firm has the fastest payout for funded traders?",
  "Compare XM vs IC Markets for EA trading",
  "Are there any active scam alerts on Exness right now?",
  "Which signal group has the highest verified win rate?",
  "Best ECN broker accepting US clients",
];

const Ask = () => {
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
        else if (resp.status === 402) toast.error("AI credits exhausted.");
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
    } catch {
      toast.error("Connection error — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <SEO
        title="Ask NAFT AI — Free AI Broker Assistant"
        description="Ask anything about forex brokers, prop firms, scam alerts, and signal groups. NAFT's AI assistant answers from verified review data — free, instant, no signup."
        path="/ask"
      />
      <JsonLd data={faqSchema(SAMPLE_QS.map((q) => ({
        question: q,
        answer: "Ask NAFT AI directly to get a real-time answer based on verified broker data, complaints, and reviews.",
      })))} />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Powered by NAFT verified data
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-foreground mb-3 leading-[0.95]">
            Ask anything about
            <br />
            <span className="text-primary">any broker.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Free AI assistant trained on 280+ broker reviews, scam alerts, and complaints.
            No signup. No fluff. Just answers.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
          <div ref={scrollRef} className="px-4 md:px-6 py-5 space-y-4 min-h-[320px] max-h-[60vh] overflow-y-auto">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Try one of these
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SAMPLE_QS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-left px-3 py-2.5 text-sm rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all group"
                    >
                      <span className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="flex-1">{q}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-3 border-t border-border mt-4 text-center">
                  <Link to="/match" className="text-xs text-primary hover:underline font-mono">
                    → Or take the 60-second AI Broker Matcher quiz
                  </Link>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg px-4 py-3 text-sm",
                  m.role === "user"
                    ? "bg-primary/10 text-foreground ml-8 border border-primary/20"
                    : "bg-secondary/40 border border-border text-foreground mr-8",
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground mr-8">
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
              placeholder="Ask about any broker, prop firm, signal group..."
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-foreground"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Answers are AI-generated from NAFT's verified data. Always do your own research before depositing.
        </p>
      </div>
    </MainLayout>
  );
};

export default Ask;
