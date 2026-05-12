import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Pin, Lock, Trash2, Search, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["all", "general", "broker-talk", "scam-watch", "strategy", "psychology", "off-topic"];

export default function ForumAdmin() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [stats, setStats] = useState({ total: 0, replies: 0 });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("forum_threads").select("*")
      .order("pinned", { ascending: false })
      .order("last_reply_at", { ascending: false }).limit(500);
    setThreads(data || []);
    const { count: replyCount } = await supabase.from("forum_replies").select("*", { count: "exact", head: true });
    setStats({ total: data?.length || 0, replies: replyCount || 0 });
    setLoading(false);
  }

  async function togglePin(t: any) {
    const { error } = await supabase.from("forum_threads").update({ pinned: !t.pinned }).eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success(t.pinned ? "Unpinned" : "Pinned");
    load();
  }
  async function toggleLock(t: any) {
    const { error } = await supabase.from("forum_threads").update({ locked: !t.locked }).eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success(t.locked ? "Unlocked" : "Locked");
    load();
  }
  async function remove(t: any) {
    if (!confirm(`Delete thread "${t.title}"? This removes all replies.`)) return;
    const { error } = await supabase.from("forum_threads").delete().eq("id", t.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  const filtered = threads.filter(t =>
    (cat === "all" || t.category === cat) &&
    (!q || t.title.toLowerCase().includes(q.toLowerCase()) || t.body?.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-extrabold text-foreground">Forum Threads</h1>
        <p className="text-sm text-muted-foreground mt-1">Moderate the verified-trader forum.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-mono uppercase">Threads</div>
          <div className="text-2xl font-display font-bold text-foreground">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-mono uppercase">Replies</div>
          <div className="text-2xl font-display font-bold text-foreground">{stats.replies}</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs text-muted-foreground font-mono uppercase">Pinned</div>
          <div className="text-2xl font-display font-bold text-primary">{threads.filter(t => t.pinned).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search title or body…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl text-muted-foreground">
          <MessageSquare className="w-8 h-8 mx-auto mb-2" /> No threads.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="p-4 rounded-lg border border-border bg-card flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {t.pinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                  {t.locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">{t.category}</Badge>
                  <span className="text-xs text-muted-foreground font-mono">{t.reply_count} replies · {new Date(t.created_at).toLocaleDateString()}</span>
                </div>
                <div className="font-display font-bold text-foreground truncate">{t.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.body}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" asChild><Link to={`/forum/${t.slug}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link></Button>
                <Button size="sm" variant={t.pinned ? "default" : "ghost"} onClick={() => togglePin(t)}><Pin className="w-4 h-4" /></Button>
                <Button size="sm" variant={t.locked ? "default" : "ghost"} onClick={() => toggleLock(t)}><Lock className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(t)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
