import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, TrendingUp, Users, CheckCircle } from "lucide-react";

const SignalDashboard = () => {
  const [stats, setStats] = useState({ total: 0, verified: 0, avgWinRate: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("signal_groups").select("*");
      const { data: rec } = await supabase.from("signal_groups").select("name, win_rate, verified, status").order("created_at", { ascending: false }).limit(10);
      if (data) {
        const pub = data.filter(g => g.status === "published");
        setStats({ total: data.length, verified: data.filter(g => g.verified).length, avgWinRate: pub.length ? Math.round(pub.reduce((s, g) => s + (g.win_rate || 0), 0) / pub.length) : 0 });
      }
      if (rec) setRecent(rec);
    };
    fetch();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Signal Provider Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Radio className="w-4 h-4 text-primary" />Total Groups</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.total}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" />Verified</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.verified}</p></CardContent></Card>
        <Card className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Avg Win Rate</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-foreground">{stats.avgWinRate}%</p></CardContent></Card>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Signal Groups</h3>
      <div className="space-y-2">
        {recent.map((g, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{g.name}</span>{g.verified && <CheckCircle className="w-3 h-3 text-primary" />}</div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground">{g.win_rate}% WR</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${g.status === "published" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{g.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignalDashboard;
