import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Star, AlertTriangle, Bookmark, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const StatCard = ({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string | number }) => (
  <div className="glass-card rounded-xl p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className="text-2xl font-display font-bold text-foreground">{value}</div>
  </div>
);

const Overview = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["dashboard-profile-name", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("full_name, username").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const fullName =
    user?.user_metadata?.full_name ||
    profile?.full_name ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "User";

  const { data: reviewCount = 0 } = useQuery({
    queryKey: ["dashboard-review-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("reviews").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: complaintCount = 0 } = useQuery({
    queryKey: ["dashboard-complaint-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("complaints").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: watchlistCount = 0 } = useQuery({
    queryKey: ["dashboard-watchlist-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("watchlist").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["dashboard-activity", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_activity").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <>
      <SEO title="Dashboard" description="Your personal trading dashboard." path="/dashboard" />
      <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">Dashboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Welcome back, {fullName.split(" ")[0]}.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Star} label="Reviews" value={reviewCount} />
        <StatCard icon={AlertTriangle} label="Complaints" value={complaintCount} />
        <StatCard icon={Bookmark} label="Watchlist" value={watchlistCount} />
        <StatCard icon={Activity} label="Actions" value={activity.length} />
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Your actions will appear here.</p>
        ) : (
          <div className="space-y-3">
            {activity.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 text-sm">
                <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground">{a.action_type}</span>
                <span className="text-muted-foreground text-xs ml-auto">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Overview;
