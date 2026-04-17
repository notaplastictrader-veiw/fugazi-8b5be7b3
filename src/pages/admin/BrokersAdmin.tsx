import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import AdminTableToolbar from "@/components/admin/AdminTableToolbar";
import { exportToCSV, filterByDateRange } from "@/lib/adminExport";
import { ImageUpload } from "@/components/admin/ImageUpload";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getFullYear()).slice(-2)}`;
};

interface AccountType { name: string; min_deposit: string; spread: string; commission: string; }

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
  description: string;
  founded_year: number | null;
  headquarters: string;
  pros: string[];
  cons: string[];
  payment_methods: string[];
  platforms: string[];
  account_types: AccountType[];
  website_url: string;
  support_email: string;
  support_phone: string;
}

const emptyBroker = {
  name: "", slug: "", type: "forex", tags: [] as string[], regulation: [] as string[],
  score: 0, avg_spread: "0", leverage: "1:100", min_deposit: "$0",
  stars: 0, review_count: 0, complaints: 0, badge: "none", logo_url: "", status: "draft",
  description: "", founded_year: null as number | null, headquarters: "",
  pros: [] as string[], cons: [] as string[],
  payment_methods: [] as string[], platforms: [] as string[],
  account_types: [] as AccountType[],
  website_url: "", support_email: "", support_phone: "",
};

const BrokersAdmin = () => {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Broker | null>(null);
  const [form, setForm] = useState<typeof emptyBroker>(emptyBroker);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchBrokers = async () => {
    const { data } = await supabase.from("brokers").select("*").order("created_at", { ascending: false });
    if (data) setBrokers(data as any);
  };

  useEffect(() => { fetchBrokers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyBroker); setModalOpen(true); };
  const openEdit = (b: Broker) => {
    setEditing(b);
    setForm({
      ...emptyBroker,
      ...b,
      logo_url: b.logo_url || "",
      tags: b.tags || [],
      regulation: b.regulation || [],
      pros: b.pros || [],
      cons: b.cons || [],
      payment_methods: b.payment_methods || [],
      platforms: b.platforms || [],
      account_types: Array.isArray(b.account_types) ? b.account_types : [],
      description: b.description || "",
      headquarters: b.headquarters || "",
      website_url: b.website_url || "",
      support_email: b.support_email || "",
      support_phone: b.support_phone || "",
      founded_year: b.founded_year ?? null,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const payload: any = {
      ...form,
      score: Number(form.score),
      stars: Number(form.stars),
      review_count: Number(form.review_count),
      complaints: Number(form.complaints),
      founded_year: form.founded_year ? Number(form.founded_year) : null,
      account_types: form.account_types,
      status: form.status as "draft" | "pending" | "published" | "rejected",
    };

    if (editing) {
      const { error } = await supabase.from("brokers").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      if (user) await logAuditAction(user.id, "update", "brokers", editing.id, editing, payload);
      toast.success("Broker updated");
    } else {
      const { data: created, error } = await supabase.from("brokers").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return; }
      if (user && created) {
        await submitToApprovalQueue("broker", created.id, user.id);
        await logAuditAction(user.id, "create", "brokers", created.id, null, payload);
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

  // Account-types editor
  const addAccountType = () => setForm({ ...form, account_types: [...form.account_types, { name: "", min_deposit: "", spread: "", commission: "" }] });
  const updateAccountType = (i: number, field: keyof AccountType, value: string) => {
    const updated = [...form.account_types];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, account_types: updated });
  };
  const removeAccountType = (i: number) => setForm({ ...form, account_types: form.account_types.filter((_, idx) => idx !== i) });

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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Broker" : "Add Broker"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
            </div>
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

            <div><Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description shown on broker page" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><Label>Founded Year</Label><Input type="number" value={form.founded_year ?? ""} onChange={e => setForm({...form, founded_year: e.target.value ? +e.target.value : null})} /></div>
              <div className="col-span-2"><Label>Headquarters</Label><Input value={form.headquarters} onChange={e => setForm({...form, headquarters: e.target.value})} placeholder="London, UK" /></div>
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
              <div></div>
            </div>
            <ImageUpload value={form.logo_url || ""} onChange={url => setForm({...form, logo_url: url})} bucket="logos" folder="brokers" maxSizeMB={2} label="Broker Logo" />

            <div><Label>Tags (comma-separated)</Label><Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm({...form, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>
            <div><Label>Regulation (comma-separated)</Label><Input value={Array.isArray(form.regulation) ? form.regulation.join(", ") : form.regulation} onChange={e => setForm({...form, regulation: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>

            <div><Label>Pros (one per line)</Label>
              <Textarea rows={4} value={form.pros.join("\n")} onChange={e => setForm({...form, pros: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})} placeholder="Regulated by tier-1 authorities&#10;Competitive spreads&#10;Fast withdrawals" />
            </div>
            <div><Label>Cons (one per line)</Label>
              <Textarea rows={3} value={form.cons.join("\n")} onChange={e => setForm({...form, cons: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})} placeholder="Inactivity fees&#10;Limited crypto selection" />
            </div>

            <div><Label>Payment Methods (comma-separated)</Label>
              <Input value={form.payment_methods.join(", ")} onChange={e => setForm({...form, payment_methods: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Bank Transfer, Credit Card, Crypto, E-wallets" />
            </div>
            <div><Label>Platforms (comma-separated)</Label>
              <Input value={form.platforms.join(", ")} onChange={e => setForm({...form, platforms: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="MT4, MT5, Web Trader, cTrader" />
            </div>

            <div className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <Label>Account Types</Label>
                <Button type="button" size="sm" variant="outline" onClick={addAccountType}><Plus className="w-3 h-3 mr-1" /> Add</Button>
              </div>
              {form.account_types.length === 0 && <p className="text-xs text-muted-foreground">No account types added.</p>}
              <div className="space-y-2">
                {form.account_types.map((at, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-start">
                    <Input className="col-span-3" placeholder="Name (Standard)" value={at.name} onChange={e => updateAccountType(i, "name", e.target.value)} />
                    <Input className="col-span-3" placeholder="Min ($10)" value={at.min_deposit} onChange={e => updateAccountType(i, "min_deposit", e.target.value)} />
                    <Input className="col-span-3" placeholder="Spread (1.0 pip)" value={at.spread} onChange={e => updateAccountType(i, "spread", e.target.value)} />
                    <Input className="col-span-2" placeholder="Commission" value={at.commission} onChange={e => updateAccountType(i, "commission", e.target.value)} />
                    <Button type="button" size="sm" variant="ghost" className="col-span-1" onClick={() => removeAccountType(i)}><X className="w-4 h-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><Label>Website URL</Label><Input value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://" /></div>
              <div><Label>Support Email</Label><Input value={form.support_email} onChange={e => setForm({...form, support_email: e.target.value})} /></div>
              <div><Label>Support Phone</Label><Input value={form.support_phone} onChange={e => setForm({...form, support_phone: e.target.value})} /></div>
            </div>

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
