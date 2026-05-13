import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { marginRequired, type LotType } from "@/lib/tradingMath";

const MarginCalculator = () => {
  const [lots, setLots] = useState("1");
  const [price, setPrice] = useState("1.0850");
  const [leverage, setLeverage] = useState("100");
  const [lotType, setLotType] = useState<LotType>("standard");

  const result = useMemo(() => {
    const l = parseFloat(lots), p = parseFloat(price), lev = parseFloat(leverage);
    if (![l, p, lev].every(n => isFinite(n) && n > 0)) return null;
    return marginRequired({ lots: l, price: p, leverage: lev, lotType });
  }, [lots, price, leverage, lotType]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Lots</Label>
          <Input className="mt-1" type="number" step="0.01" value={lots} onChange={e => setLots(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Price</Label>
          <Input className="mt-1" type="number" step="0.0001" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
        <div>
          <Label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Leverage 1:</Label>
          <Input className="mt-1" type="number" value={leverage} onChange={e => setLeverage(e.target.value)} />
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
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 text-center">
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Required Margin</div>
        <div className="font-display text-3xl font-bold text-primary">
          {result !== null ? `$${result.toFixed(2)}` : "—"}
        </div>
      </div>
    </div>
  );
};

export default MarginCalculator;
