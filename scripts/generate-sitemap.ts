// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls dynamic broker, news, education, promotion slugs from Supabase at build time.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.notafugazitrader.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://jclmhealhirenkyonyjp.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbG1oZWFsaGlyZW5reW9ueWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMDE1NjksImV4cCI6MjA5MTg3NzU2OX0.SoKhcjyeaz5h78bZRmNOzpctxtPqKvtmyHTCjyUeSns";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const today = new Date().toISOString().slice(0, 10);

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/brokers", changefreq: "daily", priority: "0.9" },
  { path: "/prop-firms", changefreq: "weekly", priority: "0.8" },
  { path: "/signals", changefreq: "daily", priority: "0.8" },
  { path: "/scam-alerts", changefreq: "daily", priority: "0.8" },
  { path: "/sports", changefreq: "daily", priority: "0.7" },
  { path: "/news", changefreq: "daily", priority: "0.7" },
  { path: "/promotions", changefreq: "weekly", priority: "0.7" },
  { path: "/calendar", changefreq: "daily", priority: "0.7" },
  { path: "/forecasts", changefreq: "daily", priority: "0.7" },
  { path: "/ideas", changefreq: "daily", priority: "0.7" },
  { path: "/education", changefreq: "weekly", priority: "0.6" },
  { path: "/compare", changefreq: "weekly", priority: "0.6" },
  { path: "/forum", changefreq: "daily", priority: "0.6" },
  { path: "/awards", changefreq: "weekly", priority: "0.6" },
  { path: "/match", changefreq: "monthly", priority: "0.6" },
  { path: "/partnership", changefreq: "monthly", priority: "0.5" },
  { path: "/advertise", changefreq: "monthly", priority: "0.5" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "monthly", priority: "0.4" },
  { path: "/disclaimer", changefreq: "monthly", priority: "0.4" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/signup", changefreq: "yearly", priority: "0.3" },
];

async function fetchRows(table: string, select = "slug,updated_at", filter = "status=eq.published"): Promise<any[]> {
  try {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&${filter}&limit=1000`;
    const res = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) {
      console.warn(`[sitemap] ${table} fetch failed: ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (e) {
    console.warn(`[sitemap] ${table} fetch error`, e);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <lastmod>${e.lastmod || today}</lastmod>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const [brokers, news, education, promos] = await Promise.all([
    fetchRows("brokers"),
    fetchRows("news_articles"),
    fetchRows("education_articles"),
    fetchRows("promotions"),
  ]);

  const dynamic: SitemapEntry[] = [
    ...brokers.filter((b) => b.slug).map((b) => ({
      path: `/brokers/${b.slug}`,
      lastmod: (b.updated_at || "").slice(0, 10) || today,
      changefreq: "weekly" as const,
      priority: "0.7",
    })),
    ...news.filter((n) => n.slug).map((n) => ({
      path: `/news/${n.slug}`,
      lastmod: (n.updated_at || "").slice(0, 10) || today,
      changefreq: "monthly" as const,
      priority: "0.5",
    })),
    ...education.filter((e) => e.slug).map((e) => ({
      path: `/education/${e.slug}`,
      lastmod: (e.updated_at || "").slice(0, 10) || today,
      changefreq: "monthly" as const,
      priority: "0.5",
    })),
    ...promos.filter((p) => p.slug).map((p) => ({
      path: `/promotions/${p.slug}`,
      lastmod: (p.updated_at || "").slice(0, 10) || today,
      changefreq: "weekly" as const,
      priority: "0.5",
    })),
  ];

  const all = [...staticEntries, ...dynamic];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all));
  console.log(`sitemap.xml written (${all.length} entries — ${dynamic.length} dynamic)`);
})();
