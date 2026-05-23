import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import { exportToCSV } from "@/lib/adminExport";
import { Download } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Switch } from "@/components/ui/switch";
import { LongReviewEditor, emptyLREditor, buildLongReview, parseLongReview, type LREditorState } from "@/components/admin/LongReviewEditor";

const formatDate = (d: string) => {
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getFullYear()).slice(-2)}`;
};

interface AccountType { name: string; min_deposit: string; spread: string; leverage: string; commission: string; }
interface PaymentMethodDetail { method: string; min: string; processing: string; fee: string; }

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
  payment_method_details: PaymentMethodDetail[];
  website_url: string;
  support_email: string;
  support_phone: string;
  show_on_homepage: boolean;
  homepage_position: number | null;
  license_number: string;
  withdrawal_time: string;
  withdrawal_fee: string;
  warning_note: string;
}

const emptyBroker = {
  name: "", slug: "", type: "forex", tags: [] as string[], regulation: [] as string[],
  score: 0, avg_spread: "0", leverage: "1:100", min_deposit: "$0",
  stars: 0, review_count: 0, complaints: 0, badge: "none", logo_url: "", status: "draft",
  description: "", founded_year: null as number | null, headquarters: "",
  pros: [] as string[], cons: [] as string[],
  payment_methods: [] as string[], platforms: [] as string[],
  account_types: [] as AccountType[],
  payment_method_details: [] as PaymentMethodDetail[],
  website_url: "", support_email: "", support_phone: "",
  show_on_homepage: false, homepage_position: null as number | null,
  license_number: "", withdrawal_time: "", withdrawal_fee: "", warning_note: "",
  promo_code: "", promo_label: "", affiliate_url: "",
  naft_verified: false,
};

const BrokersAdmin = () => {
  const { user } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Broker | null>(null);
  const [form, setForm] = useState<typeof emptyBroker>(emptyBroker);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [longReview, setLongReview] = useState<LREditorState>(emptyLREditor);

  const fetchBrokers = async () => {
    const { data } = await supabase.from("brokers").select("*").order("created_at", { ascending: false });
    if (data) setBrokers(data as any);
  };

  useEffect(() => { fetchBrokers(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyBroker); setLongReview(emptyLREditor); setModalOpen(true); };
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
      account_types: Array.isArray(b.account_types)
        ? b.account_types.map((at: any) => ({ leverage: "", ...at }))
        : [],
      payment_method_details: Array.isArray((b as any).payment_method_details)
        ? (b as any).payment_method_details.map((p: any) => ({ method: "", min: "", processing: "", fee: "", ...p }))
        : [],
      description: b.description || "",
      headquarters: b.headquarters || "",
      website_url: b.website_url || "",
      support_email: b.support_email || "",
      support_phone: b.support_phone || "",
      founded_year: b.founded_year ?? null,
      show_on_homepage: (b as any).show_on_homepage ?? false,
      homepage_position: (b as any).homepage_position ?? null,
      license_number: (b as any).license_number || "",
      withdrawal_time: (b as any).withdrawal_time || "",
      withdrawal_fee: (b as any).withdrawal_fee || "",
      warning_note: (b as any).warning_note || "",
      promo_code: (b as any).promo_code || "",
      promo_label: (b as any).promo_label || "",
      affiliate_url: (b as any).affiliate_url || "",
      naft_verified: (b as any).naft_verified ?? false,
    });
    setLongReview(parseLongReview((b as any).long_review));
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
      payment_method_details: form.payment_method_details,
      status: form.status as "draft" | "pending" | "published" | "rejected",
      show_on_homepage: !!form.show_on_homepage,
      homepage_position: form.show_on_homepage && form.homepage_position
        ? Number(form.homepage_position)
        : null,
      long_review: buildLongReview(longReview),
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
    return brokers.filter(b => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      return true;
    });
  }, [brokers, search, typeFilter, statusFilter]);

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
  const addAccountType = () => setForm({ ...form, account_types: [...form.account_types, { name: "", min_deposit: "", spread: "", leverage: "", commission: "" }] });
  const updateAccountType = (i: number, field: keyof AccountType, value: string) => {
    const updated = [...form.account_types];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, account_types: updated });
  };
  const removeAccountType = (i: number) => setForm({ ...form, account_types: form.account_types.filter((_, idx) => idx !== i) });

  // Payment method details editor
  const addPaymentDetail = () => setForm({ ...form, payment_method_details: [...form.payment_method_details, { method: "", min: "", processing: "", fee: "" }] });
  const updatePaymentDetail = (i: number, field: keyof PaymentMethodDetail, value: string) => {
    const updated = [...form.payment_method_details];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, payment_method_details: updated });
  };
  const removePaymentDetail = (i: number) => setForm({ ...form, payment_method_details: form.payment_method_details.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Brokers</h2>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Broker</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search brokers..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="forex">Forex</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="binary">Binary</SelectItem>
            <SelectItem value="ecn">ECN</SelectItem>
            <SelectItem value="prop-firm">Prop Firm</SelectItem>
            <SelectItem value="scam-watch">Scam Watch</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs font-mono text-muted-foreground">{filtered.length} of {brokers.length}</span>
        <Button variant="outline" size="sm" className="ml-auto" onClick={handleExport}>
          <Download className="w-4 h-4 mr-1" /> Download Excel
        </Button>
      </div>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 flex flex-col gap-0">
          <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0 sticky top-0 bg-background z-10">
            <DialogTitle>{editing ? "Edit Broker" : "Add Broker"}</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave}>{editing ? "Update" : "Create"}</Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="basics" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-4 grid grid-cols-6 w-auto">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="funding">Funding</TabsTrigger>
              <TabsTrigger value="long-review">Long Review</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* BASICS */}
              <TabsContent value="basics" className="mt-0 space-y-5">
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                    <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Founded Year</Label><Input type="number" value={form.founded_year ?? ""} onChange={e => setForm({...form, founded_year: e.target.value ? +e.target.value : null})} /></div>
                    <div className="col-span-2"><Label>Headquarters</Label><Input value={form.headquarters} onChange={e => setForm({...form, headquarters: e.target.value})} placeholder="London, UK" /></div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <ImageUpload value={form.logo_url || ""} onChange={url => setForm({...form, logo_url: url})} bucket="logos" folder="brokers" maxSizeMB={2} label="Broker Logo" />
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div><Label>Tags (comma-separated)</Label><Input value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags} onChange={e => setForm({...form, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} /></div>
                  <div><Label>Regulation (comma-separated)</Label><Input value={Array.isArray(form.regulation) ? form.regulation.join(", ") : form.regulation} onChange={e => setForm({...form, regulation: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="FCA, CySEC, License #SD185" /></div>
                </div>
              </TabsContent>

              {/* TRADING */}
              <TabsContent value="trading" className="mt-0 space-y-5">
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Score</Label><Input type="number" step="0.1" value={form.score} onChange={e => setForm({...form, score: +e.target.value})} /></div>
                    <div><Label>Stars</Label><Input type="number" step="0.1" value={form.stars} onChange={e => setForm({...form, stars: +e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Avg Spread</Label><Input value={form.avg_spread} onChange={e => setForm({...form, avg_spread: e.target.value})} /></div>
                    <div><Label>Leverage</Label><Input value={form.leverage} onChange={e => setForm({...form, leverage: e.target.value})} /></div>
                    <div><Label>Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({...form, min_deposit: e.target.value})} /></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="rounded-lg border border-border p-4">
                    <Label>Pros (one per line)</Label>
                    <Textarea rows={5} className="mt-2" value={form.pros.join("\n")} onChange={e => setForm({...form, pros: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})} placeholder="Regulated by tier-1 authorities&#10;Competitive spreads&#10;Fast withdrawals" />
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <Label>Cons (one per line)</Label>
                    <Textarea rows={5} className="mt-2" value={form.cons.join("\n")} onChange={e => setForm({...form, cons: e.target.value.split("\n").map(s => s.trim()).filter(Boolean)})} placeholder="Inactivity fees&#10;Limited crypto selection" />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <Label>Platforms (comma-separated)</Label>
                  <Input className="mt-2" value={form.platforms.join(", ")} onChange={e => setForm({...form, platforms: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="MT4, MT5, Web Trader, cTrader" />
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base">Account Types</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Used in the public Account Types table.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addAccountType}><Plus className="w-3 h-3 mr-1" /> Add row</Button>
                  </div>
                  {form.account_types.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded">No account types added yet.</p>}
                  <div className="space-y-3">
                    {form.account_types.map((at, i) => (
                      <div key={i} className="rounded border border-border bg-muted/30 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">#{i + 1} {at.name || "Account"}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => removeAccountType(i)}><X className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <div><Label className="text-xs">Name</Label><Input placeholder="Standard" value={at.name} onChange={e => updateAccountType(i, "name", e.target.value)} /></div>
                          <div><Label className="text-xs">Min Deposit</Label><Input placeholder="$10" value={at.min_deposit} onChange={e => updateAccountType(i, "min_deposit", e.target.value)} /></div>
                          <div><Label className="text-xs">Spread</Label><Input placeholder="1.0" value={at.spread} onChange={e => updateAccountType(i, "spread", e.target.value)} /></div>
                          <div><Label className="text-xs">Leverage</Label><Input placeholder="1:500" value={(at as any).leverage || ""} onChange={e => updateAccountType(i, "leverage", e.target.value)} /></div>
                          <div><Label className="text-xs">Commission</Label><Input placeholder="No Commission" value={at.commission} onChange={e => updateAccountType(i, "commission", e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* FUNDING */}
              <TabsContent value="funding" className="mt-0 space-y-5">
                <div className="rounded-lg border border-border p-4">
                  <Label>Payment Methods (comma-separated)</Label>
                  <Input className="mt-2" value={form.payment_methods.join(", ")} onChange={e => setForm({...form, payment_methods: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Bank Transfer, Credit Card, Crypto, E-wallets" />
                  <p className="text-xs text-muted-foreground mt-2">Quick list. Use the detailed table below to populate the public Deposits & Withdrawals table.</p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-base">Payment Method Details</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Powers the Deposits & Withdrawals table on the broker page.</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={addPaymentDetail}><Plus className="w-3 h-3 mr-1" /> Add row</Button>
                  </div>
                  {form.payment_method_details.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center border border-dashed border-border rounded">No payment methods added yet.</p>}
                  <div className="space-y-3">
                    {form.payment_method_details.map((p, i) => (
                      <div key={i} className="rounded border border-border bg-muted/30 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">#{i + 1} {p.method || "Method"}</span>
                          <Button type="button" size="sm" variant="ghost" onClick={() => removePaymentDetail(i)}><X className="w-4 h-4 text-destructive" /></Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div><Label className="text-xs">Method</Label><Input placeholder="Bank Transfer" value={p.method} onChange={e => updatePaymentDetail(i, "method", e.target.value)} /></div>
                          <div><Label className="text-xs">Min</Label><Input placeholder="$50" value={p.min} onChange={e => updatePaymentDetail(i, "min", e.target.value)} /></div>
                          <div><Label className="text-xs">Processing</Label><Input placeholder="1-3 days" value={p.processing} onChange={e => updatePaymentDetail(i, "processing", e.target.value)} /></div>
                          <div><Label className="text-xs">Fee</Label><Input placeholder="Free" value={p.fee} onChange={e => updatePaymentDetail(i, "fee", e.target.value)} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* LONG REVIEW */}
              <TabsContent value="long-review" className="mt-0">
                <LongReviewEditor value={longReview} onChange={setLongReview} />
              </TabsContent>

              {/* DISPLAY */}
              <TabsContent value="display" className="mt-0 space-y-5">
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <Label className="text-base">Contact & Links</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label className="text-xs">Website URL</Label><Input value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://" /></div>
                    <div><Label className="text-xs">Support Email</Label><Input value={form.support_email} onChange={e => setForm({...form, support_email: e.target.value})} /></div>
                    <div><Label className="text-xs">Support Phone</Label><Input value={form.support_phone} onChange={e => setForm({...form, support_phone: e.target.value})} /></div>
                  </div>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
                  <div>
                    <Label className="text-foreground text-base">Promo Offer (Card Rail)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Shown on broker cards as a one-tap copy-code + claim strip. Leave blank to hide.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label className="text-xs">Offer Label</Label><Input value={form.promo_label} onChange={e => setForm({...form, promo_label: e.target.value})} placeholder="25% OFF / $50 BONUS" /></div>
                    <div><Label className="text-xs">Promo Code</Label><Input value={form.promo_code} onChange={e => setForm({...form, promo_code: e.target.value})} placeholder="NAFT25" /></div>
                    <div><Label className="text-xs">Affiliate URL</Label><Input value={form.affiliate_url} onChange={e => setForm({...form, affiliate_url: e.target.value})} placeholder="https://" /></div>
                  </div>
                </div>

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground text-base">Show on Homepage</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Feature this broker in the homepage Trust Hub (max 6 brokers).</p>
                    </div>
                    <Switch checked={form.show_on_homepage} onCheckedChange={(checked) => setForm({ ...form, show_on_homepage: checked })} />
                  </div>
                  {form.show_on_homepage && (
                    <div>
                      <Label>Homepage Position (1–6)</Label>
                      <Input type="number" min={1} max={6} value={form.homepage_position ?? ""} onChange={(e) => setForm({ ...form, homepage_position: e.target.value ? +e.target.value : null })} placeholder="Leave empty for auto-order" />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* STATUS */}
              <TabsContent value="status" className="mt-0 space-y-5">
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <Label className="text-base">Publication Status</Label>
                  <p className="text-xs text-muted-foreground">Controls whether the broker appears publicly. New brokers go through approval queue.</p>
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
                <Button onClick={handleSave} className="w-full">{editing ? "Update Broker" : "Create Broker"}</Button>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrokersAdmin;
