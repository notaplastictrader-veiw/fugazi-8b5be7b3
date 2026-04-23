// Normalized signature for economic-calendar event deduplication.
// Groups e.g. "Non-Farm Payrolls", "NFP", "Nonfarm Payrolls (NFP) m/m" together.

const STOPWORDS = new Set([
  "the", "and", "of", "for", "a", "an", "to", "in", "on",
  "mom", "yoy", "qoq", "mm", "yy", "qq",
  "monthly", "yearly", "quarterly",
]);

const ACRONYMS: Record<string, string> = {
  nfp: "nonfarm payrolls",
  cpi: "consumer price index",
  ppi: "producer price index",
  gdp: "gross domestic product",
  pmi: "purchasing managers index",
  ism: "institute supply management",
  boe: "bank england",
  boj: "bank japan",
  ecb: "european central bank",
  fed: "federal reserve",
  fomc: "federal open market committee",
  rba: "reserve bank australia",
  boc: "bank canada",
  snb: "swiss national bank",
  rbnz: "reserve bank new zealand",
  pce: "personal consumption expenditures",
  adp: "adp employment",
  unemp: "unemployment",
};

export function normalizeEventSignature(name: string): string {
  if (!name) return "";
  let s = name.toLowerCase();
  // strip parenthetical content
  s = s.replace(/\([^)]*\)/g, " ");
  // normalize separators
  s = s.replace(/[\/\-_.,;:]/g, " ");
  // remove non-alphanumerics
  s = s.replace(/[^a-z0-9 ]/g, " ");
  // collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  const tokens: string[] = [];
  for (const raw of s.split(" ")) {
    if (!raw) continue;
    if (ACRONYMS[raw]) {
      for (const t of ACRONYMS[raw].split(" ")) tokens.push(t);
    } else {
      tokens.push(raw);
    }
  }

  const filtered = tokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
  const unique = Array.from(new Set(filtered)).sort();
  return unique.slice(0, 5).join(" ");
}

export function dedupeKey(event_date: string, currency: string, name: string): string {
  return `${event_date}::${(currency || "").toUpperCase()}::${normalizeEventSignature(name)}`;
}

// Map raw API category strings to a small UI-friendly bucket.
export function categoryBucket(raw: string, name: string): string {
  const r = (raw || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (r.includes("central") || /\b(rate decision|interest rate|fomc|ecb|boe|boj|rba|boc|snb|rbnz|monetary)\b/.test(n))
    return "central_bank";
  if (r.includes("inflation") || /\b(cpi|ppi|inflation|pce)\b/.test(n)) return "inflation";
  if (r.includes("employ") || /\b(nfp|payroll|unemployment|jobless|employment|adp|jobs)\b/.test(n))
    return "employment";
  if (r.includes("gdp") || /\bgdp\b/.test(n)) return "gdp";
  if (r.includes("manufact") || /\b(pmi|ism|manufacturing|industrial)\b/.test(n)) return "manufacturing";
  if (r.includes("consumer") || r.includes("retail") || /\b(retail sales|consumer)\b/.test(n)) return "consumer";
  if (r.includes("housing") || /\b(housing|home sales|building permits|mortgage)\b/.test(n)) return "housing";
  return "other";
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  central_bank: "Central Bank",
  inflation: "Inflation",
  employment: "Employment",
  gdp: "GDP",
  manufacturing: "Manufacturing",
  consumer: "Consumer",
  housing: "Housing",
  other: "Other",
};
