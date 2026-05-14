import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  brokerId: string;
  brokerName: string;
  onSubmitted?: () => void;
}

const WithdrawalProofUploadModal = ({ open, onClose, brokerId, brokerName, onSubmitted }: Props) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("");
  const [hours, setHours] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) { toast.error("Please sign in to submit a payout proof."); return; }
    if (!file) { toast.error("Please attach a screenshot or PDF."); return; }

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `withdrawal-proofs/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);

      const { error: insErr } = await supabase.from("withdrawal_proofs").insert({
        user_id: user.id,
        broker_id: brokerId,
        amount: amount ? Number(amount) : null,
        currency: currency || "USD",
        withdrawal_date: date || null,
        payout_method: method || null,
        payout_time_hours: hours ? Number(hours) : null,
        proof_url: pub.publicUrl,
        notes: notes || null,
        status: "pending",
      });
      if (insErr) throw insErr;

      toast.success("Submitted! An admin will verify your proof shortly.");
      onSubmitted?.();
      onClose();
      setFile(null); setAmount(""); setDate(""); setMethod(""); setHours(""); setNotes("");
    } catch (e: any) {
      toast.error(e.message || "Could not submit proof.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit a verified payout — {brokerName}</DialogTitle>
          <DialogDescription>
            Upload a screenshot/PDF of a real withdrawal. Sensitive details (account number,
            ID) should be redacted. Admin verifies before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Proof file (image or PDF) *</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Amount</Label>
              <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500" />
            </div>
            <div>
              <Label className="text-xs">Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="USD" maxLength={4} />
            </div>
            <div>
              <Label className="text-xs">Withdrawal date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Payout time (hours)</Label>
              <Input type="number" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="24" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Method (Wire / Skrill / Crypto…)</Label>
            <Input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Bank wire" />
          </div>
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything noteworthy about this payout…" />
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Submit for verification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalProofUploadModal;
