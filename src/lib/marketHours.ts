// Forex market hours utility.
// Forex spot market opens Sunday 22:00 UTC (Sydney) and closes Friday 22:00 UTC (NY close).
// Crypto trades 24/7.

export type MarketKind = "forex" | "crypto";

export function isForexOpen(now: Date = new Date()): boolean {
  const day = now.getUTCDay(); // 0=Sun, 6=Sat
  const hour = now.getUTCHours();
  if (day === 6) return false; // Saturday: closed all day
  if (day === 0 && hour < 22) return false; // Sunday before 22:00 UTC
  if (day === 5 && hour >= 22) return false; // Friday after 22:00 UTC
  return true;
}

export const isCryptoOpen = () => true;

export function isMarketOpen(kind: MarketKind, now?: Date): boolean {
  return kind === "crypto" ? true : isForexOpen(now);
}

/** Returns ms until forex reopens (Sunday 22:00 UTC). 0 if already open. */
export function msUntilForexOpen(now: Date = new Date()): number {
  if (isForexOpen(now)) return 0;
  const next = new Date(now);
  next.setUTCHours(22, 0, 0, 0);
  // Advance to next Sunday 22:00 UTC
  while (next.getUTCDay() !== 0 || next.getTime() <= now.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  // If we're on Sunday before 22:00, "next" might have advanced past — fix back to today 22:00
  const sunday22 = new Date(now);
  sunday22.setUTCHours(22, 0, 0, 0);
  if (now.getUTCDay() === 0 && now.getUTCHours() < 22) {
    return sunday22.getTime() - now.getTime();
  }
  return next.getTime() - now.getTime();
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
