import { useEffect, useState } from "react";
import { Trophy, Plus, Trash2, Edit, Loader2, ChevronRight, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Cat = { id: string; year: number; slug: string; title: string; description: string; display_order: number; is_active: boolean; voting_starts_at: string | null; voting_ends_at: string | null; nominations_open: boolean };
type Nom = { id: string; category_id: string; broker_id: string | null; title: string; subtitle: string; logo_url: string; vote_count: number; display_order: number };
type Broker = { id: string; name: string; logo_url: string | null; slug: string };

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AwardsAdmin() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [cats, setCats] = useState<Cat[]>([]);
  const [noms, setNoms] = useState<Nom[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // category dialog
  const [catOpen, setCatOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Cat | null>(null);
  const [catForm, setCatForm] = useState({ title: "", description: "", display_order: 0, is_active: true, voting_starts_at: "", voting_ends_at: "", nominations_open: false });

  // nominee dialog
  const [nomOpen, setNomOpen] = useState(false);
  const [nomForm, setNomForm] = useState({ broker_id: "", title: "", subtitle: "", logo_url: "" });

  useEffect(() => { load(); }, [year]);

  async function load() {
    setLoading(true);
    const [catsRes, brokersRes] = await Promise.all([
      supabase.from("award_categories").select("*").eq("year", year).order("display_order"),
      supabase.from("brokers").select("id, name, logo_url, slug").eq("status", "published").order("score", { ascending: false }).limit(200),
    ]);
    const catList = (catsRes.data || []) as Cat[];
    setCats(catList);
    setBrokers((brokersRes.data || []) as Broker[]);
    if (catList.length) {
      const { data: nomData } = await supabase.from("award_nominees").select("*")
        .in("category_id", catList.map(c => c.id))
        .order("display_order");
      setNoms((nomData || []) as Nom[]);
      if (!activeCat || !catList.find(c => c.id === activeCat)) setActiveCat(catList[0].id);
    } else {
      setNoms([]); setActiveCat(null);
    }
    setLoading(false);
  }

  function openCatDialog(cat?: Cat) {
    setEditingCat(cat || null);
    const toLocal = (iso: string | null) => iso ? new Date(iso).toISOString().slice(0, 16) : "";
    setCatForm(cat
      ? { title: cat.title, description: cat.description || "", display_order: cat.display_order, is_active: cat.is_active, voting_starts_at: toLocal(cat.voting_starts_at), voting_ends_at: toLocal(cat.voting_ends_at), nominations_open: cat.nominations_open }
      : { title: "", description: "", display_order: cats.length, is_active: true, voting_starts_at: "", voting_ends_at: "", nominations_open: false });
    setCatOpen(true);
  }

  async function saveCat() {
    if (!catForm.title.trim()) return toast.error("Title required");
    const payload = {
      year, title: catForm.title.trim(), description: catForm.description,
      display_order: catForm.display_order, is_active: catForm.is_active,
      slug: slugify(catForm.title.trim()),
      voting_starts_at: catForm.voting_starts_at ? new Date(catForm.voting_starts_at).toISOString() : null,
      voting_ends_at: catForm.voting_ends_at ? new Date(catForm.voting_ends_at).toISOString() : null,
      nominations_open: catForm.nominations_open,
    };
    const { error } = editingCat
      ? await supabase.from("award_categories").update(payload).eq("id", editingCat.id)
      : await supabase.from("award_categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingCat ? "Category updated" : "Category created");
    setCatOpen(false); load();
  }

  async function deleteCat(c: Cat) {
    if (!confirm(`Delete "${c.title}" and all its nominees + votes?`)) return;
    const { error } = await supabase.from("award_categories").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  function openNomDialog() {
    setNomForm({ broker_id: "", title: "", subtitle: "", logo_url: "" });
    setNomOpen(true);
  }

  async function saveNom() {
    if (!activeCat) return;
    let payload: any = { category_id: activeCat, display_order: currentNoms.length };
    if (nomForm.broker_id) {
      const b = brokers.find(x => x.id === nomForm.broker_id);
      if (!b) return toast.error("Broker not found");
      payload = { ...payload, broker_id: b.id, title: b.name, subtitle: nomForm.subtitle || "", logo_url: b.logo_url || "" };
    } else {
      if (!nomForm.title.trim()) return toast.error("Pick a broker or enter a title");
      payload = { ...payload, title: nomForm.title.trim(), subtitle: nomForm.subtitle, logo_url: nomForm.logo_url };
    }
    const { error } = await supabase.from("award_nominees").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Nominee added");
    setNomOpen(false); load();
  }

  async function deleteNom(n: Nom) {
    if (!confirm(`Remove "${n.title}" and all its votes?`)) return;
    const { error } = await supabase.from("award_nominees").delete().eq("id", n.id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  }

  const currentNoms = noms.filter(n => n.category_id === activeCat);
  const currentCat = cats.find(c => c.id === activeCat);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-foreground">NAFT Awards</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage categories, nominees, and live vote counts.</p>
        </div>
        <div className="flex gap-2">
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => openCatDialog()} className="gap-2"><Plus className="w-4 h-4" /> New Category</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : cats.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground mb-3">No categories for {year}.</p>
          <Button onClick={() => openCatDialog()}>Create the first one</Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Categories sidebar */}
          <div className="space-y-1">
            {cats.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition flex items-center justify-between gap-2 ${
                  activeCat === c.id ? "bg-primary/10 border-primary/40 text-foreground" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate text-sm">{c.title}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">
                    {noms.filter(n => n.category_id === c.id).length} nominees · {c.is_active ? "live" : "hidden"}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-50" />
              </button>
            ))}
          </div>

          {/* Nominees panel */}
          <div className="space-y-4">
            {currentCat && (
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <h2 className="font-display font-bold text-xl text-foreground">{currentCat.title}</h2>
                  <p className="text-xs text-muted-foreground">{currentCat.description || "No description"}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openCatDialog(currentCat)}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => deleteCat(currentCat)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" onClick={openNomDialog} className="gap-1"><Plus className="w-3.5 h-3.5" /> Nominee</Button>
                </div>
              </div>
            )}

            {currentNoms.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl text-sm text-muted-foreground">
                No nominees yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {currentNoms.map(n => (
                  <div key={n.id} className="p-4 rounded-lg border border-border bg-card flex items-start gap-3">
                    {n.logo_url ? (
                      <img src={n.logo_url} alt={n.title} className="w-10 h-10 rounded object-contain bg-muted/40 p-1" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-primary font-bold">{n.title.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{n.title}</div>
                      {n.subtitle && <div className="text-xs text-muted-foreground truncate">{n.subtitle}</div>}
                      <div className="text-xs font-mono text-primary mt-1">{n.vote_count} votes</div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteNom(n)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCat ? "Edit" : "New"} Category — {year}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title</Label><Input value={catForm.title} onChange={e => setCatForm({ ...catForm, title: e.target.value })} placeholder="e.g. Best Overall Broker" /></div>
            <div><Label>Description</Label><Textarea rows={3} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Display Order</Label><Input type="number" value={catForm.display_order} onChange={e => setCatForm({ ...catForm, display_order: Number(e.target.value) })} /></div>
              <div className="flex items-end gap-2"><Switch checked={catForm.is_active} onCheckedChange={v => setCatForm({ ...catForm, is_active: v })} /><Label>Active</Label></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Voting opens</Label><Input type="datetime-local" value={catForm.voting_starts_at} onChange={e => setCatForm({ ...catForm, voting_starts_at: e.target.value })} /></div>
              <div><Label>Voting closes</Label><Input type="datetime-local" value={catForm.voting_ends_at} onChange={e => setCatForm({ ...catForm, voting_ends_at: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={catForm.nominations_open} onCheckedChange={v => setCatForm({ ...catForm, nominations_open: v })} /><Label>Open community nominations</Label></div>
            <div className="hidden">
            </div>
            <Button onClick={saveCat} className="w-full gap-2"><Save className="w-4 h-4" /> Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nominee dialog */}
      <Dialog open={nomOpen} onOpenChange={setNomOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Nominee</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Pick existing broker</Label>
              <Select value={nomForm.broker_id} onValueChange={v => setNomForm({ ...nomForm, broker_id: v })}>
                <SelectTrigger><SelectValue placeholder="— or enter custom below —" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {brokers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-center text-muted-foreground">— or —</div>
            <div><Label>Custom title</Label><Input value={nomForm.title} onChange={e => setNomForm({ ...nomForm, title: e.target.value })} disabled={!!nomForm.broker_id} /></div>
            <div><Label>Subtitle (optional)</Label><Input value={nomForm.subtitle} onChange={e => setNomForm({ ...nomForm, subtitle: e.target.value })} placeholder="e.g. Tagline or category" /></div>
            <div><Label>Logo URL (optional)</Label><Input value={nomForm.logo_url} onChange={e => setNomForm({ ...nomForm, logo_url: e.target.value })} disabled={!!nomForm.broker_id} /></div>
            <Button onClick={saveNom} className="w-full gap-2"><Save className="w-4 h-4" /> Add Nominee</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
