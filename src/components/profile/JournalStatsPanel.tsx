import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Target, BarChart3 } from "lucide-react";

interface Props {
  userId: string;
}

const JournalStatsPanel = ({ userId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["public-journal-stats", userId],
    queryFn: async () => {
      const { data: trades } = await supabase
        .from("trade_journal")
        .select("pnl, side")
        .eq("user_id", userId);
      const list = trades ?? [];
      const total = list.length;
      const wins = list.filter((t: any) => Number(t.pnl) > 0).length;
      const losses = list.filter((t: any) => Number(t.pnl) < 0).length;
      const net = list.reduce((s: number, t: any) => s + (Number(t.pnl) || 0), 0);
      const winRate = total ? Math.round((wins / total) * 100) : 0;
      return { total, wins, losses, net, winRate };
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground">Loading trade stats…</div>;
  }
  if (!data || data.total === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground text-center">
        No trades logged yet.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" /> Trade Journal Stats
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-xl font-display font-bold text-foreground">{data.total}</div>
          <div className="text-xs text-muted-foreground">Trades</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-display font-bold text-primary flex items-center justify-center gap-1">
            <Target className="w-4 h-4" /> {data.winRate}%
          </div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-display font-bold ${data.net >= 0 ? "text-green-500" : "text-red-500"} flex items-center justify-center gap-1`}>
            <TrendingUp className="w-4 h-4" /> {data.net >= 0 ? "+" : ""}{data.net.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">Net P&amp;L</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-display font-bold text-foreground">
            {data.wins}<span className="text-muted-foreground text-sm">/</span>{data.losses}
          </div>
          <div className="text-xs text-muted-foreground">W/L</div>
        </div>
      </div>
    </div>
  );
};

export default JournalStatsPanel;
