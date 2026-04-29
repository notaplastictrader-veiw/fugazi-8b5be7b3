// Snapshots AI football predictions from football-prediction-api into the
// public.sports_predictions table so they become permanent picks that can
// later be settled. Idempotent — re-running the same day is a no-op for
// matches already snapshotted.
//
// Triggered by pg_cron (hourly) and can also be invoked manually.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PREDICTION_HOST = "football-prediction-api.p.rapidapi.com";

function toUtcIso(s: any): string {
  if (!s) return new Date().toISOString();
  const str = String(s).trim();
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(str)) {
    const d = new Date(str);
    return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(str + "T00:00:00Z").toISOString();
  }
  const m = str.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}(?::\d{2})?)/);
  if (m) return new Date(`${m[1]}T${m[2]}Z`).toISOString();
  const d = new Date(str);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}

function deriveConfidence(odds: any): number {
  if (!odds || typeof odds !== "object") return 65;
  const nums = Object.values(odds)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 1);
  if (!nums.length) return 65;
  const best = Math.min(...nums);
  const implied = Math.round((1 / best) * 100);
  return Math.max(50, Math.min(85, implied));
}

function formatOddsString(odds: any): string {
  if (!odds || typeof odds !== "object") return "";
  const order = ["1", "X", "2"];
  const parts: string[] = [];
  for (const k of order) {
    if (odds[k] !== undefined && odds[k] !== null && odds[k] !== "") {
      const n = Number(odds[k]);
      parts.push(`${k}: ${Number.isFinite(n) ? n.toFixed(2) : odds[k]}`);
    }
  }
  return parts.join(" · ");
}

async function fetchPredictionsForDate(apiKey: string, isoDate: string): Promise<any[]> {
  const url = `https://${PREDICTION_HOST}/api/v2/predictions?market=classic&iso_date=${isoDate}&federation=UEFA`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": PREDICTION_HOST,
      "x-rapidapi-key": apiKey,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    await res.text().catch(() => "");
    return [];
  }
  const json = await res.json().catch(() => null);
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json)) return json;
  return [];
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
      status: 200,
    });
  }

  // Snapshot today + tomorrow (UTC) so we capture picks before kickoff.
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const dates = [today.toISOString().slice(0, 10), tomorrow.toISOString().slice(0, 10)];

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const isoDate of dates) {
    const list = await fetchPredictionsForDate(apiKey, isoDate);
    for (const p of list.slice(0, 30)) {
      const home = String(p.home_team || p.homeTeam || "").trim();
      const away = String(p.away_team || p.awayTeam || "").trim();
      const prediction = String(p.prediction || p.predicted_outcome || "").trim();
      if (!home || !away || !prediction) {
        skipped++;
        continue;
      }
      const matchDate = toUtcIso(p.start_date || p.iso_date || isoDate);
      const competition = p.competition_name || p.competition || "Football";

      // De-dupe: skip if a row exists for the same teams + same calendar day
      const dayStart = matchDate.slice(0, 10) + "T00:00:00Z";
      const dayEnd = matchDate.slice(0, 10) + "T23:59:59Z";
      const { data: existing } = await admin
        .from("sports_predictions")
        .select("id")
        .eq("sport", "football")
        .eq("team_a", home)
        .eq("team_b", away)
        .gte("match_date", dayStart)
        .lte("match_date", dayEnd)
        .maybeSingle();

      if (existing?.id) {
        skipped++;
        continue;
      }

      const oddsStr = formatOddsString(p.odds);
      const note = oddsStr ? `Market: classic · Odds ${oddsStr}` : "Market: classic";

      const { error } = await admin.from("sports_predictions").insert({
        title: competition,
        sport: "football",
        team_a: home,
        team_b: away,
        match_date: matchDate,
        prediction,
        confidence: deriveConfidence(p.odds),
        analyst_note: note,
        result: "",
        is_correct: null,
        status: "published",
      });

      if (error) errors.push(`${home} vs ${away}: ${error.message}`);
      else inserted++;
    }
  }

  return new Response(
    JSON.stringify({ inserted, skipped, errors, dates }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
