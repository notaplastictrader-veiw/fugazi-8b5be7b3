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


  // If text describes multiple account tiers, prefer the Standard account spread
  const standard = s.match(/standard[^.]*?(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*(pips?|%)?/i);
  if (standard) {
    const unit = standard[2] ? standard[2].toLowerCase() : "pips";
    const value = standard[1].split(/[-–]/).pop()?.trim() || standard[1];
    return `${value} ${unit}`.trim();
  }

  // Ranges like "0.2–0.9 pips" should show the actual average/standard card value: the upper spread.
  const range = s.match(/\b\d+(?:\.\d+)?\s*[-–]\s*(\d+(?:\.\d+)?)\s*(pips?|%)?/i);
  if (range) {
    const unit = range[2] ? range[2].toLowerCase() : "pips";
    return `${range[1]} ${unit}`.trim();
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
