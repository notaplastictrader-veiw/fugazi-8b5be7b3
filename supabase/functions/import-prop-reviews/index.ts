// Import all prop firm reviews from gogang735-oss/PROP @ feat/tier2-prop-reviews-v4.10.
// Each file contains TWO concatenated JSON objects: prop_firm_payload + { editorial_review_row }.
// Super admin only. Idempotent upsert by slug.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const REPO_API =
  "https://api.github.com/repos/gogang735-oss/PROP/contents/?ref=feat/tier2-prop-reviews-v4.10";

function splitConcatenatedJson(raw: string): any[] {
  const objs: any[] = [];
  let i = 0;
  const n = raw.length;
  while (i < n) {
    while (i < n && /\s/.test(raw[i])) i++;
    if (i >= n) break;
    // Find matching brace by scanning, respecting strings & escapes.
    if (raw[i] !== "{" && raw[i] !== "[") {
      throw new Error(`unexpected char at ${i}: ${raw[i]}`);
    }
    const open = raw[i];
    const close = open === "{" ? "}" : "]";
    let depth = 0;
    let inStr = false;
    let esc = false;
    let j = i;
    for (; j < n; j++) {
      const c = raw[j];
      if (inStr) {
        if (esc) { esc = false; continue; }
        if (c === "\\") { esc = true; continue; }
        if (c === '"') inStr = false;
        continue;
      }
      if (c === '"') { inStr = true; continue; }
      if (c === open) depth++;
      else if (c === close) {
        depth--;
        if (depth === 0) { j++; break; }
      }
    }
    objs.push(JSON.parse(raw.slice(i, j)));
    i = j;
  }
  return objs;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  const { data: userData } = await supabase.auth.getUser(token);
  if (!userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: roleRow } = await supabase
    .from("user_roles").select("role")
    .eq("user_id", userData.user.id).eq("role", "super_admin").maybeSingle();
  if (!roleRow) {
    return new Response(JSON.stringify({ error: "Forbidden — super_admin only" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const listRes = await fetch(REPO_API, { headers: { "User-Agent": "naft-prop-importer" } });
  if (!listRes.ok) {
    return new Response(JSON.stringify({ error: `GitHub list failed ${listRes.status}` }), {
      status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const files = await listRes.json() as Array<{ name: string; download_url: string }>;
  const propFiles = files.filter(f => f.name.endsWith(".json") && f.name !== "README.md");

  const results = {
    files_seen: propFiles.length,
    firms_upserted: 0,
    editorials_inserted: 0,
    firms: [] as string[],
    errors: [] as string[],
  };

  for (const f of propFiles) {
    try {
      const r = await fetch(f.download_url);
      const text = await r.text();
      const objs = splitConcatenatedJson(text);
      if (objs.length === 0) {
        results.errors.push(`${f.name}: empty`); continue;
      }
      const payload = objs[0];
      const sidecar = objs.find(o => o && typeof o === "object" && o.editorial_review_row)?.editorial_review_row;

      const row: Record<string, unknown> = {
        name: payload.name,
        slug: payload.slug,
        type: "prop-firm",
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
      if (!row.slug || !row.name) {
        results.errors.push(`${f.name}: missing name/slug`); continue;
      }

      const { error: upErr } = await supabase
        .from("brokers").upsert(row, { onConflict: "slug" });
      if (upErr) { results.errors.push(`${payload.slug}: ${upErr.message}`); continue; }
      results.firms_upserted++;
      results.firms.push(String(payload.name));

      if (sidecar) {
        const { data: broker } = await supabase
          .from("brokers").select("id").eq("slug", payload.slug).maybeSingle();
        if (broker) {
          await supabase.from("reviews").delete()
            .eq("broker_id", broker.id).in("role", ["editor", "editorial"]);
          const { error: revErr } = await supabase.from("reviews").insert({
            broker_id: broker.id,
            user_id: userData.user.id,
            author: sidecar.author ?? "NAFT Editorial",
            role: sidecar.role ?? "editor",
            rating: sidecar.rating ?? null,
            content: sidecar.content ?? "",
            status: sidecar.status ?? "published",
            verified_account: sidecar.verified_account ?? true,
          });
          if (revErr) results.errors.push(`editorial ${payload.slug}: ${revErr.message}`);
          else results.editorials_inserted++;
        }
      }
    } catch (e) {
      results.errors.push(`${f.name}: ${(e as Error).message}`);
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
