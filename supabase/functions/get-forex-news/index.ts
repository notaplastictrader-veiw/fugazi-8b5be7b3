// Public edge function — returns cached forex news from Finnhub.
// Caches in site_settings.forex_news_cache (refreshed at most every 5 min).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number; // unix seconds
}

const CACHE_TTL_MS = 5 * 60_000; // 5 minutes

async function fetchFromFinnhub(
  apiKey: string,
  category: "forex" | "general",
): Promise<NewsArticle[]> {
  const url = `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${category} ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Finnhub ${category}: unexpected response`);

  return data
    .map((a: any) => ({
      headline: String(a.headline ?? "").trim(),
      summary: String(a.summary ?? "").trim(),
      source: String(a.source ?? "").trim(),
      url: String(a.url ?? "").trim(),
      image: String(a.image ?? "").trim(),
      datetime: Number(a.datetime ?? 0),
    }))
    .filter((a) => a.headline && a.url);
}

function mergeArticles(
  forex: NewsArticle[],
  general: NewsArticle[],
  cap: number,
): NewsArticle[] {
  const seen = new Set<string>();
  const merged: NewsArticle[] = [];
  for (const a of [...forex, ...general]) {
    if (seen.has(a.url)) continue;
    seen.add(a.url);
    merged.push(a);
    if (merged.length >= cap) break;
  }
  return merged;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Read cache
    const { data: cacheRow } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "forex_news_cache")
      .maybeSingle();

    const cacheValue = cacheRow?.value as
      | { articles?: NewsArticle[]; fetched_at?: string }
      | null;
    const cachedArticles = cacheValue?.articles;
    const fetchedAt = cacheValue?.fetched_at
      ? new Date(cacheValue.fetched_at).getTime()
      : 0;
    const age = Date.now() - fetchedAt;

    if (cachedArticles && cachedArticles.length > 0 && age < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ articles: cachedArticles, cached: true, age_ms: age }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Refresh from Finnhub
    const apiKey = Deno.env.get("FINNHUB_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          articles: cachedArticles ?? [],
          cached: false,
          error: "no_api_key",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let articles: NewsArticle[];
    try {
      const [forexRes, generalRes] = await Promise.allSettled([
        fetchFromFinnhub(apiKey, "forex"),
        fetchFromFinnhub(apiKey, "general"),
      ]);
      const forexArticles = forexRes.status === "fulfilled" ? forexRes.value : [];
      const generalArticles = generalRes.status === "fulfilled" ? generalRes.value : [];
      if (forexRes.status === "rejected") console.error("Finnhub forex failed:", forexRes.reason);
      if (generalRes.status === "rejected") console.error("Finnhub general failed:", generalRes.reason);

      articles = mergeArticles(forexArticles, generalArticles, 12);
      if (articles.length === 0) throw new Error("Both Finnhub categories returned no articles");
    } catch (err) {
      console.error("Finnhub fetch failed:", err);
      return new Response(
        JSON.stringify({
          articles: cachedArticles ?? [],
          cached: false,
          error: "upstream_failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Write cache
    const newValue = { articles, fetched_at: new Date().toISOString() };
    const { error: upsertErr } = await supabase
      .from("site_settings")
      .upsert({ key: "forex_news_cache", value: newValue }, { onConflict: "key" });
    if (upsertErr) console.error("Cache upsert error:", upsertErr);

    return new Response(
      JSON.stringify({ articles, cached: false, age_ms: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("get-forex-news error:", err);
    return new Response(
      JSON.stringify({ articles: [], cached: false, error: String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
