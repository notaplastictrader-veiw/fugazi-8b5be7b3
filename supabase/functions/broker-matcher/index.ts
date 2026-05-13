import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MatcherInput {
  country?: string;
  capital?: string;
  style?: string;
  experience?: string;
  goal?: string;
}

// --- Phase 8: deterministic pre-scoring so AI gets ranked candidates ---
function scoreBroker(b: any, input: MatcherInput): { score: number; tags: string[] } {
  let s = Number(b.score || 0); // base 0-100
  const tags: string[] = [];

  // Capital → min_deposit weight
  const minDep = parseFloat(String(b.min_deposit || "0").replace(/[^0-9.]/g, "")) || 0;
  if (input.capital === "<500" && minDep <= 100) { s += 8; tags.push("low-deposit-friendly"); }
  if (input.capital === ">10000" && minDep >= 500) { s += 4; tags.push("premium-tier"); }

  // Style → spread / type weight
  const spread = parseFloat(String(b.avg_spread || "0").replace(/[^0-9.]/g, "")) || 0;
  if (input.style === "scalping") {
    if (spread > 0 && spread <= 0.4) { s += 12; tags.push("ultra-low-spread"); }
    if ((b.tags || []).some((t: string) => /ecn|raw/i.test(t))) { s += 6; tags.push("ecn"); }
  }
  if (input.style === "position" && spread <= 1.2) s += 4;

  // Goal weight
  if (input.goal === "regulation" && (b.regulation || []).length >= 2) { s += 10; tags.push("multi-regulated"); }
  if (input.goal === "low-spread" && spread > 0 && spread <= 0.6) { s += 10; tags.push("tight-spread"); }
  if (input.goal === "prop-friendly" && (b.tags || []).some((t: string) => /prop/i.test(t))) { s += 12; tags.push("prop-firm"); }
  if (input.goal === "fast-withdrawal" && /instant|24|same/i.test(String(b.withdrawal_time || ""))) { s += 8; tags.push("fast-withdrawal"); }

  // Penalties
  s -= Math.min(15, (b.complaints || 0) * 2);

  return { score: Math.max(0, Math.min(100, s)), tags };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const input: MatcherInput = await req.json();

    const { data: brokers } = await supabase
      .from("brokers")
      .select("id, name, slug, type, tags, regulation, score, avg_spread, leverage, min_deposit, stars, review_count, complaints, badge, withdrawal_time")
      .eq("status", "published")
      .order("score", { ascending: false })
      .limit(80);

    if (!brokers?.length) {
      return new Response(JSON.stringify({ error: "No brokers available" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pre-score and pick top 12 candidates by deterministic score
    const scored = brokers.map((b: any) => ({ b, ...scoreBroker(b, input) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    const compact = scored.map((x) => ({
      id: x.b.id, slug: x.b.slug, name: x.b.name, type: x.b.type,
      reg: x.b.regulation, score: x.b.score, spread: x.b.avg_spread,
      leverage: x.b.leverage, min_dep: x.b.min_deposit, stars: x.b.stars,
      complaints: x.b.complaints, badge: x.b.badge, withdrawal: x.b.withdrawal_time,
      preScore: x.score, matchTags: x.tags,
    }));

    const systemPrompt = `You are NAFT's AI Broker Matcher v2. Rank the BEST 3 brokers from the supplied PRE-SCORED candidate list.

Rules:
- Only pick from supplied list (use exact "id" and "slug").
- Respect preScore as a strong prior, but you MAY re-rank if the trader profile clearly favours another candidate.
- Each "reasoning" MUST cite at least 2 concrete data points (regulator name, spread, score, complaints, withdrawal time, or matchTag).
- Each "reasoning" ≤ 240 chars, conversational, second-person ("you'll get…").
- Ensure diversity: prefer mixing broker types/regulators across the 3 picks unless one clearly dominates.`;

    const userPrompt = `Trader profile:
- Country: ${input.country || "any"}
- Capital: ${input.capital || "any"}
- Style: ${input.style || "any"}
- Experience: ${input.experience || "any"}
- Goal: ${input.goal || "balanced"}

Pre-scored candidates:
${JSON.stringify(compact)}

Return the top 3 ranked matches.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_top_brokers",
            description: "Top 3 broker matches with reasoning.",
            parameters: {
              type: "object",
              properties: {
                matches: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      slug: { type: "string" },
                      name: { type: "string" },
                      match_score: { type: "number" },
                      reasoning: { type: "string" },
                    },
                    required: ["id", "slug", "name", "match_score", "reasoning"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["matches"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_top_brokers" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit, try again." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      console.error("AI gateway:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { matches: [] };

    const enriched = (args.matches || []).slice(0, 3).map((m: any) => {
      const full = brokers.find((b: any) => b.id === m.id);
      const pre = scored.find((x) => x.b.id === m.id);
      return { ...m, broker: full, why_tags: pre?.tags || [] };
    }).filter((m: any) => m.broker);

    return new Response(JSON.stringify({ matches: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("matcher:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
