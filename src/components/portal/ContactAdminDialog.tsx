import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Headphones, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContactAdminDialogProps {
  /** Used in the message body to identify the sender's role */
  senderRole?: "broker" | "signal_provider" | "betting_site";
  /** Optional listing name for context */
  contextName?: string;
}

const ContactAdminDialog = ({ senderRole = "broker", contextName }: ContactAdminDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    if (!user) { toast.error("You must be signed in"); return; }
    setSending(true);
    try {
      const { error } = await supabase.from("support_messages").insert({
        user_id: user.id,
        sender_role: senderRole,
        context_name: contextName ?? null,
        subject: subject.trim(),
        message: message.trim(),
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide">Priority Support</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground font-mono mb-2">
          Your message goes directly to the NAFT admin team. We'll reach out within 24 hours.
        </p>
        <div className="space-y-3">
          <div>
            <Label className="font-mono text-xs">Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief subject" />
          </div>
          <div>
            <Label className="font-mono text-xs">Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your request or issue…" rows={5} />
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
