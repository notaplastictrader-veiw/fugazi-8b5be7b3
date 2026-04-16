import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { submitToApprovalQueue } from "@/lib/approvalQueue";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ReportScamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportScamModal = ({ open, onOpenChange }: ReportScamModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    story: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from("scam_alerts").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        story: form.story.trim() || null,
        status: "pending",
        created_by: user.id,
      }).select("id").single();

      if (error) throw error;

      if (data) {
        await submitToApprovalQueue("scam_alert", data.id, user.id);
      }

      toast({ title: "Report submitted!", description: "Our team will review it shortly." });
      setForm({ title: "", description: "", severity: "medium", story: "" });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Report a Scam
          </DialogTitle>
          <DialogDescription>Submit details about the fraudulent broker or platform. Our team will verify and publish it.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="scam-title">Broker / Platform Name *</Label>
            <Input id="scam-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. TradeWave Markets" maxLength={100} required />
          </div>

          <div>
            <Label htmlFor="scam-desc">Short Description *</Label>
            <Textarea id="scam-desc" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What happened? (brief summary)" maxLength={500} rows={3} required />
          </div>

          <div>
            <Label htmlFor="scam-severity">Severity</Label>
            <select id="scam-severity" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <Label htmlFor="scam-story">Full Story (optional)</Label>
            <Textarea id="scam-story" value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))}
              placeholder="Describe your full experience in detail..." maxLength={5000} rows={5} />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportScamModal;
