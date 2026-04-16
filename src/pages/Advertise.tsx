import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BarChart3, Eye, Users, Globe, Zap, Target } from "lucide-react";
import { toast } from "sonner";

const placements = [
  { icon: Eye, title: "Homepage Banner", description: "Premium visibility on the most-visited page" },
  { icon: BarChart3, title: "Broker Listing Boost", description: "Featured placement in broker comparison results" },
  { icon: Users, title: "Signal Channel Sponsor", description: "Sponsored messages to our active trading community" },
  { icon: Globe, title: "Sitewide Banner", description: "Persistent visibility across all pages" },
  { icon: Zap, title: "Newsletter Sponsor", description: "Reach our email subscriber base directly" },
  { icon: Target, title: "Custom Campaign", description: "Tailored advertising solutions for your brand" },
];

const Advertise = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [companyAge, setCompanyAge] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !company.trim() || !message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Enquiry submitted! We'll schedule a meeting and share our media kit within 24 hours.");
      setName(""); setEmail(""); setCompany(""); setCompanyUrl(""); setCompanyAge(""); setMessage("");
      setSubmitting(false);
    }, 800);
  };

  return (
    <MainLayout>
      <SEO title="Advertise With Us" description="Reach thousands of active traders. Explore advertising options on Not A Fugazi Trader." path="/advertise" />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            ADVERTISE WITH US
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Reach <span className="text-primary">Active Traders</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Connect your brand with thousands of traders across forex, crypto, and sports markets.</p>
        </div>

        {/* Placement Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {placements.map((p) => (
            <div key={p.title} className="glass-card rounded-xl p-6 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{p.description}</p>
              
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2 text-center">Get Started</h2>
            <p className="text-sm text-muted-foreground text-center mb-4">Fill out the form and our team will schedule a meeting and share our media kit.</p>
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
