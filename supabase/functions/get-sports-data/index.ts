// TheSportsDB sports schedule + results aggregator
// Free public API key "1" — legal, documented for free use
// 5-min cache in site_settings.sports_cache, stale-while-error fallback (24h)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_KEY = "1"; // TheSportsDB public free key
const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

const LEAGUES = [
  { id: "4328", sport: "Football", league: "Premier League" },
  { id: "4424", sport: "Cricket", league: "IPL" },
  { id: "4387", sport: "Basketball", league: "NBA" },
];

const CACHE_KEY = "sports_cache";
const LAST_GOOD_KEY = "sports_cache_last_good";
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const STALE_MAX_MS = 24 * 60 * 60_000; // 24 hours

interface UpcomingMatch {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  status: string;
}

interface ResultMatch extends UpcomingMatch {
  homeScore: number | null;
  awayScore: number | null;
}

interface Payload {
  upcoming: UpcomingMatch[];
  results: ResultMatch[];
  fetchedAt: number;
}

function mapStatus(strStatus: string | null | undefined): string {
  if (!strStatus) return "Scheduled";
  const s = strStatus.toLowerCase();
  if (s.includes("finish") || s === "ft" || s === "aet") return "Finished";
  if (s.includes("not started") || s === "ns" || s === "" || s === "scheduled") return "Scheduled";
  if (s.includes("postpone") || s.includes("cancel")) return "Postponed";
  // anything else (1H, 2H, HT, Live, Q1, Q2, etc.) → live
  return "Live";
}

function buildIso(dateEvent: string | null, strTime: string | null): string {
  if (!dateEvent) return new Date().toISOString();
  const time = strTime && /^\d{2}:\d{2}/.test(strTime) ? strTime.slice(0, 8) : "00:00:00";
  return `${dateEvent}T${time.length === 5 ? time + ":00" : time}Z`;
}

function shortTime(strTime: string | null): string {
  if (!strTime || !/^\d{2}:\d{2}/.test(strTime)) return "";
  return strTime.slice(0, 5);
}

async function fetchLeague(id: string, type: "next" | "past"): Promise<any[]> {
  const endpoint = type === "next" ? "eventsnextleague.php" : "eventspastleague.php";
  const url = `${BASE}/${endpoint}?id=${id}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "NAFT/1.0" } });
    if (!res.ok) {
      console.warn(`[get-sports-data] ${endpoint}?id=${id} → HTTP ${res.status}`);
      return [];
    }
    const json = await res.json();
    return Array.isArray(json?.events) ? json.events : [];
  } catch (e) {
    console.warn(`[get-sports-data] fetch failed for ${endpoint}?id=${id}:`, e);
    return [];
  }
}

async function buildPayload(): Promise<Payload> {
  // Fetch all 6 endpoints in parallel
  const tasks = LEAGUES.flatMap((lg) => [
    fetchLeague(lg.id, "next").then((events) => ({ lg, type: "next" as const, events })),
    fetchLeague(lg.id, "past").then((events) => ({ lg, type: "past" as const, events })),
  ]);
  const buckets = await Promise.all(tasks);

  const upcoming: UpcomingMatch[] = [];
  const results: ResultMatch[] = [];

  for (const { lg, type, events } of buckets) {
    for (const ev of events.slice(0, 12)) {
      const status = mapStatus(ev.strStatus);
      const base: UpcomingMatch = {
        id: String(ev.idEvent),
        sport: lg.sport,
        league: lg.league,
        homeTeam: ev.strHomeTeam || "TBD",
        awayTeam: ev.strAwayTeam || "TBD",
        date: buildIso(ev.dateEvent, ev.strTime),
        time: shortTime(ev.strTime),
        status,
      };
      if (type === "next") {
        upcoming.push(base);
      } else {
        const hs = ev.intHomeScore !== null && ev.intHomeScore !== undefined && ev.intHomeScore !== ""
          ? Number(ev.intHomeScore) : null;
        const as = ev.intAwayScore !== null && ev.intAwayScore !== undefined && ev.intAwayScore !== ""
          ? Number(ev.intAwayScore) : null;
        results.push({
          ...base,
          status: status === "Scheduled" ? "Finished" : status,
          homeScore: Number.isFinite(hs as number) ? (hs as number) : null,
          awayScore: Number.isFinite(as as number) ? (as as number) : null,
        });
      }
    }
  }

  upcoming.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  results.sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return { upcoming, results, fetchedAt: Date.now() };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1) Try TTL cache
    const { data: cached } = await admin
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", CACHE_KEY)
      .maybeSingle();

    if (cached?.value && cached.updated_at) {
      const age = Date.now() - new Date(cached.updated_at).getTime();
      if (age < CACHE_TTL_MS) {
        return new Response(
          JSON.stringify({ ...(cached.value as Payload), stale: false, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 2) Fetch fresh
    const payload = await buildPayload();
    const hasData = payload.upcoming.length > 0 || payload.results.length > 0;

    if (hasData) {
      await admin.from("site_settings").upsert(
        { key: CACHE_KEY, value: payload as any, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      await admin.from("site_settings").upsert(
        { key: LAST_GOOD_KEY, value: payload as any, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
      return new Response(
        JSON.stringify({ ...payload, stale: false, cached: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 3) Upstream returned nothing → fall back to last-good
    throw new Error("upstream_empty");
  } catch (err) {
    console.warn("[get-sports-data] live fetch failed, trying last-good:", err);
    const { data: lastGood } = await admin
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", LAST_GOOD_KEY)
      .maybeSingle();

    if (lastGood?.value && lastGood.updated_at) {
      const age = Date.now() - new Date(lastGood.updated_at).getTime();
      if (age < STALE_MAX_MS) {
        return new Response(
          JSON.stringify({ ...(lastGood.value as Payload), stale: true, cached: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        upcoming: [],
        results: [],
        fetchedAt: Date.now(),
        stale: true,
        error: "feed_unavailable",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
