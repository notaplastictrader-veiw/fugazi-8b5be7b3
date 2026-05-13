import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ASSETS, TIMEFRAME_LABELS, RISK_LABELS, IdeaDirection, IdeaTimeframe, IdeaRiskLevel } from "@/data/tradingIdeas";
import { TrendingUp, TrendingDown, Minus, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PostIdeaModal = ({ open, onClose }: Props) => {
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<IdeaDirection | "">("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [timeframe, setTimeframe] = useState<IdeaTimeframe | "">("");
  const [riskLevel, setRiskLevel] = useState<IdeaRiskLevel | "">("");
  const [disclaimer, setDisclaimer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chartImage, setChartImage] = useState<File | null>(null);
  const [chartPreview, setChartPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const directionButtons: { value: IdeaDirection; label: string; icon: any; cls: string }[] = [
    { value: "bullish", label: "Bullish", icon: TrendingUp, cls: "border-green-500/50 bg-green-500/10 text-green-400" },
    { value: "bearish", label: "Bearish", icon: TrendingDown, cls: "border-red-500/50 bg-red-500/10 text-red-400" },
    { value: "neutral", label: "Neutral", icon: Minus, cls: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" },
  ];

  const handleSubmit = () => {
    if (!asset || !direction || !title.trim() || !body.trim() || !timeframe || !riskLevel) {
      toast.error("Please fill in all fields");
      return;
    }
    if (body.trim().length < 50) {
      toast.error("Analysis must be at least 50 characters");
      return;
    }
    if (!disclaimer) {
      toast.error("You must accept the risk disclaimer");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Trading idea posted! 🚀");
      setAsset(""); setDirection(""); setTitle(""); setBody("");
      setTimeframe(""); setRiskLevel(""); setDisclaimer(false);
      setSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Post a Trading Idea</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Asset */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Asset / Pair</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select asset..." /></SelectTrigger>
              <SelectContent>
                {ASSETS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Direction */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Direction</Label>
            <div className="flex gap-2">
              {directionButtons.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDirection(d.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-semibold transition-all ${
                    direction === d.value ? d.cls : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <d.icon className="w-4 h-4" /> {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Idea Title</Label>
            <Input
              placeholder="e.g. Gold targeting 2,400 after DXY breakdown"
              value={title} onChange={e => setTitle(e.target.value.slice(0, 80))}
              className="bg-background"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block text-right">{title.length}/80</span>
          </div>

          {/* Body */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Your Analysis</Label>
            <Textarea
              placeholder="Share your entry, target, stop loss, and reasoning..."
              value={body} onChange={e => setBody(e.target.value.slice(0, 500))}
              className="bg-background min-h-[120px]"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block text-right">{body.length}/500</span>
          </div>

          {/* Chart Upload */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Chart Image (optional)</Label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("Image must be under 5MB");
                    return;
                  }
                  setChartImage(file);
                  setChartPreview(URL.createObjectURL(file));
                }
              }}
            />
            {chartPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img loading="lazy" decoding="async" src={chartPreview} alt="Chart preview" className="w-full max-h-48 object-cover" />
                <button
                  onClick={() => { setChartImage(null); setChartPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-destructive text-destructive-foreground rounded"
                >Remove</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors"
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">Click to upload chart screenshot (max 5MB)</span>
              </button>
            )}
          </div>

          {/* Timeframe & Risk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Timeframe</Label>
              <Select value={timeframe} onValueChange={v => setTimeframe(v as IdeaTimeframe)}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(TIMEFRAME_LABELS) as [IdeaTimeframe, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Risk Level</Label>
              <Select value={riskLevel} onValueChange={v => setRiskLevel(v as IdeaRiskLevel)}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(RISK_LABELS) as [IdeaRiskLevel, string][]).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <Checkbox id="disclaimer" checked={disclaimer} onCheckedChange={v => setDisclaimer(v === true)} className="mt-0.5" />
            <Label htmlFor="disclaimer" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              I understand this is my personal analysis and not financial advice. Trading involves risk of loss.
            </Label>
          </div>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "Posting..." : "Post Idea 🚀"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostIdeaModal;
