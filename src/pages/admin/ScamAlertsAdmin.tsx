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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Alert" : "Add Alert"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-5">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4 mt-0">
                <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                <div><Label>Short Description <span className="text-xs text-muted-foreground font-normal">(card teaser)</span></Label><Textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label>Linked Broker <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                    <Select value={form.broker_id || "__none__"} onValueChange={v => setForm({...form, broker_id: v === "__none__" ? "" : v})}>
                      <SelectTrigger><SelectValue placeholder="No broker linked" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        {brokers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="report" className="space-y-4 mt-0">
                <div>
                  <Label>Story / Summary <span className="text-xs text-muted-foreground font-normal">(detail page)</span></Label>
                  <Textarea rows={5} value={form.story} onChange={e => setForm({...form, story: e.target.value})} placeholder="Short investigation summary." />
                </div>
                <div>
                  <Label>Full Investigation Report</Label>
                  <Textarea rows={10} value={form.full_report} onChange={e => setForm({...form, full_report: e.target.value})} placeholder="Long-form investigation. Rendered with red highlights when 'Publish Full Report' is on." />
                </div>
                <ImageUpload value="" onChange={() => {}} bucket="media" folder="scams" maxSizeMB={5} label="Evidence Image (optional, separate upload)" accept="image/png,image/jpeg,image/webp" />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-0">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Switch checked={form.is_repeat_offender} onCheckedChange={v => setForm({...form, is_repeat_offender: v})} />
                  <div>
                    <Label className="cursor-pointer">Repeat Offender</Label>
                    <p className="text-xs text-muted-foreground">Marks the alert with a red REPEAT OFFENDER tag.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Switch checked={form.show_full_report} onCheckedChange={v => setForm({...form, show_full_report: v})} />
                  <div>
                    <Label className="cursor-pointer">Publish Full Report</Label>
                    <p className="text-xs text-muted-foreground">Show the full investigation on the detail page.</p>
                  </div>
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
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScamAlertsAdmin;
