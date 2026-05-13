import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SITE_URL = "https://www.notafugazitrader.com";

// Static regulator slugs (kept in sync with src/data/regulators.ts)
const REGULATOR_SLUGS = ["fca","asic","cysec","nfa","finma","fsa-jp","bafin","mas","dfsa","fsca","ifsc","fsc-bvi","fsa-svg","ifmrrc"];

// Static country guide slugs (kept in sync with src/data/countryGuides.ts)
const COUNTRY_SLUGS = ["bangladesh","india","pakistan","uae","saudi-arabia","indonesia","malaysia","nigeria","south-africa","uk","australia","philippines","vietnam"];

// Static glossary slugs (kept in sync with src/data/glossary.ts)
const GLOSSARY_SLUGS = ["pip","spread","leverage","margin","margin-call","stop-out","negative-balance-protection","lot-size","ecn","stp","market-maker","slippage","swap","islamic-account","regulation-tier","segregated-funds","metatrader-4","metatrader-5","ctrader","demo-account","prop-firm","drawdown","challenge","scalping","withdrawal-proof","kyc","aml","stop-loss","take-profit","risk-reward","signal","scam-broker"];

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
  { loc: "/regulators", changefreq: "monthly", priority: "0.7" },
  { loc: "/glossary", changefreq: "monthly", priority: "0.6" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/partnership", changefreq: "monthly", priority: "0.5" },
  { loc: "/advertise", changefreq: "monthly", priority: "0.5" },
  { loc: "/how-we-review", changefreq: "monthly", priority: "0.5" },
  { loc: "/terms", changefreq: "monthly", priority: "0.4" },
  { loc: "/privacy", changefreq: "monthly", priority: "0.4" },
  { loc: "/cookies", changefreq: "monthly", priority: "0.4" },
  { loc: "/disclaimer", changefreq: "monthly", priority: "0.4" },
  ...REGULATOR_SLUGS.map(s => ({ loc: `/regulators/${s}`, changefreq: "monthly", priority: "0.6" })),
  ...COUNTRY_SLUGS.map(s => ({ loc: `/brokers/country/${s}`, changefreq: "weekly", priority: "0.7" })),
  ...GLOSSARY_SLUGS.map(s => ({ loc: `/glossary/${s}`, changefreq: "monthly", priority: "0.5" })),
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

    const brokerSlugs: string[] = [];
    for (const b of brokers) {
      if (!b?.slug) continue;
      brokerSlugs.push(b.slug);
      urls.push(
        `<url><loc>${SITE_URL}/brokers/${xmlEscape(b.slug)}</loc><lastmod>${fmtDate(b.updated_at)}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      );
    }
    // Programmatic comparison pages — top 12 brokers paired with each other (head-to-head matrix)
    const topForCompare = brokerSlugs.slice(0, 12);
    for (let i = 0; i < topForCompare.length; i++) {
      for (let j = i + 1; j < topForCompare.length; j++) {
        const slug = `${topForCompare[i]}-vs-${topForCompare[j]}`;
        urls.push(
          `<url><loc>${SITE_URL}/compare/${xmlEscape(slug)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
        );
      }
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
