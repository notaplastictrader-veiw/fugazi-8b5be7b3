import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { Star, Shield, Award, AlertTriangle, ArrowLeft, ExternalLink } from "lucide-react";

interface Broker {
  id: string;
  name: string;
  slug: string;
  type: string;
  tags: string[];
  regulation: string[];
  score: number;
  avg_spread: string;
  leverage: string;
  min_deposit: string;
  stars: number;
  review_count: number;
  complaints: number;
  badge: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  role: string;
  created_at: string;
}

const BrokerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: b } = await supabase.from("brokers").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    if (b) {
      setBroker(b as Broker);
      const { data: r } = await supabase.from("reviews").select("*").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false });
      if (r) setReviews(r as Review[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [slug]);

  if (loading) return <MainLayout><div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div></MainLayout>;
  if (!broker) return <MainLayout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Broker not found.</p><Link to="/brokers" className="text-primary hover:underline">← Back to Brokers</Link></div></MainLayout>;

  const scoreColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";

  return (
    <MainLayout>
      <SEO
        title={`${broker.name} Review`}
        description={`Read the full ${broker.name} review — regulation, spreads, deposits, and real trader feedback. Score: ${broker.score}/10.`}
        path={`/broker/${broker.slug}`}
      />
      <div className="min-h-screen pt-6 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/brokers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Brokers
          </Link>

          {/* Header */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-extrabold text-foreground">{broker.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {broker.regulation?.map((r) => (
                    <span key={r} className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">{r}</span>
                  ))}
                  {broker.badge === "verified" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {broker.badge === "featured" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20">
                      <Award className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>
              </div>
              <a href="#" className="px-5 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                Create an Account <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Avg Spread", value: broker.avg_spread },
              { label: "Leverage", value: broker.leverage },
              { label: "Min Deposit", value: broker.min_deposit },
              { label: "Trust Score", value: `${broker.score}/10` },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                <div className="text-lg font-mono font-bold text-foreground">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Score Bar */}
          <div className="glass-card rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">Trust Score</span>
              <span className="text-lg font-mono font-bold text-foreground">{broker.score}/10</span>
            </div>
            <div className="score-bar"><div className={`score-bar-fill ${scoreColor}`} style={{ width: `${broker.score * 10}%` }} /></div>
            <div className="flex items-center gap-1 mt-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.floor(broker.stars) ? "text-accent fill-accent" : "text-border"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">({broker.review_count} reviews)</span>
            </div>
            {(broker.complaints || 0) > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" /> {broker.complaints} complaints filed
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold text-foreground">Community Reviews</h2>
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="px-4 py-2 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Write a Review
              </button>
            </div>

            {showReviewForm && (
              <div className="mb-6">
                <ReviewSubmissionForm onSuccess={() => { setShowReviewForm(false); fetchData(); }} />
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground glass-card rounded-xl p-6">No reviews yet. Be the first to review this broker!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="glass-card rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-foreground">{r.author}</span>
                        <span className="text-xs text-muted-foreground ml-2">{r.role}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? "text-accent fill-accent" : "text-border"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="glass-card rounded-xl p-6 text-center">
            <h3 className="text-lg font-display font-bold text-foreground mb-2">Ready to start trading?</h3>
            <p className="text-sm text-muted-foreground mb-4">Open an account with {broker.name} today.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="#" className="px-6 py-2.5 text-sm font-display font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Create an Account
              </a>
              <Link to="/signup" className="px-6 py-2.5 text-sm font-display font-bold border border-border text-foreground rounded-lg hover:border-primary/40 transition-colors">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BrokerDetail;
