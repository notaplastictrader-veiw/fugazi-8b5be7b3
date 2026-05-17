import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Globe } from "lucide-react";

interface Props {
  accepted?: string[];
  excluded?: string[];
}

const GeoAvailability = ({ accepted = [], excluded = [] }: Props) => {
  if (accepted.length === 0 && excluded.length === 0) return null;
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="font-display font-bold text-base">Where it works</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {accepted.length > 0 && (
            <div className="rounded-md border border-primary/25 bg-primary/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
              </div>
              <div className="flex flex-wrap gap-1.5">
                {accepted.map((c) => (
                  <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-foreground border border-primary/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {excluded.length > 0 && (
            <div className="rounded-md border border-destructive/25 bg-destructive/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-destructive mb-2">
                <XCircle className="w-3.5 h-3.5" /> Not accepted
              </div>
              <div className="flex flex-wrap gap-1.5">
                {excluded.map((c) => (
                  <span key={c} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-destructive/10 text-foreground border border-destructive/20">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeoAvailability;
