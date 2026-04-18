import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Shield, ShieldCheck, ArrowUpCircle, Calendar, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import CancelPremiumDialog from "@/components/portal/CancelPremiumDialog";

type Tier = "basic" | "verified" | "featured";

interface Props {
  portalType: "broker" | "signal" | "betting";
}

const TIER_BENEFITS: Record<Tier, { title: string; icon: typeof Shield; color: string; perks: string[] }> = {
  basic: {
    title: "Basic",
    icon: Shield,
    color: "text-muted-foreground",
    perks: [
      "Public listing visible to all users",
      "View incoming reviews & complaints",
      "Read-only dashboard access",
    ],
  },
  verified: {
    title: "Verified Partner",
    icon: ShieldCheck,
    color: "text-blue-400",
    perks: [
      "Everything in Basic, plus:",
      "Edit your profile content",
      "Reply to user reviews",
      "React to reviews with emojis",
      "Track read/unread review status",
      "Verified badge on your listing",
    ],
  },
  featured: {
    title: "Featured Partner",
    icon: Crown,
    color: "text-amber-400",
    perks: [
      "Everything in Verified, plus:",
      "Featured placement on homepage",
      "Search result priority",
      "Featured badge & golden border",
      "Full analytics dashboard",
      "Dedicated account manager",
    ],
  },
};

const Subscription = ({ portalType }: Props) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [contextName, setContextName] = useState<string>("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [contact, setContact] = useState({ email: "", phone: "" });

  const tier: Tier = (profile?.tier as Tier) || "basic";
  const isPaid = tier === "verified" || tier === "featured";
  const config = TIER_BENEFITS[tier];
  const TierIcon = config.icon;
  const nextTier: Tier = tier === "basic" ? "verified" : "featured";

  const tableName = portalType === "broker" ? "broker_profiles" : portalType === "signal" ? "signal_profiles" : "betting_profiles";
  const senderRole = portalType === "broker" ? "broker" : portalType === "signal" ? "signal_provider" : "betting_site";

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase.from(tableName).select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (data) {
        setProfile(data);
        // resolve context name
        if (portalType === "broker" && (data as any).broker_id) {
          const { data: b } = await supabase.from("brokers").select("name").eq("id", (data as any).broker_id).maybeSingle();
          if (b) setContextName(b.name);
        } else if (portalType === "signal" && (data as any).signal_group_id) {
          const { data: g } = await supabase.from("signal_groups").select("name").eq("id", (data as any).signal_group_id).maybeSingle();
          if (g) setContextName(g.name);
        } else if (portalType === "betting") {
          setContextName((data as any).site_name || "");
        }
      }
    };
    fetch();
  }, [user, tableName, portalType]);

  const handleUpgrade = async () => {
    if (!user || !profile) return;
    const profileId = portalType === "broker" ? profile.broker_id
      : portalType === "signal" ? profile.signal_group_id
      : profile.id;
    const { error } = await supabase.from("tier_upgrades").insert({
      profile_type: portalType,
      profile_id: profileId,
      requested_by: user.id,
      current_tier: tier,
      requested_tier: nextTier,
      contact_info: contact,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Upgrade request submitted! We'll reach out within 24 hours.");
    setUpgradeOpen(false);
    setContact({ email: "", phone: "" });
  };

  const sinceDate = profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";

  if (!profile) {
    return (
      <div className="hud-scanline text-center py-16 text-muted-foreground">
        <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p className="font-mono text-sm">NO PROFILE LINKED TO YOUR ACCOUNT</p>
      </div>
    );
  }

  return (
    <div className="hud-scanline space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="hud-badge">SUBSCRIPTION</div>
        <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">
          Subscription & Tier
        </h2>
      </div>

      {/* Current Tier card */}
      <div className={`hud-card p-6 ${tier === "featured" ? "border-amber-500/30 bg-amber-500/5" : tier === "verified" ? "border-blue-500/20 bg-blue-500/5" : "border-border/50"}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${tier === "featured" ? "border-amber-500/40 bg-amber-500/10" : tier === "verified" ? "border-blue-500/40 bg-blue-500/10" : "border-border bg-muted/30"}`}>
              <TierIcon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Current Tier</p>
              <p className={`text-xl font-bold font-['Barlow_Condensed'] uppercase ${config.color}`}>{config.title}</p>
            </div>
          </div>
          <BrokerTierBadge tier={tier} size="lg" />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
          <Calendar className="w-3 h-3" />
          Active since {sinceDate}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-primary">What's included</p>
          <ul className="space-y-1.5">
            {config.perks.map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-foreground">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upgrade card */}
      {tier !== "featured" && (
        <div className="hud-card p-6 border-amber-500/20">
          <div className="flex items-center gap-3 mb-3">
            <ArrowUpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">Upgrade to {TIER_BENEFITS[nextTier].title}</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-4">
            Unlock more visibility and tools. Our team will reach out to discuss pricing & onboarding.
          </p>
          <ul className="space-y-1.5 mb-5">
            {TIER_BENEFITS[nextTier].perks.slice(1).map((perk, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-mono text-foreground/80">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button onClick={() => setUpgradeOpen(true)} className="font-mono text-xs">
            <ArrowUpCircle className="w-4 h-4 mr-1" /> REQUEST UPGRADE
          </Button>
        </div>
      )}

      {/* Cancel Premium card */}
      {isPaid && (
        <div className="hud-card p-6 border-destructive/20">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <h3 className="text-lg font-bold font-['Barlow_Condensed'] uppercase tracking-wide">Cancel Premium</h3>
          </div>
          <p className="text-xs text-muted-foreground font-mono mb-4">
            Want to downgrade or cancel? Submit a request and our team will get in touch within 24 hours to confirm.
          </p>
          <Button variant="outline" onClick={() => setCancelOpen(true)} className="font-mono text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
            <XCircle className="w-4 h-4 mr-1" /> CANCEL SUBSCRIPTION
          </Button>
        </div>
      )}

      {/* Upgrade dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Request Tier Upgrade</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground mb-3 font-mono">
            From <BrokerTierBadge tier={tier} /> to <BrokerTierBadge tier={nextTier} />
          </p>
          <div className="space-y-3">
            <div><Label className="font-mono text-xs">Contact Email</Label><Input type="email" value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} placeholder="you@example.com" /></div>
            <div><Label className="font-mono text-xs">Phone</Label><Input type="tel" value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} placeholder="+1 555 0100" /></div>
            <Button onClick={handleUpgrade} className="w-full font-mono">SUBMIT UPGRADE REQUEST</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CancelPremiumDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        currentTier={tier}
        senderRole={senderRole}
        contextName={contextName}
      />
    </div>
  );
};

export default Subscription;
