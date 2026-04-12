import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Users, DollarSign, Megaphone, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const benefits = {
  affiliate: [
    "Earn up to 30% recurring commission",
    "Real-time tracking dashboard",
    "Monthly payouts via bank or crypto",
    "Dedicated affiliate manager",
    "Custom landing pages & creatives",
  ],
  ib: [
    "Revenue share on every client trade",
    "Sub-IB multi-tier structure",
    "White-label broker comparison pages",
    "Priority listing for your referred brokers",
    "Direct API access for reporting",
  ],
  collab: [
    "Co-branded content & campaigns",
    "Cross-promotion to 50K+ traders",
    "Exclusive event partnerships",
    "Custom integration opportunities",
    "Joint webinars & education series",
  ],
};

const Partnership = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "affiliate";
  const [activeTab, setActiveTab] = useState(tabParam);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && ["affiliate", "ib", "collab"].includes(t)) setActiveTab(t);
  }, [searchParams]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Application submitted! We'll be in touch within 48 hours.");
      setName(""); setEmail(""); setCompany(""); setMessage("");
      setSubmitting(false);
    }, 800);
  };

  const tabConfig = [
    { value: "affiliate", label: "Affiliate", icon: DollarSign, description: "Earn commissions by referring traders to NAFT-reviewed brokers." },
    { value: "ib", label: "Introducing Broker", icon: Users, description: "Partner as an Introducing Broker and grow your trading network." },
    { value: "collab", label: "Collaboration", icon: Megaphone, description: "Brand partnerships, co-marketing, and content collaboration." },
  ];

  return (
    <MainLayout>
      <SEO title="Partnership Program" description="Join NAFT's partner ecosystem. Become an affiliate, introducing broker, or brand collaborator." path="/partnership" />
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            <Handshake className="w-3 h-3 inline mr-1" /> PARTNERSHIPS
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Partner With <span className="text-primary">NAFT</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Join our growing network of affiliates, introducing brokers, and brand partners.</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            {tabConfig.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="flex items-center gap-2">
                <t.icon className="w-4 h-4" /> {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabConfig.map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Benefits */}
                <div className="glass-card rounded-2xl p-8">
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
                    <tab.icon className="w-6 h-6 text-primary" /> {tab.label} Program
                  </h2>
                  <p className="text-muted-foreground mb-6">{tab.description}</p>
                  <ul className="space-y-3">
                    {benefits[tab.value as keyof typeof benefits].map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
                  <h2 className="text-xl font-display font-bold text-foreground mb-2">Apply Now</h2>
                  <Input placeholder="Your name *" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
                  <Input type="email" placeholder="Your email *" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" />
                  <Input placeholder="Company / Website (optional)" value={company} onChange={e => setCompany(e.target.value)} className="bg-background" />
                  <Textarea placeholder={`Tell us about your ${tab.label.toLowerCase()} experience... *`} value={message} onChange={e => setMessage(e.target.value)} className="bg-background min-h-[120px]" />
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </MainLayout>
  );
};

export default Partnership;
