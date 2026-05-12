import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import NeonCard from "@/components/ui/NeonCard";

export interface MatcherAnswers {
  country?: string;
  capital?: string;
  style?: string;
  experience?: string;
  goal?: string;
}

const questions: {
  key: keyof MatcherAnswers;
  question: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: "country",
    question: "Where are you based?",
    options: [
      { value: "UK", label: "UK" },
      { value: "EU", label: "EU" },
      { value: "Asia", label: "Asia" },
      { value: "Middle East", label: "Middle East" },
      { value: "Africa", label: "Africa" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    key: "capital",
    question: "How much capital do you plan to start with?",
    options: [
      { value: "<500", label: "Under $500" },
      { value: "500-2000", label: "$500–$2,000" },
      { value: "2000-10000", label: "$2,000–$10,000" },
      { value: ">10000", label: "$10,000+" },
    ],
  },
  {
    key: "style",
    question: "What's your trading style?",
    options: [
      { value: "scalping", label: "Scalping (seconds–minutes)" },
      { value: "day", label: "Day trading" },
      { value: "swing", label: "Swing (days–weeks)" },
      { value: "position", label: "Position (weeks+)" },
    ],
  },
  {
    key: "experience",
    question: "How experienced are you?",
    options: [
      { value: "beginner", label: "Beginner (<1 year)" },
      { value: "intermediate", label: "Intermediate (1–3 years)" },
      { value: "pro", label: "Pro (3+ years)" },
    ],
  },
  {
    key: "goal",
    question: "Most important to you?",
    options: [
      { value: "regulation", label: "Strong regulation" },
      { value: "low-spread", label: "Lowest spreads" },
      { value: "fast-withdrawal", label: "Fast withdrawals" },
      { value: "prop-friendly", label: "Prop-firm friendly" },
    ],
  },
];

const MatcherQuiz = ({ onSubmit, loading }: { onSubmit: (a: MatcherAnswers) => void; loading: boolean }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<MatcherAnswers>({});

  const q = questions[step];
  const isLast = step === questions.length - 1;
  const value = answers[q.key];

  const select = (val: string) => {
    const next = { ...answers, [q.key]: val };
    setAnswers(next);
    if (isLast) {
      onSubmit(next);
    } else {
      setTimeout(() => setStep((s) => s + 1), 200);
    }
  };

  return (
    <NeonCard className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
            Step {step + 1} of {questions.length}
          </span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all",
                i <= step ? "w-6 bg-primary" : "w-3 bg-border"
              )}
            />
          ))}
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-6">
        {q.question}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => select(opt.value)}
            disabled={loading}
            className={cn(
              "px-4 py-3 text-left text-sm rounded-lg border transition-all",
              value === opt.value
                ? "border-primary bg-primary/10 text-primary shadow-[0_0_14px_hsl(var(--primary)/0.25)]"
                : "border-border text-foreground hover:border-primary/60 hover:bg-primary/5"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && !loading && (
        <button
          onClick={() => setStep((s) => s - 1)}
          className="mt-6 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Back
        </button>
      )}

      {loading && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-primary" />
          AI is matching your perfect brokers...
        </div>
      )}
    </NeonCard>
  );
};

export default MatcherQuiz;
