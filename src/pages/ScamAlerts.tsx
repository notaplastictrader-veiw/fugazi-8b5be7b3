import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { AlertTriangle, Search } from "lucide-react";

interface ScamAlert {
  id: string; title: string; description: string; severity: string; created_at: string;
}

const ScamAlerts = () => {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("scam_alerts").select("*").eq("status", "published").order("created_at", { ascending: false });
      if (data) setAlerts(data as ScamAlert[]);
    };
    fetch();
  }, []);

  const filtered = alerts.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <span className="section-tag">// SCAM WATCH</span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-2">
            Scam <span className="text-destructive">Alerts</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl">All verified scam alerts issued by our team and community. Stay safe.</p>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search alerts..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-destructive/40" />
          </div>

          <div className="space-y-4">
            {filtered.map(alert => {
              const daysAgo = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 86400000);
              return (
                <div key={alert.id} className="glass-card rounded-xl p-5 hover:border-destructive/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><AlertTriangle className="w-5 h-5 text-destructive" /></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-foreground">{alert.title}</h3>
                        <span className="text-[10px] font-mono text-muted-foreground">{daysAgo}d ago</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        alert.severity === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-accent/10 text-accent border-accent/20"
                      }`}>{alert.severity} severity</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No scam alerts found.</p>}
        </div>
      </section>
    </MainLayout>
  );
};

export default ScamAlerts;
