import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const year = Number(url.searchParams.get("year") || new Date().getFullYear());
    const yStart = `${year}-01-01`;
    const yEnd = `${year + 1}-01-01`;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [
      brokersRes, reviewsRes, complaintsRes, scamRes, signalsRes,
      forecastsRes, usersRes, votesRes, threadsRes, repliesRes,
    ] = await Promise.all([
      supabase.from("brokers").select("id,name,slug,score,stars,review_count,logo_url,tier:status").eq("status", "published").order("stars", { ascending: false }).limit(10),
      supabase.from("reviews").select("id,rating,created_at,broker_id").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("complaints").select("id,broker_id,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("scam_alerts").select("id,broker_id,severity,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("signals").select("id,outcome,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("forecasts").select("id,direction,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("profiles").select("id,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("award_votes").select("id,category_id,nominee_id,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("forum_threads").select("id,created_at").gte("created_at", yStart).lt("created_at", yEnd),
      supabase.from("forum_replies").select("id,created_at").gte("created_at", yStart).lt("created_at", yEnd),
    ]);

    const reviews = reviewsRes.data || [];
    const complaints = complaintsRes.data || [];
    const signals = signalsRes.data || [];
    const wins = signals.filter((s: any) => s.outcome === "win").length;
    const losses = signals.filter((s: any) => s.outcome === "loss").length;
    const winRate = wins + losses ? Math.round((wins / (wins + losses)) * 100) : 0;

    // Top reviewed brokers in year
    const reviewByBroker = new Map<string, { count: number; sum: number }>();
    for (const r of reviews as any[]) {
      if (!r.broker_id) continue;
      const cur = reviewByBroker.get(r.broker_id) || { count: 0, sum: 0 };
      cur.count++; cur.sum += Number(r.rating || 0);
      reviewByBroker.set(r.broker_id, cur);
    }
    const topBrokerIds = [...reviewByBroker.entries()]
      .sort((a, b) => b[1].count - a[1].count).slice(0, 10).map(([id]) => id);

    let topBrokerDetails: any[] = [];
    if (topBrokerIds.length) {
      const { data } = await supabase.from("brokers")
        .select("id,name,slug,logo_url,stars").in("id", topBrokerIds);
      topBrokerDetails = (data || []).map((b: any) => {
        const stat = reviewByBroker.get(b.id)!;
        return { ...b, year_reviews: stat.count, year_avg: +(stat.sum / stat.count).toFixed(2) };
      }).sort((a, b) => b.year_reviews - a.year_reviews);
    }

    // Most-complained brokers
    const complaintByBroker = new Map<string, number>();
    for (const c of complaints as any[]) {
      if (!c.broker_id) continue;
      complaintByBroker.set(c.broker_id, (complaintByBroker.get(c.broker_id) || 0) + 1);
    }
    const flaggedIds = [...complaintByBroker.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id);
    let flaggedBrokers: any[] = [];
    if (flaggedIds.length) {
      const { data } = await supabase.from("brokers").select("id,name,slug,logo_url").in("id", flaggedIds);
      flaggedBrokers = (data || []).map((b: any) => ({ ...b, complaints: complaintByBroker.get(b.id) || 0 }))
        .sort((a, b) => b.complaints - a.complaints);
    }

    const report = {
      year,
      generated_at: new Date().toISOString(),
      headline_stats: {
        new_users: usersRes.data?.length || 0,
        reviews: reviews.length,
        complaints: complaints.length,
        scam_alerts: scamRes.data?.length || 0,
        signals_published: signals.length,
        signal_win_rate: winRate,
        forecasts: forecastsRes.data?.length || 0,
        forum_threads: threadsRes.data?.length || 0,
        forum_replies: repliesRes.data?.length || 0,
        award_votes: votesRes.data?.length || 0,
      },
      top_brokers_overall: brokersRes.data || [],
      most_reviewed_brokers: topBrokerDetails,
      most_flagged_brokers: flaggedBrokers,
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("annual-report error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
