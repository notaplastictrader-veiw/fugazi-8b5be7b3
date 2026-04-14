import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Radio, Search, ArrowLeft, TrendingUp, Users, CheckCircle, Eye } from "lucide-react";

const SignalDetail = ({ id }: { id: string }) => {
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    supabase.from("signal_groups").select("*").eq("id", id).maybeSingle()
      .then(({ data }) => { if (data) setGroup(data); });
  }, [id]);

  if (!group) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Win Rate", value: `${group.win_rate || 0}%`, icon: TrendingUp },
    { label: "Members", value: group.members || "0", icon: Users },
    { label: "Verified", value: group.verified ? "Yes" : "No", icon: CheckCircle },
    { label: "Status", value: group.status || "N/A", icon: Radio },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/signal-dashboards" className="hud-action-btn p-2"><ArrowLeft className="w-4 h-4 text-primary" /></Link>
        <div className="hud-badge">SIGNAL</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">{group.name}</h2>
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

      <div className="hud-card p-1">
        <div className="p-4">
          <span className="text-xs font-mono text-primary uppercase tracking-widest mb-3 block">Details</span>
          <div className="space-y-2 text-sm font-mono">
            {["monthly_signals", "avg_rr", "track_record", "type", "telegram_link"].map(k => (
              <div key={k} className="flex justify-between p-2 bg-background/50 border border-border/50 rounded">
                <span className="text-muted-foreground uppercase text-[10px]">{k.replace(/_/g, " ")}</span>
                <span className="text-foreground">{group[k] || "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SignalDashboardsList = () => {
  const { id } = useParams<{ id: string }>();
  const [groups, setGroups] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("signal_groups").select("id, name, win_rate, members, verified, status")
      .order("name").then(({ data }) => { if (data) setGroups(data); setLoading(false); });
  }, []);

  if (id) return <SignalDetail id={id} />;

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">DASHBOARDS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Signal Dashboards</h2>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search signal groups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 font-mono text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(g => (
            <Link key={g.id} to={`/admin/signal-dashboards/${g.id}`} className="hud-card p-1 block hover:scale-[1.01] transition-transform">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-foreground">{g.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {g.verified && <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-primary/10 text-primary border border-primary/20">VERIFIED</span>}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${g.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" : "bg-accent/10 text-accent border border-accent/20"}`}>{g.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground font-mono">{g.win_rate || 0}%</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">WIN RATE</span>
                  </div>
                  <Eye className="w-4 h-4 text-primary" />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground font-mono text-sm">NO SIGNAL GROUPS FOUND</p>}
        </div>
      )}
    </div>
  );
};

export default SignalDashboardsList;
