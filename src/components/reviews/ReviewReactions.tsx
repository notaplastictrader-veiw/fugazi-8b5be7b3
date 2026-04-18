import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ReactionKey = "love" | "care" | "helpful" | "thanks";

const REACTIONS: { key: ReactionKey; emoji: string; label: string }[] = [
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "care", emoji: "🤗", label: "Care" },
  { key: "helpful", emoji: "👍", label: "Helpful" },
  { key: "thanks", emoji: "🙏", label: "Thanks" },
];

interface Props {
  reviewId: string;
  className?: string;
  /** When true, renders counts only — no toggling */
  readOnly?: boolean;
}

const ReviewReactions = ({ reviewId, className, readOnly }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<ReactionKey, number>>({ love: 0, care: 0, helpful: 0, thanks: 0 });
  const [mine, setMine] = useState<Set<ReactionKey>>(new Set());
  const [busy, setBusy] = useState<ReactionKey | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("review_reactions")
      .select("reaction, user_id")
      .eq("review_id", reviewId);
    if (!data) return;
    const c: Record<ReactionKey, number> = { love: 0, care: 0, helpful: 0, thanks: 0 };
    const m = new Set<ReactionKey>();
    data.forEach((row: any) => {
      const k = row.reaction as ReactionKey;
      if (k in c) {
        c[k]++;
        if (user && row.user_id === user.id) m.add(k);
      }
    });
    setCounts(c);
    setMine(m);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [reviewId, user?.id]);

  const toggle = async (key: ReactionKey) => {
    if (readOnly) return;
    if (!user) {
      toast({ title: "Sign in to react", variant: "destructive" });
      return;
    }
    setBusy(key);
    try {
      if (mine.has(key)) {
        const { error } = await supabase
          .from("review_reactions")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id)
          .eq("reaction", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_reactions")
          .insert({ review_id: reviewId, user_id: user.id, reaction: key });
        if (error) throw error;
      }
      await load();
    } catch (err: any) {
      toast({ title: "Reaction failed", description: err.message, variant: "destructive" });
    }
    setBusy(null);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {REACTIONS.map((r) => {
        const active = mine.has(r.key);
        return (
          <button
            key={r.key}
            onClick={() => toggle(r.key)}
            disabled={busy === r.key}
            title={r.label}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors",
              active
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              busy === r.key && "opacity-50",
            )}
          >
            <span className="text-sm leading-none">{r.emoji}</span>
            <span className="font-mono tabular-nums">{counts[r.key]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReviewReactions;
