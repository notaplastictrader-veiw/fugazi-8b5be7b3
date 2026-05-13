import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Trash2, Bell, BellOff, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SavedMatches() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("saved_matches")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("saved_matches").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved match removed");
    setItems(items.filter((i) => i.id !== id));
  }

  async function toggleNotify(id: string, current: boolean) {
    const { error } = await supabase.from("saved_matches")
      .update({ notify_on_new: !current }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(items.map((i) => i.id === id ? { ...i, notify_on_new: !current } : i));
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Saved Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your saved AI matcher results. Toggle alerts to get notified when a new broker fits your profile.
          </p>
        </div>
        <Button asChild className="gap-2"><Link to="/match"><Plus className="w-4 h-4" /> Run new match</Link></Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No saved matches yet.</p>
          <Button asChild><Link to="/match">Take the matcher quiz</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((m) => {
            const result = Array.isArray(m.result) ? m.result : [];
            return (
              <div key={m.id} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{m.name}</h3>
                    <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                      {new Date(m.created_at).toLocaleDateString()} · {result.length} brokers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleNotify(m.id, m.notify_on_new)}
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border flex items-center gap-1 transition ${
                        m.notify_on_new ? "border-primary text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      {m.notify_on_new ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                      {m.notify_on_new ? "Alerts on" : "Alerts off"}
                    </button>
                    <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.slice(0, 3).map((r: any) => (
                    <Link key={r.id || r.slug} to={`/brokers/${r.slug}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 hover:text-primary transition">
                      {r.name} · {Math.round(r.match_score || 0)}%
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
