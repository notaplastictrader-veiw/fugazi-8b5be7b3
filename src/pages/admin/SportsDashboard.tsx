import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dices, Trophy, TrendingUp, Pencil, ArrowUpCircle, Lock, BarChart3, Crown, Shield } from "lucide-react";
import { toast } from "sonner";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import ContactAdminDialog from "@/components/portal/ContactAdminDialog";

const HudGauge = ({ value, label, icon: Icon }: { value: string | number; label: string; icon: any }) => (
  <div className="hud-stat p-4 flex flex-col items-center gap-2 hud-scanline">
    <div className="relative w-20 h-20 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-1 rounded-full border border-primary/10" />
      <div className="flex flex-col items-center">
        <Icon className="w-4 h-4 text-primary mb-1" />
        <span className="text-lg font-bold text-foreground font-mono">{value}</span>
      </div>
    </div>
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{label}</span>
  </div>
);

const SportsDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeContact, setUpgradeContact] = useState({ email: "", phone: "" });

  const tier = profile?.tier || "basic";
  const isVerified = tier === "verified" || tier === "featured";
  const isFeatured = tier === "featured";

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data } = await supabase.from("betting_profiles").select("*").eq("claimed_by", user.id).limit(1).maybeSingle();
      if (data) setProfile(data);
    };
    fetchData();
  }, [user]);

  const handleUpgradeRequest = async () => {
    if (!user || !profile) return;
    const nextTier = tier === "basic" ? "verified" : "featured";
    const { error } = await supabase.from("tier_upgrades").insert({
      profile_type: "betting",
      profile_id: profile.id,
      requested_by: user.id,
      current_tier: tier,
      requested_tier: nextTier,
      contact_info: upgradeContact,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Upgrade request submitted!");
    setUpgradeOpen(false);
  };

  const cards = [
    { label: "Site", value: profile?.site_name || "—", icon: Dices },
    { label: "Tier", value: tier.toUpperCase(), icon: Trophy },
    { label: "Verified", value: profile?.is_verified ? "Yes" : "No", icon: TrendingUp },
  ];

  return (
    <div className="hud-scanline">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="hud-badge">BETTING SITE</div>
          <h2 className="text-2xl font-bold text-foreground font-['Barlow_Condensed'] uppercase tracking-wide">Sports / Betting Dashboard</h2>
          {profile && <BrokerTierBadge tier={tier} size="md" />}
        </div>
        <div className="flex gap-2 flex-wrap">
          <ContactAdminDialog senderRole="betting_site" contextName={profile?.site_name} />
          {profile && tier !== "featured" && (
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-400 hover:border-amber-500/60 font-mono text-xs" onClick={() => setUpgradeOpen(true)}>
              <ArrowUpCircle className="w-3 h-3 mr-1" /> UPGRADE
            </Button>
          )}
          {profile && !isVerified && (
            <Button size="sm" variant="outline" disabled className="font-mono text-xs border-amber-500/20 text-amber-400/70 cursor-not-allowed">
              <Lock className="w-3 h-3 mr-1" /> EDIT (LOCKED)
            </Button>
          )}
        </div>
      </div>

      {tier === "basic" && profile && (
        <div className="hud-card p-4 mb-6 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400 font-mono">BASIC TIER — LIMITED ACCESS</p>
              <p className="text-xs text-muted-foreground font-mono">Upgrade to Verified to edit your listing & access full management tools.</p>
            </div>
            <Button size="sm" className="font-mono text-xs" onClick={() => setUpgradeOpen(true)}>UPGRADE NOW</Button>
          </div>
        </div>
      )}

      {isVerified && !isFeatured && (
        <div className="hud-card p-3 mb-6 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-3 flex-wrap">
            <Shield className="w-4 h-4 text-blue-400" />
            <p className="text-xs text-muted-foreground font-mono flex-1">
              <span className="text-blue-400 font-semibold">VERIFIED PARTNER</span> — Edit unlocked. Upgrade to Featured for homepage placement.
            </p>
            <Button size="sm" variant="outline" className="font-mono text-xs border-amber-500/30 text-amber-400" onClick={() => setUpgradeOpen(true)}>
              <Crown className="w-3 h-3 mr-1" /> GO FEATURED
            </Button>
          </div>
        </div>
      )}

      {isFeatured && (
        <div className="hud-card p-3 mb-6 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <Crown className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-mono text-muted-foreground">
              <span className="text-amber-400 font-semibold">FEATURED PARTNER</span> — Featured placement & search priority active.
            </p>
          </div>
        </div>
      )}

      {profile ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {cards.map(c => <HudGauge key={c.label} value={c.value} label={c.label} icon={c.icon} />)}
          </div>
          {isFeatured && (
            <div className="hud-card p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary uppercase tracking-widest">Analytics</span>
              </div>
              <p className="text-muted-foreground font-mono text-sm">Full analytics available for featured tier.</p>
            </div>
          )}
          {profile.account_manager_name && (
            <div className="hud-card p-4">
              <p className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Account Manager</p>
              <p className="font-mono text-sm">{profile.account_manager_name}</p>
              <p className="text-xs text-muted-foreground font-mono">{profile.account_manager_contact}</p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center">
          <Dices className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-mono text-sm">No betting site profile linked to your account.</p>
        </div>
      )}

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-['Barlow_Condensed'] uppercase">Request Tier Upgrade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="font-mono text-xs">Contact Email</Label><Input value={upgradeContact.email} onChange={e => setUpgradeContact({...upgradeContact, email: e.target.value})} /></div>
            <div><Label className="font-mono text-xs">Phone</Label><Input value={upgradeContact.phone} onChange={e => setUpgradeContact({...upgradeContact, phone: e.target.value})} /></div>
            <Button onClick={handleUpgradeRequest} className="w-full font-mono">SUBMIT UPGRADE REQUEST</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportsDashboard;
