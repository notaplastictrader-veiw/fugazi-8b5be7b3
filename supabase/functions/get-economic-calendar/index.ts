// Public edge function — returns cached economic calendar from JBlanked News API.
// Caches in site_settings.calendar_cache for 24h (free tier = 1 req/day).
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

const CACHE_TTL_MS = 24 * 60 * 60_000; // 24 hours (JBlanked free tier = 1 req/day)

function mapImpact(imp: any): "high" | "medium" | "low" {
  const s = String(imp ?? "").toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  return "low"; // "low" or "none"
}

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

// JBlanked Date format: "2024.02.08 15:30:00" in EST.
// EST = UTC-5 (no DST handling — JBlanked uses fixed EST per docs).
function parseJBlankedDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // "2024.02.08 15:30:00" -> "2024-02-08T15:30:00"
  const iso = dateStr.replace(/\./g, "-").replace(" ", "T");
  // Treat as EST (UTC-5) → add 5 hours to get UTC
  const local = new Date(iso + "Z"); // parse as UTC first
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
    const title = String(r.Name ?? "").trim();
    const currency = String(r.Currency ?? "").trim().toUpperCase();
    if (!title) continue;

    const event: CalendarEvent = {
      id: `jb-${currency}-${event_date}-${slugify(title)}`,
      title,
      description: String(r.Category ?? "").trim(),
      event_date,
      event_time,
      impact: mapImpact(r.Impact),
      currency,
      category: "economic",
      actual_value: r.Actual != null && r.Actual !== "" ? String(r.Actual) : "",
      forecast_value:
        r.Forecast != null && r.Forecast !== "" ? String(r.Forecast) : "",
      previous_value:
        r.Previous != null && r.Previous !== "" ? String(r.Previous) : "",
    };
    out.push(event);
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

    // 2. Fetch from JBlanked Forex Factory weekly calendar
    const apiKey = Deno.env.get("JBLANKED_API_KEY");
    if (!apiKey) {
      throw new Error("JBLANKED_API_KEY not configured");
    }

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
