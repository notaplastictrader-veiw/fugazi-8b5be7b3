import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Headphones, Send, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Thread {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

const LiveChatSheet = ({ open, onOpenChange }: Props) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("support_messages")
      .select("id, subject, message, status, admin_response, responded_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setThreads((data as Thread[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (open && user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  useEffect(() => {
    if (!open || !user) return;
    const channel = supabase
      .channel("support_messages_user")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !message.trim()) {
      toast.error("Add a subject and a message");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      sender_role: "user",
      subject: subject.trim(),
      message: message.trim(),
      status: "open",
    });
    setSending(false);
    if (error) {
      toast.error("Couldn't send. Try again.");
      return;
    }
    toast.success("Message sent to our support team");
    setSubject("");
    setMessage("");
    load();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            <span className="font-display">Live Chat</span>
            <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-1">
              SUPPORT
            </span>
          </SheetTitle>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground text-left">
            <Clock className="w-3 h-3" />
            Typical response time: 15–30 minutes
          </p>
        </SheetHeader>

        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
            <p className="text-sm text-muted-foreground">
              Sign in to start a live chat with our support team.
            </p>
            <Link
              to="/login"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Sign in to continue
            </Link>
            <Link
              to="/contact"
              onClick={() => onOpenChange(false)}
              className="text-xs text-primary hover:underline font-mono"
            >
              → Or use the contact form
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {loading && threads.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                </div>
              )}

              {!loading && threads.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No conversations yet. Send your first message below — we usually reply within
                  15–30 minutes during operating hours.
                </p>
              )}

              {threads.map((t) => (
                <div key={t.id} className="space-y-2">
                  <div className="rounded-lg px-3 py-2 text-sm bg-primary/10 border border-primary/20 ml-6">
                    <div className="text-[10px] font-mono uppercase text-primary mb-1">
                      You · {t.subject}
                    </div>
                    <div className="text-foreground whitespace-pre-wrap">{t.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>
                  {t.admin_response ? (
                    <div className="rounded-lg px-3 py-2 text-sm bg-card border border-border mr-6">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                        Support team
                      </div>
                      <div className="text-foreground whitespace-pre-wrap">{t.admin_response}</div>
                      {t.responded_at && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(t.responded_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mr-6">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Awaiting reply ({t.status})…
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={send} className="border-t border-border p-3 space-y-2">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                disabled={sending}
                className="w-full px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border focus:border-primary focus:outline-none text-foreground"
              />
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  disabled={sending}
                  rows={2}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm rounded-lg bg-secondary/50 border border-border",
                    "focus:border-primary focus:outline-none text-foreground resize-none"
                  )}
                />
                <button
                  type="submit"
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity self-end"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default LiveChatSheet;
