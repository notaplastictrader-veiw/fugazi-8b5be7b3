import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import MatcherQuiz, { MatcherAnswers } from "@/components/match/MatcherQuiz";
import MatchResults from "@/components/match/MatchResults";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const Match = () => {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[] | null>(null);

  const handleSubmit = async (answers: MatcherAnswers) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("broker-matcher", {
        body: answers,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMatches(data?.matches || []);
    } catch (e: any) {
      toast.error(e.message || "Could not get matches. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <SEO
        title="AI Broker Matcher — Find Your Perfect Forex Broker"
        description="Answer 5 quick questions and our AI recommends the 3 best brokers for your trading style, capital, and goals — using NAFT's verified review database."
        path="/match"
      />
      <section className="pt-10 pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3" /> AI Broker Matcher
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-3">
            Find your perfect <span className="text-primary">broker</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            5 quick questions. Our AI scans 280+ verified brokers and picks the top 3 for your style.
          </p>
        </div>

        {matches === null ? (
          <MatcherQuiz onSubmit={handleSubmit} loading={loading} />
        ) : (
          <MatchResults matches={matches} onReset={() => setMatches(null)} />
        )}
      </section>
    </MainLayout>
  );
};

export default Match;
