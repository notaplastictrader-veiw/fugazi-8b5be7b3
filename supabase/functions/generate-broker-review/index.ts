// Generates a broker review JSON payload using Lovable AI Gateway.
// Input:  { entity_key: string, name: string, model?: string }
// Output: { text: string }  — raw model text, expected to be JSON per the prompt
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Inline copy of the prompts (kept minimal — we import from a shared structure mirror).
// To avoid bundling the full client lib, we accept the prompt text from the client.
// Actually simpler: client sends `prompt` directly. Server only adds the AI call.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    // Admin check
    const userId = claims.claims.sub;
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const isAdmin = (roleRows ?? []).some((r: any) =>
      ["super_admin", "content_ops", "broker_ops"].includes(r.role)
    );
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const { prompt, model } = body ?? {};
    if (!prompt || typeof prompt !== "string") {
      return json({ error: "Missing prompt" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const useModel = model || "google/gemini-2.5-pro";

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: useModel,
        messages: [
          { role: "system", content: "You are NAFT's senior broker analyst. Output strict valid JSON only, no markdown, no commentary." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (aiRes.status === 429) return json({ error: "Rate limited. Try again shortly." }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted. Add credits in workspace settings." }, 402);
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return json({ error: `AI gateway error [${aiRes.status}]: ${t.slice(0, 500)}` }, 500);
    }

    const data = await aiRes.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    if (!text) return json({ error: "Empty AI response" }, 500);

    // Strip accidental markdown fences if model slipped
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

    return json({ text: cleaned, model: useModel }, 200);
  } catch (e: any) {
    return json({ error: e?.message || "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
