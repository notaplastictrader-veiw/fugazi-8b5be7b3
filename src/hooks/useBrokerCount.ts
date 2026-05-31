import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallbacks used during initial load so UI never shows empty/zero.
// Keep in sync with the most recent known DB count.
const FALLBACK_EXACT = 928;

const roundDown = (n: number) => `${Math.max(0, Math.floor(n / 100) * 100)}+`;

/**
 * Live published broker count from the database.
 * Cached for 1 hour to avoid hammering the API on every render.
 *
 * - `exact`   → e.g. 928 (use in hero stat cards, dashboards)
 * - `rounded` → e.g. "900+" (use in marketing copy, meta descriptions)
 */
export function useBrokerCount() {
  const { data, isLoading } = useQuery({
    queryKey: ["broker-count", "published"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("brokers")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      if (error) throw error;
      return count ?? FALLBACK_EXACT;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
  });

  const exact = data ?? FALLBACK_EXACT;
  return {
    exact,
    rounded: roundDown(exact),
    loading: isLoading,
  };
}
