import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SITE_URL = "https://www.notafugazitrader.com";

const STATIC_URLS: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/brokers", changefreq: "daily", priority: "0.9" },
  { loc: "/prop-firms", changefreq: "weekly", priority: "0.8" },
  { loc: "/signals", changefreq: "daily", priority: "0.8" },
  { loc: "/scam-alerts", changefreq: "daily", priority: "0.8" },
  { loc: "/sports", changefreq: "daily", priority: "0.7" },
  { loc: "/news", changefreq: "daily", priority: "0.7" },
  { loc: "/promotions", changefreq: "weekly", priority: "0.7" },
  { loc: "/calendar", changefreq: "daily", priority: "0.7" },
  { loc: "/forecasts", changefreq: "daily", priority: "0.7" },
  { loc: "/ideas", changefreq: "daily", priority: "0.7" },
  { loc: "/education", changefreq: "weekly", priority: "0.6" },
  { loc: "/compare", changefreq: "weekly", priority: "0.6" },
  { loc: "/match", changefreq: "weekly", priority: "0.7" },
  { loc: "/forum", changefreq: "daily", priority: "0.7" },
  { loc: "/awards", changefreq: "weekly", priority: "0.6" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/partnership", changefreq: "monthly", priority: "0.5" },
  { loc: "/advertise", changefreq: "monthly", priority: "0.5" },
  { loc: "/how-we-review", changefreq: "monthly", priority: "0.5" },
  { loc: "/terms", changefreq: "monthly", priority: "0.4" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.4" },
  { loc: "/cookies", changefreq: "monthly", priority: "0.4" },
  { loc: "/disclaimer", changefreq: "monthly", priority: "0.4" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const fmtDate = (d?: string | null) => {
  const date = d ? new Date(d) : new Date();
  return isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const today = new Date().toISOString().slice(0, 10);
    const urls: string[] = STATIC_URLS.map(
      (u) =>
        `<url><loc>${SITE_URL}${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    );

    const safeQuery = async <T,>(p: Promise<{ data: T[] | null; error: any }>): Promise<T[]> => {
      try {
        const { data } = await p;
        return data ?? [];
      } catch {
        return [];
      }
    };

    const [brokers, scamAlerts, news, promos, education, signalGroups, forum] = await Promise.all([
      safeQuery<{ slug: string; updated_at: string }>(
        supabase.from("brokers").select("slug, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ id: string; updated_at: string }>(
        supabase.from("scam_alerts").select("id, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ slug: string; updated_at: string }>(
        supabase.from("news_articles").select("slug, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ slug: string; updated_at: string }>(
        supabase.from("promotions").select("slug, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ slug: string; updated_at: string }>(
        supabase.from("education_articles").select("slug, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ id: string; updated_at: string }>(
        supabase.from("signal_groups").select("id, updated_at").eq("status", "published") as any,
      ),
      safeQuery<{ slug: string; updated_at: string }>(
        supabase.from("forum_threads").select("slug, updated_at") as any,
      ),
    ]);

    for (const b of brokers) {
      if (!b?.slug) continue;
      urls.push(
        `<url><loc>${SITE_URL}/brokers/${xmlEscape(b.slug)}</loc><lastmod>${fmtDate(b.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      );
    }
    for (const a of scamAlerts) {
      if (!a?.id) continue;
      urls.push(
        `<url><loc>${SITE_URL}/scam-alerts/${xmlEscape(a.id)}</loc><lastmod>${fmtDate(a.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
      );
    }
    for (const n of news) {
      if (!n?.slug) continue;
      urls.push(
        `<url><loc>${SITE_URL}/news/${xmlEscape(n.slug)}</loc><lastmod>${fmtDate(n.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
      );
    }
    for (const p of promos) {
      if (!p?.slug) continue;
      urls.push(
        `<url><loc>${SITE_URL}/promotions/${xmlEscape(p.slug)}</loc><lastmod>${fmtDate(p.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
      );
    }
    for (const e of education) {
      if (!e?.slug) continue;
      urls.push(
        `<url><loc>${SITE_URL}/education/${xmlEscape(e.slug)}</loc><lastmod>${fmtDate(e.updated_at)}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
      );
    }
    for (const s of signalGroups) {
      if (!s?.id) continue;
      urls.push(
        `<url><loc>${SITE_URL}/signals/${xmlEscape(s.id)}</loc><lastmod>${fmtDate(s.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
      );
    }
    for (const f of forum) {
      if (!f?.slug) continue;
      urls.push(
        `<url><loc>${SITE_URL}/forum/${xmlEscape(f.slug)}</loc><lastmod>${fmtDate(f.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 200,
      headers: { "Content-Type": "application/xml; charset=utf-8" },
    });
  }
});
