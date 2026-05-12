import { Link } from "react-router-dom";
import { Sparkles, Shield, ArrowUpRight, RotateCw } from "lucide-react";
import NeonCard from "@/components/ui/NeonCard";
import TrustLight from "@/components/broker/TrustLight";
import StarRating from "@/components/reviews/StarRating";

interface Match {
  id: string;
  slug: string;
  name: string;
  match_score: number;
  reasoning: string;
  broker: any;
}

const MatchResults = ({ matches, onReset }: { matches: Match[]; onReset: () => void }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3 h-3" /> AI Matched
        </span>
        <h2 className="mt-3 text-3xl md:text-4xl font-display font-extrabold text-foreground">
          Your top 3 broker matches
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Based on your trading style, capital, and goals.
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((m, i) => (
          <NeonCard key={m.id} className="p-6" accent={i === 0 ? "primary" : "accent"}>
            <div className="flex items-start gap-4">
              <div className="text-4xl font-display font-black text-primary/30 leading-none w-10 shrink-0">
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {m.name}
                  </h3>
                  {m.broker.badge === "verified" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-primary bg-primary/10 border border-primary/20">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  <TrustLight score={m.broker.score} complaints={m.broker.complaints} />
                  <span className="ml-auto text-xs font-mono text-primary font-bold">
                    Match {Math.round(m.match_score)}%
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <StarRating value={m.broker.stars} size={12} />
                  <span>· {m.broker.review_count} reviews</span>
                  <span>· {m.broker.avg_spread} spread</span>
                  <span>· min {m.broker.min_deposit}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {m.reasoning}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to={`/brokers/${m.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Read full review <ArrowUpRight className="w-3 h-3" />
                  </Link>
                  <Link
                    to={`/compare?b=${m.slug}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold border border-border text-foreground rounded-lg hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    Compare
                  </Link>
                </div>
              </div>
            </div>
          </NeonCard>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          Run again with different answers
        </button>
      </div>
    </div>
  );
};

export default MatchResults;
