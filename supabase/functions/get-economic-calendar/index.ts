// Public edge function — returns cached economic calendar from TradingEconomics guest feed.
// Caches in site_settings.calendar_cache (refreshed at most every 15 min).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string; // YYYY-MM-DD
  event_time: string | null; // HH:MM
  impact: "high" | "medium" | "low";
  currency: string;
  category: string;
  actual_value: string;
  forecast_value: string;
  previous_value: string;
}

const CACHE_TTL_MS = 15 * 60_000; // 15 minutes

function mapImportance(imp: any): "high" | "medium" | "low" {
  const n = Number(imp);
  if (n >= 3) return "high";
  if (n === 2) return "medium";
  return "low";
}

function normalize(raw: any[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const r of raw) {
    const dateStr = String(r.Date ?? "").trim();
    if (!dateStr) continue;
    // Date format: "2026-04-23T13:30:00" (UTC)
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) continue;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mi = String(d.getUTCMinutes()).padStart(2, "0");

    const event: CalendarEvent = {
      id: `te-${String(r.CalendarId ?? `${dateStr}-${r.Event}`)}`,
      title: String(r.Event ?? "").trim(),
      description: [r.Country, r.Category].filter(Boolean).join(" • "),
      event_date: `${yyyy}-${mm}-${dd}`,
      event_time: hh === "00" && mi === "00" ? null : `${hh}:${mi}`,
      impact: mapImportance(r.Importance),
      currency: String(r.Currency ?? "").trim(),
      category: "economic",
      actual_value: r.Actual != null ? String(r.Actual) : "",
      forecast_value: r.Forecast != null ? String(r.Forecast) : "",
      previous_value: r.Previous != null ? String(r.Previous) : "",
    };
    if (event.title) out.push(event);
  }
  return out;
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
      .select("value")
      .eq("key", "calendar_cache")
      .maybeSingle();

    const cacheValue = cacheRow?.value as
      | { events?: CalendarEvent[]; fetched_at?: string }
      | null;
    const cachedEvents = cacheValue?.events;
    const fetchedAt = cacheValue?.fetched_at
      ? new Date(cacheValue.fetched_at).getTime()
      : 0;
    const age = Date.now() - fetchedAt;

    if (cachedEvents && cachedEvents.length > 0 && age < CACHE_TTL_MS) {
      return new Response(
        JSON.stringify({ events: cachedEvents, cached: true, age_ms: age }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Fetch from TradingEconomics guest endpoint (next ~30 days)
    const today = new Date();
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 30);
    const fmt = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const url =
      `https://api.tradingeconomics.com/calendar/country/all/${fmt(today)}/${fmt(end)}?c=guest:guest&f=json`;

    let events: CalendarEvent[];
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TradingEconomics ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response shape");
      events = normalize(data);
      if (events.length === 0) throw new Error("No events returned");
    } catch (err) {
      console.error("TradingEconomics fetch failed:", err);
      return new Response(
        JSON.stringify({
          events: cachedEvents ?? [],
          cached: false,
          error: "upstream_failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. Write cache
    const newValue = { events, fetched_at: new Date().toISOString() };
    const { error: upsertErr } = await supabase
      .from("site_settings")
      .upsert({ key: "calendar_cache", value: newValue }, { onConflict: "key" });
    if (upsertErr) console.error("Cache upsert error:", upsertErr);

    return new Response(
      JSON.stringify({ events, cached: false, age_ms: 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("get-economic-calendar error:", err);
    return new Response(
      JSON.stringify({ events: [], cached: false, error: String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
});
