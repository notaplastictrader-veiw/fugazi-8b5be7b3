// SofaSport (RapidAPI) sports schedule + results aggregator — BASIC tier friendly.
// Sequential calls + 250ms gap, drops /inverse to stay under rate limit. 15-min TTL.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPIDAPI_HOST = "sportapi7.p.rapidapi.com";
const BASE = `https://${RAPIDAPI_HOST}/api/v1/sport`;

const SPORTS = [
  { slug: "football", display: "Football" },
  { slug: "cricket", display: "Cricket" },
  { slug: "basketball", display: "Basketball" },
];

const CACHE_KEY = "sports_cache";
const LAST_GOOD_KEY = "sports_cache_last_good";
const CACHE_TTL_MS = 15 * 60_000; // 15 minutes — BASIC tier daily cap is small
const STALE_MAX_MS = 24 * 60 * 60_000;
const PER_SPORT_LIMIT = 25;
const REQUEST_GAP_MS = 300; // gap between upstream calls

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
  liveAvailable: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function mapStatus(statusType: string | undefined): string {
  switch ((statusType || "").toLowerCase()) {
    case "inprogress":
      return "Live";
    case "finished":
      return "Finished";
    case "postponed":
    case "canceled":
    case "cancelled":
      return "Postponed";
    default:
      return "Scheduled";
  }
}

function tsToIso(ts: number | undefined): string {
  if (!ts || !Number.isFinite(ts)) return new Date().toISOString();
  return new Date(ts * 1000).toISOString();
}

function tsToShortTime(ts: number | undefined): string {
  if (!ts || !Number.isFinite(ts)) return "";
  const d = new Date(ts * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

interface SofaEvent {
  id: number | string;
  tournament?: { name?: string; uniqueTournament?: { name?: string } };
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  homeScore?: { current?: number; display?: number };
  awayScore?: { current?: number; display?: number };
  startTimestamp?: number;
  status?: { type?: string; description?: string };
}

interface FetchResult {
  events: SofaEvent[];
  ok: boolean;
}

async function callSofa(apiKey: string, path: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${BASE}/${path}`, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });
    if (!res.ok) {
      // Swallow 403/429 silently — BASIC tier limitations
      if (res.status !== 403 && res.status !== 429) {
        console.warn(`[get-sports-data] ${path} → HTTP ${res.status}`);
      }
      await res.text().catch(() => "");
      return { events: [], ok: false };
    }
    const json = await res.json();
    return { events: Array.isArray(json?.events) ? json.events : [], ok: true };
  } catch (e) {
    console.warn(`[get-sports-data] fetch failed ${path}:`, e);
    return { events: [], ok: false };
  }
}

function mapEvent(ev: SofaEvent, sportDisplay: string): UpcomingMatch {
  const league =
    ev.tournament?.uniqueTournament?.name ||
    ev.tournament?.name ||
    sportDisplay;
  return {
    id: String(ev.id ?? `${ev.startTimestamp}-${ev.homeTeam?.name ?? "h"}-${ev.awayTeam?.name ?? "a"}`),
    sport: sportDisplay,
    league,
    homeTeam: ev.homeTeam?.name || "TBD",
    awayTeam: ev.awayTeam?.name || "TBD",
    date: tsToIso(ev.startTimestamp),
    time: tsToShortTime(ev.startTimestamp),
    status: mapStatus(ev.status?.type),
  };
}

async function buildPayload(apiKey: string): Promise<Payload> {
  const today = todayUtc();
  const upcoming: UpcomingMatch[] = [];
  const finished: ResultMatch[] = [];
  let liveAvailable = false;

  // Sequential to respect BASIC tier rate limit. 6 calls total (3 sports × 2 endpoints).
  for (const sp of SPORTS) {
    const live = await callSofa(apiKey, `${sp.slug}/events/live`);
    if (live.ok && live.events.length > 0) liveAvailable = true;
    for (const ev of live.events.slice(0, PER_SPORT_LIMIT)) {
      upcoming.push(mapEvent(ev, sp.display));
    }
    await sleep(REQUEST_GAP_MS);

    const today_ = await callSofa(apiKey, `${sp.slug}/scheduled-events/${today}`);
    for (const ev of today_.events.slice(0, PER_SPORT_LIMIT)) {
      const base = mapEvent(ev, sp.display);
      if (base.status === "Finished") {
        const hs = ev.homeScore?.current ?? ev.homeScore?.display;
        const as = ev.awayScore?.current ?? ev.awayScore?.display;
        finished.push({
          ...base,
          homeScore: typeof hs === "number" ? hs : null,
          awayScore: typeof as === "number" ? as : null,
        });
      } else {
        upcoming.push(base);
      }
    }
    await sleep(REQUEST_GAP_MS);
  }

  const dedupe = <T extends { id: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  };

  return {
    upcoming: dedupe(upcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    results: dedupe(finished).sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    fetchedAt: Date.now(),
    liveAvailable,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("RAPIDAPI_SPORTS_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        upcoming: [],
        results: [],
        fetchedAt: Date.now(),
        stale: true,
        liveAvailable: false,
        error: "missing_api_key",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
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

    const payload = await buildPayload(apiKey);
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

    throw new Error("upstream_empty");
  } catch (err) {
    console.warn("[get-sports-data] using last-good:", err);
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
        liveAvailable: false,
        error: "feed_unavailable",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
