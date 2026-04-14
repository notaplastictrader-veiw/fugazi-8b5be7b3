import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReputationTier = "New Trader" | "Active Trader" | "Trusted Trader" | "Verified Voice" | "Top Contributor";

export const getTierColor = (tier: ReputationTier | string) => {
  switch (tier) {
    case "Top Contributor": return "text-yellow-400";
    case "Verified Voice": return "text-purple-400";
    case "Trusted Trader": return "text-emerald-400";
    case "Active Trader": return "text-blue-400";
    default: return "text-muted-foreground";
  }
};

export const getTierBg = (tier: ReputationTier | string) => {
  switch (tier) {
    case "Top Contributor": return "bg-yellow-400/10 border-yellow-400/30";
    case "Verified Voice": return "bg-purple-400/10 border-purple-400/30";
    case "Trusted Trader": return "bg-emerald-400/10 border-emerald-400/30";
    case "Active Trader": return "bg-blue-400/10 border-blue-400/30";
    default: return "bg-muted/50 border-border";
  }
};

export const useReputation = (userId?: string) => {
  return useQuery({
    queryKey: ["reputation", userId],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("reputation_score, reputation_tier")
        .eq("user_id", userId!)
        .single();
      return {
        score: profile?.reputation_score ?? 0,
        tier: (profile?.reputation_tier ?? "New Trader") as ReputationTier,
      };
    },
    enabled: !!userId,
  });
};
