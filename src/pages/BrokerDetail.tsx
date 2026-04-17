import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { brokers as localBrokers } from "@/data/brokers";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Star, Shield, Award, AlertTriangle, ArrowLeft, ExternalLink,
  CheckCircle, XCircle, Globe, Clock, CreditCard, Headphones,
  TrendingUp, FileText, Scale, Gift, GitCompare, Loader2
} from "lucide-react";

interface AccountType { name: string; min_deposit: string; spread: string; commission: string; }
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
  description?: string;
  founded_year?: number | null;
  headquarters?: string;
  pros?: string[];
  cons?: string[];
  payment_methods?: string[];
  platforms?: string[];
  account_types?: AccountType[];
  website_url?: string;
  support_email?: string;
  support_phone?: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  role: string;
  created_at: string;
}

// Placeholder full review data — will come from DB later
const getPlaceholderReview = (broker: Broker) => ({
  verdict: `${broker.name} is a well-established broker with a strong regulatory framework and competitive trading conditions. ${broker.score >= 8 ? "We recommend it for both beginners and experienced traders." : broker.score >= 6 ? "Suitable for intermediate traders who understand the risks." : "Exercise caution — read the full review carefully before committing funds."}`,
  keyFacts: [
    { label: "Regulation", value: broker.regulation?.join(", ") || "N/A" },
    { label: "Avg. Spread", value: broker.avg_spread || "N/A" },
    { label: "Max Leverage", value: broker.leverage || "N/A" },
    { label: "Min. Deposit", value: broker.min_deposit || "N/A" },
    { label: "Platforms", value: "MT4, MT5, Web Trader" },
    { label: "Withdrawal Time", value: "Instant – 3 business days" },
    { label: "Deposit Methods", value: "Bank, Card, Crypto, E-wallets" },
    { label: "Customer Support", value: "24/5 Live Chat, Email" },
  ],
  pros: broker.pros && broker.pros.length > 0 ? broker.pros : [
    "Regulated by tier-1 authorities",
    "Competitive spreads and low fees",
    "Fast deposit and withdrawal processing",
    "Multiple trading platforms available",
    "Educational resources for beginners",
  ],
  cons: broker.cons && broker.cons.length > 0 ? broker.cons : [
    "Limited cryptocurrency selection",
    "Inactivity fees may apply",
    "Some account types have higher minimum deposits",
  ],
  bestFor: `${broker.tags?.includes("bd-friendly") ? "Bangladeshi and South Asian traders due to local payment support and low minimum deposit." : "Active forex traders looking for tight spreads and reliable execution."}`,
  notIdealFor: "Traders seeking guaranteed stop-loss or US-based traders (not available).",
  ratings: {
    safety: Math.min(10, broker.score + 0.3),
    fees: Math.min(10, broker.score - 0.2),
    platform: Math.min(10, broker.score + 0.1),
    support: Math.min(10, broker.score - 0.4),
  },
});

const RatingBar = ({ label, value }: { label: string; value: number }) => {
  const color = value >= 8 ? "bg-primary" : value >= 6 ? "bg-accent" : "bg-destructive";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 score-bar"><div className={`score-bar-fill ${color}`} style={{ width: `${value * 10}%` }} /></div>
      <span className="text-sm font-mono font-bold text-foreground w-10 text-right">{value.toFixed(1)}</span>
    </div>
  );
};

const BrokerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [claimStatus, setClaimStatus] = useState<string>("unclaimed");
  const [claimLoading, setClaimLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ companyName: "", position: "", proofUrl: "", contactEmail: "" });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: b } = await supabase.from("brokers").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    if (b) {
      setBroker(b as unknown as Broker);
      const [{ data: r }, { data: bp }] = await Promise.all([
        supabase.from("reviews").select("*").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false }),
        supabase.from("broker_profiles").select("claim_status").eq("broker_id", b.id).maybeSingle(),
      ]);
      if (r) setReviews(r as Review[]);
      if (bp) setClaimStatus(bp.claim_status);

      if (user) {
        const { data: pendingClaim } = await supabase
          .from("profile_claims")
          .select("status")
          .eq("profile_id", b.id)
          .eq("claimed_by", user.id)
          .eq("status", "pending")
          .maybeSingle();
        if (pendingClaim) setClaimStatus("pending");
      }
    } else {
      // Fallback to local data
      const local = localBrokers.find(lb => lb.slug === slug);
      if (local) {
        setBroker({
          id: local.slug,
          name: local.name,
          slug: local.slug,
          type: local.type === "prop" ? "prop-firm" : local.type,
          tags: local.tags,
          regulation: local.regulation,
          score: local.score,
          avg_spread: local.avgSpread,
          leverage: local.leverage,
          min_deposit: local.minDeposit,
          stars: local.stars,
          review_count: local.reviewCount,
          complaints: local.complaints,
          badge: local.badge,
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [slug, user]);

  const handleClaimClick = () => {
    if (!broker) return;
    if (!user) {
      navigate(`/signup?role=broker&broker_id=${broker.id}`);
    } else {
      setShowClaimModal(true);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broker || !user) return;
    if (!claimForm.companyName || !claimForm.position || !claimForm.proofUrl || !claimForm.contactEmail) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setClaimLoading(true);
    try {
      const { error } = await supabase.from("profile_claims").insert({
        profile_id: broker.id,
        profile_type: "broker",
        claimed_by: user.id,
        status: "pending",
        documents_url: claimForm.proofUrl,
        admin_note: `Company: ${claimForm.companyName} | Position: ${claimForm.position} | Email: ${claimForm.contactEmail}`,
      });
      if (error) throw error;
      setClaimStatus("pending");
      setShowClaimModal(false);
      toast({ title: "Claim submitted!", description: "Your claim is under review. We'll notify you once approved." });
    } catch (err: any) {
      toast({ title: "Claim failed", description: err.message || "Something went wrong", variant: "destructive" });
    }
    setClaimLoading(false);
  };

  if (loading) return <MainLayout><div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div></MainLayout>;
  if (!broker) return <MainLayout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="text-muted-foreground">Broker not found.</p><Link to="/brokers" className="text-primary hover:underline">← Back to Brokers</Link></div></MainLayout>;

  const scoreColor = broker.score >= 8 ? "bg-primary" : broker.score >= 6 ? "bg-accent" : "bg-destructive";
  const review = getPlaceholderReview(broker);

  return (
    <MainLayout>
      <SEO
        title={`${broker.name} Review — Full A-Z Broker Analysis`}
        description={`Read the full ${broker.name} review — regulation, spreads, deposits, and real trader feedback. Score: ${broker.score}/10.`}
        path={`/brokers/${broker.slug}`}
      />
      <div className="min-h-screen pt-6 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/brokers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Brokers
          </Link>

          {/* ===== HEADER ===== */}
          <div className="glass-card rounded-xl p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                {/* Logo placeholder */}
                <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl font-display font-extrabold text-primary">{broker.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground">{broker.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
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
                    {broker.badge === "warning" && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-destructive bg-destructive/10 border-destructive/20">
                        <AlertTriangle className="w-3 h-3" /> Warning
                      </span>
                    )}
                    {claimStatus === "claimed" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                        <CheckCircle className="w-3 h-3" /> Claimed
                      </span>
                    ) : claimStatus === "pending" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20">
                        <Clock className="w-3 h-3" /> Pending Review
                      </span>
                    ) : (
                      <button
                        onClick={handleClaimClick}
                        disabled={claimLoading}
                        className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Shield className="w-3 h-3" /> Claim This Profile
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(broker.stars) ? "text-accent fill-accent" : "text-border"}`} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{broker.stars}</span>
                    <span className="text-xs text-muted-foreground">({broker.review_count} reviews)</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Min Deposit: <strong className="text-foreground">{broker.min_deposit}</strong></span>
                    <span>Leverage: <strong className="text-foreground">{broker.leverage}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right — Score + CTA */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <div className="text-center">
                  <div className="text-xs font-mono text-muted-foreground mb-1">Trust Score</div>
                  <div className={`w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-mono font-extrabold text-primary-foreground ${scoreColor}`}>
                    {broker.score}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="font-display font-bold">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Open Account
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setActiveTab("reviews"); setShowReviewForm(true); }}>
                    Add Review
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== TABS ===== */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border rounded-lg h-auto p-1 flex-wrap">
              <TabsTrigger value="overview" className="font-display text-sm">Overview</TabsTrigger>
              <TabsTrigger value="reviews" className="font-display text-sm">Reviews ({reviews.length})</TabsTrigger>
              <TabsTrigger value="complaints" className="font-display text-sm">Complaints ({broker.complaints || 0})</TabsTrigger>
              <TabsTrigger value="promotions" className="font-display text-sm">Promotions</TabsTrigger>
              <TabsTrigger value="comparison" className="font-display text-sm">Comparison</TabsTrigger>
              <TabsTrigger value="scam-score" className="font-display text-sm">Scam Score</TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW TAB ===== */}
            <TabsContent value="overview" className="mt-6 space-y-8">
              {/* Our Verdict */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" /> Our Verdict
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed">{review.verdict}</p>
                </div>
              </section>

              {/* Key Facts */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" /> Key Facts at a Glance
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      {review.keyFacts.map((fact, i) => (
                        <tr key={fact.label} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                          <td className="px-5 py-3 text-sm font-medium text-muted-foreground w-44">{fact.label}</td>
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{fact.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Regulation & Safety */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Regulation & Safety
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {broker.name} holds licenses from {broker.regulation?.join(", ") || "unregulated authorities"}.
                    {broker.score >= 8 ? " Client funds are held in segregated accounts with tier-1 banks, providing strong investor protection." : broker.score >= 6 ? " The regulatory framework provides moderate protection for client funds." : " The regulatory status raises concerns. We recommend exercising extreme caution."}
                  </p>
                </div>
              </section>

              {/* Trading Conditions */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Trading Conditions
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {broker.name} offers {broker.avg_spread} average spreads with leverage up to {broker.leverage}.
                    The minimum deposit starts from {broker.min_deposit}, making it {parseInt(broker.min_deposit?.replace(/[^0-9]/g, "") || "0") <= 10 ? "highly accessible for beginners" : "suitable for traders with moderate capital"}.
                  </p>
                  <div className="glass-card rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Account</th>
                          <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Min Deposit</th>
                          <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Spread</th>
                          <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Leverage</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-border/50">
                          <td className="px-4 py-2.5 text-foreground">Standard</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{broker.min_deposit}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{broker.avg_spread}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{broker.leverage}</td>
                        </tr>
                        <tr className="border-t border-border/50">
                          <td className="px-4 py-2.5 text-foreground">ECN/Raw</td>
                          <td className="px-4 py-2.5 text-muted-foreground">$200+</td>
                          <td className="px-4 py-2.5 text-muted-foreground">0.0 pips</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{broker.leverage}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Platforms */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Platforms Available
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["MetaTrader 4", "MetaTrader 5", "Web Trader"].map(p => (
                    <div key={p} className="glass-card rounded-xl p-4 text-center">
                      <div className="text-sm font-display font-bold text-foreground">{p}</div>
                      <div className="text-xs text-muted-foreground mt-1">Desktop, Mobile, Web</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Deposits & Withdrawals */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" /> Deposits & Withdrawals
                </h2>
                <div className="glass-card rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Method</th>
                        <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Min</th>
                        <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Processing</th>
                        <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { method: "Bank Transfer", min: "$50", processing: "1-3 days", fee: "Free" },
                        { method: "Credit/Debit Card", min: "$10", processing: "Instant", fee: "Free" },
                        { method: "Crypto (USDT)", min: "$10", processing: "10-30 min", fee: "Network fee" },
                        { method: "E-wallets", min: "$1", processing: "Instant", fee: "Free" },
                      ].map((m, i) => (
                        <tr key={m.method} className={i % 2 === 0 ? "" : "bg-muted/10"}>
                          <td className="px-4 py-2.5 text-foreground">{m.method}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.min}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.processing}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Customer Support */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-primary" /> Customer Support
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Live Chat", "Email", "Phone", "Telegram"].map(c => (
                      <span key={c} className="text-xs font-mono bg-primary/10 text-primary px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Available 24/5 during market hours. Multilingual support available.</p>
                </div>
              </section>

              {/* Pros & Cons */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Pros & Cons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-display font-bold text-primary mb-3">✓ Pros</h3>
                    <ul className="space-y-2">
                      {review.pros.map(p => (
                        <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-sm font-display font-bold text-destructive mb-3">✗ Cons</h3>
                    <ul className="space-y-2">
                      {review.cons.map(c => (
                        <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* Best For */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Who Is This Broker Best For?</h2>
                <div className="glass-card rounded-xl p-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-primary">Best for:</strong> {review.bestFor}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-destructive">Not ideal for:</strong> {review.notIdealFor}
                  </p>
                </div>
              </section>

              {/* Final Verdict & Ratings */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Our Final Verdict</h2>
                <div className="glass-card rounded-xl p-6 space-y-4">
                  <div className="space-y-3">
                    <RatingBar label="Safety" value={review.ratings.safety} />
                    <RatingBar label="Fees" value={review.ratings.fees} />
                    <RatingBar label="Platform" value={review.ratings.platform} />
                    <RatingBar label="Support" value={review.ratings.support} />
                  </div>
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <span className="text-sm font-display font-bold text-foreground">Overall Score</span>
                    <span className="text-2xl font-mono font-extrabold text-primary">{broker.score}/10</span>
                  </div>
                </div>
              </section>

              {/* How to Open Account */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">How to Open an Account</h2>
                <div className="glass-card rounded-xl p-6">
                  <div className="space-y-4">
                    {[
                      'Click "Open Account" button above',
                      "Fill in your personal details",
                      "Verify your identity (KYC)",
                      "Make your first deposit",
                      "Start trading",
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                          {i + 1}
                        </div>
                        <span className="text-sm text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <Button className="font-display font-bold">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Account with {broker.name}
                    </Button>
                  </div>
                </div>
              </section>

              {/* Disclaimer */}
              <div className="rounded-xl border border-border/50 bg-muted/20 p-5 text-xs text-muted-foreground italic leading-relaxed">
                This review is based on our independent research and user-submitted data.
                NAPT may earn a commission if you open an account via our links.
                This does not affect our review or rating.
              </div>
            </TabsContent>

            {/* ===== REVIEWS TAB ===== */}
            <TabsContent value="reviews" className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground">Community Reviews</h2>
                <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  Write a Review
                </Button>
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
                      <span className="text-[10px] text-muted-foreground mt-2 block">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ===== COMPLAINTS TAB ===== */}
            <TabsContent value="complaints" className="mt-6">
              <div className="glass-card rounded-xl p-8 text-center">
                <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  {(broker.complaints || 0) > 0 ? `${broker.complaints} Complaints Filed` : "No Complaints"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  {(broker.complaints || 0) > 0
                    ? "These complaints were submitted by verified users. We investigate each one independently."
                    : "No complaints have been filed against this broker yet. That's a good sign!"}
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/contact">File a Complaint</Link>
                </Button>
              </div>
            </TabsContent>

            {/* ===== PROMOTIONS TAB ===== */}
            <TabsContent value="promotions" className="mt-6">
              <div className="glass-card rounded-xl p-8 text-center">
                <Gift className="w-10 h-10 text-accent mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-foreground mb-2">Active Promotions</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  No active promotions found for {broker.name} at the moment. Check back soon or browse all available offers.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/promotions">Browse All Promotions</Link>
                </Button>
              </div>
            </TabsContent>

            {/* ===== COMPARISON TAB ===== */}
            <TabsContent value="comparison" className="mt-6">
              <div className="glass-card rounded-xl p-8 text-center">
                <GitCompare className="w-10 h-10 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-foreground mb-2">Compare {broker.name}</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                  See how {broker.name} stacks up against other brokers — regulation, spreads, leverage, and more side-by-side.
                </p>
                <Button size="sm" asChild>
                  <Link to={`/compare?b=${broker.slug}`}>
                    <GitCompare className="w-4 h-4 mr-2" />
                    Start Comparison
                  </Link>
                </Button>
              </div>
            </TabsContent>

            {/* ===== SCAM SCORE TAB ===== */}
            <TabsContent value="scam-score" className="mt-6">
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div className="text-center">
                  <div className="text-xs font-mono text-muted-foreground mb-2">SCAM SCORE</div>
                  <div className={`inline-flex w-24 h-24 rounded-2xl items-center justify-center text-3xl font-mono font-extrabold text-primary-foreground ${scoreColor}`}>
                    {broker.score}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">
                    {broker.score >= 8 ? "This broker has a high trust score. Low risk of scam based on our analysis." :
                     broker.score >= 6 ? "Moderate trust score. Exercise standard caution." :
                     "Low trust score. High risk — proceed with extreme caution."}
                  </p>
                </div>

                <div className="space-y-3">
                  <RatingBar label="Regulation" value={review.ratings.safety} />
                  <RatingBar label="Transparency" value={review.ratings.fees} />
                  <RatingBar label="User Trust" value={review.ratings.platform} />
                  <RatingBar label="Track Record" value={review.ratings.support} />
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-display font-bold text-foreground mb-2">How We Calculate Scam Score</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Our scam score is based on regulatory status, complaint history, user reviews, transparency of operations,
                    withdrawal reliability, and overall track record. Scores above 8 indicate low risk, 6-8 moderate risk,
                    and below 6 high risk.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Claim Proof Modal */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Claim {broker?.name} Profile</DialogTitle>
            <DialogDescription>Submit proof of ownership. Our team will review and approve your claim.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleClaimSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Company Name *</label>
              <input
                type="text"
                value={claimForm.companyName}
                onChange={(e) => setClaimForm(f => ({ ...f, companyName: e.target.value }))}
                placeholder="e.g. FBS Markets Inc."
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Position/Role *</label>
              <input
                type="text"
                value={claimForm.position}
                onChange={(e) => setClaimForm(f => ({ ...f, position: e.target.value }))}
                placeholder="e.g. Head of Partnerships"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Proof Document URL *</label>
              <input
                type="url"
                value={claimForm.proofUrl}
                onChange={(e) => setClaimForm(f => ({ ...f, proofUrl: e.target.value }))}
                placeholder="Google Drive / Dropbox link to verification docs"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">Upload business registration, employee ID, or official letter to Google Drive/Dropbox and paste the link.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contact Email *</label>
              <input
                type="email"
                value={claimForm.contactEmail}
                onChange={(e) => setClaimForm(f => ({ ...f, contactEmail: e.target.value }))}
                placeholder="your@company.com"
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            <Button type="submit" disabled={claimLoading} className="w-full font-display font-bold">
              {claimLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Claim for Review"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default BrokerDetail;
