import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Lock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { submitToApprovalQueue, logAuditAction } from "@/lib/approvalQueue";
import ImageUpload from "@/components/admin/ImageUpload";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";

interface Props {
  portalType: "broker" | "signal" | "betting";
}

const splitCsv = (s: string) => s.split(",").map(x => x.trim()).filter(Boolean);
const joinCsv = (a?: string[] | null) => (a || []).join(", ");

const MyListing = ({ portalType }: Props) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [entity, setEntity] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  const tier = profile?.tier || "basic";
  const canEdit = tier === "verified" || tier === "featured";

  const profileTable = portalType === "broker" ? "broker_profiles" : portalType === "signal" ? "signal_profiles" : "betting_profiles";

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: p } = await supabase.from(profileTable).select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (!p) return;
      setProfile(p);

      if (portalType === "broker") {
        const { data: b } = await supabase.from("brokers").select("*").eq("id", (p as any).broker_id).maybeSingle();
        if (b) {
          setEntity(b);
          setForm({
            name: b.name || "",
            description: b.description || "",
            headquarters: b.headquarters || "",
            founded_year: b.founded_year ? String(b.founded_year) : "",
            website_url: b.website_url || "",
            support_email: b.support_email || "",
            support_phone: b.support_phone || "",
            avg_spread: b.avg_spread || "",
            leverage: b.leverage || "",
            min_deposit: b.min_deposit || "",
            logo_url: b.logo_url || "",
            pros: joinCsv(b.pros),
            cons: joinCsv(b.cons),
            platforms: joinCsv(b.platforms),
            payment_methods: joinCsv(b.payment_methods),
            regulation: joinCsv(b.regulation),
          });
        }
      } else if (portalType === "signal") {
        const { data: g } = await supabase.from("signal_groups").select("*").eq("id", (p as any).signal_group_id).maybeSingle();
        if (g) {
          setEntity(g);
          setForm({
            name: g.name || "",
            description: g.description || "",
            members: g.members || "",
            monthly_signals: g.monthly_signals || "",
            avg_rr: g.avg_rr || "",
            track_record: g.track_record || "",
            telegram_url: g.telegram_url || "",
            discord_url: g.discord_url || "",
            logo_url: g.logo_url || "",
          });
        }
      } else {
        // betting
        setEntity(p);
        setForm({
          site_name: (p as any).site_name || "",
          affiliate_url: (p as any).affiliate_url || "",
        });
      }
    };
    fetch();
  }, [user, portalType, profileTable]);

  const handleSave = async () => {
    if (!user || !entity) return;
    if (!canEdit) { toast.error("Upgrade to Verified to edit your listing"); return; }
    setSaving(true);
    try {
      if (portalType === "broker") {
        const payload: any = {
          name: form.name,
          description: form.description,
          headquarters: form.headquarters,
          founded_year: form.founded_year ? parseInt(form.founded_year, 10) || null : null,
          website_url: form.website_url,
          support_email: form.support_email,
          support_phone: form.support_phone,
          avg_spread: form.avg_spread,
          leverage: form.leverage,
          min_deposit: form.min_deposit,
          logo_url: form.logo_url,
          pros: splitCsv(form.pros || ""),
          cons: splitCsv(form.cons || ""),
          platforms: splitCsv(form.platforms || ""),
          payment_methods: splitCsv(form.payment_methods || ""),
          regulation: splitCsv(form.regulation || ""),
          status: "pending" as const,
        };
        const { error } = await supabase.from("brokers").update(payload).eq("id", entity.id);
        if (error) throw error;
        await submitToApprovalQueue("broker", entity.id, user.id);
        await logAuditAction(user.id, "update", "brokers", entity.id, entity, payload);
      } else if (portalType === "signal") {
        const payload: any = {
          name: form.name,
          description: form.description,
          members: form.members,
          monthly_signals: form.monthly_signals,
          avg_rr: form.avg_rr,
          track_record: form.track_record,
          telegram_url: form.telegram_url,
          discord_url: form.discord_url,
          logo_url: form.logo_url,
          status: "pending" as const,
        };
        const { error } = await supabase.from("signal_groups").update(payload).eq("id", entity.id);
        if (error) throw error;
        await submitToApprovalQueue("signal_group", entity.id, user.id);
      } else {
        const { error } = await supabase.from("betting_profiles").update({
          site_name: form.site_name,
          affiliate_url: form.affiliate_url,
        }).eq("id", entity.id);
        if (error) throw error;
      }
      toast.success("Changes submitted for review");
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    }
    setSaving(false);
  };

  if (!profile) {
    return (
      <div className="hud-scanline text-center py-16 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-mono text-sm">NO LISTING LINKED TO YOUR ACCOUNT</p>
      </div>
    );
  }

  return (
    <div className="hud-scanline space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="hud-badge">MY LISTING</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Edit My Listing</h2>
          <BrokerTierBadge tier={tier} size="md" />
        </div>
        {canEdit && (
          <Button onClick={handleSave} disabled={saving} className="font-mono text-xs">
            {saving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            SAVE & SUBMIT FOR REVIEW
          </Button>
        )}
      </div>

      {!canEdit && (
        <div className="hud-card p-4 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 flex-wrap">
            <Lock className="w-5 h-5 text-amber-400" />
            <p className="text-xs font-mono text-muted-foreground flex-1">
              <span className="text-amber-400 font-semibold">EDITING LOCKED</span> — Upgrade to Verified or Featured to edit your listing details.
            </p>
            <Button size="sm" className="font-mono text-xs" asChild>
              <a href={`/portal/${portalType}/upgrade`}>UPGRADE NOW</a>
            </Button>
          </div>
        </div>
      )}

      <div className={`hud-card p-6 ${!canEdit ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {portalType === "broker" && entity && (
            <>
              <Field label="Broker Name" value={form.name} onChange={v => setForm({...form, name: v})} />
              <Field label="Headquarters" value={form.headquarters} onChange={v => setForm({...form, headquarters: v})} />
              <Field label="Founded Year" value={form.founded_year} onChange={v => setForm({...form, founded_year: v})} />
              <Field label="Website URL" value={form.website_url} onChange={v => setForm({...form, website_url: v})} />
              <Field label="Support Email" value={form.support_email} onChange={v => setForm({...form, support_email: v})} />
              <Field label="Support Phone" value={form.support_phone} onChange={v => setForm({...form, support_phone: v})} />
              <Field label="Avg Spread" value={form.avg_spread} onChange={v => setForm({...form, avg_spread: v})} />
              <Field label="Leverage" value={form.leverage} onChange={v => setForm({...form, leverage: v})} />
              <Field label="Min Deposit" value={form.min_deposit} onChange={v => setForm({...form, min_deposit: v})} />
              <div className="md:col-span-2">
                <Label className="font-mono text-xs uppercase tracking-wider">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="mt-1.5" />
              </div>
              <Field label="Pros (comma-separated)" value={form.pros} onChange={v => setForm({...form, pros: v})} colSpan={2} />
              <Field label="Cons (comma-separated)" value={form.cons} onChange={v => setForm({...form, cons: v})} colSpan={2} />
              <Field label="Platforms (comma-separated)" value={form.platforms} onChange={v => setForm({...form, platforms: v})} colSpan={2} />
              <Field label="Payment Methods (comma-separated)" value={form.payment_methods} onChange={v => setForm({...form, payment_methods: v})} colSpan={2} />
              <Field label="Regulation (comma-separated)" value={form.regulation} onChange={v => setForm({...form, regulation: v})} colSpan={2} />
              <div className="md:col-span-2">
                <Label className="font-mono text-xs uppercase tracking-wider">Logo</Label>
                <ImageUpload value={form.logo_url} onChange={v => setForm({...form, logo_url: v})} bucket="logos" />
              </div>
            </>
          )}

          {portalType === "signal" && entity && (
            <>
              <Field label="Group Name" value={form.name} onChange={v => setForm({...form, name: v})} colSpan={2} />
              <Field label="Members" value={form.members} onChange={v => setForm({...form, members: v})} />
              <Field label="Monthly Signals" value={form.monthly_signals} onChange={v => setForm({...form, monthly_signals: v})} />
              <Field label="Avg R:R" value={form.avg_rr} onChange={v => setForm({...form, avg_rr: v})} />
              <Field label="Track Record" value={form.track_record} onChange={v => setForm({...form, track_record: v})} />
              <Field label="Telegram URL" value={form.telegram_url} onChange={v => setForm({...form, telegram_url: v})} />
              <Field label="Discord URL" value={form.discord_url} onChange={v => setForm({...form, discord_url: v})} />
              <div className="md:col-span-2">
                <Label className="font-mono text-xs uppercase tracking-wider">Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="mt-1.5" />
              </div>
              <div className="md:col-span-2">
                <Label className="font-mono text-xs uppercase tracking-wider">Logo</Label>
                <ImageUpload value={form.logo_url} onChange={v => setForm({...form, logo_url: v})} bucket="logos" />
              </div>
            </>
          )}

          {portalType === "betting" && entity && (
            <>
              <Field label="Site Name" value={form.site_name} onChange={v => setForm({...form, site_name: v})} colSpan={2} />
              <Field label="Affiliate URL" value={form.affiliate_url} onChange={v => setForm({...form, affiliate_url: v})} colSpan={2} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, colSpan = 1 }: { label: string; value: string; onChange: (v: string) => void; colSpan?: number }) => (
  <div className={colSpan === 2 ? "md:col-span-2" : ""}>
    <Label className="font-mono text-xs uppercase tracking-wider">{label}</Label>
    <Input value={value || ""} onChange={e => onChange(e.target.value)} className="mt-1.5" />
  </div>
);

export default MyListing;
