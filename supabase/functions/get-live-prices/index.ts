// Public edge function — returns cached live prices from TwelveData.
// Weekend-aware: skips forex API call when forex market is closed (Sat/Sun)
// and returns the last cached forex prices marked as `closed: true`.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type MarketKind = "forex" | "crypto";

interface TickerPair {
  pair: string;
  price: string;
  change: string;
  up: boolean;
  type: MarketKind;
  closed?: boolean;
}

const SYMBOLS: Array<{ label: string; symbol: string; type: MarketKind }> = [
  { label: "XAU/USD", symbol: "XAU/USD", type: "forex" },
  { label: "EUR/USD", symbol: "EUR/USD", type: "forex" },
  { label: "GBP/USD", symbol: "GBP/USD", type: "forex" },
  { label: "USD/JPY", symbol: "USD/JPY", type: "forex" },
  { label: "AUD/USD", symbol: "AUD/USD", type: "forex" },
  { label: "USD/CAD", symbol: "USD/CAD", type: "forex" },
  { label: "BTC/USD", symbol: "BTC/USD", type: "crypto" },
  { label: "ETH/USD", symbol: "ETH/USD", type: "crypto" },
];

const CACHE_TTL_MS = 300_000;
const RATE_LIMIT_BACKOFF_MS = 300_000;

function isForexOpen(now: Date = new Date()): boolean {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (day === 6) return false;
  if (day === 0 && hour < 22) return false;
  if (day === 5 && hour >= 22) return false;
  return true;
}

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
  syms: typeof SYMBOLS,
): Promise<{ prices: TickerPair[]; rateLimited: boolean }> {
  if (syms.length === 0) return { prices: [], rateLimited: false };
  const symbolsParam = syms.map((s) => s.symbol).join(",");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
    symbolsParam,
  )}&apikey=${apiKey}`;

  const res = await fetch(url);
  if (res.status === 429) return { prices: [], rateLimited: true };
  if (!res.ok) throw new Error(`TwelveData ${res.status}`);
  const data = await res.json();

  if (looksRateLimited(data)) return { prices: [], rateLimited: true };

  let rateLimited = false;
  const result: TickerPair[] = syms.flatMap((s) => {
    const entry = data?.[s.symbol] ?? (syms.length === 1 ? data : null);
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
      type: s.type,
    }];
  });

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

    const forexOpen = isForexOpen();

    const { data: cacheRow } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "ticker_cache")
      .maybeSingle();

    const cacheValue = cacheRow?.value as
      | {
          prices?: TickerPair[];
          fetched_at?: string;
          rate_limited_until?: string;
        }
      | null;
    const cachedPrices = cacheValue?.prices ?? [];
    const fetchedAt = cacheValue?.fetched_at ? new Date(cacheValue.fetched_at).getTime() : 0;
    const rateLimitedUntil = cacheValue?.rate_limited_until
      ? new Date(cacheValue.rate_limited_until).getTime()
      : 0;
    const age = Date.now() - fetchedAt;

    // Helper: stamp forex pairs as closed when market is shut.
    const stampClosed = (pairs: TickerPair[]): TickerPair[] =>
      pairs.map((p) =>
        p.type === "forex" && !forexOpen
          ? { ...p, closed: true, change: "CLOSED", up: false }
          : { ...p, closed: false },
      );

    // Fresh cache → serve it (with weekend stamp applied)
    if (cachedPrices.length > 0 && age < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({
          prices: stampClosed(cachedPrices),
          cached: true,
          age_ms: age,
          forex_open: forexOpen,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // If we recently hit rate limit, don't hammer upstream — return cached if any
    if (Date.now() < rateLimitedUntil) {
      if (cachedPrices.length > 0) {
        return new Response(
          JSON.stringify({
            prices: stampClosed(cachedPrices),
            cached: true,
            stale: true,
            forex_open: forexOpen,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          prices: [],
          rate_limited: true,
          retry_after_ms: rateLimitedUntil - Date.now(),
          forex_open: forexOpen,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("TWELVEDATA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          prices: stampClosed(cachedPrices),
          rate_limited: true,
          error: "no_api_key",
          forex_open: forexOpen,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Decide which symbols to fetch fresh:
    // - When forex is closed: only fetch crypto, reuse cached forex (last Friday close).
    // - When forex is open: fetch everything.
    const symsToFetch = forexOpen
      ? SYMBOLS
      : SYMBOLS.filter((s) => s.type === "crypto");

    let freshPrices: TickerPair[] = [];
    let rateLimited = false;
    try {
      const r = await fetchFromTwelveData(apiKey, symsToFetch);
      freshPrices = r.prices;
      rateLimited = r.rateLimited;
    } catch (err) {
      console.error("TwelveData fetch failed:", err);
      // Fall back to cached if available
      if (cachedPrices.length > 0) {
        return new Response(
          JSON.stringify({
            prices: stampClosed(cachedPrices),
            cached: true,
            stale: true,
            forex_open: forexOpen,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          prices: [],
          rate_limited: true,
          error: "upstream_failed",
          forex_open: forexOpen,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (rateLimited || freshPrices.length === 0) {
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
      // Serve cached if we have it, even when rate-limited
      if (cachedPrices.length > 0) {
        return new Response(
          JSON.stringify({
            prices: stampClosed(cachedPrices),
            cached: true,
            stale: true,
            forex_open: forexOpen,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          prices: [],
          rate_limited: true,
          retry_after_ms: RATE_LIMIT_BACKOFF_MS,
          forex_open: forexOpen,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Merge: fresh fetched pairs override cached; missing types reuse cache.
    const freshLabels = new Set(freshPrices.map((p) => p.pair));
    const merged: TickerPair[] = [
      ...freshPrices,
      ...cachedPrices.filter((p) => !freshLabels.has(p.pair)),
    ];

    const newValue = { prices: merged, fetched_at: new Date().toISOString() };
    const { error: upsertErr } = await supabase
      .from("site_settings")
      .upsert({ key: "ticker_cache", value: newValue }, { onConflict: "key" });
    if (upsertErr) console.error("Cache upsert error:", upsertErr);

    return new Response(
      JSON.stringify({
        prices: stampClosed(merged),
        cached: false,
        age_ms: 0,
        forex_open: forexOpen,
      }),
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
