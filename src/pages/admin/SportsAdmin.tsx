import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, Ban, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";

interface SportsPrediction {
  id: string; title: string; sport: string; team_a: string; team_b: string;
  match_date: string; prediction: string; confidence: number; analyst_note: string;
  result: string; is_correct: boolean | null; status: string;
}

const empty = {
  title: "", sport: "football", team_a: "", team_b: "", match_date: "",
  prediction: "", confidence: 70, analyst_note: "", result: "", is_correct: null as boolean | null, status: "draft",
};

const SportsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SportsPrediction[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SportsPrediction | null>(null);
  const [form, setForm] = useState(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("sports_predictions").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as SportsPrediction[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (p: SportsPrediction) => {
    setEditing(p);
    setForm({ ...p, analyst_note: p.analyst_note || "", result: p.result || "", match_date: p.match_date ? p.match_date.slice(0, 16) : "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      confidence: Number(form.confidence),
      is_correct: form.is_correct,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("sports_predictions").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "sports_predictions", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("sports_predictions").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("sports_prediction", created.id, user.id);
        await logAuditAction(user.id, "create", "sports_predictions", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this prediction?")) return;
    await supabase.from("sports_predictions").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

  const settle = async (p: SportsPrediction, outcome: "win" | "loss" | "void") => {
    const score = (scoreInputs[p.id] || p.result || "").trim();
    if ((outcome === "win" || outcome === "loss") && !score) {
      toast.error("Enter score first (e.g. 2-1)");
      return;
    }
    const payload =
      outcome === "void"
        ? { result: "VOID", is_correct: null }
        : { result: score, is_correct: outcome === "win" };
    const { error } = await supabase.from("sports_predictions").update(payload).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    if (user) await logAuditAction(user.id, "settle", "sports_predictions", p.id, { result: p.result, is_correct: p.is_correct }, payload);
    toast.success(outcome === "void" ? "Marked as void" : outcome === "win" ? "Marked as WIN" : "Marked as LOSS");
    setScoreInputs(s => ({ ...s, [p.id]: "" }));
    fetchData();
  };

  const resetSettle = async (p: SportsPrediction) => {
    const { error } = await supabase.from("sports_predictions").update({ result: "", is_correct: null }).eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    if (user) await logAuditAction(user.id, "reset", "sports_predictions", p.id, { result: p.result, is_correct: p.is_correct }, { result: "", is_correct: null });
    toast.success("Reset");
    fetchData();
  };

  const filtered = items.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const renderSettleCell = (p: SportsPrediction) => {
    const matchPast = new Date(p.match_date).getTime() < Date.now();
    // Already settled
    if (p.is_correct === true) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bull/15 text-bull">✅ WIN {p.result}</span>
          <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => resetSettle(p)}><RotateCcw className="w-3 h-3" /></Button>
        </div>
      );
    }
    if (p.is_correct === false) {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-bear/15 text-bear">❌ LOSS {p.result}</span>
          <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => resetSettle(p)}><RotateCcw className="w-3 h-3" /></Button>
        </div>
      );
    }
    if (p.result === "VOID") {
      return (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-muted-foreground">⊘ VOID</span>
          <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => resetSettle(p)}><RotateCcw className="w-3 h-3" /></Button>
        </div>
      );
    }
    if (!matchPast) {
      return <span className="text-xs text-muted-foreground">—</span>;
    }
    // Past + unsettled — show controls
    return (
      <div className="flex items-center gap-1">
        <Input
          value={scoreInputs[p.id] ?? ""}
          onChange={e => setScoreInputs(s => ({ ...s, [p.id]: e.target.value }))}
          placeholder="2-1"
          className="h-7 w-16 text-xs font-mono"
        />
        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-bull hover:bg-bull/10" onClick={() => settle(p, "win")} title="Win"><Check className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-bear hover:bg-bear/10" onClick={() => settle(p, "loss")} title="Loss"><X className="w-3.5 h-3.5" /></Button>
        <Button size="sm" variant="ghost" className="h-7 px-1.5 text-muted-foreground" onClick={() => settle(p, "void")} title="Void"><Ban className="w-3.5 h-3.5" /></Button>
      </div>
    );
  };

  const [aiSettling, setAiSettling] = useState(false);
  const runAiSettle = async () => {
    if (aiSettling) return;
    setAiSettling(true);
    toast.loading("AI scanning past matches...", { id: "ai-settle" });
    try {
      const { data, error } = await supabase.functions.invoke("ai-settle-sports-predictions", { body: { limit: 25 } });
      if (error) throw error;
      toast.success(
        `Settled ${data?.settled ?? 0} · Uncertain ${data?.uncertain ?? 0} · Unparseable ${data?.unparseable ?? 0}`,
        { id: "ai-settle", description: `Scanned ${data?.scanned ?? 0}. Re-run to process more.` },
      );
      fetchData();
    } catch (e: any) {
      toast.error("AI settle failed", { id: "ai-settle", description: e?.message ?? "Try again" });
    } finally {
      setAiSettling(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-foreground">Sports Predictions</h2>
        <div className="flex items-center gap-2">
          <Button onClick={runAiSettle} disabled={aiSettling} size="sm" variant="outline">
            <Sparkles className={`w-4 h-4 mr-1 ${aiSettling ? "animate-pulse" : ""}`} />
            {aiSettling ? "AI settling..." : "AI Auto-Settle Past Picks"}
          </Button>
          <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Prediction</Button>
        </div>
      </div>
      <Input placeholder="Search predictions..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Match</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Pick</TableHead>
              <TableHead>Conf.</TableHead>
              <TableHead className="min-w-[200px]">Settle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium max-w-[200px] truncate text-xs">{p.team_a} <span className="text-muted-foreground">vs</span> {p.team_b}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{new Date(p.match_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell className="font-mono text-xs">{p.prediction}</TableCell>
                <TableCell className="text-xs">{p.confidence}%</TableCell>
                <TableCell>{renderSettleCell(p)}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No predictions</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Prediction" : "Add Prediction"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Sport</Label>
                <Select value={form.sport} onValueChange={v => setForm({...form, sport: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="football">Football</SelectItem><SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem><SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="mma">MMA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Match Date</Label><Input type="datetime-local" value={form.match_date} onChange={e => setForm({...form, match_date: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Team A</Label><Input value={form.team_a} onChange={e => setForm({...form, team_a: e.target.value})} /></div>
              <div><Label>Team B</Label><Input value={form.team_b} onChange={e => setForm({...form, team_b: e.target.value})} /></div>
            </div>
            <div><Label>Prediction</Label><Input value={form.prediction} onChange={e => setForm({...form, prediction: e.target.value})} placeholder="e.g. Team A Win" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Confidence (%)</Label><Input type="number" min={0} max={100} value={form.confidence} onChange={e => setForm({...form, confidence: +e.target.value})} /></div>
              <div><Label>Result</Label>
                <Select value={form.is_correct === null ? "pending" : form.is_correct ? "correct" : "incorrect"} onValueChange={v => setForm({...form, is_correct: v === "pending" ? null : v === "correct"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem><SelectItem value="correct">Correct ✅</SelectItem><SelectItem value="incorrect">Incorrect ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Result Text</Label><Input value={form.result} onChange={e => setForm({...form, result: e.target.value})} placeholder="e.g. 2-1" /></div>
            </div>
            <div><Label>Analyst Note</Label><Textarea rows={3} value={form.analyst_note} onChange={e => setForm({...form, analyst_note: e.target.value})} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem><SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportsAdmin;
