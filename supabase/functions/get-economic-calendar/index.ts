// Public edge function — returns cached economic calendar from JBlanked News API
// + optional ML sentiment predictions per currency.
// Caches 12h by default in site_settings (free tier = 1 req/day).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CalendarEvent {
  id: string;
  name: string;
  date: string; // ISO UTC
  event_date: string; // YYYY-MM-DD (UTC)
  event_time: string | null; // HH:MM (UTC)
  impact: "high" | "medium" | "low";
  currency: string;
  category: string;
  description: string;
  actual: string;
  forecast: string;
  previous: string;
  // legacy aliases for existing UI
  title: string;
  actual_value: string;
  forecast_value: string;
  previous_value: string;
  ml_prediction?: "Bullish" | "Bearish" | "Neutral";
}

const CACHE_TTL_MS = 12 * 60 * 60_000; // 12h — flip to 10*60_000 once on paid plan
const MAJORS = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

function mapImpact(imp: any): "high" | "medium" | "low" {
  const s = String(imp ?? "").toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// JBlanked uses "2024.02.08 15:30:00" in EST (fixed UTC-5).
function parseJBlankedDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.replace(/\./g, "-").replace(" ", "T");
  const local = new Date(iso + "Z");
  if (isNaN(local.getTime())) return null;
  return new Date(local.getTime() + 5 * 60 * 60_000);
}

function normalize(raw: any[]): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  for (const r of raw) {
    const d = parseJBlankedDate(String(r.Date ?? ""));
    if (!d) continue;
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mi = String(d.getUTCMinutes()).padStart(2, "0");

    const event_date = `${yyyy}-${mm}-${dd}`;
    const event_time = hh === "00" && mi === "00" ? null : `${hh}:${mi}`;
    const name = String(r.Name ?? "").trim();
    const currency = String(r.Currency ?? "").trim().toUpperCase();
    if (!name) continue;

    const actual = r.Actual != null && r.Actual !== "" ? String(r.Actual) : "";
    const forecast =
      r.Forecast != null && r.Forecast !== "" ? String(r.Forecast) : "";
    const previous =
      r.Previous != null && r.Previous !== "" ? String(r.Previous) : "";
    const description = String(r.Category ?? r.Outcome ?? "").trim();

    out.push({
      id: `jb-${currency}-${event_date.replace(/-/g, "")}-${slugify(name)}`,
      name,
      title: name,
      date: d.toISOString(),
      event_date,
      event_time,
      impact: mapImpact(r.Impact),
      currency,
      category: "economic",
      description,
      actual,
      forecast,
      previous,
      actual_value: actual,
      forecast_value: forecast,
      previous_value: previous,
    });
  }
  return out;
}

async function fetchMl(
  apiKey: string,
): Promise<Record<string, "Bullish" | "Bearish" | "Neutral">> {
  const result: Record<string, "Bullish" | "Bearish" | "Neutral"> = {};
  await Promise.all(
    MAJORS.map(async (cur) => {
      try {
        const res = await fetch(
          `https://www.jblanked.com/news/api/machine_learning/${cur}/`,
          {
            headers: {
              Authorization: `Api-Key ${apiKey}`,
              Accept: "application/json",
            },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        // Try common shapes
        const pred =
          data?.prediction ??
          data?.Prediction ??
          data?.signal ??
          data?.direction ??
          data?.outlook;
        const s = String(pred ?? "").toLowerCase();
        if (s.includes("bull")) result[cur] = "Bullish";
        else if (s.includes("bear")) result[cur] = "Bearish";
        else if (s) result[cur] = "Neutral";
      } catch (_e) {
        // skip silently
      }
    }),
  );
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

    // 1. Read calendar cache + ml cache in parallel
    const [calRes, mlRes] = await Promise.all([
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "calendar_cache")
        .maybeSingle(),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "calendar_ml_cache")
        .maybeSingle(),
    ]);

    const cacheValue = calRes.data?.value as
      | { events?: CalendarEvent[]; fetched_at?: string }
      | null;
    const cachedEvents = cacheValue?.events;
    const fetchedAt = cacheValue?.fetched_at
      ? new Date(cacheValue.fetched_at).getTime()
      : 0;
    const age = Date.now() - fetchedAt;

    const mlValue = mlRes.data?.value as
      | {
          ml?: Record<string, "Bullish" | "Bearish" | "Neutral">;
          fetched_at?: string;
        }
      | null;
    const cachedMl = mlValue?.ml ?? {};

    const fresh = cachedEvents && cachedEvents.length > 0 && age < CACHE_TTL_MS;

    if (fresh) {
      const enriched = (cachedEvents as CalendarEvent[]).map((e) => ({
        ...e,
        ml_prediction: cachedMl[e.currency],
      }));
      return new Response(
        JSON.stringify({ events: enriched, cached: true, age_ms: age }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Fetch from JBlanked
    const apiKey = Deno.env.get("JBLANKED_API_KEY");
    if (!apiKey) throw new Error("JBLANKED_API_KEY not configured");

    let events: CalendarEvent[];
    try {
      const res = await fetch(
        "https://www.jblanked.com/news/api/forex-factory/calendar/week/",
        {
          headers: {
            Authorization: `Api-Key ${apiKey}`,
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) {
        throw new Error(`JBlanked ${res.status}: ${await res.text()}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Unexpected response shape");
      events = normalize(data);
      if (events.length === 0) throw new Error("No events returned");
    } catch (err) {
      console.error("JBlanked fetch failed:", err);
      const fallback = (cachedEvents ?? []).map((e) => ({
        ...e,
        ml_prediction: cachedMl[e.currency],
      }));
      return new Response(
        JSON.stringify({
          events: fallback,
          cached: false,
          error: "upstream_failed",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3. ML fan-out (best-effort)
    let ml = cachedMl;
    try {
      const fresh = await fetchMl(apiKey);
      if (Object.keys(fresh).length > 0) ml = fresh;
    } catch (e) {
      console.warn("ML fetch skipped:", e);
    }

    // 4. Persist caches
    const now = new Date().toISOString();
    await Promise.all([
      supabase.from("site_settings").upsert(
        { key: "calendar_cache", value: { events, fetched_at: now } },
        { onConflict: "key" },
      ),
      supabase.from("site_settings").upsert(
        { key: "calendar_ml_cache", value: { ml, fetched_at: now } },
        { onConflict: "key" },
      ),
    ]);

    const enriched = events.map((e) => ({
      ...e,
      ml_prediction: ml[e.currency],
    }));

    return new Response(
      JSON.stringify({ events: enriched, cached: false, age_ms: 0 }),
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
