import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Headphones, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface ContactAdminDialogProps {
  /** Used in the message body to identify the sender's role */
  senderRole?: "broker" | "signal_provider" | "betting_site";
  /** Optional listing name for context */
  contextName?: string;
}

const contactSchema = z.object({
  contact_name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  contact_email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  contact_phone: z.string().trim().min(4, "Phone is required").max(30, "Phone too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

const ContactAdminDialog = ({ senderRole = "broker", contextName }: ContactAdminDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Auto-prefill from logged-in user's profile
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setContactName((prev) => prev || data?.full_name || "");
      setContactEmail((prev) => prev || user.email || "");
      setContactPhone((prev) => prev || data?.phone || "");
    })();
    return () => { cancelled = true; };
  }, [open, user]);

  const handleSend = async () => {
    if (!user) { toast.error("You must be signed in"); return; }

    const parsed = contactSchema.safeParse({
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      subject,
      message,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Please fill all fields correctly");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("support_messages").insert({
        user_id: user.id,
        sender_role: senderRole,
        context_name: contextName ?? null,
        contact_name: parsed.data.contact_name,
        contact_email: parsed.data.contact_email,
        contact_phone: parsed.data.contact_phone,
        subject: parsed.data.subject,
        message: parsed.data.message,
      });
      if (error) throw error;
      toast.success("Message received. Our team will reach out within 24 hours.");
      setOpen(false);
      setSubject(""); setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="font-mono text-xs border-primary/30 hover:border-primary/60">
          <Headphones className="w-3 h-3 mr-1" /> CONTACT ADMIN
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Priority Support</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground font-mono mb-2">
          Your message goes directly to the NAFT admin team. We'll reach out within 24 hours.
        </p>
        <div className="space-y-3">
          <div className="grid gap-3">
            <div>
              <Label className="font-mono text-xs">Your Name <span className="text-destructive">*</span></Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
                maxLength={100}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="font-mono text-xs">Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="you@email.com"
                  maxLength={255}
                  required
                />
              </div>
              <div>
                <Label className="font-mono text-xs">Phone <span className="text-destructive">*</span></Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 555 1234"
                  maxLength={30}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="font-mono text-xs">Subject <span className="text-destructive">*</span></Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief subject" maxLength={200} />
          </div>
          <div>
            <Label className="font-mono text-xs">Message <span className="text-destructive">*</span></Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your request or issue…" rows={5} maxLength={2000} />
          </div>
          <Button onClick={handleSend} disabled={sending} className="w-full font-mono">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEND TO ADMIN"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactAdminDialog;
