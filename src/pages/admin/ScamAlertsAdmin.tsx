import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { ImageUpload } from "@/components/admin/ImageUpload";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getFullYear()).slice(-2)}`;
};

interface ScamAlert {
  id: string; title: string; description: string; severity: string; status: string; created_at: string;
  story?: string | null;
  is_repeat_offender?: boolean;
  show_full_report?: boolean;
  full_report?: string | null;
  broker_id?: string | null;
}

interface BrokerOption { id: string; name: string; }

interface FormState {
  title: string; description: string; severity: string; status: string;
  story: string;
  is_repeat_offender: boolean;
  show_full_report: boolean;
  full_report: string;
  broker_id: string; // "" === none
}

const empty: FormState = {
  title: "", description: "", severity: "medium", status: "draft", story: "",
  is_repeat_offender: false, show_full_report: false, full_report: "", broker_id: "",
};

const ScamAlertsAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ScamAlert[]>([]);
  const [brokers, setBrokers] = useState<BrokerOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ScamAlert | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => filterByDateRange(items, "created_at", fromDate, toDate), [items, fromDate, toDate]);

  const handleExport = () => {
    exportToCSV(filtered.map(s => ({
      title: s.title, severity: s.severity, status: s.status,
      date: formatDate(s.created_at),
    })), [
      { key: "title", label: "Title" }, { key: "severity", label: "Severity" },
      { key: "status", label: "Status" }, { key: "date", label: "Date" },
    ], "scam-alerts-export");
  };

  const fetchData = async () => {
    const [{ data: alertsData }, { data: brokersData }] = await Promise.all([
      supabase.from("scam_alerts").select("*").order("created_at", { ascending: false }),
      supabase.from("brokers").select("id, name").order("name", { ascending: true }),
    ]);
    if (alertsData) setItems(alertsData as unknown as ScamAlert[]);
    if (brokersData) setBrokers(brokersData as BrokerOption[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s: ScamAlert) => {
    setEditing(s);
    setForm({
      title: s.title || "",
      description: s.description || "",
      severity: s.severity || "medium",
      status: s.status || "draft",
      story: s.story || "",
      is_repeat_offender: !!s.is_repeat_offender,
      show_full_report: !!s.show_full_report,
      full_report: s.full_report || "",
      broker_id: s.broker_id || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      severity: form.severity,
      status: form.status as "draft" | "pending" | "published" | "rejected",
      story: form.story,
      is_repeat_offender: form.is_repeat_offender,
      show_full_report: form.show_full_report,
      full_report: form.full_report,
      broker_id: form.broker_id || null,
    };
    if (editing) {
      const { error } = await supabase.from("scam_alerts").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "scam_alerts", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("scam_alerts").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("scam_alert", created.id, user.id);
        await logAuditAction(user.id, "create", "scam_alerts", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("scam_alerts").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Scam Alerts</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Alert</Button>
      </div>
      <AdminTableToolbar fromDate={fromDate} toDate={toDate} onFromChange={setFromDate} onToChange={setToDate} onExport={handleExport} />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.title}</TableCell>
                <TableCell className={s.severity === "high" ? "text-destructive" : "text-accent"}>{s.severity}</TableCell>
                <TableCell className="text-[10px] font-mono space-x-1">
                  {s.is_repeat_offender && <span className="px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/30">REPEAT</span>}
                  {s.show_full_report && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">REPORT</span>}
                </TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell className="text-sm font-semibold text-foreground">{formatDate(s.created_at)}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No scam alerts</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Alert" : "Add Alert"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Short Description (card teaser)</Label><Textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>

            <div>
              <Label>Story / Summary (shown on detail page)</Label>
              <Textarea rows={4} value={form.story} onChange={e => setForm({...form, story: e.target.value})} placeholder="Short investigation summary." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={v => setForm({...form, severity: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
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
            </div>

            <div>
              <Label>Linked Broker (optional)</Label>
              <Select value={form.broker_id || "__none__"} onValueChange={v => setForm({...form, broker_id: v === "__none__" ? "" : v})}>
                <SelectTrigger><SelectValue placeholder="No broker linked" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {brokers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">If linked, the investigation report appears on the broker's profile too.</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Switch checked={form.is_repeat_offender} onCheckedChange={v => setForm({...form, is_repeat_offender: v})} />
              <Label>Mark as REPEAT OFFENDER (red tag)</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.show_full_report} onCheckedChange={v => setForm({...form, show_full_report: v})} />
              <Label>Publish Full Investigation Report</Label>
            </div>

            <div>
              <Label>Full Investigation Report</Label>
              <Textarea rows={8} value={form.full_report} onChange={e => setForm({...form, full_report: e.target.value})} placeholder="Long-form investigation. Rendered with red highlights when 'Publish Full Report' is on." />
            </div>

            <ImageUpload value="" onChange={() => {}} bucket="media" folder="scams" maxSizeMB={5} label="Evidence Image (optional, separate upload)" accept="image/png,image/jpeg,image/webp" />

            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScamAlertsAdmin;
