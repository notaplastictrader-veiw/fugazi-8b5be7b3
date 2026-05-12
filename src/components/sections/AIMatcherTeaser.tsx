import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MessageSquare } from "lucide-react";

const sample = [
  "Best broker for $500 scalping in UK",
  "Which prop firm pays out fastest?",
  "Is XM regulated in my country?",
];

const AIMatcherTeaser = () => {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 md:p-10">
        {/* glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              AI · Live · Free
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3 leading-[0.95]">
              Find your broker
              <br />
              <span className="text-primary">in 60 seconds.</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Answer 5 quick questions. Our AI matcher cross-checks 280+ brokers,
              verified reviews, and live scam alerts to recommend the top 3 for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/match"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-mono font-bold uppercase text-sm tracking-wider hover:opacity-90 transition-opacity"
              >
                Start the quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground font-mono font-bold uppercase text-sm tracking-wider hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Ask NAFT AI
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Real questions traders ask
            </p>
            {sample.map((q) => (
              <Link
                key={q}
                to="/ask"
                className="block px-4 py-3 rounded-lg border border-border bg-card/60 backdrop-blur hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <span className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground flex-1">{q}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIMatcherTeaser;
