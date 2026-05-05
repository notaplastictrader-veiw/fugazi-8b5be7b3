// Public edge function — returns cached live prices from TwelveData.
// On rate limit / upstream failure returns { rate_limited: true } so the UI
// can show "Updating soon…" instead of stale fallback prices.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TickerPair {
  pair: string;
  price: string;
  change: string;
  up: boolean;
}

const SYMBOLS: Array<{ label: string; symbol: string; type: "forex" | "crypto" }> = [
  { label: "XAU/USD", symbol: "XAU/USD", type: "forex" },
  { label: "EUR/USD", symbol: "EUR/USD", type: "forex" },
  { label: "GBP/USD", symbol: "GBP/USD", type: "forex" },
  { label: "USD/JPY", symbol: "USD/JPY", type: "forex" },
  { label: "AUD/USD", symbol: "AUD/USD", type: "forex" },
  { label: "USD/CAD", symbol: "USD/CAD", type: "forex" },
  { label: "BTC/USD", symbol: "BTC/USD", type: "crypto" },
  { label: "ETH/USD", symbol: "ETH/USD", type: "crypto" },
];

const CACHE_TTL_MS = 55_000;
const RATE_LIMIT_BACKOFF_MS = 90_000;

function formatPrice(value: number, type: string): string {
  if (type === "crypto" && value >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  if (value >= 100) return value.toFixed(2);
  return value.toFixed(4);
}

function looksRateLimited(entry: any): boolean {
  if (!entry) return false;
  const code = entry.code;
  const msg = (entry.message || "").toString().toLowerCase();
  if (code === 429) return true;
  return /limit|credit|quota|exceed/.test(msg);
}

async function fetchFromTwelveData(
  apiKey: string,
): Promise<{ prices: TickerPair[]; rateLimited: boolean }> {
  const symbolsParam = SYMBOLS.map((s) => s.symbol).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
    symbolsParam,
  )}&apikey=${apiKey}`;

  const res = await fetch(url);
  if (res.status === 429) {
    return { prices: [], rateLimited: true };
  }
  if (!res.ok) throw new Error(`TwelveData ${res.status}`);
  const data = await res.json();

  // If top-level is a rate-limit error
  if (looksRateLimited(data)) {
    return { prices: [], rateLimited: true };
  }

  let rateLimited = false;
  const result: TickerPair[] = SYMBOLS.flatMap((s) => {
    const entry = data?.[s.symbol] ?? (SYMBOLS.length === 1 ? data : null);
    if (!entry) return [];
    if (looksRateLimited(entry)) {
      rateLimited = true;
      return [];
    }
    if (entry.status === "error" || !entry.close) return [];
    const close = parseFloat(entry.close);
    const pct = parseFloat(entry.percent_change ?? "0");
    return [{
      pair: s.label,
      price: formatPrice(close, s.type),
      change: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
      up: pct >= 0,
    }];
  });

  // If we got nothing back at all, treat as rate limited (most common cause).
  if (result.length === 0) rateLimited = true;

  return { prices: result, rateLimited };
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

    const { data: cacheRow } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "ticker_cache")
      .maybeSingle();

    const cacheValue = cacheRow?.value as
      | { prices?: TickerPair[]; fetched_at?: string; rate_limited_until?: string }
      | null;
    const cachedPrices = cacheValue?.prices;
    const fetchedAt = cacheValue?.fetched_at ? new Date(cacheValue.fetched_at).getTime() : 0;
    const rateLimitedUntil = cacheValue?.rate_limited_until
      ? new Date(cacheValue.rate_limited_until).getTime()
      : 0;
    const age = Date.now() - fetchedAt;

    // Fresh cache → serve it
    if (cachedPrices && cachedPrices.length > 0 && age < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ prices: cachedPrices, cached: true, age_ms: age }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If we recently hit rate limit, don't hammer upstream
    if (Date.now() < rateLimitedUntil) {
      return new Response(
        JSON.stringify({
          prices: [],
          rate_limited: true,
          retry_after_ms: rateLimitedUntil - Date.now(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("TWELVEDATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ prices: [], rate_limited: true, error: "no_api_key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let prices: TickerPair[] = [];
    let rateLimited = false;
    try {
      const r = await fetchFromTwelveData(apiKey);
      prices = r.prices;
      rateLimited = r.rateLimited;
    } catch (err) {
      console.error("TwelveData fetch failed:", err);
      return new Response(
        JSON.stringify({ prices: [], rate_limited: true, error: "upstream_failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (rateLimited || prices.length === 0) {
      const until = new Date(Date.now() + RATE_LIMIT_BACKOFF_MS).toISOString();
      await supabase
        .from("site_settings")
        .upsert(
          {
            key: "ticker_cache",
            value: { ...(cacheValue ?? {}), rate_limited_until: until },
          },
          { onConflict: "key" },
        );
      return new Response(
        JSON.stringify({ prices: [], rate_limited: true, retry_after_ms: RATE_LIMIT_BACKOFF_MS }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const newValue = { prices, fetched_at: new Date().toISOString() };
    const { error: upsertErr } = await supabase
      .from("site_settings")
      .upsert({ key: "ticker_cache", value: newValue }, { onConflict: "key" });
    if (upsertErr) console.error("Cache upsert error:", upsertErr);

    return new Response(
      JSON.stringify({ prices, cached: false, age_ms: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("get-live-prices error:", err);
    return new Response(
      JSON.stringify({ prices: [], rate_limited: true, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
