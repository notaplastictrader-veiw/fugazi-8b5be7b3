import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MatcherInput {
  country?: string;
  capital?: string; // "<500" | "500-2000" | "2000-10000" | ">10000"
  style?: string;   // "scalping" | "day" | "swing" | "position"
  experience?: string; // "beginner" | "intermediate" | "pro"
  goal?: string;    // "regulation" | "low-spread" | "fast-withdrawal" | "prop-friendly"
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const input: MatcherInput = await req.json();

    // Pull a compact broker snapshot
    const { data: brokers } = await supabase
      .from("brokers")
      .select(
        "id, name, slug, type, tags, regulation, score, avg_spread, leverage, min_deposit, stars, review_count, complaints, badge"
      )
      .eq("status", "published")
      .order("score", { ascending: false })
      .limit(60);

    if (!brokers || brokers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No brokers available" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const compact = brokers.map((b: any) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      type: b.type,
      tags: b.tags,
      reg: b.regulation,
      score: b.score,
      spread: b.avg_spread,
      leverage: b.leverage,
      min_dep: b.min_deposit,
      stars: b.stars,
      complaints: b.complaints,
      badge: b.badge,
    }));

    const systemPrompt = `You are NAFT's AI Broker Matcher. You recommend the BEST 3 brokers for a trader from the supplied dataset.

Rules:
- ONLY pick from the provided broker list. Use their exact "id" and "slug".
- Prioritise: score, regulation match, broker type compatibility with trading style, low complaints.
- Match style: scalping → low spread + ECN tags, day/swing → balanced, position → low cost + reliability.
- For prop-friendly goal, prefer brokers tagged "prop-firm" or "prop-friendly".
- Reasoning should be concrete: cite spread, regulation, score numbers from the data.
- Keep each reasoning under 240 chars.`;

    const userPrompt = `Trader profile:
- Country: ${input.country || "any"}
- Capital: ${input.capital || "any"}
- Trading style: ${input.style || "any"}
- Experience: ${input.experience || "any"}
- Primary goal: ${input.goal || "balanced"}

Broker dataset (JSON):
${JSON.stringify(compact)}

Return the top 3 matches.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_top_brokers",
              description: "Return the top 3 broker matches.",
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
          },
        ],
        tool_choice: { type: "function", function: { name: "return_top_brokers" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached, try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Top up Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : { matches: [] };

    // Enrich matches with full broker data from our DB
    const enriched = (args.matches || []).slice(0, 3).map((m: any) => {
      const full = brokers.find((b: any) => b.id === m.id);
      return { ...m, broker: full };
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
