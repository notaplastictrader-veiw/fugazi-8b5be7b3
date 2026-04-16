import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import {
  Building2, Radio, TrendingUp, MessageSquare, AlertTriangle,
  ShieldAlert, CheckCircle, Users, DollarSign, Activity, Zap, Eye,
  ShieldCheck, ArrowUpCircle, Clock, Cpu, Wifi
} from "lucide-react";

interface Stats {
  brokers: number; signals: number; forecasts: number; reviews: number;
  complaints: number; scamAlerts: number; pendingApprovals: number; users: number;
  pendingClaims: number; pendingUpgrades: number; pendingApplications: number;
}

const HudGauge = ({ value, max, label, icon: Icon }: {
  value: number; max: number; label: string; icon: any;
}) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - pct * circumference;

  return (
    <div className="hud-stat p-3 flex flex-col items-center gap-1.5 hud-scanline">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary mb-0.5" />
          <span className="text-lg font-bold text-foreground font-mono">{value}</span>
        </div>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
    </div>
  );
};

const Dashboard = () => {
  const { hasRole, loading } = useUserRole();
  const [stats, setStats] = useState<Stats>({
    brokers: 0, signals: 0, forecasts: 0, reviews: 0,
    complaints: 0, scamAlerts: 0, pendingApprovals: 0, users: 0,
    pendingClaims: 0, pendingUpgrades: 0, pendingApplications: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [topBrokers, setTopBrokers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [b, s, f, r, c, sa, aq, u, pc, pu, pa] = await Promise.all([
        supabase.from("brokers").select("id", { count: "exact", head: true }),
        supabase.from("signal_groups").select("id", { count: "exact", head: true }),
        supabase.from("forecasts").select("id", { count: "exact", head: true }),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("complaints").select("id", { count: "exact", head: true }),
        supabase.from("scam_alerts").select("id", { count: "exact", head: true }),
        supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profile_claims").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("tier_upgrades").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      ]);
      setStats({
        brokers: b.count || 0, signals: s.count || 0, forecasts: f.count || 0, reviews: r.count || 0,
        complaints: c.count || 0, scamAlerts: sa.count || 0, pendingApprovals: aq.count || 0, users: u.count || 0,
        pendingClaims: pc.count || 0, pendingUpgrades: pu.count || 0, pendingApplications: pa.count || 0,
      });

      const { data: activity } = await supabase.from("approval_queue").select("content_type, status, created_at, priority")
        .order("created_at", { ascending: false }).limit(8);
      if (activity) setRecentActivity(activity);

      const { data: users } = await supabase.from("profiles").select("full_name, username, created_at")
        .order("created_at", { ascending: false }).limit(5);
      if (users) setRecentUsers(users);

      const { data: brokers } = await supabase.from("brokers").select("name, score, review_count, slug")
        .eq("status", "published").order("score", { ascending: false }).limit(5);
      if (brokers) setTopBrokers(brokers);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasRole("super_admin")) return <Navigate to="/dashboard" replace />;

  const maxStat = Math.max(...Object.values(stats), 1);

  const primaryStats = [
    { label: "Pending", value: stats.pendingApprovals, icon: CheckCircle, link: "/admin/approvals" },
    { label: "Users", value: stats.users, icon: Users, link: "/admin/users" },
    { label: "Brokers", value: stats.brokers, icon: Building2, link: "/admin/brokers" },
    { label: "Revenue", value: 0, icon: DollarSign, link: "/admin/revenue" },
  ];

  const healthGauges = [
    { label: "Reviews", value: stats.reviews, icon: MessageSquare },
    { label: "Complaints", value: stats.complaints, icon: AlertTriangle },
    { label: "Signals", value: stats.signals, icon: Radio },
    { label: "Forecasts", value: stats.forecasts, icon: TrendingUp },
    { label: "Scam Alerts", value: stats.scamAlerts, icon: ShieldAlert },
    { label: "Claims", value: stats.pendingClaims, icon: ShieldCheck },
  ];

  const quickActions = [
    { label: "Approvals", icon: CheckCircle, link: "/admin/approvals", badge: stats.pendingApprovals },
    { label: "Claims", icon: ShieldCheck, link: "/admin/claims", badge: stats.pendingClaims },
    { label: "Upgrades", icon: ArrowUpCircle, link: "/admin/tier-upgrades", badge: stats.pendingUpgrades },
    { label: "Scam Alerts", icon: ShieldAlert, link: "/admin/scam-alerts" },
    { label: "Users & Roles", icon: Users, link: "/admin/users" },
    { label: "Settings", icon: Cpu, link: "/admin/settings" },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">SUPER ADMIN</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Command Center</h2>
        <div className="ml-auto flex items-center gap-2">
          <Wifi className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase">System Online</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {primaryStats.map(s => (
          <Link key={s.label} to={s.link} className="hud-stat p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-foreground">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Quick Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(qa => (
              <Link key={qa.label} to={qa.link} className="hud-action-btn p-3 flex flex-col items-center gap-1.5 text-center relative">
                <qa.icon className="w-5 h-5 text-primary" />
                <span className="text-[10px] text-foreground font-mono">{qa.label}</span>
                {qa.badge ? (
                  <span className="absolute top-1 right-1 text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-mono">{qa.badge}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="hud-card p-1">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-mono text-primary uppercase tracking-widest">Queue Preview</span>
                </div>
                <Link to="/admin/approvals" className="text-[10px] font-mono text-primary hover:underline">VIEW ALL →</Link>
              </div>
              <div className="space-y-1.5">
                {recentActivity.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-background/50 border border-border/30 rounded text-xs">
                    <span className="text-foreground capitalize font-mono">{a.content_type}</span>
                    <div className="flex items-center gap-2">
                      {a.priority && a.priority <= 2 && <span className="text-[9px] text-destructive font-mono">P{a.priority}</span>}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        a.status === "pending" ? "bg-accent/10 text-accent border border-accent/20" :
                        a.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" :
                        "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}>{a.status}</span>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && <p className="text-xs text-muted-foreground font-mono p-2">NO PENDING ITEMS</p>}
              </div>
            </div>
          </div>

          <div className="hud-card p-1">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Recent Signups</span>
              </div>
              <div className="space-y-1.5">
                {recentUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-background/50 border border-border/30 rounded text-xs">
                    <div>
                      <span className="text-foreground font-mono">{u.full_name || "—"}</span>
                      {u.username && <span className="text-muted-foreground font-mono ml-1">@{u.username}</span>}
                    </div>
                    <span className="text-[9px] text-muted-foreground font-mono">{new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                {recentUsers.length === 0 && <p className="text-xs text-muted-foreground font-mono p-2">NO USERS YET</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Health Gauges</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {healthGauges.map(g => (
                <HudGauge key={g.label} value={g.value} max={maxStat} label={g.label} icon={g.icon} />
              ))}
            </div>
          </div>

          <div className="hud-card p-1">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Top Brokers</span>
              </div>
              <div className="space-y-1.5">
                {topBrokers.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-background/50 border border-border/30 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold font-mono text-primary">#{i + 1}</span>
                      <span className="text-foreground font-mono">{b.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-muted-foreground font-mono">{b.review_count || 0} reviews</span>
                      <span className="text-[9px] font-mono text-primary">{b.score}/10</span>
                    </div>
                  </div>
                ))}
                {topBrokers.length === 0 && <p className="text-xs text-muted-foreground font-mono p-2">NO BROKERS YET</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
