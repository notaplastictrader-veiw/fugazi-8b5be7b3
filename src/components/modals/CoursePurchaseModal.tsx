import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Mail, Check } from "lucide-react";
import type { Course } from "@/data/educationArticles";

interface Props {
  course: Course | null;
  open: boolean;
  onClose: () => void;
}

const WALLET_ADDRESS = "TRC20-WALLET-ADDRESS-HERE";
const TELEGRAM_URL = "https://t.me/notaplastictrader";
const EMAIL = "notaplastictrader@gmail.com";

export default function CoursePurchaseModal({ course, open, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!course) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Complete Your Purchase</DialogTitle>
          <DialogDescription className="sr-only">Purchase instructions for {course.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Course info */}
          <div className="rounded-lg bg-muted/40 p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent">{course.type}</span>
            <h3 className="font-display font-bold text-foreground">{course.title}</h3>
            <p className="text-2xl font-bold text-primary">
              ${course.price}
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">${course.originalPrice}</span>
              )}
            </p>
          </div>

          {/* Payment method */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Pay via Crypto (USDT preferred)</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted/60 rounded-md px-3 py-2 text-xs font-mono text-muted-foreground truncate">
                {WALLET_ADDRESS}
              </code>
              <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Or contact us for other payment methods</p>
          </div>

          {/* Contact buttons */}
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Us on Telegram
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(course.title + ' Purchase')}`}>
                <Mail className="w-4 h-4 mr-2" />
                Contact Us by Email
              </a>
            </Button>
          </div>

          {/* Instructions */}
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              After payment, send your receipt to{" "}
              <strong className="text-foreground">{EMAIL}</strong> with subject:{" "}
              <strong className="text-foreground">"{course.title} Purchase"</strong>.
              We'll send access within 24 hours.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
