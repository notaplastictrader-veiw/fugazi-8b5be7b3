/**
 * Centralized formatters for broker numeric fields.
 * Strips descriptive words so cards/headers show numbers only.
 */

export const formatSpreadNumber = (raw?: string | null): string => {
  if (!raw) return "—";
  const s = String(raw).trim();
  if (!s || /^n\/?a$/i.test(s)) return "—";

  // Prop-firm account size ranges like "$5K–$400K" — passthrough
  if (/[$€£]/.test(s) || /\bK\b/i.test(s)) return s;

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
