// SofaSport (RapidAPI) sports schedule + results aggregator
// Replaces TheSportsDB which only returned demo data on the free key.
// 5-min TTL cache + 24h stale-while-error fallback in site_settings.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAPIDAPI_HOST = "sportapi7.p.rapidapi.com";
const BASE = `https://${RAPIDAPI_HOST}/api/v1/sport`;

// SofaSport sport slugs we want to surface on /sports
const SPORTS = [
  { slug: "football", display: "Football" },
  { slug: "cricket", display: "Cricket" },
  { slug: "basketball", display: "Basketball" },
];

const CACHE_KEY = "sports_cache";
const LAST_GOOD_KEY = "sports_cache_last_good";
const CACHE_TTL_MS = 5 * 60_000; // 5 minutes
const STALE_MAX_MS = 24 * 60 * 60_000; // 24 hours
const PER_SPORT_LIMIT = 20; // cap per sport per bucket to keep payload sane

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
    case "notstarted":
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
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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
  notSubscribed: boolean;
}

async function callSofa(
  apiKey: string,
  path: string,
): Promise<FetchResult> {
  const url = `${BASE}/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const notSub = res.status === 403 || /not subscribed/i.test(txt);
      console.warn(`[get-sports-data] ${path} → HTTP ${res.status}${notSub ? " (not subscribed)" : ""}`);
      return { events: [], ok: false, notSubscribed: notSub };
    }
    const json = await res.json();
    const events: SofaEvent[] = Array.isArray(json?.events) ? json.events : [];
    return { events, ok: true, notSubscribed: false };
  } catch (e) {
    console.warn(`[get-sports-data] fetch failed ${path}:`, e);
    return { events: [], ok: false, notSubscribed: false };
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

  // For each sport: live + scheduled today + scheduled today/inverse (yesterday's results)
  const tasks = SPORTS.flatMap((sp) => [
    callSofa(apiKey, `${sp.slug}/events/live`).then((r) => ({ sp, kind: "live" as const, r })),
    callSofa(apiKey, `${sp.slug}/scheduled-events/${today}`).then((r) => ({ sp, kind: "today" as const, r })),
    callSofa(apiKey, `${sp.slug}/scheduled-events/${today}/inverse`).then((r) => ({ sp, kind: "inverse" as const, r })),
  ]);

  const results = await Promise.all(tasks);

  let liveAvailable = false;
  const upcoming: UpcomingMatch[] = [];
  const finished: ResultMatch[] = [];

  for (const { sp, kind, r } of results) {
    if (kind === "live" && r.ok && r.events.length > 0) liveAvailable = true;

    const slice = r.events.slice(0, PER_SPORT_LIMIT);
    for (const ev of slice) {
      const base = mapEvent(ev, sp.display);
      const isFinished = base.status === "Finished";
      if (isFinished) {
        const hs = ev.homeScore?.current ?? ev.homeScore?.display;
        const as = ev.awayScore?.current ?? ev.awayScore?.display;
        finished.push({
          ...base,
          homeScore: typeof hs === "number" ? hs : null,
          awayScore: typeof as === "number" ? as : null,
        });
      } else {
        // Live + Scheduled both go into "upcoming" so users see them in one stream
        upcoming.push(base);
      }
    }
  }

  // Dedupe by id (live + today often overlap)
  const dedupe = <T extends { id: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  };

  const upcomingDeduped = dedupe(upcoming).sort(
    (a, b) => +new Date(a.date) - +new Date(b.date),
  );
  const finishedDeduped = dedupe(finished).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date),
  );

  return {
    upcoming: upcomingDeduped,
    results: finishedDeduped,
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
    console.error("[get-sports-data] RAPIDAPI_SPORTS_KEY not configured");
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
    // 1) TTL cache
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

    // 2) Fresh fetch
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
    console.warn("[get-sports-data] live fetch failed, using last-good:", err);
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
