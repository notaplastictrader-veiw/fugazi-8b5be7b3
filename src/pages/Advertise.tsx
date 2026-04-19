import { useEffect, useRef, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import * as Icons from "lucide-react";
import { BarChart3, Eye, Users, Globe, Zap, Target, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { notifyAdmins } from "@/lib/notifyAdmins";

interface Placement {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

const FALLBACK_ICONS: Record<string, any> = {
  Eye, BarChart3, Users, Globe, Zap, Target,
};

const FALLBACK_PLACEMENTS: Placement[] = [
  { id: "1", slug: "homepage-banner", title: "Homepage Banner", description: "Premium visibility on the most-visited page", icon: "Eye", display_order: 1 },
  { id: "2", slug: "broker-listing-boost", title: "Broker Listing Boost", description: "Featured placement in broker comparison results", icon: "BarChart3", display_order: 2 },
  { id: "3", slug: "signal-channel-sponsor", title: "Signal Channel Sponsor", description: "Sponsored messages to our active trading community", icon: "Users", display_order: 3 },
  { id: "4", slug: "sitewide-banner", title: "Sitewide Banner", description: "Persistent visibility across all pages", icon: "Globe", display_order: 4 },
  { id: "5", slug: "newsletter-sponsor", title: "Newsletter Sponsor", description: "Reach our email subscriber base directly", icon: "Zap", display_order: 5 },
  { id: "6", slug: "custom-campaign", title: "Custom Campaign", description: "Tailored advertising solutions for your brand", icon: "Target", display_order: 6 },
];

const Advertise = () => {
  const copy = useSiteSettings<{
    eyebrow: string; title: string; accent: string; subtitle: string;
    form_heading: string; form_subtitle: string; success_message: string;
  }>("advertise_page", {
    eyebrow: "ADVERTISE WITH US",
    title: "Reach",
    accent: "Active Traders",
    subtitle: "Connect your brand with thousands of traders across forex, crypto, and sports markets.",
    form_heading: "Get Started",
    form_subtitle: "Fill out the form and our team will schedule a meeting and share our media kit.",
    success_message: "Enquiry received! We'll share our media kit and schedule a meeting within 24 hours.",
  });

  const [placements, setPlacements] = useState<Placement[]>(FALLBACK_PLACEMENTS);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyAge, setCompanyAge] = useState("");
  const [message, setMessage] = useState("");
  const [placementSlug, setPlacementSlug] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    supabase
      .from("ad_placements")
      .select("id, slug, title, description, icon, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setPlacements(data as Placement[]);
      });
  }, []);

  const selectedPlacement = placements.find(p => p.slug === placementSlug);

  const pickPlacement = (slug: string) => {
    setPlacementSlug(slug);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !company.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("ad_enquiries").insert({
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      company_url: companyUrl.trim(),
      company_age: companyAge.trim(),
      message: message.trim(),
      placement_slug: placementSlug,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    notifyAdmins(
      "New Advertise Enquiry",
      `${company.trim()} (${email.trim()})${selectedPlacement ? ` — ${selectedPlacement.title}` : ""}`,
      "/admin/advertise/enquiries"
    );
    toast.success(copy.success_message);
    setName(""); setEmail(""); setCompany(""); setCompanyUrl(""); setCompanyAge(""); setMessage("");
    setPlacementSlug(null);
  };

  const renderIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || FALLBACK_ICONS[iconName] || Target;
    return <Icon className="w-5 h-5 text-primary" />;
  };

  return (
    <MainLayout>
      <SEO title="Advertise With Us" description="Reach thousands of active traders. Explore advertising options on Not A Fugazi Trader." path="/advertise" />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            {copy.eyebrow}
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            {copy.title} <span className="text-primary">{copy.accent}</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">{copy.subtitle}</p>
        </div>

        {/* Placement Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {placements.map((p) => {
            const isSelected = placementSlug === p.slug;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => pickPlacement(p.slug)}
                className={`text-left glass-card rounded-xl p-6 transition-all hover:border-primary/40 ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/20"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  {renderIcon(p.icon)}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                {isSelected && (
                  <p className="mt-3 text-xs font-mono text-primary">✓ Selected — scroll to form</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form ref={formRef} onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">{copy.form_heading}</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">{copy.form_subtitle}</p>

            {selectedPlacement && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <span className="text-sm">
                  <span className="text-muted-foreground">Interested in:</span>{" "}
                  <span className="font-semibold text-foreground">{selectedPlacement.title}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setPlacementSlug(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Your name *" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
              <Input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" />
            </div>
            <Input placeholder="Company / Brand *" value={company} onChange={e => setCompany(e.target.value)} className="bg-background" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input type="url" placeholder="Company website URL" value={companyUrl} onChange={e => setCompanyUrl(e.target.value)} className="bg-background" />
              <Input placeholder="Company age (e.g. 3 years)" value={companyAge} onChange={e => setCompanyAge(e.target.value)} className="bg-background" />
            </div>
            <Textarea placeholder="Tell us about your advertising goals... *" value={message} onChange={e => setMessage(e.target.value)} className="bg-background min-h-[120px]" />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default Advertise;
