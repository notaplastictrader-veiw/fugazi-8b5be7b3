import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Top {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  reputation_score: number;
  reputation_tier: string | null;
}

const TopTradersRail = () => {
  const [top, setTop] = useState<Top[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, username, full_name, avatar_url, reputation_score, reputation_tier")
        .eq("is_public", true)
        .order("reputation_score", { ascending: false })
        .limit(5);
      setTop(data ?? []);
    })();
  }, []);

  if (top.length === 0) return null;

  return (
    <aside className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-mono uppercase tracking-widest text-foreground">Top Traders</h3>
      </div>
      <ol className="space-y-3">
        {top.map((t, i) => {
          const name = t.full_name || t.username || "Trader";
          const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
          return (
            <li key={t.user_id}>
              <Link
                to={t.username ? `/profile/${t.username}` : "#"}
                className="flex items-center gap-3 group"
              >
                <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={name} className="w-8 h-8 rounded-full object-cover border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[11px] font-display font-bold text-primary">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{t.reputation_tier || "New Trader"}</div>
                </div>
                <span className="flex items-center gap-1 text-xs font-mono text-primary">
                  <Star className="w-3 h-3" /> {t.reputation_score}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
};

export default TopTradersRail;
