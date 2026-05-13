// Trading math utilities. All calculations use standard FX conventions.
// Standard lot = 100,000 units. Mini = 10,000. Micro = 1,000.

export const LOT_UNITS = { standard: 100_000, mini: 10_000, micro: 1_000 } as const;
export type LotType = keyof typeof LOT_UNITS;

/** Pip value in quote currency for 1 standard lot. */
export function pipValueStandardLot(symbol: string): number {
  const s = symbol.toUpperCase();
  // JPY pairs use 0.01 as a pip; everything else 0.0001
  if (s.endsWith("JPY")) return 1000 / 100; // 100,000 * 0.01 / price-of-quote ≈ approximated; we treat in quote ccy
  return 10; // 100,000 * 0.0001 = 10 quote units
}

/** Pip value for given lot count (in quote currency). */
export function pipValue({ symbol, lots, lotType = "standard" }: {
  symbol: string; lots: number; lotType?: LotType;
}): number {
  const units = LOT_UNITS[lotType] * lots;
  const pipSize = symbol.toUpperCase().endsWith("JPY") ? 0.01 : 0.0001;
  return units * pipSize;
}

/** Position size (in lots) for risk-based money management. */
export function positionSize({
  accountBalance, riskPct, stopLossPips, symbol, lotType = "standard",
}: {
  accountBalance: number; riskPct: number; stopLossPips: number;
  symbol: string; lotType?: LotType;
}): { lots: number; units: number; riskAmount: number } {
  const riskAmount = accountBalance * (riskPct / 100);
  const pipSize = symbol.toUpperCase().endsWith("JPY") ? 0.01 : 0.0001;
  const valuePerPipPerUnit = pipSize; // in quote ccy
  const units = stopLossPips > 0
    ? riskAmount / (stopLossPips * valuePerPipPerUnit)
    : 0;
  const lots = units / LOT_UNITS[lotType];
  return { lots, units, riskAmount };
}

/** Required margin = (lots * contract size * price) / leverage */
export function marginRequired({
  lots, lotType = "standard", price, leverage,
}: { lots: number; lotType?: LotType; price: number; leverage: number }): number {
  if (!leverage) return 0;
  return (lots * LOT_UNITS[lotType] * price) / leverage;
}

/** P&L in quote currency. */
export function profitLoss({
  side, entry, exit, lots, lotType = "standard",
}: { side: "long" | "short"; entry: number; exit: number; lots: number; lotType?: LotType }): {
  pnl: number; pips: number;
} {
  const pipSize = entry > 50 ? 0.01 : 0.0001; // crude JPY heuristic
  const diff = side === "long" ? exit - entry : entry - exit;
  const pips = diff / pipSize;
  const pnl = diff * lots * LOT_UNITS[lotType];
  return { pnl, pips };
}

/** Approx round-trip trading cost in account currency. */
export function tradingCost({
  spreadPips, commissionPerLot = 0, lots, tradesPerMonth, symbol = "EURUSD",
}: {
  spreadPips: number; commissionPerLot?: number; lots: number;
  tradesPerMonth: number; symbol?: string;
}): { perTrade: number; perMonth: number; perYear: number } {
  const pipVal = pipValue({ symbol, lots });
  const spreadCost = spreadPips * pipVal;
  const commission = commissionPerLot * lots; // per side already? assume round-trip
  const perTrade = spreadCost + commission;
  return {
    perTrade,
    perMonth: perTrade * tradesPerMonth,
    perYear: perTrade * tradesPerMonth * 12,
  };
}

/** Parse "1.2 pips" or "1.2" → number. Returns NaN if unparseable. */
export function parseSpread(raw: string | null | undefined): number {
  if (!raw) return NaN;
  const m = String(raw).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : NaN;
}
