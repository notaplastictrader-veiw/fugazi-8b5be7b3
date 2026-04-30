// Auto-settles published sports_predictions whose match_date is in the past
// and that have no result yet. Looks up the final score from
// free-api-live-football-data (RapidAPI), parses the prediction string against
// the score, and writes back result + is_correct.
//
// Conservative: only settles when we have a confident match in the upstream
// feed AND can interpret the prediction. Otherwise leaves the row pending.
//
// Triggered by pg_cron (every 30 min) and can also be invoked manually.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FOOTBALL_HOST = "free-api-live-football-data.p.rapidapi.com";

interface FinishedMatch {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  dateIso: string;
}

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|sc|ac|afc|cfc|club|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");

function teamsMatch(a1: string, a2: string, b1: string, b2: string): boolean {
  const na1 = norm(a1), na2 = norm(a2), nb1 = norm(b1), nb2 = norm(b2);
  if (!na1 || !na2 || !nb1 || !nb2) return false;
  const exact = (na1 === nb1 && na2 === nb2);
  const partial =
    (na1.includes(nb1) || nb1.includes(na1)) &&
    (na2.includes(nb2) || nb2.includes(na2));
  return exact || partial;
}

async function fetchFinishedMatches(apiKey: string, isoDate: string): Promise<FinishedMatch[]> {
  const candidates = [
    `/football-get-matches-by-date/?date=${isoDate}`,
    `/football-matches-by-date?date=${isoDate}`,
    `/football-get-all-matches-by-date?date=${isoDate}`,
  ];
  for (const path of candidates) {
    const res = await fetch(`https://${FOOTBALL_HOST}${path}`, {
      headers: {
        "x-rapidapi-host": FOOTBALL_HOST,
        "x-rapidapi-key": apiKey,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      await res.text().catch(() => "");
      continue;
    }
    const json = await res.json().catch(() => null);
    const list: any[] =
      (Array.isArray(json?.response?.matches) && json.response.matches) ||
      (Array.isArray(json?.response) && json.response) ||
      (Array.isArray(json?.matches) && json.matches) ||
      (Array.isArray(json?.data) && json.data) ||
      [];
    if (!list.length) continue;

    const out: FinishedMatch[] = [];
    for (const m of list) {
      const statusRaw = (m.status?.short || m.status || m.state || "").toString().toLowerCase();
      const isFinished = ["ft", "aet", "pen", "finished", "fulltime"].some((k) => statusRaw.includes(k));
      if (!isFinished) continue;

      const home = m.home?.name || m.homeTeam?.name || m.teams?.home?.name || m.home_name || "";
      const away = m.away?.name || m.awayTeam?.name || m.teams?.away?.name || m.away_name || "";
      const hs = Number(m.home?.score ?? m.score?.home ?? m.homeScore ?? m.goals?.home);
      const as = Number(m.away?.score ?? m.score?.away ?? m.awayScore ?? m.goals?.away);
      if (!home || !away || !Number.isFinite(hs) || !Number.isFinite(as)) continue;

      const startTs =
        Number(m.time) || Number(m.timestamp) || Date.parse(m.date || m.kickoff || m.utcDate || "") || NaN;
      const dateIso = Number.isFinite(startTs)
        ? new Date(startTs > 1e12 ? startTs : startTs * 1000).toISOString()
        : isoDate;

      out.push({ home, away, homeScore: hs, awayScore: as, dateIso });
    }
    if (out.length) return out;
  }
  return [];
}

function evaluatePrediction(
  prediction: string,
  homeTeam: string,
  awayTeam: string,
  hs: number,
  as: number,
): boolean | null {
  const p = (prediction || "").toLowerCase().trim();
  if (!p) return null;

  const homeWin = hs > as;
  const draw = hs === as;
  const awayWin = hs < as;
  const total = hs + as;

  // 1X2 markets — short codes
  if (p === "1" || p === "home") return homeWin;
  if (p === "2" || p === "away") return awayWin;
  if (p === "x" || p === "draw") return draw;

  // Double chance
  if (p.includes("1x") || (p.includes("home") && p.includes("draw"))) return homeWin || draw;
  if (p.includes("x2") || (p.includes("away") && p.includes("draw"))) return awayWin || draw;
  if (p.includes("12") || (p.includes("home") && p.includes("away"))) return homeWin || awayWin;

  // Team-name based ("home win", "<team> to win")
  if (p.includes("home") && p.includes("win")) return homeWin;
  if (p.includes("away") && p.includes("win")) return awayWin;
  if (norm(p).includes(norm(homeTeam)) && p.includes("win")) return homeWin;
  if (norm(p).includes(norm(awayTeam)) && p.includes("win")) return awayWin;

  // Over/Under goals
  const ou = p.match(/(over|under)\s*(\d+(?:\.\d+)?)/);
  if (ou) {
    const line = parseFloat(ou[2]);
    if (Number.isFinite(line)) {
      return ou[1] === "over" ? total > line : total < line;
    }
  }

  // BTTS
  if (p.includes("btts") || (p.includes("both") && p.includes("score"))) {
    const yes = hs > 0 && as > 0;
    if (p.includes("no")) return !yes;
    return yes;
  }

  return null; // unknown market — leave pending
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("RAPIDAPI_SPORTS_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "missing_api_key" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Pull pending football picks from the last 7 days where match has likely ended (>= 2h ago)
  const cutoff = new Date(Date.now() - 2 * 3600_000).toISOString();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const { data: pending, error: pendErr } = await admin
    .from("sports_predictions")
    .select("id, team_a, team_b, match_date, prediction, sport")
    .eq("sport", "football")
    .eq("status", "published")
    .or("result.is.null,result.eq.")
    .lte("match_date", cutoff)
    .gte("match_date", since)
    .order("match_date", { ascending: false });

  if (pendErr) {
    return new Response(JSON.stringify({ error: pendErr.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ settled: 0, scanned: 0, message: "no pending picks" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Group by date so we hit the API once per day
  const byDate = new Map<string, typeof pending>();
  for (const row of pending) {
    const d = String(row.match_date).slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, [] as any);
    byDate.get(d)!.push(row);
  }

  let settled = 0;
  let unmatched = 0;
  let unparseable = 0;
  const details: any[] = [];

  for (const [date, rows] of byDate) {
    const finished = await fetchFinishedMatches(apiKey, date);
    if (!finished.length) {
      unmatched += rows.length;
      continue;
    }
    for (const row of rows) {
      const match = finished.find((f) => teamsMatch(row.team_a, row.team_b, f.home, f.away));
      if (!match) {
        unmatched++;
        continue;
      }
      const correct = evaluatePrediction(row.prediction, row.team_a, row.team_b, match.homeScore, match.awayScore);
      if (correct === null) {
        unparseable++;
        continue;
      }
      const resultStr = `${match.homeScore}-${match.awayScore}`;
      const { error: updErr } = await admin
        .from("sports_predictions")
        .update({ result: resultStr, is_correct: correct, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      if (!updErr) {
        settled++;
        details.push({ id: row.id, teams: `${row.team_a} vs ${row.team_b}`, score: resultStr, correct });
      }
    }
  }

  return new Response(
    JSON.stringify({ scanned: pending.length, settled, unmatched, unparseable, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
