import { ShieldCheck, FileSearch, Banknote, Eye } from "lucide-react";

const proofPoints = [
  {
    icon: ShieldCheck,
    label: "Verified Reviews Only",
    detail: "MT4/MT5 ID required",
  },
  {
    icon: FileSearch,
    label: "Real Withdrawal Proof",
    detail: "Screenshots on every claim",
  },
  {
    icon: Banknote,
    label: "No Pay-to-Rank",
    detail: "Sponsored ≠ Trust score",
  },
  {
    icon: Eye,
    label: "Scams Exposed Daily",
    detail: "Public alerts + evidence",
  },
];

const TrustStrip = () => {
  return (
    <section className="py-10 px-4 border-y border-border/50 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <span className="section-tag">// WHY TRUST US</span>
          <h2 className="text-xl md:text-2xl font-display font-extrabold text-foreground mt-2">
            We Test Brokers. <span className="text-primary">You Trade Smarter.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {proofPoints.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="glass-card rounded-xl p-4 flex items-start gap-3 hover:border-primary/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground leading-tight">{label}</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5 leading-tight">{detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
