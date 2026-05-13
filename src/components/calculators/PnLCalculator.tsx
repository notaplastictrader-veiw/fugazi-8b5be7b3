import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { profitLoss, type LotType } from "@/lib/tradingMath";

const PnLCalculator = () => {
  const [side, setSide] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState("1.0800");
  const [exit, setExit] = useState("1.0850");
  const [lots, setLots] = useState("1");
  const [lotType, setLotType] = useState<LotType>("standard");

  const result = useMemo(() => {
    const e = parseFloat(entry), x = parseFloat(exit), l = parseFloat(lots);
    if (![e, x, l].every(n => isFinite(n) && n > 0)) return null;
    return profitLoss({ side, entry: e, exit: x, lots: l, lotType });
  }, [side, entry, exit, lots, lotType]);

  const positive = (result?.pnl ?? 0) >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Side</Label>
          <Select value={side} onValueChange={v => setSide(v as any)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="long">Long</SelectItem>
              <SelectItem value="short">Short</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Entry</Label>
          <Input className="mt-1" type="number" step="0.0001" value={entry} onChange={e => setEntry(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Exit</Label>
          <Input className="mt-1" type="number" step="0.0001" value={exit} onChange={e => setExit(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lots</Label>
          <Input className="mt-1" type="number" step="0.01" value={lots} onChange={e => setLots(e.target.value)} />
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
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-lg border p-4 text-center ${positive ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">P&L</div>
          <div className={`font-display text-3xl font-bold mt-1 ${positive ? "text-primary" : "text-destructive"}`}>
            {result ? `${positive ? "+" : ""}$${result.pnl.toFixed(2)}` : "—"}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Pips</div>
          <div className="font-display text-3xl font-bold text-foreground mt-1">
            {result ? `${result.pips >= 0 ? "+" : ""}${result.pips.toFixed(1)}` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PnLCalculator;
