import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";

interface Broker {
  id: string;
  name: string;
  slug: string;
  type: string;
  tags: string[];
  regulation: string[];
  score: number;
  avg_spread: string;
  leverage: string;
  min_deposit: string;
  stars: number;
  review_count: number;
  complaints: number;
  badge: string;
  logo_url: string | null;
  status: string;
  created_at: string;
}

const emptyBroker = {
  name: "", slug: "", type: "forex", tags: [] as string[], regulation: [] as string[],
  score: 0, avg_spread: "0", leverage: "1:100", min_deposit: "$0",
  stars: 0, review_count: 0, complaints: 0, badge: "none", logo_url: "", status: "draft",
};

const BrokersAdmin = () => {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Broker | null>(null);
  const [form, setForm] = useState(emptyBroker);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchBrokers = async () => {
    const { data } = await supabase.from("brokers").select("*").order("created_at", { ascending: false });
    if (data) setBrokers(data as Broker[]);
  };

  useEffect(() => { fetchBrokers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyBroker); setModalOpen(true); };
  const openEdit = (b: Broker) => {
    setEditing(b);
    setForm({ ...b, logo_url: b.logo_url || "", tags: b.tags || [], regulation: b.regulation || [] });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      score: Number(form.score),
      stars: Number(form.stars),
      review_count: Number(form.review_count),
      complaints: Number(form.complaints),
      tags: typeof form.tags === "string" ? (form.tags as string).split(",").map(s => s.trim()) : form.tags,
      regulation: typeof form.regulation === "string" ? (form.regulation as string).split(",").map(s => s.trim()) : form.regulation,
    };

    const typedPayload = { ...payload, status: payload.status as "draft" | "pending" | "published" | "rejected" };
    if (editing) {
      const { error } = await supabase.from("brokers").update(typedPayload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "brokers", editing.id, editing, typedPayload);
      toast.success("Broker updated");
    } else {
      const { data: created, error } = await supabase.from("brokers").insert(typedPayload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("broker", created.id, user.id);
        await logAuditAction(user.id, "create", "brokers", created.id, null, typedPayload);
      }
      toast.success("Broker created");
    }
    setModalOpen(false);
    fetchBrokers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broker?")) return;
    await supabase.from("brokers").delete().eq("id", id);
    toast.success("Deleted");
    fetchBrokers();
  };

  const filtered = useMemo(() => {
    let result = brokers.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
    return filterByDateRange(result, "created_at", fromDate, toDate);
  }, [brokers, search, fromDate, toDate]);

  const handleExport = () => {
    exportToCSV(filtered.map(b => ({
      name: b.name, type: b.type, score: b.score, status: b.status,
      date: formatDate(b.created_at),
    })), [
      { key: "name", label: "Name" }, { key: "type", label: "Type" },
      { key: "score", label: "Score" }, { key: "status", label: "Status" }, { key: "date", label: "Date" },
    ], "brokers-export");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Brokers</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Broker</Button>
      </div>
      <Input placeholder="Search brokers..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <AdminTableToolbar fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onExport={handleExport} />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell>{b.type}</TableCell>
                <TableCell>{b.score}</TableCell>
                <TableCell><StatusBadge status={b.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No brokers found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Broker" : "Add Broker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="forex">Forex</SelectItem>
                    <SelectItem value="crypto">Crypto</SelectItem>
                    <SelectItem value="prop">Prop</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Badge</Label>
                <Select value={form.badge} onValueChange={v => setForm({...form, badge: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Score</Label><Input type="number" step="0.1" value={form.score} onChange={e => setForm({...form, score: +e.target.value})} /></div>
              <div><Label>Stars</Label><Input type="number" step="0.1" value={form.stars} onChange={e => setForm({...form, stars: +e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Avg Spread</Label><Input value={form.avg_spread} onChange={e => setForm({...form, avg_spread: e.target.value})} /></div>
              <div><Label>Leverage</Label><Input value={form.leverage} onChange={e => setForm({...form, leverage: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({...form, min_deposit: e.target.value})} /></div>
              <div><Label>Logo URL</Label><Input value={form.logo_url || ""} onChange={e => setForm({...form, logo_url: e.target.value})} /></div>
            </div>
            <div><Label>Tags (comma-separated)</Label><Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm({...form, tags: e.target.value.split(",").map(s => s.trim())})} /></div>
            <div><Label>Regulation (comma-separated)</Label><Input value={Array.isArray(form.regulation) ? form.regulation.join(", ") : form.regulation} onChange={e => setForm({...form, regulation: e.target.value.split(",").map(s => s.trim())})} /></div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
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

export default BrokersAdmin;
