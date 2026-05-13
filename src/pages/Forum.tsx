import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Plus, Pin, Lock, ShieldCheck, Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TopTradersRail from "@/components/forum/TopTradersRail";

const CATEGORIES = ["general", "broker-talk", "scam-watch", "strategy", "psychology", "off-topic"];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) +
  "-" + Math.random().toString(36).slice(2, 6);

export default function Forum() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  // form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadThreads();
    if (user) checkVerified();
  }, [user]);

  async function loadThreads() {
    setLoading(true);
    const { data } = await supabase
      .from("forum_threads")
      .select("*")
      .order("pinned", { ascending: false })
      .order("last_reply_at", { ascending: false })
      .limit(100);
    setThreads(data || []);
    setLoading(false);
  }

  async function checkVerified() {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user!.id)
      .eq("status", "published")
      .limit(1);
    setVerified((data?.length || 0) > 0);
  }

  async function createThread() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body required");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("forum_threads").insert({
      user_id: user!.id,
      title: title.trim(),
      slug: slugify(title.trim()),
      body: body.trim(),
      category,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("verified")
        ? "You need at least one published review to post."
        : error.message);
      return;
    }
    toast.success("Thread posted");
    setOpen(false);
    setTitle(""); setBody(""); setCategory("general");
    loadThreads();
  }

  const filtered = filter === "all" ? threads : threads.filter(t => t.category === filter);

  return (
    <MainLayout>
      <SEO
        title="Verified Trader Forum — NAFT Community"
        description="Real traders. Real broker talk. Verified by published reviews. Join the conversation on scams, strategies, and the markets."
        path="/forum"
      />
      <section className="pt-10 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-4">
                <ShieldCheck className="w-3 h-3" /> Verified Traders Only
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground">
                The <span className="text-primary">Forum</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-xl">
                No bots. No paid shills. Post a review first, then join the conversation.
              </p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  disabled={!user || !verified}
                  className="gap-2"
                  onClick={() => {
                    if (!user) { toast.error("Sign in to post"); return; }
                    if (!verified) { toast.error("Submit a review first to unlock posting"); return; }
                  }}
                >
                  <Plus className="w-4 h-4" /> New Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Start a thread</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                  <Input placeholder="Thread title" value={title} onChange={e => setTitle(e.target.value)} maxLength={140} />
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Share your thoughts, evidence, or question…" rows={6} value={body} onChange={e => setBody(e.target.value)} />
                  <Button onClick={createThread} disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Thread"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {!user && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 mb-6 text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-semibold">Sign in</Link> to participate in the forum.
            </div>
          )}
          {user && !verified && (
            <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 mb-6 text-sm">
              <ShieldCheck className="inline w-4 h-4 mr-2 text-primary" />
              Submit your first <Link to="/brokers" className="text-primary font-semibold">broker review</Link> to unlock posting.
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition ${
                filter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >All</button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition ${
                  filter === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >{c}</button>
            ))}
          </div>

          {/* Threads + sidebar */}
          <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
            <div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No threads yet. Be the first.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(t => (
                <Link
                  key={t.id}
                  to={`/forum/${t.slug}`}
                  className="block p-5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/80 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {t.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                        {t.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono">{t.category}</Badge>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {t.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{t.body}</p>
                    </div>
                    <div className="text-right shrink-0 text-xs text-muted-foreground font-mono">
                      <div className="flex items-center gap-1 justify-end">
                        <MessageSquare className="w-3 h-3" /> {t.reply_count}
                      </div>
                      <div className="mt-1">{new Date(t.last_reply_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
