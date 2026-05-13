import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, BookOpen, Trash2, Trophy, Target, Activity } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Trade = {
  id: string;
  symbol: string;
  side: "long" | "short";
  entry_price: number | null;
  exit_price: number | null;
  size: number | null;
  pnl: number | null;
  rr: number | null;
  notes: string | null;
  outcome: "win" | "loss" | "breakeven" | "open";
  opened_at: string;
  closed_at: string | null;
};

const StatCard = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) => (
  <div className="glass-card rounded-xl p-5">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <div className={`text-2xl font-display font-bold ${accent || "text-foreground"}`}>{value}</div>
  </div>
);

const Journal = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    symbol: "",
    side: "long" as "long" | "short",
    entry_price: "",
    exit_price: "",
    size: "",
    pnl: "",
    rr: "",
    notes: "",
    outcome: "open" as Trade["outcome"],
  });

  const { data: trades = [] } = useQuery({
    queryKey: ["trade-journal", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_journal")
        .select("*")
        .eq("user_id", user!.id)
        .order("opened_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as Trade[];
    },
    enabled: !!user,
  });

  const closed = trades.filter((t) => t.outcome !== "open");
  const wins = closed.filter((t) => t.outcome === "win").length;
  const losses = closed.filter((t) => t.outcome === "loss").length;
  const winRate = closed.length ? Math.round((wins / closed.length) * 100) : 0;
  const totalPnL = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
  const avgRR = closed.length
    ? (closed.reduce((s, t) => s + (Number(t.rr) || 0), 0) / closed.length).toFixed(2)
    : "0";

  const reset = () =>
    setForm({
      symbol: "",
      side: "long",
      entry_price: "",
      exit_price: "",
      size: "",
      pnl: "",
      rr: "",
      notes: "",
      outcome: "open",
    });

  const submit = async () => {
    if (!user || !form.symbol.trim()) {
      toast.error("Symbol is required");
      return;
    }
    const payload: any = {
      user_id: user.id,
      symbol: form.symbol.trim().toUpperCase(),
      side: form.side,
      outcome: form.outcome,
      entry_price: form.entry_price ? Number(form.entry_price) : null,
      exit_price: form.exit_price ? Number(form.exit_price) : null,
      size: form.size ? Number(form.size) : null,
      pnl: form.pnl ? Number(form.pnl) : null,
      rr: form.rr ? Number(form.rr) : null,
      notes: form.notes.trim() || null,
      closed_at: form.outcome !== "open" ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("trade_journal").insert(payload);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Trade logged");
    setOpen(false);
    reset();
    qc.invalidateQueries({ queryKey: ["trade-journal", user.id] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("trade_journal").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Trade deleted");
    qc.invalidateQueries({ queryKey: ["trade-journal", user!.id] });
  };

  return (
    <>
      <SEO title="Trade Journal" description="Log and review your personal trades." path="/dashboard/journal" />
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-foreground mb-1">Trade Journal</h1>
          <p className="text-sm text-muted-foreground">Track every trade. Spot patterns. Improve your edge.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Log Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log a Trade</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Symbol *</Label>
                <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="EURUSD, BTCUSDT, XAUUSD..." />
              </div>
              <div>
                <Label>Side</Label>
                <Select value={form.side} onValueChange={(v: any) => setForm({ ...form, side: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="long">Long</SelectItem>
                    <SelectItem value="short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Outcome</Label>
                <Select value={form.outcome} onValueChange={(v: any) => setForm({ ...form, outcome: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="win">Win</SelectItem>
                    <SelectItem value="loss">Loss</SelectItem>
                    <SelectItem value="breakeven">Breakeven</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Entry</Label>
                <Input type="number" step="any" value={form.entry_price} onChange={(e) => setForm({ ...form, entry_price: e.target.value })} />
              </div>
              <div>
                <Label>Exit</Label>
                <Input type="number" step="any" value={form.exit_price} onChange={(e) => setForm({ ...form, exit_price: e.target.value })} />
              </div>
              <div>
                <Label>Size (lots/units)</Label>
                <Input type="number" step="any" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>
              <div>
                <Label>P&L ($)</Label>
                <Input type="number" step="any" value={form.pnl} onChange={(e) => setForm({ ...form, pnl: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>R:R</Label>
                <Input type="number" step="any" value={form.rr} onChange={(e) => setForm({ ...form, rr: e.target.value })} placeholder="e.g. 2.5" />
              </div>
              <div className="col-span-2">
                <Label>Notes</Label>
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Setup, mistakes, lessons..." />
              </div>
            </div>
            <Button onClick={submit} className="w-full">Save Trade</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Activity} label="Total Trades" value={String(trades.length)} />
        <StatCard icon={Trophy} label="Win Rate" value={`${winRate}%`} accent={winRate >= 50 ? "text-primary" : undefined} />
        <StatCard icon={Target} label="Avg R:R" value={avgRR} />
        <StatCard icon={TrendingUp} label="Net P&L" value={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`} accent={totalPnL >= 0 ? "text-primary" : "text-destructive"} />
      </div>

      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Trade History
        </h2>
        {trades.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No trades yet. Click "Log Trade" to start your journal.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 px-2">Symbol</th>
                  <th className="text-left py-2 px-2">Side</th>
                  <th className="text-left py-2 px-2">Outcome</th>
                  <th className="text-right py-2 px-2">P&L</th>
                  <th className="text-right py-2 px-2">R:R</th>
                  <th className="text-left py-2 px-2 hidden md:table-cell">When</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="py-2 px-2 font-mono font-semibold">{t.symbol}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex items-center gap-1 ${t.side === "long" ? "text-primary" : "text-destructive"}`}>
                        {t.side === "long" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {t.side}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        t.outcome === "win" ? "bg-primary/15 text-primary" :
                        t.outcome === "loss" ? "bg-destructive/15 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>{t.outcome}</span>
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${(t.pnl ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                      {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${Number(t.pnl).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">{t.rr ?? "—"}</td>
                    <td className="py-2 px-2 text-xs text-muted-foreground hidden md:table-cell">
                      {formatDistanceToNow(new Date(t.opened_at), { addSuffix: true })}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive p-1" aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Journal;
