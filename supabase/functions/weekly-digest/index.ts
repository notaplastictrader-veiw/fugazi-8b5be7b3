import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Aggregate digest payload
    const [{ data: topBrokers }, { data: scams }, { data: signals }] = await Promise.all([
      supabase.from("brokers").select("name, slug, score, stars").eq("status", "published")
        .order("score", { ascending: false }).limit(5),
      supabase.from("scam_alerts").select("title, severity, created_at").eq("status", "published")
        .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(5),
      supabase.from("forecasts").select("pair, direction, potential, created_at").eq("status", "published")
        .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(5),
    ]);

    // Get users opted into weekly digest
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, last_digest_sent_at")
      .eq("weekly_digest", true)
      .eq("inapp_enabled", true);

    if (!prefs?.length) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no opted-in users" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build summary text
    const summary = [
      topBrokers?.length ? `🏆 Top brokers: ${topBrokers.slice(0, 3).map((b: any) => b.name).join(", ")}` : "",
      scams?.length ? `🚨 ${scams.length} new scam alert${scams.length > 1 ? "s" : ""} this week` : "",
      signals?.length ? `📈 ${signals.length} fresh forecast${signals.length > 1 ? "s" : ""}` : "",
    ].filter(Boolean).join(" · ") || "Your weekly NAFT update is ready.";

    // Insert in-app notifications + update last_digest_sent_at
    const now = new Date().toISOString();
    const notifications = prefs.map((p: any) => ({
      user_id: p.user_id,
      type: "digest",
      title: "Your weekly NAFT digest",
      message: summary,
      link: "/dashboard",
    }));

    const { error: notifErr } = await supabase.from("notifications").insert(notifications);
    if (notifErr) throw notifErr;

    await supabase.from("notification_preferences")
      .update({ last_digest_sent_at: now })
      .in("user_id", prefs.map((p: any) => p.user_id));

    return new Response(JSON.stringify({ ok: true, sent: prefs.length, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-digest:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
