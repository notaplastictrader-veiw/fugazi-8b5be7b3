import { useEffect, useState } from "react";
import { ThumbsUp, Flame, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Reaction = "like" | "fire" | "flag";
const ICON: Record<Reaction, any> = { like: ThumbsUp, fire: Flame, flag: Flag };

interface Props {
  targetType: "thread" | "reply";
  targetId: string;
}

export default function ReactionBar({ targetType, targetId }: Props) {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<Reaction, number>>({ like: 0, fire: 0, flag: 0 });
  const [mine, setMine] = useState<Set<Reaction>>(new Set());
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [targetId, user?.id]);

  async function load() {
    const { data } = await supabase
      .from("forum_reactions")
      .select("reaction, user_id")
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    const c: Record<Reaction, number> = { like: 0, fire: 0, flag: 0 };
    const m = new Set<Reaction>();
    (data || []).forEach((r: any) => {
      c[r.reaction as Reaction] = (c[r.reaction as Reaction] || 0) + 1;
      if (user && r.user_id === user.id) m.add(r.reaction);
    });
    setCounts(c); setMine(m);
  }

  async function toggle(r: Reaction) {
    if (!user) { toast.error("Sign in to react"); return; }
    if (mine.has(r)) {
      await supabase.from("forum_reactions")
        .delete()
        .eq("user_id", user.id)
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("reaction", r);
    } else {
      const { error } = await supabase.from("forum_reactions").insert({
        user_id: user.id, target_type: targetType, target_id: targetId, reaction: r,
      });
      if (error) { toast.error(error.message); return; }
    }
    load();
  }

  async function submitReport() {
    if (!user) { toast.error("Sign in to report"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("forum_reports").insert({
      reporter_id: user.id, target_type: targetType, target_id: targetId, reason: reason.trim(),
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Reported. Mods will review.");
    setReportOpen(false); setReason("");
  }

  const Btn = ({ r, label }: { r: Reaction; label: string }) => {
    const Icon = ICON[r];
    const active = mine.has(r);
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(r); }}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition",
          active
            ? "bg-primary/15 border-primary/40 text-primary"
            : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
        )}
        aria-label={label}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{counts[r] || 0}</span>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Btn r="like" label="Like" />
      <Btn r="fire" label="Fire" />
      <Btn r="flag" label="Flag agree" />
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogTrigger asChild>
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive transition"
          >
            <Flag className="w-3.5 h-3.5" /> Report
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Report this {targetType}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Why is this harmful, spam, or misleading? (optional)"
              rows={4}
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={500}
            />
            <Button onClick={submitReport} disabled={submitting} className="w-full" variant="destructive">
              {submitting ? "Sending…" : "Send report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
