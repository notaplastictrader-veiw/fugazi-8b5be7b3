import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, Radio, TrendingUp, MessageSquare, AlertTriangle,
  ShieldAlert, CheckCircle, Users, DollarSign, Activity, Zap, Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import BrokerDashboard from "./BrokerDashboard";
import SignalDashboard from "./SignalDashboard";

interface Stats {
  brokers: number; signals: number; forecasts: number; reviews: number;
  complaints: number; scamAlerts: number; pendingApprovals: number; users: number;
}

/* ─── Circular Gauge SVG ─── */
const HudGauge = ({ value, max, label, icon: Icon, color = "primary" }: {
  value: number; max: number; label: string; icon: any; color?: string;
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - pct * circumference;

  return (
    <div className="hud-stat p-4 flex flex-col items-center gap-2 hud-scanline">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke="hsl(var(--primary))" strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 text-primary mb-0.5" />
          <span className="text-xl font-bold text-foreground font-mono">{value}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
    </div>
  );
};

/* ─── Content Ops Dashboard ─── */
const ContentOpsDashboard = () => {
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("approval_queue").select("*").eq("status", "pending")
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setPending(data); });
  }, []);

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">CONTENT OPS</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Approval Queue
        </h2>
      </div>
      <div className="hud-card p-1">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">{pending.length} PENDING ITEMS</span>
          </div>
          <div className="space-y-2">
            {pending.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded">
                <span className="text-sm text-foreground capitalize font-mono">{item.content_type}</span>
                <div className="flex items-center gap-3">
                  <span className="hud-badge">{item.status}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-mono">ALL CLEAR — NO PENDING ITEMS</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Link to="/admin/approvals" className="hud-action-btn mt-4 p-4 flex items-center justify-center gap-2">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-sm text-foreground font-mono">OPEN FULL QUEUE</span>
      </Link>
    </div>
  );
};

/* ─── Super Admin HUD Dashboard ─── */
const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    brokers: 0, signals: 0, forecasts: 0, reviews: 0,
    complaints: 0, scamAlerts: 0, pendingApprovals: 0, users: 0,
  });
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
      const { data } = await supabase.from("approval_queue").select("content_type, status, created_at")
        .order("created_at", { ascending: false }).limit(8);
      if (data) setRecentActivity(data);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const maxStat = Math.max(stats.brokers, stats.signals, stats.forecasts, stats.reviews, stats.complaints, stats.scamAlerts, stats.pendingApprovals, stats.users, 1);

  const gauges = [
    { label: "Brokers", value: stats.brokers, icon: Building2, link: "/admin/brokers" },
    { label: "Signals", value: stats.signals, icon: Radio, link: "/admin/signals" },
    { label: "Forecasts", value: stats.forecasts, icon: TrendingUp, link: "/admin/forecasts" },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare, link: "/admin/reviews" },
    { label: "Complaints", value: stats.complaints, icon: AlertTriangle, link: "/admin/complaints" },
    { label: "Scam Alerts", value: stats.scamAlerts, icon: ShieldAlert, link: "/admin/scam-alerts" },
    { label: "Pending", value: stats.pendingApprovals, icon: CheckCircle, link: "/admin/approvals" },
    { label: "Users", value: stats.users, icon: Users, link: "/admin/users" },
  ];

  const quickActions = [
    { label: "Manage Brokers", icon: Building2, link: "/admin/brokers" },
    { label: "Approvals", icon: CheckCircle, link: "/admin/approvals", badge: stats.pendingApprovals },
    { label: "Scam Alerts", icon: ShieldAlert, link: "/admin/scam-alerts" },
    { label: "Site Settings", icon: DollarSign, link: "/admin/settings" },
    { label: "Users & Roles", icon: Users, link: "/admin/users" },
    { label: "Revenue", icon: DollarSign, link: "/admin/revenue" },
  ];

  return (
    <div className="hud-scanline">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">SUPER ADMIN</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Command Center
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase">System Online</span>
        </div>
      </div>

      {/* Gauge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        {gauges.map((g) => (
          <Link key={g.label} to={g.link} className="hover:scale-105 transition-transform">
            <HudGauge value={g.value} max={maxStat} label={g.label} icon={g.icon} />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="hud-card p-1">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Live Activity</span>
            </div>
            <div className="space-y-2">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded">
                  <span className="text-sm text-foreground capitalize font-mono">{a.content_type}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      a.status === "pending" ? "bg-accent/10 text-accent border border-accent/20" :
                      a.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" :
                      "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}>{a.status}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-sm text-muted-foreground font-mono p-3">NO RECENT ACTIVITY</p>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((qa) => (
              <Link key={qa.label} to={qa.link} className="hud-action-btn p-4 flex flex-col items-center gap-2 text-center">
                <qa.icon className="w-6 h-6 text-primary" />
                <span className="text-xs text-foreground font-mono">{qa.label}</span>
                {qa.badge ? (
                  <span className="hud-badge">{qa.badge}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Role-Aware Dashboard Router ─── */
const Dashboard = () => {
  const { hasRole, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Broker-only users
  if (hasRole("broker") && !hasRole("super_admin") && !hasRole("content_ops") && !hasRole("moderator")) {
    return <BrokerDashboard />;
  }

  // Signal provider-only users
  if (hasRole("signal_provider") && !hasRole("super_admin") && !hasRole("content_ops") && !hasRole("moderator")) {
    return <SignalDashboard />;
  }

  // Content ops / moderator
  if ((hasRole("content_ops") || hasRole("moderator")) && !hasRole("super_admin")) {
    return <ContentOpsDashboard />;
  }

  // Super admin (default)
  return <SuperAdminDashboard />;
};

export default Dashboard;
