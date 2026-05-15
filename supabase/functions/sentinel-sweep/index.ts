// Sentinel cron — sweeps all published brokers and runs detect_potential_scam.
// Triggered by pg_cron daily. Returns counts.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: brokers, error } = await supabase
      .from("brokers")
      .select("id")
      .eq("status", "published");

    if (error) throw error;

    let scanned = 0;
    let triggered = 0;

    // Count alerts created during this sweep
    const before = await supabase
      .from("scam_alerts")
      .select("id", { count: "exact", head: true })
      .like("title", "Auto-detected:%");

    for (const b of brokers || []) {
      const { error: rpcErr } = await supabase.rpc("detect_potential_scam", { _broker_id: b.id });
      if (!rpcErr) scanned++;
    }

    const after = await supabase
      .from("scam_alerts")
      .select("id", { count: "exact", head: true })
      .like("title", "Auto-detected:%");

    triggered = (after.count || 0) - (before.count || 0);

    console.log(`Sentinel sweep complete: scanned=${scanned}, new alerts=${triggered}`);

    return new Response(
      JSON.stringify({ ok: true, scanned, triggered, total_brokers: brokers?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("sentinel-sweep error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
