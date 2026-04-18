import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentTier: string;
  senderRole: "broker" | "signal_provider" | "betting_site";
  contextName?: string;
}

const REASONS = [
  "Too expensive",
  "Not getting value",
  "Switching service",
  "Temporary pause",
  "Other",
];

const CancelPremiumDialog = ({ open, onOpenChange, currentTier, senderRole, contextName }: Props) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [timing, setTiming] = useState<"immediate" | "end_of_period">("end_of_period");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (!reason) { toast.error("Please select a reason"); return; }

    setSubmitting(true);

    // Pull profile contact info for admin follow-up
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user.id)
      .maybeSingle();

    const messageBody = [
      `Cancellation Request — ${currentTier.toUpperCase()} tier`,
      contextName ? `Listing: ${contextName}` : null,
      ``,
      `Reason: ${reason}`,
      `Effective: ${timing === "immediate" ? "Immediately" : "End of current billing period"}`,
      comment ? `\nAdditional comment:\n${comment}` : null,
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      sender_role: senderRole,
      subject: `[Cancellation Request] ${currentTier} tier`,
      message: messageBody,
      context_name: contextName,
      contact_name: profile?.full_name || "Unknown",
      contact_email: user.email || "unknown@example.com",
      contact_phone: profile?.phone || "N/A",
    });

    setSubmitting(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Cancellation request received. Our team will reach out within 24 hours to confirm.");
    setReason(""); setComment(""); setTiming("end_of_period");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-['Barlow_Condensed'] uppercase tracking-wide flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            Cancel Premium Subscription
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground font-mono">
          Sorry to see you go. Your request goes to our team — we'll reach out within 24 hours to confirm.
        </p>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="font-mono text-xs uppercase tracking-wider">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="font-mono text-xs uppercase tracking-wider">When?</Label>
            <RadioGroup value={timing} onValueChange={(v: any) => setTiming(v)} className="mt-2 space-y-1.5">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="end_of_period" id="r-end" />
                <Label htmlFor="r-end" className="font-mono text-xs cursor-pointer">End of current billing period</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="immediate" id="r-imm" />
                <Label htmlFor="r-imm" className="font-mono text-xs cursor-pointer">Immediately</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="font-mono text-xs uppercase tracking-wider">Additional comment (optional)</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell us how we could improve…"
              maxLength={500}
              className="mt-1.5 font-mono text-xs"
              rows={3}
            />
            <p className="text-[10px] text-muted-foreground font-mono mt-1">{comment.length}/500</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 font-mono text-xs" onClick={() => onOpenChange(false)} disabled={submitting}>
              KEEP SUBSCRIPTION
            </Button>
            <Button variant="destructive" className="flex-1 font-mono text-xs" onClick={handleSubmit} disabled={submitting || !reason}>
              {submitting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              SUBMIT REQUEST
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelPremiumDialog;
