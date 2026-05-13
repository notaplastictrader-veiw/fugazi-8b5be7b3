import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pipValue, type LotType } from "@/lib/tradingMath";

const COMMON = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "XAUUSD", "BTCUSD"];

const PipCalculator = () => {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lots, setLots] = useState("1");
  const [lotType, setLotType] = useState<LotType>("standard");

  const result = useMemo(() => {
    const n = parseFloat(lots);
    if (!isFinite(n) || n <= 0) return null;
    return pipValue({ symbol, lots: n, lotType });
  }, [symbol, lots, lotType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Symbol</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMMON.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lot Size</Label>
          <Input className="mt-1" type="number" step="0.01" value={lots} onChange={e => setLots(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lot Type</Label>
          <Select value={lotType} onValueChange={v => setLotType(v as LotType)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (100k)</SelectItem>
              <SelectItem value="mini">Mini (10k)</SelectItem>
              <SelectItem value="micro">Micro (1k)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Pip Value</div>
        <div className="font-display text-3xl font-bold text-primary">
          {result !== null ? `${result.toFixed(2)} ${symbol.endsWith("JPY") ? "JPY" : "USD"}` : "—"}
        </div>
        <p className="text-xs text-muted-foreground mt-2">per 1 pip movement, in the quote currency</p>
      </div>
    </div>
  );
};

export default PipCalculator;
