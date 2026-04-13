import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MessageCircle, Send, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const contactMethods = [
  { icon: Mail, label: "Email", value: "notafugazitrader@gmail.com", href: "mailto:notafugazitrader@gmail.com" },
  { icon: Phone, label: "Phone", value: "+44 XXX XXXX XXXX", href: "tel:+44" },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: "https://wa.me/44" },
  { icon: Send, label: "Telegram", value: "@notafugazitrader", href: "https://t.me/notafugazitrader" },
];

const subjects = ["General Enquiry", "Broker Listing", "Partnership", "Report a Scam", "Other"];

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setSubmitting(false);
    }, 800);
  };

  return (
    <MainLayout>
      <SEO
        title="Contact Us"
        description="Get in touch with Not A Fugazi Trader. Report scams, submit complaints, request broker reviews, or partner with us."
        path="/contact"
      />
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-24">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
            GET IN TOUCH
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have a question, want to list your broker, or report a scam? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Methods */}
          <div className="lg:col-span-2 space-y-4">
            {contactMethods.map((m) => (
              <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer"
                className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors block">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{m.label}</div>
                  <div className="text-sm font-medium text-foreground">{m.value}</div>
                </div>
              </a>
            ))}

            <a href="/scam-alerts"
              className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-destructive/30 transition-colors block border-destructive/10">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Got scammed?</div>
                <div className="text-sm font-medium text-foreground">File a Complaint →</div>
              </div>
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 glass-card rounded-2xl p-8 space-y-5">
            <h2 className="text-xl font-display font-bold text-foreground mb-2">Send us a message</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="bg-background" />
              <Input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" />
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Your message..." value={message} onChange={e => setMessage(e.target.value)}
              className="bg-background min-h-[140px]" />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
};

export default Contact;
