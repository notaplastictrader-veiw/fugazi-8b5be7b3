import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"; // George — warm narrator
const MODEL_ID = "eleven_turbo_v2_5";

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = date.getUTCDay(); // 0=Sun
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday start
  const monday = new Date(date.setUTCDate(diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const week = startOfWeek();
    const weekStr = week.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();

    // Skip if we already produced this week's digest
    const { data: existing } = await supabase
      .from("audio_digests")
      .select("id, status")
      .eq("week_of", weekStr)
      .maybeSingle();

    if (existing?.status === "ready") {
      return new Response(JSON.stringify({ ok: true, skipped: true, id: existing.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather data
    const [{ data: topBrokers }, { data: scams }, { data: forecasts }, { data: news }] = await Promise.all([
      supabase.from("brokers").select("name, health_score, score").eq("status", "published")
        .order("health_score", { ascending: false }).limit(3),
      supabase.from("scam_alerts").select("title, severity").eq("status", "published")
        .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(3),
      supabase.from("forecasts").select("pair, direction, potential").eq("status", "published")
        .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(3),
      supabase.from("news_articles").select("title").eq("status", "published")
        .gte("created_at", sevenDaysAgo).order("created_at", { ascending: false }).limit(3),
    ]);

    // Build script
    const dateLabel = week.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const lines: string[] = [
      `Welcome to your NAFT weekly digest for the week of ${dateLabel}. Here's what every trader should know.`,
    ];

    if (topBrokers?.length) {
      lines.push(`First, the brokers leading our Health Score this week: ${topBrokers.map((b: any) => `${b.name} at ${Math.round(b.health_score || 0)}`).join(", ")}.`);
    }

    if (scams?.length) {
      lines.push(`On the scam alert front, ${scams.length} new alert${scams.length > 1 ? "s were" : " was"} published this week. Top of the list: ${scams[0].title}. Check the full list before depositing anywhere new.`);
    } else {
      lines.push(`Good news on the scam front — no new high-severity alerts this week.`);
    }

    if (forecasts?.length) {
      const f = forecasts[0] as any;
      lines.push(`Our analysts dropped ${forecasts.length} fresh forecast${forecasts.length > 1 ? "s" : ""}, including a ${f.direction} call on ${f.pair} with ${f.potential} potential.`);
    }

    if (news?.length) {
      lines.push(`In market news: ${news.map((n: any) => n.title).join("; ")}.`);
    }

    lines.push(`That's your week. Stay sharp, verify everything, and we'll see you next Monday on NAFT.`);
    const script = lines.join(" ");
    const title = `NAFT Weekly Digest — ${dateLabel}`;

    // Insert/update placeholder row
    const upsert = await supabase.from("audio_digests").upsert({
      week_of: weekStr,
      title,
      script,
      voice_id: VOICE_ID,
      status: "generating",
    }, { onConflict: "week_of" }).select().single();

    if (upsert.error) throw upsert.error;
    const digestId = upsert.data.id;

    // Generate audio
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: script,
          model_id: MODEL_ID,
          voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.4, use_speaker_boost: true },
        }),
      }
    );

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      await supabase.from("audio_digests").update({ status: "failed", error_message: errText.slice(0, 500) }).eq("id", digestId);
      throw new Error(`ElevenLabs TTS failed: ${ttsRes.status} ${errText}`);
    }

    const audioBuffer = await ttsRes.arrayBuffer();
    const filePath = `${weekStr}.mp3`;

    const upload = await supabase.storage.from("audio-digests").upload(filePath, audioBuffer, {
      contentType: "audio/mpeg",
      upsert: true,
    });
    if (upload.error) throw upload.error;

    const { data: pub } = supabase.storage.from("audio-digests").getPublicUrl(filePath);
    const audioUrl = pub.publicUrl;

    // Rough duration estimate: ~150 wpm => seconds = words / 2.5
    const words = script.split(/\s+/).length;
    const estDuration = Math.round(words / 2.5);

    await supabase.from("audio_digests").update({
      audio_url: audioUrl,
      duration_seconds: estDuration,
      status: "ready",
      error_message: null,
    }).eq("id", digestId);

    return new Response(JSON.stringify({ ok: true, id: digestId, audio_url: audioUrl, duration: estDuration }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-audio-digest:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
