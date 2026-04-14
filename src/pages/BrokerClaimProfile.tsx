import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Building2, Upload, CheckCircle } from "lucide-react";
import BrokerTierBadge from "@/components/broker/BrokerTierBadge";
import { toast } from "sonner";

const BrokerClaimProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [docsUrl, setDocsUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const { data } = await supabase.from("brokers").select("id, name, slug, score, status").ilike("name", `%${query}%`).eq("status", "published").limit(10);
    setResults(data || []);
  };

  const handleClaim = async () => {
    if (!user || !selected) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("profile_claims").insert({
        profile_type: "broker",
        profile_id: selected.id,
        claimed_by: user.id,
        documents_url: docsUrl || null,
      });
      if (error) throw error;
      toast.success("Claim submitted! Our team will review it shortly.");
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit claim");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground font-mono">Please log in to claim a broker profile.</p>
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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold font-['Barlow_Condensed'] uppercase tracking-wide mb-2">Claim Your Broker Profile</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          Search for your brokerage and submit verification documents to claim ownership.
        </p>

        {!selected ? (
          <>
            <div className="flex gap-2 mb-6">
              <Input placeholder="Search broker by name..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} />
              <Button onClick={handleSearch}><Search className="w-4 h-4 mr-1" /> Search</Button>
            </div>
            <div className="space-y-2">
              {results.map(b => (
                <Card key={b.id} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setSelected(b)}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold">{b.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">/{b.slug}</p>
                      </div>
                    </div>
                    <BrokerTierBadge tier="basic" />
                  </CardContent>
                </Card>
              ))}
              {results.length === 0 && query && <p className="text-sm text-muted-foreground font-mono text-center py-4">No brokers found. Try a different name.</p>}
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                Claiming: {selected.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="font-mono text-xs">Verification Documents URL</Label>
                <Input placeholder="Link to proof of ownership (Google Drive, Dropbox, etc.)" value={docsUrl} onChange={e => setDocsUrl(e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1 font-mono">Upload corporate registration, domain ownership proof, or official email screenshot</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleClaim} disabled={submitting} className="flex-1 font-mono">
                  <Upload className="w-4 h-4 mr-1" /> {submitting ? "Submitting..." : "Submit Claim"}
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Back</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default BrokerClaimProfile;
