import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Building2, Upload, CheckCircle, Radio, Dices } from "lucide-react";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import { toast } from "sonner";
import { notifyAdmins } from "@/lib/notifyAdmins";

type ProfileType = "broker" | "signal" | "betting";

const BrokerClaimProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileType>("broker");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [docsUrl, setDocsUrl] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    if (activeTab === "broker") {
      const { data } = await supabase.from("brokers").select("id, name, slug, score, status").ilike("name", `%${query}%`).eq("status", "published").limit(10);
      setResults(data || []);
    } else if (activeTab === "signal") {
      const { data } = await supabase.from("signal_groups").select("id, name, win_rate, members, status").ilike("name", `%${query}%`).eq("status", "published").limit(10);
      setResults(data || []);
    } else {
      const { data } = await supabase.from("betting_profiles").select("id, site_name, slug, tier").ilike("site_name", `%${query}%`).limit(10);
      setResults(data || []);
    }
  };

  const handleClaim = async () => {
    if (!user || !selected) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("profile_claims").insert({
        profile_type: activeTab,
        profile_id: selected.id,
        claimed_by: user.id,
        documents_url: docsUrl || null,
        contact_info: { company, position, email: contactEmail, phone: contactPhone },
      } as any);
      if (error) throw error;
      toast.success("Claim submitted! Our team will review it shortly.");
      const entityName = selected[currentConfig.nameKey] || selected.name || selected.site_name || "Unknown";
      notifyAdmins(
        "New Profile Claim",
        `${company || "A user"} submitted a ${activeTab} claim for "${entityName}"`,
        "/admin/approvals"
      );
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  const resetSearch = () => {
    setSelected(null);
    setQuery("");
    setResults([]);
    setDocsUrl("");
    setCompany("");
    setPosition("");
    setContactEmail("");
    setContactPhone("");
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-mono">Please log in to claim a profile.</p>
          <Button onClick={() => navigate("/login/broker")} className="mt-4">Log In</Button>
        </div>
      </MainLayout>
    );
  }

  if (submitted) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-['Barlow_Condensed'] uppercase mb-2">Claim Submitted</h1>
          <p className="text-muted-foreground font-mono text-sm mb-6">
            Our admin team will review your documents and verify ownership. You'll receive a notification once approved.
          </p>
          <Button onClick={() => navigate("/admin")} variant="outline">Go to Dashboard</Button>
        </div>
      </MainLayout>
    );
  }

  const tabConfig: Record<ProfileType, { icon: any; label: string; nameKey: string }> = {
    broker: { icon: Building2, label: "Broker", nameKey: "name" },
    signal: { icon: Radio, label: "Signal Group", nameKey: "name" },
    betting: { icon: Dices, label: "Betting Site", nameKey: "site_name" },
  };

  const currentConfig = tabConfig[activeTab];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-2">Claim Your Profile</h1>
        <p className="text-muted-foreground font-mono text-sm mb-6">
          Search for your listing and submit verification documents to claim ownership.
        </p>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ProfileType); resetSearch(); }} className="mb-6">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="broker" className="font-mono text-xs gap-1"><Building2 className="w-3.5 h-3.5" /> Broker</TabsTrigger>
            <TabsTrigger value="signal" className="font-mono text-xs gap-1"><Radio className="w-3.5 h-3.5" /> Signal</TabsTrigger>
            <TabsTrigger value="betting" className="font-mono text-xs gap-1"><Dices className="w-3.5 h-3.5" /> Betting</TabsTrigger>
          </TabsList>
        </Tabs>

        {!selected ? (
          <>
            <div className="flex gap-2 mb-6">
              <Input
                placeholder={`Search ${currentConfig.label.toLowerCase()} by name...`}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}><Search className="w-4 h-4 mr-1" /> Search</Button>
            </div>
            <div className="space-y-2">
              {results.map(b => {
                const Icon = currentConfig.icon;
                const displayName = b[currentConfig.nameKey] || b.name || b.site_name;
                return (
                  <Card key={b.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelected(b)}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-semibold">{displayName}</p>
                          {b.slug && <p className="text-xs text-muted-foreground font-mono">/{b.slug}</p>}
                          {b.members && <p className="text-xs text-muted-foreground font-mono">{b.members} members</p>}
                        </div>
                      </div>
                      <BrokerTierBadge tier="basic" />
                    </CardContent>
                  </Card>
                );
              })}
              {results.length === 0 && query && (
                <p className="text-sm text-muted-foreground font-mono text-center py-4">No {currentConfig.label.toLowerCase()}s found. Try a different name.</p>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {(() => { const Icon = currentConfig.icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                Claiming: {selected[currentConfig.nameKey] || selected.name || selected.site_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-xs">Company Name</Label>
                  <Input placeholder="Your company name" value={company} onChange={e => setCompany(e.target.value)} />
                </div>
                <div>
                  <Label className="font-mono text-xs">Your Position</Label>
                  <Input placeholder="e.g. CEO, Manager" value={position} onChange={e => setPosition(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-xs">Contact Email</Label>
                  <Input type="email" placeholder="your@company.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
                <div>
                  <Label className="font-mono text-xs">Contact Phone</Label>
                  <Input type="tel" placeholder="+1 234 567 890" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="font-mono text-xs">Verification Documents URL</Label>
                <Input placeholder="Link to proof of ownership (Google Drive, Dropbox, etc.)" value={docsUrl} onChange={e => setDocsUrl(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Upload corporate registration, domain ownership proof, or official email screenshot</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleClaim} disabled={submitting} className="flex-1 font-mono">
                  <Upload className="w-4 h-4 mr-1" /> {submitting ? "Submitting..." : "Submit Claim"}
                </Button>
                <Button variant="outline" onClick={resetSearch}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default BrokerClaimProfile;
