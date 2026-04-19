import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/adminExport";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  company_url: string | null;
  company_age: string | null;
  message: string;
  placement_slug: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "media_kit_sent", label: "Media Kit Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

const statusColor: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  new: "default",
  contacted: "secondary",
  media_kit_sent: "secondary",
  negotiating: "outline",
  won: "default",
  lost: "destructive",
};

const AdvertiseEnquiriesAdmin = () => {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    const { data } = await supabase
      .from("ad_enquiries").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Enquiry[]);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter(e => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) ||
             e.email.toLowerCase().includes(q) ||
             e.company.toLowerCase().includes(q);
    }
    return true;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("ad_enquiries").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Status updated");
    fetchData();
  };

  const openView = (e: Enquiry) => { setViewing(e); setNotes(e.admin_notes || ""); };

  const saveNotes = async () => {
    if (!viewing) return;
    const { error } = await supabase.from("ad_enquiries").update({ admin_notes: notes }).eq("id", viewing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Notes saved");
    setViewing(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    const { error } = await supabase.from("ad_enquiries").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    fetchData();
  };

  const exportCSV = () => {
    exportToCSV(filtered, [
      { key: "created_at", label: "Submitted" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "company", label: "Company" },
      { key: "company_url", label: "Website" },
      { key: "company_age", label: "Company Age" },
      { key: "placement_slug", label: "Placement" },
      { key: "status", label: "Status" },
      { key: "message", label: "Message" },
      { key: "admin_notes", label: "Admin Notes" },
    ], `advertise-enquiries-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Advertise Enquiries</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {items.length} enquiries</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search name, email, company…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Placement</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{e.company}</div>
                  {e.company_url && (
                    <a href={e.company_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                      {e.company_url}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.email}</div>
                </TableCell>
                <TableCell className="text-xs font-mono">
                  {e.placement_slug || <span className="italic text-muted-foreground">—</span>}
                </TableCell>
                <TableCell>
                  <Select value={e.status} onValueChange={(v) => updateStatus(e.id, v)}>
                    <SelectTrigger className="h-8 w-[150px]">
                      <Badge variant={statusColor[e.status] || "default"}>
                        {STATUS_OPTIONS.find(s => s.value === e.status)?.label || e.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" asChild>
                    <a href={`mailto:${e.email}`}><Mail className="w-4 h-4" /></a>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => openView(e)}><Eye className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No enquiries</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Enquiry Details</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label className="text-xs text-muted-foreground">Name</Label><div>{viewing.name}</div></div>
                <div><Label className="text-xs text-muted-foreground">Email</Label><div>{viewing.email}</div></div>
                <div><Label className="text-xs text-muted-foreground">Company</Label><div>{viewing.company}</div></div>
                <div><Label className="text-xs text-muted-foreground">Company Age</Label><div>{viewing.company_age || "—"}</div></div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Website</Label>
                  <div>{viewing.company_url ? <a href={viewing.company_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{viewing.company_url}</a> : "—"}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Interested in</Label>
                  <div className="font-mono text-xs">{viewing.placement_slug || "—"}</div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <div className="p-3 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap">{viewing.message}</div>
              </div>
              <div>
                <Label>Admin Notes (internal)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
                <Button onClick={saveNotes}>Save Notes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiseEnquiriesAdmin;
