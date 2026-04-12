import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  type: "broker" | "signal" | "news" | "scam_alert" | "forecast" | "promotion";
  url: string;
}

export const useGlobalSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const q = `%${query}%`;

      const [brokers, signals, news, scams, forecasts, promos] = await Promise.all([
        supabase.from("brokers").select("id, name, slug").eq("status", "published").ilike("name", q).limit(5),
        supabase.from("signal_groups").select("id, name").eq("status", "published").ilike("name", q).limit(5),
        supabase.from("news_articles").select("id, title, slug").eq("status", "published").ilike("title", q).limit(5),
        supabase.from("scam_alerts").select("id, title").eq("status", "published").ilike("title", q).limit(5),
        supabase.from("forecasts").select("id, pair").eq("status", "published").ilike("pair", q).limit(5),
        supabase.from("promotions").select("id, title").eq("status", "published").ilike("title", q).limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(brokers.data || []).map((b) => ({ id: b.id, title: b.name, type: "broker" as const, url: `/brokers/${b.slug}` })),
        ...(signals.data || []).map((s) => ({ id: s.id, title: s.name, type: "signal" as const, url: "/signals" })),
        ...(news.data || []).map((n) => ({ id: n.id, title: n.title, type: "news" as const, url: "/news" })),
        ...(scams.data || []).map((s) => ({ id: s.id, title: s.title, type: "scam_alert" as const, url: "/scam-alerts" })),
        ...(forecasts.data || []).map((f) => ({ id: f.id, title: f.pair, type: "forecast" as const, url: "/signals" })),
        ...(promos.data || []).map((p) => ({ id: p.id, title: p.title, type: "promotion" as const, url: "/promotions" })),
      ];

      setResults(mapped);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, loading };
};
