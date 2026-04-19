import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Calendar, ExternalLink } from "lucide-react";

interface Campaign {
  id: string;
  placement_slug: string;
  sponsor_name: string;
  sponsor_logo_url: string;
  headline: string;
  subtext: string;
  cta_label: string;
  cta_url: string;
  image_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  display_order: number;
}

interface Placement {
  slug: string;
  title: string;
}

const emptyForm: Partial<Campaign> = {
  placement_slug: "",
  sponsor_name: "",
  sponsor_logo_url: "",
  headline: "",
  subtext: "",
  cta_label: "Learn More",
  cta_url: "",
  image_url: "",
  is_active: true,
  display_order: 0,
};

const AdvertiseCampaignsAdmin = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Campaign>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, p] = await Promise.all([
      supabase.from("ad_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("ad_placements").select("slug, title").order("display_order"),
    ]);
    setCampaigns((c.data as Campaign[]) || []);
    setPlacements((p.data as Placement[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ ...emptyForm, placement_slug: placements[0]?.slug || "" });
    setEditingId(null);
    setOpen(true);
  };

  const openEdit = (c: Campaign) => {
    setForm({
      ...c,
      start_date: c.start_date?.slice(0, 10),
      end_date: c.end_date?.slice(0, 10),
    });
    setEditingId(c.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.placement_slug || !form.sponsor_name || !form.headline) {
      toast.error("Placement, sponsor name and headline are required");
      return;
    }
    const payload: any = {
      placement_slug: form.placement_slug,
      sponsor_name: form.sponsor_name,
      sponsor_logo_url: form.sponsor_logo_url || "",
      headline: form.headline,
      subtext: form.subtext || "",
      cta_label: form.cta_label || "Learn More",
      cta_url: form.cta_url || "#",
      image_url: form.image_url || "",
      is_active: form.is_active ?? true,
      display_order: form.display_order ?? 0,
    };
    if (form.start_date) payload.start_date = new Date(form.start_date).toISOString();
    if (form.end_date) payload.end_date = new Date(form.end_date).toISOString();

    const { error } = editingId
      ? await supabase.from("ad_campaigns").update(payload).eq("id", editingId)
      : await supabase.from("ad_campaigns").insert(payload);

    if (error) return toast.error(error.message);
    toast.success(editingId ? "Campaign updated" : "Campaign created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this campaign? This sponsor will disappear from the site.")) return;
    const { error } = await supabase.from("ad_campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleActive = async (c: Campaign) => {
    const { error } = await supabase.from("ad_campaigns").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    load();
  };

  const isLive = (c: Campaign) => {
    const now = new Date();
    return c.is_active && new Date(c.start_date) <= now && new Date(c.end_date) >= now;
  };

  const placementTitle = (slug: string) =>
    placements.find((p) => p.slug === slug)?.title || slug;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-extrabold">Live Sponsor Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Active paid placements rendering on the live site. Tied to placements catalog.
          </p>
        </div>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1.5" />New Campaign</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : campaigns.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-muted-foreground">No campaigns yet. Create one to start showing sponsors on the site.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => (
            <Card key={c.id} className="p-4 flex items-start gap-4">
              {c.sponsor_logo_url && (
                <img src={c.sponsor_logo_url} alt={c.sponsor_name} className="w-14 h-14 rounded-lg object-cover border border-border shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-base font-bold">{c.sponsor_name}</h3>
                  <Badge variant="outline" className="text-[10px]">{placementTitle(c.placement_slug)}</Badge>
                  {isLive(c) ? (
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">● LIVE</Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-foreground font-medium line-clamp-1">{c.headline}</p>
                {c.subtext && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.subtext}</p>}
                <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                    {new Date(c.start_date).toLocaleDateString()} → {new Date(c.end_date).toLocaleDateString()}
                  </span>
                  {c.cta_url && c.cta_url !== "#" && (
                    <a href={c.cta_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                      <ExternalLink className="w-3 h-3" /> {c.cta_label}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(c.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Campaign" : "New Campaign"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Placement *</Label>
              <Select
                value={form.placement_slug}
                onValueChange={(v) => setForm({ ...form, placement_slug: v })}
              >
                <SelectTrigger><SelectValue placeholder="Choose placement" /></SelectTrigger>
                <SelectContent>
                  {placements.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Sponsor Name *</Label>
                <Input value={form.sponsor_name || ""} onChange={(e) => setForm({ ...form, sponsor_name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Sponsor Logo URL</Label>
                <Input value={form.sponsor_logo_url || ""} onChange={(e) => setForm({ ...form, sponsor_logo_url: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Headline *</Label>
              <Input value={form.headline || ""} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Subtext</Label>
              <Textarea rows={2} value={form.subtext || ""} onChange={(e) => setForm({ ...form, subtext: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>CTA Label</Label>
                <Input value={form.cta_label || ""} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>CTA URL</Label>
                <Input value={form.cta_url || ""} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date || ""} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input type="date" value={form.end_date || ""} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Display Order (higher = priority)</Label>
                <Input type="number" value={form.display_order ?? 0} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.is_active ?? true} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? "Save changes" : "Create campaign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvertiseCampaignsAdmin;
