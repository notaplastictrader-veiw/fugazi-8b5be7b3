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

interface CalendarEvent {
  id: string; title: string; description: string; event_date: string; event_time: string | null;
  impact: string; currency: string; category: string; actual_value: string;
  forecast_value: string; previous_value: string; status: string;
}

const empty = {
  title: "", description: "", event_date: "", event_time: "", impact: "medium",
  currency: "", category: "economic", actual_value: "", forecast_value: "", previous_value: "", status: "draft",
};

const CalendarAdmin = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(empty);

  const fetchData = async () => {
    const { data } = await supabase.from("calendar_events").select("*").order("event_date", { ascending: false });
    if (data) setItems(data as CalendarEvent[]);
  };
  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e: CalendarEvent) => {
    setEditing(e);
    setForm({ ...e, event_time: e.event_time || "", description: e.description || "", currency: e.currency || "", actual_value: e.actual_value || "", forecast_value: e.forecast_value || "", previous_value: e.previous_value || "" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      event_time: form.event_time || null,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };
    if (editing) {
      const { error } = await supabase.from("calendar_events").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "calendar_events", editing.id, editing, payload);
    } else {
      const { data: created, error } = await supabase.from("calendar_events").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("calendar_event", created.id, user.id);
        await logAuditAction(user.id, "create", "calendar_events", created.id, null, payload);
      }
    }
    toast.success(editing ? "Updated" : "Created");
    setModalOpen(false); fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("Deleted"); fetchData();
  };

  const filtered = items.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Calendar Events</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Event</Button>
      </div>
      <Input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-medium max-w-[180px] truncate">{e.title}</TableCell>
                <TableCell>{e.event_date}</TableCell>
                <TableCell className={e.impact === "high" ? "text-destructive font-semibold" : ""}>{e.impact}</TableCell>
                <TableCell>{e.currency}</TableCell>
                <TableCell><StatusBadge status={e.status} /></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No events</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Event Date</Label><Input type="date" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} /></div>
              <div><Label>Event Time</Label><Input type="time" value={form.event_time} onChange={e => setForm({...form, event_time: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Impact</Label>
                <Select value={form.impact} onValueChange={v => setForm({...form, impact: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Currency</Label><Input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} placeholder="e.g. USD" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Forecast</Label><Input value={form.forecast_value} onChange={e => setForm({...form, forecast_value: e.target.value})} /></div>
              <div><Label>Previous</Label><Input value={form.previous_value} onChange={e => setForm({...form, previous_value: e.target.value})} /></div>
              <div><Label>Actual</Label><Input value={form.actual_value} onChange={e => setForm({...form, actual_value: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economic">Economic</SelectItem><SelectItem value="earnings">Earnings</SelectItem><SelectItem value="political">Political</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarAdmin;
