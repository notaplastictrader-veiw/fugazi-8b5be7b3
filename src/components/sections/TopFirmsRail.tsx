import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Shield, TrendingUp } from "lucide-react";
import NeonCard from "@/components/ui/NeonCard";

interface RailItem {
  id: string;
  slug: string;
  name: string;
  score: number | null;
  badge?: string | null;
  meta?: string;
}

interface TopFirmsRailProps {
  variant: "broker" | "prop-firm" | "signal";
  limit?: number;
  title?: string;
}

const TopFirmsRail = ({ variant, limit = 7, title }: TopFirmsRailProps) => {
  const [items, setItems] = useState<RailItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (variant === "signal") {
        const { data } = await supabase
          .from("signal_groups")
          .select("id, name, win_rate, members")
          .eq("status", "published")
          .order("win_rate", { ascending: false })
          .limit(limit);
        if (cancelled || !data) return;
        setItems(
          data.map((r: any) => ({
            id: r.id,
            slug: r.id,
            name: r.name,
            score: r.win_rate,
            meta: r.members ? `${r.members} members` : "",
          }))
        );
      } else {
        const q = supabase
          .from("brokers")
          .select("id, name, slug, score, badge, type, tags")
          .eq("status", "published")
          .order("score", { ascending: false })
          .limit(limit);
        const { data } = variant === "prop-firm"
          ? await q.eq("type", "prop-firm")
          : await q.neq("type", "prop-firm");
        if (cancelled || !data) return;
        setItems(
          data
            .filter((r: any) => !r.tags?.includes('upcoming'))
            .map((r: any) => ({
              id: r.id,
              slug: r.slug,
              name: r.name,
              score: r.score,
              badge: r.badge,
            }))
        );
      }
    })();
    return () => { cancelled = true; };
  }, [variant, limit]);

  const headerTitle =
    title ||
    (variant === "broker"
      ? "Top Brokers"
      : variant === "prop-firm"
      ? "Top Prop Firms"
      : "Top Signal Groups");

  const linkBase = variant === "signal" ? "/signals" : "/brokers";

  if (!items.length) return null;

  return (
    <NeonCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
          {headerTitle}
        </span>
      </div>
      <ol className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.id}>
            <Link
              to={`${linkBase}/${item.slug}`}
              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-primary/5 transition-colors group"
            >
              <span
                className={`text-xs font-mono font-bold w-5 text-center ${
                  i === 0 ? "text-primary" : i === 1 ? "text-accent" : "text-muted-foreground"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {item.name}
              </span>
              {item.badge === "verified" && (
                <Shield className="w-3 h-3 text-primary shrink-0" />
              )}
              <span className="text-xs font-mono font-bold text-foreground shrink-0 flex items-center gap-1">
                {variant === "signal" && (
                  <TrendingUp className="w-3 h-3 text-primary" />
                )}
                {item.score ?? "—"}
                {variant === "signal" ? "%" : ""}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </NeonCard>
  );
};

export default TopFirmsRail;
