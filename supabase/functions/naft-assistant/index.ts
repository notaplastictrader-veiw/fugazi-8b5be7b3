import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatMsg { role: "user" | "assistant"; content: string; }

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

    const { messages } = await req.json() as { messages: ChatMsg[] };
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compact NAFT context bundle
    const [{ data: brokers }, { data: scams }, { data: signals }, { data: payouts }] = await Promise.all([
      supabase.from("brokers").select("name, slug, type, score, regulation, tags, badge, complaints, avg_spread, min_deposit").eq("status", "published").order("score", { ascending: false }).limit(50),
      supabase.from("scam_alerts").select("title, severity, created_at").eq("status", "published").order("created_at", { ascending: false }).limit(20),
      supabase.from("signal_groups").select("name, win_rate, members, verified").eq("status", "published").order("win_rate", { ascending: false }).limit(10),
      supabase.from("withdrawal_proofs").select("broker_id, amount, currency, payout_time_hours").eq("status", "verified").order("verified_at", { ascending: false }).limit(20),
    ]);

    const brokerById = new Map((brokers || []).map((b: any) => [b.name, b]));
    const payoutsByBroker: Record<string, number> = {};
    (payouts || []).forEach((p: any) => { payoutsByBroker[p.broker_id] = (payoutsByBroker[p.broker_id] || 0) + 1; });

    const ctx = `
NAFT (Not A Fugazi Trader) is a transparent broker review platform.

TOP BROKERS (sorted by trust score):
${(brokers || []).map((b: any) => `- ${b.name} [${b.type}] score=${b.score}/10 spread=${b.avg_spread} min=${b.min_deposit} reg=${(b.regulation || []).join("/")} complaints=${b.complaints || 0} ${b.badge === "verified" ? "✓verified" : ""}`).join("\n")}

ACTIVE SCAM ALERTS (recent):
${(scams || []).map((s: any) => `- ${s.title} [${s.severity}]`).join("\n")}

TOP SIGNAL GROUPS:
${(signals || []).map((s: any) => `- ${s.name} winrate=${s.win_rate}% ${s.verified ? "(verified)" : ""}`).join("\n")}

VERIFIED PAYOUT PROOFS (last 20): ${payouts?.length || 0} community-submitted withdrawals verified by NAFT moderators.
`;

    const systemPrompt = `You are NAFT Assistant — a friendly, no-bs trading sidekick.

Use ONLY the NAFT data below to answer broker, scam, and signal questions. If a broker isn't in the list, say "I don't have data on that broker — try the search bar."

For personalised broker recommendations, point users to "/match" (the AI Broker Matcher).
For scam concerns, point to "/scam-alerts".
For signal performance, point to "/signals".

Format answers in concise markdown. Use bullet lists. Keep under 200 words unless the user asks for detail. Never give financial advice or guarantee profits.

NAFT DATA:
${ctx}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("assistant:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
