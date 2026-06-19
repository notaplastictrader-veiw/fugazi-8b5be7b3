// AI-powered settler for sports_predictions.
// Uses Lovable AI Gateway (Gemini) to look up final scores for past matches
// by team names + date, then evaluates the saved prediction string against
// the score using the same logic as settle-sports-predictions.
//
// Conservative: only writes a result when the model is confident (uncertain=false)
// AND the prediction string can be parsed. Otherwise leaves the row pending.
//
// Trigger manually from /admin/sports ("AI Auto-Settle Past Picks" button) or
// via curl. Body: { limit?: number, sport?: string, only_id?: string }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const norm = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|sc|ac|afc|cfc|club|the)\b/g, "")
    .replace(/[^a-z0-9]+/g, "");

function evaluatePrediction(
  prediction: string,
  homeTeam: string,
  awayTeam: string,
  hs: number,
  as: number,
): boolean | null {
  const p = (prediction || "").toLowerCase().trim();
  if (!p) return null;
  const homeWin = hs > as, draw = hs === as, awayWin = hs < as;
  const total = hs + as;
  if (p === "1" || p === "home") return homeWin;
  if (p === "2" || p === "away") return awayWin;
  if (p === "x" || p === "draw") return draw;
  if (p.includes("1x") || (p.includes("home") && p.includes("draw"))) return homeWin || draw;
  if (p.includes("x2") || (p.includes("away") && p.includes("draw"))) return awayWin || draw;
  if (p.includes("12") || (p.includes("home") && p.includes("away"))) return homeWin || awayWin;
  if (p.includes("home") && p.includes("win")) return homeWin;
  if (p.includes("away") && p.includes("win")) return awayWin;
  if (norm(p).includes(norm(homeTeam)) && p.includes("win")) return homeWin;
  if (norm(p).includes(norm(awayTeam)) && p.includes("win")) return awayWin;
  const ou = p.match(/(over|under)\s*(\d+(?:\.\d+)?)/);
  if (ou) {
    const line = parseFloat(ou[2]);
    if (Number.isFinite(line)) return ou[1] === "over" ? total > line : total < line;
  }
  if (p.includes("btts") || (p.includes("both") && p.includes("score"))) {
    const yes = hs > 0 && as > 0;
    if (p.includes("no")) return !yes;
    return yes;
  }
  return null;
}

interface AILookup {
  home_score: number;
  away_score: number;
  uncertain: boolean;
  note?: string;
}

async function lookupScoreViaAI(
  apiKey: string,
  teamA: string,
  teamB: string,
  matchDateIso: string,
  sport: string,
): Promise<AILookup | null> {
  const dateStr = matchDateIso.slice(0, 10);
  const prompt = `Find the FINAL score for this ${sport} match:

Team A (home or away): ${teamA}
Team B (the other side): ${teamB}
Match date (UTC): ${dateStr}

Return strict JSON only — no prose, no markdown. Shape:
{
  "home_score": <number — goals/runs for Team A>,
  "away_score": <number — goals/runs for Team B>,
  "uncertain": <boolean — true if you are NOT confident this match happened on/around this date, OR if you cannot verify the final score, OR if the match was postponed/cancelled/not yet played>,
  "note": "<short reason if uncertain, else empty string>"
}

Rules:
- If you don't know the exact final score with high confidence, set uncertain=true and home_score=0, away_score=0.
- Never guess. Hallucination = fail.
- If the two team names refer to a real fixture you know completed on or within 2 days of ${dateStr}, return the score with uncertain=false.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a sports results lookup tool. You return strict JSON. You never guess scores you don't know — you set uncertain=true instead." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.log(`[ai-settle] gateway ${res.status}: ${txt.slice(0, 200)}`);
    return null;
  }
  const json = await res.json().catch(() => null);
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed.home_score !== "number" || typeof parsed.away_score !== "number") return null;
    return {
      home_score: parsed.home_score,
      away_score: parsed.away_score,
      uncertain: parsed.uncertain !== false,
      note: parsed.note || "",
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "missing_lovable_api_key" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: { limit?: number; sport?: string; only_id?: string } = {};
  try { body = await req.json(); } catch { /* allow empty */ }
  const limit = Math.max(1, Math.min(50, body.limit ?? 25));

  // Pending: published, no result yet, match in the past
  const cutoff = new Date(Date.now() - 2 * 3600_000).toISOString();
  let q = admin
    .from("sports_predictions")
    .select("id, team_a, team_b, match_date, prediction, sport")
    .eq("status", "published")
    .or("result.is.null,result.eq.")
    .lte("match_date", cutoff)
    .order("match_date", { ascending: false })
    .limit(limit);

  if (body.only_id) q = q.eq("id", body.only_id);
  if (body.sport) q = q.eq("sport", body.sport);

  const { data: pending, error: pendErr } = await q;
  if (pendErr) {
    return new Response(JSON.stringify({ error: pendErr.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ scanned: 0, settled: 0, uncertain: 0, unparseable: 0, message: "no pending picks" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let settled = 0, uncertain = 0, unparseable = 0, errored = 0;
  const details: any[] = [];

  for (const row of pending) {
    const ai = await lookupScoreViaAI(apiKey, row.team_a, row.team_b, String(row.match_date), row.sport || "football");
    if (!ai) { errored++; continue; }
    if (ai.uncertain) {
      uncertain++;
      details.push({ id: row.id, teams: `${row.team_a} vs ${row.team_b}`, status: "uncertain", note: ai.note });
      continue;
    }
    const correct = evaluatePrediction(row.prediction, row.team_a, row.team_b, ai.home_score, ai.away_score);
    if (correct === null) {
      unparseable++;
      details.push({ id: row.id, teams: `${row.team_a} vs ${row.team_b}`, score: `${ai.home_score}-${ai.away_score}`, status: "unparseable_market", prediction: row.prediction });
      continue;
    }
    const resultStr = `${ai.home_score}-${ai.away_score}`;
    const { error: updErr } = await admin
      .from("sports_predictions")
      .update({ result: resultStr, is_correct: correct, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (updErr) { errored++; continue; }
    settled++;
    details.push({ id: row.id, teams: `${row.team_a} vs ${row.team_b}`, score: resultStr, correct, status: "settled" });
  }

  return new Response(
    JSON.stringify({ scanned: pending.length, settled, uncertain, unparseable, errored, details }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
