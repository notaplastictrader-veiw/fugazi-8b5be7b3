import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AlertTriangle, Loader2, Upload, X } from "lucide-react";

interface FileComplaintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokerId: string;
  brokerName: string;
  onSuccess?: () => void;
}

const COMPLAINT_TYPES = [
  { value: "withdrawal", label: "Withdrawal refused / delayed" },
  { value: "spread_manipulation", label: "Spread / price manipulation" },
  { value: "account_closure", label: "Account closed without notice" },
  { value: "bonus_terms", label: "Bonus / promo terms misleading" },
  { value: "support", label: "No customer support response" },
  { value: "other", label: "Other" },
];

const MAX_FILES = 5;
const MAX_FILE_MB = 5;

const FileComplaintModal = ({ open, onOpenChange, brokerId, brokerName, onSuccess }: FileComplaintModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("withdrawal");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    const valid = incoming.filter(f => {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        toast({ title: `${f.name} is too large`, description: `Max ${MAX_FILE_MB}MB per file`, variant: "destructive" });
        return false;
      }
      return true;
    });
    setFiles(prev => [...prev, ...valid].slice(0, MAX_FILES));
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const uploadProofs = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `complaints/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in to file a complaint", variant: "destructive" });
      return;
    }
    const desc = description.trim();
    if (desc.length < 30) {
      toast({ title: "Please describe what happened", description: "Minimum 30 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const proof_urls = await uploadProofs();
      const typeLabel = COMPLAINT_TYPES.find(t => t.value === type)?.label || type;
      const fullContent = `[${typeLabel}] ${desc}`;

      const { error } = await supabase.from("complaints").insert({
        broker_id: brokerId,
        user_id: user.id,
        content: fullContent,
        proof_urls,
        status: "pending",
      });
      if (error) throw error;

      toast({
        title: "Complaint filed",
        description: "Our moderation team will review and publish it within 24–48 hours.",
      });
      setDescription("");
      setFiles([]);
      setType("withdrawal");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            File a Complaint
          </DialogTitle>
          <DialogDescription>
            Filing against <span className="font-semibold text-foreground">{brokerName}</span>. Your complaint will be reviewed before going public.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="complaint-type">Complaint type *</Label>
            <select
              id="complaint-type"
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground"
              required
            >
              {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <Label htmlFor="complaint-desc">What happened? *</Label>
            <Textarea
              id="complaint-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Dates, amounts, communication attempts, exact issue. The more detail, the faster we can verify."
              maxLength={2000}
              rows={6}
              required
            />
            <div className="text-xs text-muted-foreground mt-1">{description.length}/2000</div>
          </div>

          <div>
            <Label>Proof / screenshots (optional, up to {MAX_FILES})</Label>
            <label className="mt-1 flex items-center justify-center gap-2 px-3 py-3 border border-dashed border-input rounded-md cursor-pointer hover:border-primary/40 transition-colors text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              <span>Click to upload images (max {MAX_FILE_MB}MB each)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={files.length >= MAX_FILES}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary rounded-md">
                    <span className="truncate max-w-[160px]">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            False or malicious complaints will be removed and may result in account suspension.
          </p>

          <Button type="submit" disabled={loading} className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
            Submit complaint
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileComplaintModal;
