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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";

interface Forecast {
  id: string; pair: string; direction: string; potential: string;
  reasoning: string; updated_label: string; category: string; status: string;
}

const empty = { pair: "", direction: "bullish", potential: "MED", reasoning: "", updated_label: "", category: "forex", status: "draft" };

const ForecastsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Forecast[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Forecast | null>(null);
  const [form, setForm] = useState(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("forecasts").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Forecast[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (f: Forecast) => { setEditing(f); setForm(f); setModalOpen(true); };

  const handleSave = async () => {
    const payload = { ...form, status: form.status as "draft" | "pending" | "published" | "rejected" };
    if (editing) {
      const { error } = await supabase.from("forecasts").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "forecasts", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("forecasts").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("forecast", created.id, user.id);
        await logAuditAction(user.id, "create", "forecasts", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("forecasts").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Forecasts</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Forecast</Button>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Potential</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.pair}</TableCell>
                <TableCell className={f.direction === "bullish" ? "text-primary" : "text-destructive"}>{f.direction}</TableCell>
                <TableCell>{f.potential}</TableCell>
                <TableCell>{f.category}</TableCell>
                <TableCell><StatusBadge status={f.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(f)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No forecasts</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Forecast" : "Add Forecast"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label>Pair</Label><Input value={form.pair} onChange={e => setForm({...form, pair: e.target.value})} /></div>
              <div><Label>Direction</Label>
                <Select value={form.direction} onValueChange={v => setForm({...form, direction: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="bullish">Bullish</SelectItem><SelectItem value="bearish">Bearish</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Potential</Label>
                <Select value={form.potential} onValueChange={v => setForm({...form, potential: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="HIGH">HIGH</SelectItem><SelectItem value="MED">MED</SelectItem><SelectItem value="LOW">LOW</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forex">Forex</SelectItem><SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem><SelectItem value="sports">Sports</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Updated Label</Label><Input value={form.updated_label} onChange={e => setForm({...form, updated_label: e.target.value})} placeholder="e.g. 2 hours ago" /></div>
            </div>
            <div><Label>Reasoning</Label><Textarea rows={5} value={form.reasoning} onChange={e => setForm({...form, reasoning: e.target.value})} /></div>
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

export default ForecastsAdmin;
