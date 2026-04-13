import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Star, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { bettingSites as initialSites, type BettingSite } from "@/data/bettingSites";
import { Badge } from "@/components/ui/badge";

const emptyForm = {
  name: "", slug: "", logo: "🟢", rating: 8, bonus: "", sports: "",
  features: "", min_deposit: "", withdrawal_speed: "", license: "", url: "", warning: "",
};

const BettingSitesAdmin = () => {
  const [sites, setSites] = useState<BettingSite[]>(initialSites);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BettingSite | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (s: BettingSite) => {
    setEditing(s);
    setForm({
      name: s.name, slug: s.slug, logo: s.logo, rating: s.rating, bonus: s.bonus,
      sports: s.sports.join(", "), features: s.features.join(", "),
      min_deposit: s.min_deposit, withdrawal_speed: s.withdrawal_speed,
      license: s.license, url: s.url, warning: s.warning || "",
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.slug) { toast.error("Name and slug required"); return; }
    const site: BettingSite = {
      id: editing?.id || String(Date.now()),
      name: form.name, slug: form.slug, logo: form.logo, rating: Number(form.rating),
      bonus: form.bonus,
      sports: form.sports.split(",").map(s => s.trim()).filter(Boolean),
      features: form.features.split(",").map(s => s.trim()).filter(Boolean),
      min_deposit: form.min_deposit, withdrawal_speed: form.withdrawal_speed,
      license: form.license, url: form.url,
      warning: form.warning || undefined,
    };
    if (editing) {
      setSites(prev => prev.map(s => s.id === editing.id ? site : s));
      toast.success("Betting site updated");
    } else {
      setSites(prev => [site, ...prev]);
      toast.success("Betting site added");
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this betting site?")) return;
    setSites(prev => prev.filter(s => s.id !== id));
    toast.success("Deleted");
  };

  const filtered = sites.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Betting Sites</h2>
          <p className="text-sm text-muted-foreground">{sites.length} sites listed</p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Site</Button>
      </div>

      <Input placeholder="Search betting sites..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Bonus</TableHead>
              <TableHead>Warning</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{s.logo}</span>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">/{s.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span className="font-bold text-sm">{s.rating}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-xs">
                    <Shield className="w-3 h-3" /> {s.license}
                  </div>
                </TableCell>
                <TableCell className="text-xs max-w-[150px] truncate">{s.bonus}</TableCell>
                <TableCell>
                  {s.warning ? (
                    <Badge variant="destructive" className="text-[10px]">
                      <AlertTriangle className="w-3 h-3 mr-0.5" /> Warning
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No betting sites</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground italic mt-4">
        Currently using local state. Full DB CRUD available once betting_sites table is created.
      </p>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Betting Site" : "Add Betting Site"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Logo Emoji</Label><Input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
              <div><Label>Rating (0-10)</Label><Input type="number" min={0} max={10} step={0.1} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Welcome Bonus</Label><Input value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} placeholder="e.g. Up to $30 in Bet Credits" /></div>
            <div><Label>License</Label><Input value={form.license} onChange={e => setForm({ ...form, license: e.target.value })} placeholder="e.g. UK Gambling Commission" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Min Deposit</Label><Input value={form.min_deposit} onChange={e => setForm({ ...form, min_deposit: e.target.value })} /></div>
              <div><Label>Withdrawal Speed</Label><Input value={form.withdrawal_speed} onChange={e => setForm({ ...form, withdrawal_speed: e.target.value })} /></div>
            </div>
            <div><Label>Sports (comma-separated)</Label><Input value={form.sports} onChange={e => setForm({ ...form, sports: e.target.value })} placeholder="football, cricket, basketball" /></div>
            <div><Label>Features (comma-separated)</Label><Input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder="Live Streaming, Cash Out, Bet Builder" /></div>
            <div><Label>URL</Label><Input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} /></div>
            <div><Label>Warning (optional)</Label><Textarea value={form.warning} onChange={e => setForm({ ...form, warning: e.target.value })} placeholder="Risk warning for users..." rows={2} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BettingSitesAdmin;
