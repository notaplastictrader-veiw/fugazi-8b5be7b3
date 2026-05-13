import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingDown } from "lucide-react";
import { tradingCost, parseSpread } from "@/lib/tradingMath";

interface BrokerInput {
  id: string;
  name: string;
  avg_spread: string | null;
  /** Optional commission per round-trip lot in account ccy */
  commission_per_lot?: number | null;
}

interface Props { brokers: BrokerInput[] }

const CostCalculator = ({ brokers }: Props) => {
  const [lots, setLots] = useState("1");
  const [trades, setTrades] = useState("20");

  const rows = useMemo(() => {
    const l = parseFloat(lots), t = parseFloat(trades);
    if (![l, t].every(n => isFinite(n) && n > 0)) return [];
    return brokers.map(b => {
      const spread = parseSpread(b.avg_spread);
      const valid = isFinite(spread);
      const cost = valid ? tradingCost({
        spreadPips: spread,
        commissionPerLot: b.commission_per_lot ?? 0,
        lots: l,
        tradesPerMonth: t,
      }) : null;
      return { ...b, spread, cost };
    });
  }, [brokers, lots, trades]);

  if (brokers.length < 2) return null;

  const cheapest = rows
    .filter(r => r.cost)
    .sort((a, b) => (a.cost!.perMonth - b.cost!.perMonth))[0];

  return (
    <div className="rounded-xl border border-primary/20 bg-card/40 backdrop-blur-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-bold text-foreground">Cost Calculator</h2>
        <span className="text-xs font-mono text-muted-foreground ml-2">Estimate spread cost across these brokers</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 max-w-md">
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lot Size</Label>
          <Input className="mt-1" type="number" step="0.01" value={lots} onChange={e => setLots(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Trades / Month</Label>
          <Input className="mt-1" type="number" value={trades} onChange={e => setTrades(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {rows.map(r => {
          const isBest = cheapest?.id === r.id && r.cost;
          return (
            <div key={r.id} className={`rounded-lg border p-4 ${isBest ? "border-primary/40 bg-primary/5" : "border-border bg-background/50"}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-display font-bold text-sm text-foreground truncate">{r.name}</div>
                {isBest && (
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Cheapest
                  </span>
                )}
              </div>
              {r.cost ? (
                <>
                  <div className="text-xs text-muted-foreground font-mono mb-1">Spread {r.spread} pips</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">/ trade</span><span className="font-mono text-foreground">${r.cost.perTrade.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">/ month</span><span className="font-mono font-bold text-primary">${r.cost.perMonth.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">/ year</span><span className="font-mono text-foreground">${r.cost.perYear.toFixed(2)}</span></div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-muted-foreground italic">Spread data unavailable</div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] font-mono text-muted-foreground">
        * Estimates based on EURUSD-equivalent pip value ($10 / std lot). Commission excluded unless broker discloses it.
      </p>
    </div>
  );
};

export default CostCalculator;
