import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  brokerId: string;
  brokerName?: string;
  variant?: "pill" | "icon";
  className?: string;
}

const WatchlistButton = ({ brokerId, brokerName, variant = "pill", className = "" }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("broker_id", brokerId)
      .maybeSingle()
      .then(({ data }) => setWatching(!!data));
  }, [user, brokerId]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: "Sign in to use Watchlist", variant: "destructive" });
      return;
    }
    setLoading(true);
    if (watching) {
      await supabase.from("watchlist").delete().eq("user_id", user.id).eq("broker_id", brokerId);
      setWatching(false);
      toast({ title: `Removed ${brokerName || "broker"} from watchlist` });
    } else {
      await supabase.from("watchlist").insert({ user_id: user.id, broker_id: brokerId });
      setWatching(true);
      toast({ title: `Added ${brokerName || "broker"} to watchlist` });
    }
    setLoading(false);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
        className={`p-1.5 rounded-md border transition-colors ${
          watching
            ? "border-primary/40 text-primary bg-primary/10"
            : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
        } ${className}`}
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : watching ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
        watching
          ? "border-primary/40 text-primary bg-primary/10"
          : "border-border text-muted-foreground hover:text-primary hover:border-primary/40"
      } ${className}`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : watching ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      {watching ? "Watching" : "+ Watch"}
    </button>
  );
};

export default WatchlistButton;
