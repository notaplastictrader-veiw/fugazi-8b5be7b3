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
import { Plus, Pencil, Trash2, Check, X, Ban, RotateCcw } from "lucide-react";
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

  const filtered = items.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Sports Predictions</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Prediction</Button>
      </div>
      <Input placeholder="Search predictions..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-medium max-w-[150px] truncate">{p.title}</TableCell>
                <TableCell className="capitalize">{p.sport}</TableCell>
                <TableCell>{p.team_a} vs {p.team_b}</TableCell>
                <TableCell>{p.confidence}%</TableCell>
                <TableCell>{p.is_correct === true ? "✅" : p.is_correct === false ? "❌" : "—"}</TableCell>
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
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Prediction" : "Add Prediction"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Team A</Label><Input value={form.team_a} onChange={e => setForm({...form, team_a: e.target.value})} /></div>
              <div><Label>Team B</Label><Input value={form.team_b} onChange={e => setForm({...form, team_b: e.target.value})} /></div>
            </div>
            <div><Label>Prediction</Label><Input value={form.prediction} onChange={e => setForm({...form, prediction: e.target.value})} placeholder="e.g. Team A Win" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Confidence (%)</Label><Input type="number" min={0} max={100} value={form.confidence} onChange={e => setForm({...form, confidence: +e.target.value})} /></div>
              <div><Label>Result</Label>
                <Select value={form.is_correct === null ? "pending" : form.is_correct ? "correct" : "incorrect"} onValueChange={v => setForm({...form, is_correct: v === "pending" ? null : v === "correct"})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem><SelectItem value="correct">Correct ✅</SelectItem><SelectItem value="incorrect">Incorrect ❌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Result Text</Label><Input value={form.result} onChange={e => setForm({...form, result: e.target.value})} placeholder="e.g. 2-1" /></div>
            <div><Label>Analyst Note</Label><Textarea rows={2} value={form.analyst_note} onChange={e => setForm({...form, analyst_note: e.target.value})} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem><SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem><SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportsAdmin;
