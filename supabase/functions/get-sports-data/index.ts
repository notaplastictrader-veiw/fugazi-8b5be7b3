// Sports aggregator using three RapidAPI feeds:
//   - Cricbuzz (cricket: live, upcoming, recent)
//   - free-api-live-football-data (football popular leagues)
//   - football-prediction-api (AI predictions for today)
// Sequential calls + 300ms gap. 15-minute cache + last-good fallback.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CRICBUZZ_HOST = "cricbuzz-cricket.p.rapidapi.com";
const FOOTBALL_HOST = "free-api-live-football-data.p.rapidapi.com";
const PREDICTION_HOST = "football-prediction-api.p.rapidapi.com";

const CACHE_KEY = "sports_cache";
const LAST_GOOD_KEY = "sports_cache_last_good";
const CACHE_TTL_MS = 15 * 60_000;
const STALE_MAX_MS = 24 * 60 * 60_000;
const REQUEST_GAP_MS = 300;
const PER_LIST_LIMIT = 25;

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

interface AIPrediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  federation: string;
  date: string;
  prediction: string;
  market: string;
  odds: string | null;
}

interface Payload {
  upcoming: UpcomingMatch[];
  results: ResultMatch[];
  aiPredictions: AIPrediction[];
  fetchedAt: number;
  liveAvailable: boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const todayIso = () => new Date().toISOString().slice(0, 10);

function tsToTime(ts: number): string {
  if (!Number.isFinite(ts)) return "";
  const d = new Date(ts);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

async function rapidGet(host: string, path: string, apiKey: string): Promise<any | null> {
  try {
    const res = await fetch(`https://${host}${path}`, {
      headers: {
        "x-rapidapi-host": host,
        "x-rapidapi-key": apiKey,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      if (res.status !== 403 && res.status !== 429) {
        console.warn(`[get-sports-data] ${host}${path} → HTTP ${res.status}`);
      }
      await res.text().catch(() => "");
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn(`[get-sports-data] fetch failed ${host}${path}:`, e);
    return null;
  }
}

// ============= CRICBUZZ =============
function parseCricbuzz(json: any, defaultStatus: "Live" | "Scheduled" | "Finished"): {
  upcoming: UpcomingMatch[];
  results: ResultMatch[];
} {
  const upcoming: UpcomingMatch[] = [];
  const results: ResultMatch[] = [];
  if (!json || !Array.isArray(json.typeMatches)) return { upcoming, results };

  for (const tm of json.typeMatches) {
    const seriesMatches = Array.isArray(tm.seriesMatches) ? tm.seriesMatches : [];
    for (const sm of seriesMatches) {
      const wrapper = sm.seriesAdWrapper;
      if (!wrapper) continue;
      const matches = Array.isArray(wrapper.matches) ? wrapper.matches : [];
      const seriesName = wrapper.seriesName || "Cricket";

      for (const m of matches) {
        const info = m.matchInfo;
        if (!info) continue;
        const id = String(info.matchId ?? `${info.team1?.teamName}-${info.team2?.teamName}-${info.startDate}`);
        const startMs = Number(info.startDate);
        const dateIso = Number.isFinite(startMs) ? new Date(startMs).toISOString() : new Date().toISOString();
        const home = info.team1?.teamName || info.team1?.teamSName || "TBD";
        const away = info.team2?.teamName || info.team2?.teamSName || "TBD";
        const stateStr = (info.state || "").toLowerCase();

        const base: UpcomingMatch = {
          id,
          sport: "Cricket",
          league: seriesName,
          homeTeam: home,
          awayTeam: away,
          date: dateIso,
          time: tsToTime(startMs),
          status:
            stateStr.includes("complete") || stateStr === "result"
              ? "Finished"
              : stateStr.includes("progress") || stateStr === "in progress" || stateStr === "live"
                ? "Live"
                : defaultStatus,
        };

        if (base.status === "Finished") {
          // Score parsing from matchScore.team1Score.inngs1.runs / team2Score
          const ms = m.matchScore || {};
          const t1 = ms.team1Score?.inngs1?.runs ?? ms.team1Score?.inngs2?.runs ?? null;
          const t2 = ms.team2Score?.inngs1?.runs ?? ms.team2Score?.inngs2?.runs ?? null;
          results.push({
            ...base,
            homeScore: typeof t1 === "number" ? t1 : null,
            awayScore: typeof t2 === "number" ? t2 : null,
          });
        } else {
          upcoming.push(base);
        }
      }
    }
  }
  return { upcoming, results };
}

// ============= FOOTBALL (free-api-live-football-data) =============
// /football-popular-leagues returns popular leagues; /football-current-matches-leagueId or
// /football-matches-by-date is what's typically available. We try a few common paths.
async function fetchFootballMatches(apiKey: string): Promise<{
  upcoming: UpcomingMatch[];
  results: ResultMatch[];
}> {
  const upcoming: UpcomingMatch[] = [];
  const results: ResultMatch[] = [];

  // Primary attempt: matches by date (today). This API commonly exposes /football-get-matches-by-date.
  const today = todayIso();
  const candidates = [
    `/football-get-matches-by-date/?date=${today}`,
    `/football-matches-by-date?date=${today}`,
    `/football-current-matches`,
    `/football-popular-leagues`,
  ];

  for (const path of candidates) {
    const json = await rapidGet(FOOTBALL_HOST, path, apiKey);
    await sleep(REQUEST_GAP_MS);
    if (!json) continue;

    // Try common shapes: { response: { matches: [...] } } or { response: [...] } or { matches: [...] }
    const list: any[] =
      (Array.isArray(json?.response?.matches) && json.response.matches) ||
      (Array.isArray(json?.response) && json.response) ||
      (Array.isArray(json?.matches) && json.matches) ||
      (Array.isArray(json?.data) && json.data) ||
      [];

    if (list.length === 0) continue;

    for (const m of list.slice(0, PER_LIST_LIMIT)) {
      const id = String(m.id ?? m.matchId ?? `${m.home?.name}-${m.away?.name}-${m.time ?? m.date}`);
      const home =
        m.home?.name || m.homeTeam?.name || m.teams?.home?.name || m.home_name || "TBD";
      const away =
        m.away?.name || m.awayTeam?.name || m.teams?.away?.name || m.away_name || "TBD";
      const league =
        m.league?.name || m.competition?.name || m.tournament || m.leagueName || "Football";
      const startTs =
        Number(m.time) || Number(m.timestamp) || Date.parse(m.date || m.kickoff || m.utcDate || "") || NaN;
      const dateIso = Number.isFinite(startTs)
        ? new Date(startTs > 1e12 ? startTs : startTs * 1000).toISOString()
        : new Date().toISOString();

      const statusRaw = (m.status?.short || m.status || m.state || "").toString().toLowerCase();
      const isFinished = ["ft", "aet", "pen", "finished", "fulltime"].some((k) => statusRaw.includes(k));
      const isLive = ["live", "1h", "2h", "ht", "inplay", "in_play"].some((k) => statusRaw.includes(k));

      const base: UpcomingMatch = {
        id,
        sport: "Football",
        league,
        homeTeam: home,
        awayTeam: away,
        date: dateIso,
        time: tsToTime(new Date(dateIso).getTime()),
        status: isLive ? "Live" : isFinished ? "Finished" : "Scheduled",
      };

      if (isFinished) {
        const hs = m.home?.score ?? m.score?.home ?? m.homeScore ?? m.goals?.home ?? null;
        const as = m.away?.score ?? m.score?.away ?? m.awayScore ?? m.goals?.away ?? null;
        results.push({
          ...base,
          homeScore: typeof hs === "number" ? hs : Number.isFinite(Number(hs)) ? Number(hs) : null,
          awayScore: typeof as === "number" ? as : Number.isFinite(Number(as)) ? Number(as) : null,
        });
      } else {
        upcoming.push(base);
      }
    }

    // First successful endpoint wins
    if (upcoming.length > 0 || results.length > 0) break;
  }

  return { upcoming, results };
}

// ============= AI PREDICTIONS =============
function formatOdds(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "string" || typeof raw === "number") {
    const s = String(raw).trim();
    return s.length ? s : null;
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const order = ["1", "X", "2", "1X", "12", "X2", "home", "draw", "away"];
    const seen = new Set<string>();
    const parts: string[] = [];
    const push = (k: string) => {
      const v = obj[k];
      if (v === undefined || v === null || v === "") return;
      const num = Number(v);
      const formatted = Number.isFinite(num) ? num.toFixed(2) : String(v);
      parts.push(`${k}: ${formatted}`);
      seen.add(k);
    };
    for (const k of order) if (k in obj) push(k);
    for (const k of Object.keys(obj)) if (!seen.has(k)) push(k);
    return parts.length ? parts.join(" · ") : null;
  }
  return null;
}

async function fetchPredictions(apiKey: string): Promise<AIPrediction[]> {
  const today = todayIso();
  const url = `/api/v2/predictions?market=classic&iso_date=${today}&federation=UEFA`;
  const json = await rapidGet(PREDICTION_HOST, url, apiKey);
  if (!json) return [];

  const list: any[] =
    (Array.isArray(json?.data) && json.data) ||
    (Array.isArray(json) && json) ||
    [];

  const out: AIPrediction[] = [];
  for (const p of list.slice(0, 30)) {
    out.push({
      id: String(p.id ?? `${p.home_team}-${p.away_team}-${p.start_date}`),
      homeTeam: p.home_team || p.homeTeam || "TBD",
      awayTeam: p.away_team || p.awayTeam || "TBD",
      competition: p.competition_name || p.competition || "—",
      federation: p.federation || "UEFA",
      date: p.start_date || p.iso_date || new Date().toISOString(),
      prediction: p.prediction || p.predicted_outcome || "—",
      market: p.market || "classic",
      odds: formatOdds(p.odds),
    });
  }
  return out;
}

// ============= ORCHESTRATOR =============
async function buildPayload(apiKey: string): Promise<Payload> {
  const upcoming: UpcomingMatch[] = [];
  const results: ResultMatch[] = [];
  let liveAvailable = false;

  // Cricket — 3 sequential calls
  const cricLive = await rapidGet(CRICBUZZ_HOST, "/matches/v1/live", apiKey);
  await sleep(REQUEST_GAP_MS);
  const { upcoming: cu1, results: _cr1 } = parseCricbuzz(cricLive, "Live");
  if (cu1.length > 0) liveAvailable = true;
  upcoming.push(...cu1);

  const cricUpcoming = await rapidGet(CRICBUZZ_HOST, "/matches/v1/upcoming", apiKey);
  await sleep(REQUEST_GAP_MS);
  const { upcoming: cu2 } = parseCricbuzz(cricUpcoming, "Scheduled");
  upcoming.push(...cu2);

  const cricRecent = await rapidGet(CRICBUZZ_HOST, "/matches/v1/recent", apiKey);
  await sleep(REQUEST_GAP_MS);
  const { results: cr2 } = parseCricbuzz(cricRecent, "Finished");
  results.push(...cr2);

  // Football
  const footy = await fetchFootballMatches(apiKey);
  upcoming.push(...footy.upcoming);
  results.push(...footy.results);
  if (footy.upcoming.some((m) => m.status === "Live")) liveAvailable = true;
  await sleep(REQUEST_GAP_MS);

  // AI Predictions
  const aiPredictions = await fetchPredictions(apiKey);

  const dedupe = <T extends { id: string }>(arr: T[]) => {
    const seen = new Set<string>();
    return arr.filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  };

  return {
    upcoming: dedupe(upcoming).sort((a, b) => +new Date(a.date) - +new Date(b.date)).slice(0, 60),
    results: dedupe(results).sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 60),
    aiPredictions,
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
        aiPredictions: [],
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
    const hasData =
      payload.upcoming.length > 0 || payload.results.length > 0 || payload.aiPredictions.length > 0;

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
        aiPredictions: [],
        fetchedAt: Date.now(),
        stale: true,
        liveAvailable: false,
        error: "feed_unavailable",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
