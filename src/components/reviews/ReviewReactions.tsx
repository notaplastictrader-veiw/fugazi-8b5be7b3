import { useEffect, useState } from "react";
import { SmilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Full emoji palette (good + bad + neutral)
const EMOJI_PALETTE = [
  "❤️", "👍", "👎", "😂",
  "😮", "😢", "😡", "🔥",
  "🙏", "🤝", "⚠️", "💯",
];

// Map legacy keys (love/care/helpful/thanks) to emoji for display
const LEGACY_MAP: Record<string, string> = {
  love: "❤️",
  care: "🤗",
  helpful: "👍",
  thanks: "🙏",
};

const normalize = (raw: string) => LEGACY_MAP[raw] ?? raw;

interface Props {
  reviewId: string;
  className?: string;
  /** When true, renders counts only — no toggling */
  readOnly?: boolean;
}

const ReviewReactions = ({ reviewId, className, readOnly }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("review_reactions")
      .select("reaction, user_id")
      .eq("review_id", reviewId);
    if (!data) return;
    const c: Record<string, number> = {};
    const m = new Set<string>();
    data.forEach((row: any) => {
      const k = normalize(row.reaction as string);
      c[k] = (c[k] ?? 0) + 1;
      if (user && row.user_id === user.id) m.add(k);
    });
    setCounts(c);
    setMine(m);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId, user?.id]);

  const toggle = async (emoji: string) => {
    if (readOnly) return;
    if (!user) {
      toast({ title: "Sign in to react", variant: "destructive" });
      return;
    }
    setBusy(emoji);
    try {
      if (mine.has(emoji)) {
        // Find any stored variant for this emoji (legacy or new) by the user
        const legacyKey = Object.entries(LEGACY_MAP).find(([, v]) => v === emoji)?.[0];
        const targets = legacyKey ? [emoji, legacyKey] : [emoji];
        const { error } = await supabase
          .from("review_reactions")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id)
          .in("reaction", targets);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_reactions")
          .insert({ review_id: reviewId, user_id: user.id, reaction: emoji });
        if (error) throw error;
      }
      await load();
    } catch (err: any) {
      toast({ title: "Reaction failed", description: err.message, variant: "destructive" });
    }
    setBusy(null);
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeChips = Object.entries(counts).filter(([, n]) => n > 0);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {/* Trigger: smiley + total */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={readOnly}
            title={readOnly ? "View only" : "React"}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors",
              "bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              readOnly && "cursor-not-allowed opacity-70 hover:border-border hover:text-muted-foreground",
            )}
          >
            <SmilePlus className="w-3.5 h-3.5" />
            {total > 0 && <span className="font-mono tabular-nums">{total}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="grid grid-cols-4 gap-1">
            {EMOJI_PALETTE.map((emoji) => {
              const active = mine.has(emoji);
              return (
                <button
                  key={emoji}
                  type="button"
                  disabled={busy === emoji}
                  onClick={() => { toggle(emoji); setOpen(false); }}
                  className={cn(
                    "w-9 h-9 inline-flex items-center justify-center rounded-md text-lg transition-all hover:bg-secondary hover:scale-110",
                    active && "ring-2 ring-primary bg-primary/10",
                    busy === emoji && "opacity-50",
                  )}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Summary chips for reactions with ≥1 count */}
      {activeChips.map(([emoji, n]) => {
        const active = mine.has(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => toggle(emoji)}
            disabled={busy === emoji || readOnly}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-colors",
              active
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
              busy === emoji && "opacity-50",
              readOnly && "cursor-not-allowed opacity-70",
            )}
          >
            <span className="text-sm leading-none">{emoji}</span>
            <span className="font-mono tabular-nums">{n}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ReviewReactions;
