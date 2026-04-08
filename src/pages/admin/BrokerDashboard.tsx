import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Star, AlertTriangle, TrendingUp } from "lucide-react";

const BrokerDashboard = () => {
  const [stats, setStats] = useState({ total: 0, published: 0, avgScore: 0, totalComplaints: 0 });
  const [recentBrokers, setRecentBrokers] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: all } = await supabase.from("brokers").select("score, complaints, status").neq("type", "prop-firm");
      const { data: recent } = await supabase.from("brokers").select("name, score, status, created_at").neq("type", "prop-firm").order("created_at", { ascending: false }).limit(10);
      if (all) {
        const pub = all.filter(b => b.status === "published");
        setStats({
          total: all.length,
          published: pub.length,
          avgScore: pub.length ? +(pub.reduce((s, b) => s + (b.score || 0), 0) / pub.length).toFixed(1) : 0,
          totalComplaints: all.reduce((s, b) => s + (b.complaints || 0), 0),
        });
      }
      if (recent) setRecentBrokers(recent);
    };
    fetch();
  }, []);

  const cards = [
    { label: "Total Brokers", value: stats.total, icon: Building2 },
    { label: "Published", value: stats.published, icon: TrendingUp },
    { label: "Avg Score", value: stats.avgScore, icon: Star },
    { label: "Total Complaints", value: stats.totalComplaints, icon: AlertTriangle },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Broker Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <Card key={c.label} className="bg-card border-border">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><c.icon className="w-4 h-4 text-primary" />{c.label}</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-foreground">{c.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Brokers</h3>
      <div className="space-y-2">
        {recentBrokers.map((b, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{b.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground">{b.score}/10</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${b.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrokerDashboard;
