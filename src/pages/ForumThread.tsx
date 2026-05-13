import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Loader2, Lock, Pin, Send, Award, Check } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactionBar from "@/components/forum/ReactionBar";

export default function ForumThread() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [thread, setThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => { if (slug) load(); }, [slug]);

  async function load() {
    setLoading(true);
    const { data: t } = await supabase
      .from("forum_threads").select("*").eq("slug", slug!).maybeSingle();
    if (!t) { setLoading(false); return; }
    setThread(t);
    const { data: r } = await supabase
      .from("forum_replies").select("*").eq("thread_id", t.id).order("created_at");
    setReplies(r || []);
    setLoading(false);
  }

  async function postReply() {
    if (!body.trim() || !thread || !user) return;
    setPosting(true);
    const { error } = await supabase.from("forum_replies").insert({
      thread_id: thread.id, user_id: user.id, body: body.trim(),
    });
    setPosting(false);
    if (error) {
      toast.error(error.message.includes("verified") || error.message.includes("locked")
        ? "You must be a verified trader (1+ published review) and the thread must be open."
        : error.message);
      return;
    }
    setBody("");
    toast.success("Reply posted");
    load();
  }

  if (loading) return <MainLayout><div className="flex justify-center py-32"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div></MainLayout>;
  if (!thread) return <MainLayout><div className="text-center py-32 text-muted-foreground">Thread not found.</div></MainLayout>;

  return (
    <MainLayout>
      <SEO title={`${thread.title} — NAFT Forum`} description={thread.body.slice(0, 155)} path={`/forum/${thread.slug}`} />
      <section className="pt-8 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to forum
          </Link>

          <article className="p-6 rounded-xl border border-border bg-card mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {thread.pinned && <Pin className="w-4 h-4 text-primary" />}
              {thread.locked && <Lock className="w-4 h-4 text-muted-foreground" />}
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-mono">{thread.category}</Badge>
              <span className="text-xs text-muted-foreground ml-auto">{new Date(thread.created_at).toLocaleString()}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-3">{thread.title}</h1>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed mb-4">{thread.body}</p>
            <ReactionBar targetType="thread" targetId={thread.id} />
          </article>

          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="space-y-3 mb-8">
            {replies.map(r => (
              <div key={r.id} className="p-4 rounded-lg border border-border bg-card/60">
                <div className="text-xs text-muted-foreground font-mono mb-2">{new Date(r.created_at).toLocaleString()}</div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">{r.body}</p>
                <ReactionBar targetType="reply" targetId={r.id} />
              </div>
            ))}
          </div>

          {thread.locked ? (
            <div className="text-center py-6 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              <Lock className="w-4 h-4 inline mr-2" /> This thread is locked.
            </div>
          ) : !user ? (
            <div className="text-center py-6 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-semibold">Sign in</Link> to reply.
            </div>
          ) : (
            <div className="space-y-3">
              <Textarea placeholder="Write a reply…" rows={4} value={body} onChange={e => setBody(e.target.value)} />
              <Button onClick={postReply} disabled={posting || !body.trim()} className="gap-2">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Post Reply</>}
              </Button>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
