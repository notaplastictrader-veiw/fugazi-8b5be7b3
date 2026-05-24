/**
 * Centralized formatters for broker numeric fields.
 * Strips descriptive words so cards/headers show numbers only.
 */

export const formatSpreadNumber = (raw?: string | null): string => {
  if (!raw) return "—";
  const s = String(raw).trim();
  if (!s || /^n\/?a$/i.test(s)) return "—";

  // Prop-firm account size ranges like "$5K–$400K" / "$5K-$400K" — passthrough only when it really is a $-range with K/M
  if (/^[$€£]\s*\d+(?:\.\d+)?\s*[kKmM]?\s*[–\-—to]+\s*[$€£]?\s*\d+(?:\.\d+)?\s*[kKmM]/.test(s)) return s;


  // Helper: extract spread number from a text segment.
  // Returns the upper bound of a range (e.g. "0.2-0.9 pips" → "0.9 pips"),
  // or the first number with its unit (e.g. "1.0 pip" → "1.0 pip").
  const extractFromSegment = (seg: string): string | null => {
    const range = seg.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(pips?|%|bps|basis\s*points?)?/i);
    if (range) {
      const unit = range[3] ? range[3].toLowerCase().replace(/\s+/g, " ") : "pips";
      return `${range[2]} ${unit}`.trim();
    }
    const single = seg.match(/(\d+(?:\.\d+)?)\s*(pips?|%|bps|basis\s*points?)/i);
    if (single) {
      const unit = single[2].toLowerCase().replace(/\s+/g, " ");
      return `${single[1]} ${unit}`.trim();
    }
    return null;
  };

  // Split into segments on common separators between account tiers (;, |, newline, " / ", ". " sentence-end).
  // Note: don't split on bare "." — that breaks decimals like "0.9".
  const segments = s
    .split(/[;|\n]|\s+\/\s+|\.\s+(?=[A-Z])/)
    .map(x => x.trim())
    .filter(Boolean);


  // 1) Prefer a segment that mentions Standard (or Average)
  const stdSeg = segments.find(seg => /\b(standard|average|avg)\b/i.test(seg));
  if (stdSeg) {
    const out = extractFromSegment(stdSeg);
    if (out) return out;
  }

  // 2) Otherwise, take the first segment that has a spread number with unit
  for (const seg of segments) {
    const out = extractFromSegment(seg);
    if (out) return out;
  }


  // First numeric token

  const numMatch = s.match(/\d+(?:\.\d+)?/);
  if (!numMatch) return "—";
  const num = numMatch[0];

  // Look for nearby unit (pips, pip, %)
  const tail = s.slice(numMatch.index! + num.length, numMatch.index! + num.length + 20);
  const unitMatch = tail.match(/\s*(pips?|%)/i);
  return unitMatch ? `${num} ${unitMatch[1].toLowerCase()}` : num;
};

export const formatLeverageNumber = (raw?: string | null): string => {
  if (!raw) return "—";
  const s = String(raw).trim();
  if (!s || /^n\/?a$/i.test(s)) return "—";
  if (/unlimited/i.test(s)) return "Unlimited";

  // Find all ratio pairs like "1:500", "30:1", "500 : 1"
  const pairs = [...s.matchAll(/(\d+)\s*:\s*(\d+)/g)];
  if (pairs.length) {
    let max = 0;
    for (const p of pairs) {
      const a = parseInt(p[1], 10);
      const b = parseInt(p[2], 10);
      // The side that equals 1 goes left; take the other side
      const other = a === 1 ? b : b === 1 ? a : Math.max(a, b);
      if (other > max) max = other;
    }
    if (max > 0) return `1:${max}`;
  }

  // Fallback: first integer → 1:N
  const n = s.match(/\d+/);
  return n ? `1:${n[0]}` : "—";
};

export const formatMinDepositNumber = (raw?: string | null): string => {
  if (!raw) return "—";
  const s = String(raw).trim();
  if (!s || /^n\/?a$/i.test(s)) return "—";
  if (/free|no\s*min|zero/i.test(s) && !/\d/.test(s)) return "$0";

  // Match currency symbol + number (e.g. "$10", "€100", "£50", "$5K")
  const cur = s.match(/([$€£¥₹])\s*(\d+(?:[.,]\d+)?)\s*(k|m)?/i);
  if (cur) {
    const suffix = cur[3] ? cur[3].toUpperCase() : "";
    return `${cur[1]}${cur[2]}${suffix}`;
  }

  // Fallback: first number, prefix with $
  const n = s.match(/\d+(?:[.,]\d+)?/);
  return n ? `$${n[0]}` : "—";
};
