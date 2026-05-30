// Import all 50 broker reviews + editorial sidecars from the gogang735-oss/KIRO naft/all-50-reviews branch.
// Public, admin-only endpoint. Idempotent upsert by slug.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REPO_API = "https://api.github.com/repos/gogang735-oss/KIRO/contents/?ref=naft/all-50-reviews";

interface EditorialRow {
  broker_slug: string;
  author: string;
  role: string;
  rating: number;
  content: string;
  status: string;
  verified_account?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Auth: caller must be super_admin
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden — super_admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // List repo files
  const listRes = await fetch(REPO_API, { headers: { "User-Agent": "naft-importer" } });
  if (!listRes.ok) {
    return new Response(JSON.stringify({ error: `GitHub list failed ${listRes.status}` }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const files = await listRes.json() as Array<{ name: string; download_url: string }>;
  const brokerFiles = files.filter(f => f.name.endsWith("-REVIEW-2026.json") && !f.name.includes("EDITORIAL"));
  const editorialFiles = files.filter(f => f.name.endsWith("-EDITORIAL-REVIEW-ROW-2026.json"));

  const results = { brokers_upserted: 0, editorials_inserted: 0, errors: [] as string[] };

  // 1. Upsert brokers
  for (const f of brokerFiles) {
    try {
      const r = await fetch(f.download_url);
      const payload = await r.json();
      // Only keep fields that exist on brokers table
      const row: Record<string, unknown> = {
        name: payload.name,
        slug: payload.slug,
        type: payload.type ?? "forex",
        founded_year: payload.founded_year ?? null,
        headquarters: payload.headquarters ?? "",
        website_url: payload.website_url ?? "",
        logo_url: payload.logo_url ?? null,
        description: payload.description ?? "",
        regulation: payload.regulation ?? [],
        license_number: payload.license_number ?? "",
        min_deposit: payload.min_deposit ?? "$0",
        leverage: payload.leverage ?? "1:100",
        avg_spread: payload.avg_spread ?? "0",
        score: payload.score ?? 0,
        stars: payload.stars ?? 0,
        account_types: payload.account_types ?? [],
        platforms: payload.platforms ?? [],
        payment_methods: payload.payment_methods ?? [],
        payment_method_details: payload.payment_method_details ?? [],
        pros: payload.pros ?? [],
        cons: payload.cons ?? [],
        support_email: payload.support_email ?? "",
        support_phone: payload.support_phone ?? "",
        withdrawal_time: payload.withdrawal_time ?? "",
        withdrawal_fee: payload.withdrawal_fee ?? "",
        warning_note: payload.warning_note ?? "",
        tags: payload.tags ?? [],
        badge: payload.badge ?? "none",
        promo_label: payload.promo_label ?? null,
        promo_code: payload.promo_code ?? null,
        affiliate_url: payload.affiliate_url ?? null,
        long_review: payload.long_review ?? null,
        status: "published",
        updated_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("brokers").upsert(row, { onConflict: "slug" });
      if (error) { results.errors.push(`${payload.slug}: ${error.message}`); continue; }
      results.brokers_upserted++;
    } catch (e) {
      results.errors.push(`${f.name}: ${(e as Error).message}`);
    }
  }

  // 2. Insert editorial reviews (one per broker, replace existing editor rows)
  for (const f of editorialFiles) {
    try {
      const r = await fetch(f.download_url);
      const payload = await r.json();
      const row = (payload.editorial_review_row ?? payload) as EditorialRow;
      const { data: broker } = await supabase
        .from("brokers")
        .select("id")
        .eq("slug", row.broker_slug)
        .maybeSingle();
      if (!broker) { results.errors.push(`editorial ${row.broker_slug}: broker not found`); continue; }

      // Delete prior editor rows for this broker
      await supabase.from("reviews").delete()
        .eq("broker_id", broker.id)
        .in("role", ["editor", "editorial"]);

      const { error } = await supabase.from("reviews").insert({
        broker_id: broker.id,
        user_id: userData.user.id,
        author: row.author ?? "NAFT Editorial",
        role: row.role ?? "editor",
        rating: row.rating ?? null,
        content: row.content ?? "",
        status: row.status ?? "published",
        verified_account: row.verified_account ?? true,
      });
      if (error) { results.errors.push(`editorial ${row.broker_slug}: ${error.message}`); continue; }
      results.editorials_inserted++;
    } catch (e) {
      results.errors.push(`${f.name}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
