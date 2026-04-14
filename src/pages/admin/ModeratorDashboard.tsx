import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  MessageSquare, AlertTriangle, CheckCircle, Activity, Eye, Shield
} from "lucide-react";

interface ModStats {
  pendingReviews: number;
  pendingComplaints: number;
  pendingApprovals: number;
  publishedToday: number;
}

const HudGauge = ({ value, label, icon: Icon }: { value: number; label: string; icon: any }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / Math.max(value, 10), 1);
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

const ModeratorDashboard = () => {
  const [stats, setStats] = useState<ModStats>({ pendingReviews: 0, pendingComplaints: 0, pendingApprovals: 0, publishedToday: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fetchAll = async () => {
      const [reviews, complaints, approvals, published] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("approval_queue").select("id", { count: "exact", head: true }).eq("status", "approved").gte("created_at", today.toISOString()),
      ]);

      setStats({
        pendingReviews: reviews.count || 0,
        pendingComplaints: complaints.count || 0,
        pendingApprovals: approvals.count || 0,
        publishedToday: published.count || 0,
      });
    };

    const fetchRecent = async () => {
      const { data } = await supabase.from("approval_queue")
        .select("content_type, status, created_at")
        .order("created_at", { ascending: false }).limit(10);
      if (data) setRecentActivity(data);
    };

    fetchAll();
    fetchRecent();
  }, []);

  const quickLinks = [
    { label: "Reviews", icon: MessageSquare, link: "/admin/reviews", badge: stats.pendingReviews },
    { label: "Complaints", icon: AlertTriangle, link: "/admin/complaints", badge: stats.pendingComplaints },
    { label: "Approval Queue", icon: CheckCircle, link: "/admin/approvals", badge: stats.pendingApprovals },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center gap-3 mb-6">
        <div className="hud-badge">MODERATOR</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Moderation Hub
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-mono text-primary uppercase">Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <HudGauge value={stats.pendingReviews} label="Reviews" icon={MessageSquare} />
        <HudGauge value={stats.pendingComplaints} label="Complaints" icon={AlertTriangle} />
        <HudGauge value={stats.pendingApprovals} label="Pending" icon={CheckCircle} />
        <HudGauge value={stats.publishedToday} label="Published" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="hud-card p-1">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono text-primary uppercase tracking-widest">Recent Activity</span>
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
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground font-mono p-3">NO RECENT ACTIVITY</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Quick Access</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((ql) => (
              <Link key={ql.label} to={ql.link} className="hud-action-btn p-4 flex items-center gap-4">
                <ql.icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-foreground font-mono flex-1">{ql.label}</span>
                {ql.badge > 0 && <span className="hud-badge">{ql.badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
