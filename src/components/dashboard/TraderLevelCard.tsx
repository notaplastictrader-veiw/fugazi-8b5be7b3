import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Flame, Award, Star } from "lucide-react";

const TIERS = [
  { name: "Recruit", min: 0, color: "text-muted-foreground" },
  { name: "Trader", min: 50, color: "text-foreground" },
  { name: "Veteran", min: 200, color: "text-primary" },
  { name: "Sharpshooter", min: 500, color: "text-primary" },
  { name: "Legend", min: 1000, color: "text-primary" },
];

const TraderLevelCard = ({ userName }: { userName?: string } = {}) => {
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["xp-summary", user?.id],
    queryFn: async () => {
      const [reviews, complaints, trades, watchlist] = await Promise.all([
        supabase.from("reviews").select("created_at", { count: "exact" }).eq("user_id", user!.id),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("trade_journal").select("opened_at, outcome", { count: "exact" }).eq("user_id", user!.id),
        supabase.from("watchlist").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);

      const reviewCount = reviews.count || 0;
      const complaintCount = complaints.count || 0;
      const tradeCount = trades.count || 0;
      const watchCount = watchlist.count || 0;
      const wins = (trades.data || []).filter((t: any) => t.outcome === "win").length;

      // XP formula
      const xp = reviewCount * 25 + complaintCount * 15 + tradeCount * 5 + watchCount * 2 + wins * 5;

      // Streak: consecutive days with at least one trade or review
      const dates = new Set<string>();
      (reviews.data || []).forEach((r: any) => dates.add(new Date(r.created_at).toISOString().slice(0, 10)));
      (trades.data || []).forEach((t: any) => dates.add(new Date(t.opened_at).toISOString().slice(0, 10)));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (dates.has(d.toISOString().slice(0, 10))) streak++;
        else if (i > 0) break;
      }

      return { xp, streak, reviewCount, tradeCount };
    },
    enabled: !!user,
  });

  const xp = data?.xp ?? 0;
  const streak = data?.streak ?? 0;
  const tier = [...TIERS].reverse().find((t) => xp >= t.min) || TIERS[0];
  const next = TIERS.find((t) => t.min > xp);
  const progress = next ? Math.min(100, ((xp - tier.min) / (next.min - tier.min)) * 100) : 100;

  const badges: { label: string; icon: any; earned: boolean }[] = [
    { label: "First Review", icon: Star, earned: (data?.reviewCount ?? 0) >= 1 },
    { label: "10 Trades", icon: Award, earned: (data?.tradeCount ?? 0) >= 10 },
    { label: "Week Streak", icon: Flame, earned: streak >= 7 },
    { label: "Top Voice", icon: Trophy, earned: (data?.reviewCount ?? 0) >= 10 },
  ];

  return (
    <div className="glass-card rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className={`w-5 h-5 ${tier.color}`} />
            <span className={`font-display font-bold text-lg ${tier.color}`}>{tier.name}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {xp} XP {next ? `· ${next.min - xp} XP to ${next.name}` : "· Max tier"}
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10">
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{streak}-day streak</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-4">
        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center ${
              b.earned ? "border-primary/30 bg-primary/5" : "border-border opacity-40"
            }`}
            title={b.label}
          >
            <b.icon className={`w-4 h-4 ${b.earned ? "text-primary" : "text-muted-foreground"}`} />
            <span className="text-[10px] leading-tight text-foreground">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TraderLevelCard;
