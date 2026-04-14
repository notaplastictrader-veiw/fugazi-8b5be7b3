import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Building2, Search, ArrowLeft, Star, AlertTriangle, TrendingUp, MessageSquare, Eye } from "lucide-react";

/* ─── Individual Broker Detail ─── */
const BrokerDetail = ({ id }: { id: string }) => {
  const [broker, setBroker] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: b } = await supabase.from("brokers").select("*").eq("id", id).maybeSingle();
      if (b) {
        setBroker(b);
        const [{ data: r }, { data: c }] = await Promise.all([
          supabase.from("reviews").select("*").eq("broker_id", id).order("created_at", { ascending: false }).limit(10),
          supabase.from("complaints").select("*").eq("broker_id", id).order("created_at", { ascending: false }).limit(10),
        ]);
        if (r) setReviews(r);
        if (c) setComplaints(c);
      }
    };
    fetch();
  }, [id]);

  if (!broker) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Score", value: broker.score || 0, icon: Star },
    { label: "Reviews", value: broker.review_count || 0, icon: MessageSquare },
    { label: "Complaints", value: complaints.length, icon: AlertTriangle },
    { label: "Status", value: broker.status || "N/A", icon: TrendingUp },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/broker-dashboards" className="hud-action-btn p-2"><ArrowLeft className="w-4 h-4 text-primary" /></Link>
        <div className="hud-badge">BROKER</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">{broker.name}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="hud-stat p-4 flex flex-col items-center gap-1">
            <s.icon className="w-4 h-4 text-primary" />
            <span className="text-xl font-bold text-foreground font-mono">{s.value}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hud-card p-1">
          <div className="p-4">
            <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Details</span>
            <div className="space-y-2 text-sm font-mono">
              {["leverage", "avg_spread", "min_deposit", "regulation", "platforms", "type"].map(k => (
                <div key={k} className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
                  <span className="text-muted-foreground uppercase text-[10px]">{k.replace("_", " ")}</span>
                  <span className="text-foreground">{broker[k] || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hud-card p-1">
            <div className="p-4">
              <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Recent Reviews ({reviews.length})</span>
              <div className="space-y-2 max-h-48 overflow-auto">
                {reviews.map((r, i) => (
                  <div key={i} className="p-2 bg-background/50 border border-border/50 rounded text-xs font-mono">
                    <div className="flex justify-between"><span className="text-foreground">{r.user_name || "Anon"}</span><span className="text-primary">★ {r.rating}/10</span></div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{r.content || "No content"}</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-xs text-muted-foreground font-mono">NO REVIEWS</p>}
              </div>
            </div>
          </div>

          <div className="hud-card p-1">
            <div className="p-4">
              <span className="text-xs font-mono text-destructive uppercase tracking-widest mb-3 block">Complaints ({complaints.length})</span>
              <div className="space-y-2 max-h-48 overflow-auto">
                {complaints.map((c, i) => (
                  <div key={i} className="p-2 bg-background/50 border border-border/50 rounded text-xs font-mono">
                    <p className="text-muted-foreground line-clamp-2">{c.content || "No details"}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded mt-1 inline-block ${c.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                  </div>
                ))}
                {complaints.length === 0 && <p className="text-xs text-muted-foreground font-mono">NO COMPLAINTS</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Broker Listing ─── */
const BrokerDashboardsList = () => {
  const { id } = useParams<{ id: string }>();
  const [brokers, setBrokers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("brokers").select("id, name, score, status, type, review_count, slug")
      .order("name").then(({ data }) => { if (data) setBrokers(data); setLoading(false); });
  }, []);

  if (id) return <BrokerDetail id={id} />;

  const filtered = brokers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">DASHBOARDS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Broker Dashboards</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search brokers..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 font-mono text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <Link key={b.id} to={`/admin/broker-dashboards/${b.id}`} className="hud-card p-1 block hover:scale-[1.01] transition-transform">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-foreground">{b.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">{b.type || "broker"}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${b.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" : "bg-accent/10 text-accent border border-accent/20"}`}>{b.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground font-mono">{b.score || 0}</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">SCORE</span>
                  </div>
                  <Eye className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground font-mono text-sm">NO BROKERS FOUND</p>}
        </div>
      )}
    </div>
  );
};

export default BrokerDashboardsList;
