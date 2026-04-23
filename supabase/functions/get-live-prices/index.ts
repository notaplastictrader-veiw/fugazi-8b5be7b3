// Public edge function — returns cached live prices from TwelveData.
// Caches in site_settings.ticker_cache (refreshed at most once per 55s).
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

// Display label -> TwelveData symbol
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

const FALLBACK: TickerPair[] = [
  { pair: "XAU/USD", price: "2,341.50", change: "+0.82%", up: true },
  { pair: "EUR/USD", price: "1.0847", change: "-0.12%", up: false },
  { pair: "GBP/USD", price: "1.2634", change: "+0.25%", up: true },
  { pair: "USD/JPY", price: "157.42", change: "+0.45%", up: true },
  { pair: "AUD/USD", price: "0.6587", change: "+0.18%", up: true },
  { pair: "USD/CAD", price: "1.3642", change: "-0.09%", up: false },
  { pair: "BTC/USD", price: "67,842", change: "+2.14%", up: true },
  { pair: "ETH/USD", price: "3,521", change: "+1.82%", up: true },
];

const CACHE_TTL_MS = 55_000; // refresh at most every 55s

function formatPrice(value: number, type: string): string {
  if (type === "crypto" && value >= 1000) {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  // forex: 4 decimals (2 for JPY-style >= 100)
  if (value >= 100) return value.toFixed(2);
  return value.toFixed(4);
}

async function fetchFromTwelveData(apiKey: string): Promise<TickerPair[]> {
  const symbolsParam = SYMBOLS.map((s) => s.symbol).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
    symbolsParam,
  )}&apikey=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TwelveData ${res.status}`);
  const data = await res.json();

  // When a single symbol is requested it returns a flat object; with multiple it's keyed.
  // Skip symbols that error out so we only show real live data.
  const result: TickerPair[] = SYMBOLS.flatMap((s) => {
    const entry = data?.[s.symbol] ?? (SYMBOLS.length === 1 ? data : null);
    if (!entry || entry.status === "error" || !entry.close) {
      console.warn(`Skipping ${s.label}: no data from upstream`);
      return [];
    }
    const close = parseFloat(entry.close);
    const pct = parseFloat(entry.percent_change ?? "0");
    return [{
      pair: s.label,
      price: formatPrice(close, s.type),
      change: `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
      up: pct >= 0,
    }];
  });

  return result;
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
      .eq("key", "ticker_cache")
      .maybeSingle();

    const cacheValue = cacheRow?.value as { prices?: TickerPair[]; fetched_at?: string } | null;
    const cachedPrices = cacheValue?.prices;
    const fetchedAt = cacheValue?.fetched_at ? new Date(cacheValue.fetched_at).getTime() : 0;
    const age = Date.now() - fetchedAt;

    if (cachedPrices && cachedPrices.length > 0 && age < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ prices: cachedPrices, cached: true, age_ms: age }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Refresh from TwelveData
    const apiKey = Deno.env.get("TWELVEDATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ prices: cachedPrices ?? FALLBACK, cached: false, error: "no_api_key" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let prices: TickerPair[];
    try {
      prices = await fetchFromTwelveData(apiKey);
    } catch (err) {
      console.error("TwelveData fetch failed:", err);
      return new Response(
        JSON.stringify({
          prices: cachedPrices ?? FALLBACK,
          cached: false,
          error: "upstream_failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Write cache (upsert by key)
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
      JSON.stringify({ prices: FALLBACK, cached: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
