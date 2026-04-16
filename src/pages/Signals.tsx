import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { CheckCircle, Users, BarChart3, TrendingUp, Search } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";

interface SignalGroup {
  id: string; name: string; win_rate: number; monthly_signals: string;
  avg_rr: string; track_record: string; members: string; verified: boolean;
}

const fallbackGroups: SignalGroup[] = [
  { id: "s1", name: "Gold Pulse Signals", win_rate: 81, monthly_signals: "35", avg_rr: "1:2.4", track_record: "14 months", members: "4,200", verified: true },
  { id: "s2", name: "Asia FX Scalpers", win_rate: 84, monthly_signals: "48", avg_rr: "1:1.8", track_record: "22 months", members: "12,400", verified: true },
  { id: "s3", name: "Prop Killer Trades", win_rate: 78, monthly_signals: "60+", avg_rr: "1:3.1", track_record: "9 months", members: "8,900", verified: true },
];

const Signals = () => {
  const [groups, setGroups] = useState<SignalGroup[]>(fallbackGroups);
  const [search, setSearch] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("signal_groups").select("*").eq("status", "published").order("win_rate", { ascending: false });
      if (data && data.length > 0) setGroups(data as SignalGroup[]);
    };
    fetch();
  }, []);

  const filtered = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <SEO
        title="Verified Signal Groups"
        description="Every Telegram signal group listed, reviewed, and rated by real traders. Win rates, track records, and verified performance."
        path="/signals"
      />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// SIGNAL HUB</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Verified Signal <span className="text-primary">Groups</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">Every Telegram group listed, reviewed and rated by real traders.</p>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search signal groups..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(group => (
              <div key={group.id} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-bold text-foreground">{group.name}</h3>
                  {group.verified && <CheckCircle className="w-4 h-4 text-primary" />}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /><div><div className="text-xs text-muted-foreground">Win Rate</div><div className="text-sm font-mono font-bold text-foreground">{group.win_rate}%</div></div></div>
                  <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent" /><div><div className="text-xs text-muted-foreground">Monthly</div><div className="text-sm font-mono font-bold text-foreground">{group.monthly_signals}</div></div></div>
                  <div><div className="text-xs text-muted-foreground">Avg R:R</div><div className="text-sm font-mono font-bold text-foreground">{group.avg_rr}</div></div>
                  <div><div className="text-xs text-muted-foreground">Track Record</div><div className="text-sm font-mono font-bold text-foreground">{group.track_record}</div></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Users className="w-4 h-4" />{group.members} members</div>
                  <Link to={`/signals/${group.id}`}>
                    <button className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">View Group</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No signal groups found.</p>}
        </div>
      </section>
    </MainLayout>
  );
};

export default Signals;
