import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Radio, TrendingUp, MessageSquare, AlertTriangle, ShieldAlert, CheckCircle, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

interface Stats {
  brokers: number; signals: number; forecasts: number; reviews: number;
  complaints: number; scamAlerts: number; pendingApprovals: number; users: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ brokers: 0, signals: 0, forecasts: 0, reviews: 0, complaints: 0, scamAlerts: 0, pendingApprovals: 0, users: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [b, s, f, r, c, sa, aq, u] = await Promise.all([
        supabase.from("brokers").select("id", { count: "exact", head: true }),
        supabase.from("signal_groups").select("id", { count: "exact", head: true }),
        supabase.from("forecasts").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("scam_alerts").select("id", { count: "exact", head: true }),
        supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        brokers: b.count || 0, signals: s.count || 0, forecasts: f.count || 0, reviews: r.count || 0,
        complaints: c.count || 0, scamAlerts: sa.count || 0, pendingApprovals: aq.count || 0, users: u.count || 0,
      });
    };

    const fetchRecent = async () => {
      const { data } = await supabase.from("approval_queue").select("content_type, status, created_at").order("created_at", { ascending: false }).limit(5);
      if (data) setRecentActivity(data);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const cards = [
    { label: "Brokers", value: stats.brokers, icon: Building2, color: "text-primary", link: "/admin/brokers" },
    { label: "Signals", value: stats.signals, icon: Radio, color: "text-primary", link: "/admin/signals" },
    { label: "Forecasts", value: stats.forecasts, icon: TrendingUp, color: "text-primary", link: "/admin/forecasts" },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare, color: "text-accent", link: "/admin/reviews" },
    { label: "Complaints", value: stats.complaints, icon: AlertTriangle, color: "text-destructive", link: "/admin/complaints" },
    { label: "Scam Alerts", value: stats.scamAlerts, icon: ShieldAlert, color: "text-destructive", link: "/admin/scam-alerts" },
    { label: "Pending", value: stats.pendingApprovals, icon: CheckCircle, color: "text-accent", link: "/admin/approvals" },
    { label: "Users", value: stats.users, icon: Users, color: "text-primary", link: "/admin/users" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Super Admin Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.link}>
            <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <c.icon className={`w-4 h-4 ${c.color}`} />{c.label}
                </CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold text-foreground">{c.value}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/brokers" className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors text-center">
              <Building2 className="w-6 h-6 text-primary mx-auto mb-2" /><span className="text-sm text-foreground">Manage Brokers</span>
            </Link>
            <Link to="/admin/approvals" className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors text-center">
              <CheckCircle className="w-6 h-6 text-accent mx-auto mb-2" /><span className="text-sm text-foreground">Approvals ({stats.pendingApprovals})</span>
            </Link>
            <Link to="/admin/scam-alerts" className="p-4 bg-card border border-border rounded-lg hover:border-destructive/30 transition-colors text-center">
              <ShieldAlert className="w-6 h-6 text-destructive mx-auto mb-2" /><span className="text-sm text-foreground">Scam Alerts</span>
            </Link>
            <Link to="/admin/settings" className="p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors text-center">
              <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" /><span className="text-sm text-foreground">Site Settings</span>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <span className="text-sm text-foreground capitalize">{a.content_type}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === "pending" ? "bg-accent/10 text-accent" : a.status === "approved" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>{a.status}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-sm text-muted-foreground p-3">No recent activity</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
