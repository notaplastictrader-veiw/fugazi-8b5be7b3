import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Radio, TrendingUp, MessageSquare, AlertTriangle, ShieldAlert, CheckCircle } from "lucide-react";

interface Stats {
  brokers: number;
  signals: number;
  forecasts: number;
  reviews: number;
  complaints: number;
  scamAlerts: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    brokers: 0, signals: 0, forecasts: 0, reviews: 0,
    complaints: 0, scamAlerts: 0, pendingApprovals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [b, s, f, r, c, sa, aq] = await Promise.all([
        supabase.from("brokers").select("id", { count: "exact", head: true }),
        supabase.from("signal_groups").select("id", { count: "exact", head: true }),
        supabase.from("forecasts").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("scam_alerts").select("id", { count: "exact", head: true }),
        supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        brokers: b.count || 0,
        signals: s.count || 0,
        forecasts: f.count || 0,
        reviews: r.count || 0,
        complaints: c.count || 0,
        scamAlerts: sa.count || 0,
        pendingApprovals: aq.count || 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Brokers", value: stats.brokers, icon: Building2, color: "text-primary" },
    { label: "Signals", value: stats.signals, icon: Radio, color: "text-primary" },
    { label: "Forecasts", value: stats.forecasts, icon: TrendingUp, color: "text-primary" },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare, color: "text-accent" },
    { label: "Complaints", value: stats.complaints, icon: AlertTriangle, color: "text-destructive" },
    { label: "Scam Alerts", value: stats.scamAlerts, icon: ShieldAlert, color: "text-destructive" },
    { label: "Pending", value: stats.pendingApprovals, icon: CheckCircle, color: "text-accent" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <c.icon className={`w-4 h-4 ${c.color}`} />
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
