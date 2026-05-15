import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, MessageSquare, Check } from "lucide-react";

type Step = 0 | 1 | 2 | 3;

const Q = [
  {
    key: "capital",
    label: "Starting capital",
    options: [
      { v: "small", l: "Under $500" },
      { v: "mid", l: "$500 – $5k" },
      { v: "large", l: "$5k+" },
    ],
  },
  {
    key: "style",
    label: "Trading style",
    options: [
      { v: "scalping", l: "Scalping" },
      { v: "day", l: "Day trading" },
      { v: "swing", l: "Swing / position" },
    ],
  },
  {
    key: "priority",
    label: "Top priority",
    options: [
      { v: "regulation", l: "Strict regulation" },
      { v: "spreads", l: "Tight spreads" },
      { v: "payout", l: "Fast payouts" },
    ],
  },
] as const;

const AIMatcherTeaser = () => {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const pick = (key: string, v: string) => {
    const next = { ...answers, [key]: v };
    setAnswers(next);
    if (step < 2) setStep((step + 1) as Step);
    else {
      const qs = new URLSearchParams(next).toString();
      setStep(3);
      setTimeout(() => nav(`/match?${qs}`), 700);
    }
  };

  const reset = () => {
    setAnswers({});
    setStep(0);
  };

  const current = Q[Math.min(step, 2) as 0 | 1 | 2];
  const progress = step === 3 ? 100 : (step / 3) * 100;

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-6 md:p-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="relative grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest mb-4">
              <Sparkles className="w-3 h-3" />
              AI Matcher · Live · Free
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3 leading-[0.95]">
              Find your broker
              <br />
              <span className="text-primary">in 60 seconds.</span>
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Three quick taps. Our AI matcher cross-checks 280+ brokers, verified reviews, and live scam alerts to recommend the top 3 for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/match"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border text-foreground font-mono font-bold uppercase text-sm tracking-wider hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                Full quiz
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

          {/* Inline mini-quiz card */}
          <div className="rounded-xl border border-border bg-card/80 backdrop-blur p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {step === 3 ? "Building your shortlist…" : `Step ${step + 1} of 3`}
              </span>
              {step > 0 && step < 3 && (
                <button
                  onClick={reset}
                  className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="h-1 rounded-full bg-secondary overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {step < 3 ? (
              <>
                <h3 className="font-display text-xl font-extrabold text-foreground mb-4">
                  {current.label}
                </h3>
                <div className="space-y-2">
                  {current.options.map((o) => (
                    <button
                      key={o.v}
                      onClick={() => pick(current.key, o.v)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all group flex items-center justify-between"
                    >
                      <span className="font-medium text-sm text-foreground group-hover:text-primary">
                        {o.l}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 mb-3">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-mono uppercase tracking-wider text-foreground mb-1">
                  Matching brokers…
                </p>
                <p className="text-xs text-muted-foreground">
                  Redirecting to your personalised shortlist
                </p>
              </div>
            )}

            <p className="mt-5 pt-4 border-t border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
              No signup · 100% free · Independent
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIMatcherTeaser;
