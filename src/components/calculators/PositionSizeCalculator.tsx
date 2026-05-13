import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { positionSize, type LotType } from "@/lib/tradingMath";

const COMMON = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD", "BTCUSD"];

const PositionSizeCalculator = ({ compact = false }: { compact?: boolean }) => {
  const [balance, setBalance] = useState("10000");
  const [risk, setRisk] = useState("1");
  const [sl, setSl] = useState("20");
  const [symbol, setSymbol] = useState("EURUSD");
  const [lotType, setLotType] = useState<LotType>("standard");

  const result = useMemo(() => {
    const b = parseFloat(balance), r = parseFloat(risk), s = parseFloat(sl);
    if (![b, r, s].every(n => isFinite(n) && n > 0)) return null;
    return positionSize({ accountBalance: b, riskPct: r, stopLossPips: s, symbol, lotType });
  }, [balance, risk, sl, symbol, lotType]);

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Account Balance</Label>
          <Input className="mt-1" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Risk %</Label>
          <Input className="mt-1" type="number" step="0.1" value={risk} onChange={e => setRisk(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Stop-Loss (pips)</Label>
          <Input className="mt-1" type="number" value={sl} onChange={e => setSl(e.target.value)} />
        </div>
        {!compact && (
          <>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{COMMON.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lot Type</Label>
              <Select value={lotType} onValueChange={v => setLotType(v as LotType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="mini">Mini</SelectItem>
                  <SelectItem value="micro">Micro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Position Size</div>
          <div className="font-display text-2xl font-bold text-primary mt-1">
            {result ? result.lots.toFixed(2) : "—"} <span className="text-xs">lots</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Units</div>
          <div className="font-display text-2xl font-bold text-foreground mt-1">
            {result ? Math.round(result.units).toLocaleString() : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Risk Amount</div>
          <div className="font-display text-2xl font-bold text-accent mt-1">
            {result ? `$${result.riskAmount.toFixed(2)}` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionSizeCalculator;
