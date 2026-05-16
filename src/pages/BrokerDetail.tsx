import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { brokers as localBrokers } from "@/data/brokers";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema, brokerReviewSchema, faqSchema } from "@/components/seo/JsonLd";
import StickyBrokerCTA from "@/components/broker/StickyBrokerCTA";
import PeerBrokersRail from "@/components/broker/PeerBrokersRail";
import WithdrawalProofGallery from "@/components/broker/WithdrawalProofGallery";
import ReviewSubmissionForm from "@/components/ReviewSubmissionForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Star, Shield, Award, AlertTriangle, ArrowLeft, ExternalLink,
  CheckCircle, XCircle, Globe, Clock, CreditCard, Headphones,
  TrendingUp, FileText, Scale, Gift, GitCompare, Loader2, ShieldAlert, Info
} from "lucide-react";
import ReviewReactions from "@/components/reviews/ReviewReactions";
import VerifiedDepositorBadge from "@/components/reviews/VerifiedDepositorBadge";
import StarRating from "@/components/reviews/StarRating";
import FileComplaintModal from "@/components/modals/FileComplaintModal";
import AuthModal from "@/components/modals/AuthModal";
import TrustLight from "@/components/broker/TrustLight";
import BrokerHealthScore from "@/components/broker/BrokerHealthScore";
import BeforeYouDepositChecklist from "@/components/broker/BeforeYouDepositChecklist";
import SentimentSparkline from "@/components/broker/SentimentSparkline";
import PositionSizeCalculator from "@/components/calculators/PositionSizeCalculator";
import OfferRail from "@/components/common/OfferRail";

interface AccountType { name: string; min_deposit: string; spread: string; leverage?: string; commission: string; }
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
  logo_url?: string | null;
  description?: string;
  founded_year?: number | null;
  headquarters?: string;
  pros?: string[];
  cons?: string[];
  payment_methods?: string[];
  payment_method_details?: { method: string; min: string; processing: string; fee: string }[];
  platforms?: string[];
  account_types?: AccountType[];
  website_url?: string;
  support_email?: string;
  support_phone?: string;
  license_number?: string;
  withdrawal_time?: string;
  withdrawal_fee?: string;
  warning_note?: string;
  last_verified_at?: string | null;
  updated_at?: string | null;
}

const formatVerifiedAgo = (iso?: string | null) => {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
};

interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  role: string;
  created_at: string;
  photo_urls?: string[] | null;
  verified_account?: boolean | null;
  account_proof_url?: string | null;
  account_id_masked?: string | null;
}

interface ScamAlertRow {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  is_repeat_offender: boolean;
  show_full_report: boolean;
  full_report: string | null;
  created_at: string;
}

// Placeholder full review data — will come from DB later
const getPlaceholderReview = (broker: Broker) => ({
  verdict: `${broker.name} is a well-established broker with a strong regulatory framework and competitive trading conditions. ${broker.score >= 8 ? "We recommend it for both beginners and experienced traders." : broker.score >= 6 ? "Suitable for intermediate traders who understand the risks." : "Exercise caution — read the full review carefully before committing funds."}`,
  keyFacts: [
    { label: "Platforms", value: broker.platforms && broker.platforms.length > 0 ? broker.platforms.join(", ") : "MT4, MT5, Web Trader" },
    { label: "Headquarters", value: broker.headquarters || "—" },
    { label: "Founded", value: broker.founded_year ? String(broker.founded_year) : "—" },
    { label: "License No.", value: broker.license_number || "—" },
    { label: "Withdrawal Time", value: broker.withdrawal_time || "—" },
    { label: "Deposit Methods", value: broker.payment_methods && broker.payment_methods.length > 0 ? broker.payment_methods.join(", ") : "Bank, Card, Crypto, E-wallets" },
    { label: "Customer Support", value: broker.support_email || broker.support_phone ? [broker.support_email, broker.support_phone].filter(Boolean).join(" / ") : "24/5 Live Chat, Email" },
  ].filter(f => f.value && f.value !== "—"),
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
  const [replies, setReplies] = useState<Record<string, ReviewReply>>({});
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [claimStatus, setClaimStatus] = useState<string>("unclaimed");
  const [claimedByUserId, setClaimedByUserId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ companyName: "", position: "", proofUrl: "", contactEmail: "" });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({});
  const [replySaving, setReplySaving] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [scamAlerts, setScamAlerts] = useState<ScamAlertRow[]>([]);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const { data: b } = await supabase.from("brokers").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    if (b) {
      const [{ data: r }, { data: bp }, { count: liveReviewCount }, { count: liveComplaintCount }, { data: alerts }] = await Promise.all([
        supabase.from("reviews").select("id, author, content, rating, role, created_at, photo_urls, verified_account, account_proof_url, account_id_masked").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false }),
        supabase.from("broker_profiles").select("claim_status, claimed_by").eq("broker_id", b.id).maybeSingle(),
        supabase.from("reviews").select("*", { count: "exact", head: true }).eq("broker_id", b.id).eq("status", "published"),
        supabase.from("complaints").select("*", { count: "exact", head: true }).eq("broker_id", b.id).eq("status", "published"),
        supabase.from("scam_alerts").select("id, title, description, severity, is_repeat_offender, show_full_report, full_report, created_at").eq("broker_id", b.id).eq("status", "published").order("created_at", { ascending: false }),
      ]);
      // Override cached counts with live values
      setBroker({ ...(b as unknown as Broker), review_count: liveReviewCount || 0, complaints: liveComplaintCount || 0 });
      setScamAlerts((alerts as ScamAlertRow[]) || []);
      if (r) {
        setReviews(r as Review[]);
        // fetch replies for these reviews
        const reviewIds = (r as Review[]).map((rv) => rv.id);
        if (reviewIds.length > 0) {
          const { data: rep } = await supabase
            .from("review_replies")
            .select("*")
            .in("review_id", reviewIds);
          if (rep) {
            const map: Record<string, ReviewReply> = {};
            (rep as ReviewReply[]).forEach((rr) => { map[rr.review_id] = rr; });
            setReplies(map);
          }
        }
      }
      if (bp) {
        setClaimStatus(bp.claim_status);
        setClaimedByUserId(bp.claimed_by);
      }

      if (user) {
        const { data: pendingClaim } = await supabase
          .from("profile_claims")
          .select("status")
          .eq("profile_id", b.id)
          .eq("claimed_by", user.id)
          .eq("status", "pending")
          .maybeSingle();
        if (pendingClaim) setClaimStatus("pending");

        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "super_admin")
          .maybeSingle();
        setIsSuperAdmin(!!roleRow);
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

  const canReply = isSuperAdmin || (!!user && claimedByUserId === user.id && claimStatus === "approved");

  const handleSaveReply = async (reviewId: string) => {
    if (!broker || !user) return;
    const content = (replyDrafts[reviewId] || "").trim();
    if (!content) {
      toast({ title: "Reply cannot be empty", variant: "destructive" });
      return;
    }
    setReplySaving(reviewId);
    try {
      const existing = replies[reviewId];
      if (existing) {
        const { error } = await supabase
          .from("review_replies")
          .update({ content })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("review_replies")
          .insert({ review_id: reviewId, broker_id: broker.id, user_id: user.id, content });
        if (error) throw error;
      }
      toast({ title: "Reply saved" });
      setReplyOpen((s) => ({ ...s, [reviewId]: false }));
      setReplyDrafts((s) => ({ ...s, [reviewId]: "" }));
      // refetch replies
      const { data: rep } = await supabase
        .from("review_replies")
        .select("*")
        .eq("broker_id", broker.id);
      if (rep) {
        const map: Record<string, ReviewReply> = {};
        (rep as ReviewReply[]).forEach((rr) => { map[rr.review_id] = rr; });
        setReplies(map);
      }
    } catch (err: any) {
      toast({ title: "Failed to save reply", description: err.message, variant: "destructive" });
    }
    setReplySaving(null);
  };

  const handleDeleteReply = async (reviewId: string) => {
    const existing = replies[reviewId];
    if (!existing) return;
    const { error } = await supabase.from("review_replies").delete().eq("id", existing.id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
      return;
    }
    setReplies((s) => {
      const next = { ...s };
      delete next[reviewId];
      return next;
    });
    toast({ title: "Reply deleted" });
  };

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
        title={`${broker.name} Review ${new Date().getFullYear()} — Spreads, Regulation & Real User Feedback`}
        description={`In-depth ${broker.name} review: regulation (${(broker.regulation || []).join(", ") || "N/A"}), spreads ${broker.avg_spread || "N/A"}, ${broker.review_count || 0}+ trader reviews. Trust score: ${broker.score}/10.`}
        path={`/brokers/${broker.slug}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Brokers", path: "/brokers" },
        { name: broker.name, path: `/brokers/${broker.slug}` },
      ])} />
      <JsonLd data={brokerReviewSchema({
        name: broker.name,
        slug: broker.slug,
        score: broker.score,
        stars: broker.stars,
        reviewCount: broker.review_count,
        description: broker.description,
        logoUrl: broker.logo_url || undefined,
        reviews: reviews.slice(0, 5).map(r => ({
          author: r.author || "Verified Trader",
          rating: r.rating || 3,
          content: r.content || "",
          date: (r.created_at || new Date().toISOString()).slice(0, 10),
        })),
      })} />
      <JsonLd data={faqSchema([
        { question: `Is ${broker.name} regulated?`, answer: (broker.regulation && broker.regulation.length > 0)
            ? `${broker.name} is regulated by ${broker.regulation.join(", ")}. Always verify the licence number on the regulator's official register before depositing.`
            : `${broker.name} has no verified top-tier regulation on file. Treat this as elevated risk and start with a minimal deposit.` },
        { question: `Is ${broker.name} safe for traders?`, answer: `Our independent trust score for ${broker.name} is ${Math.round((broker.score || 0) * 10)}/100, based on regulation, complaint history, withdrawal reliability and ${broker.review_count || 0} verified user reviews.` },
        { question: `What is the minimum deposit at ${broker.name}?`, answer: broker.min_deposit ? `The minimum deposit at ${broker.name} starts from ${broker.min_deposit}.` : `Minimum deposit details for ${broker.name} are not published. Contact the broker before funding an account.` },
        { question: `How long do withdrawals take at ${broker.name}?`, answer: broker.withdrawal_time ? `${broker.name} typically processes withdrawals in ${broker.withdrawal_time}${broker.withdrawal_fee ? `, with fees around ${broker.withdrawal_fee}` : ""}.` : `Withdrawal speed at ${broker.name} varies by payment method. Check our verified user complaints below for real timing reports.` },
      ])} />
      <div className="min-h-screen pt-6 pb-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* ===== HEADER — at-a-glance ===== */}
          {(() => {
            const isProp = broker.type === "prop-firm";
            const scoreOutOf100 = Math.round((broker.score || 0) * 10);
            const scoreLabel = broker.score >= 8 ? "Excellent" : broker.score >= 6 ? "Average" : broker.score >= 4 ? "Caution" : "High Risk";
            // Clean headline numbers from messy raw values
            const cleanSpread = (raw?: string) => {
              if (!raw) return "—";
              // Take first chunk before "," or "(" → e.g. "0.3 pips (Standard), 0.0..." → "0.3 pips"
              const first = raw.split(/[,(]/)[0].trim();
              return first || raw;
            };
            const cleanLeverage = (raw?: string) => {
              if (!raw) return "—";
              if (/unlimited/i.test(raw)) return "Unlimited";
              const matches = raw.match(/1:\s*\d+/g);
              if (!matches?.length) return raw.split(/[,(]/)[0].trim() || raw;
              const max = matches
                .map((m) => parseInt(m.replace(/\D/g, ""), 10))
                .reduce((a, b) => Math.max(a, b), 0);
              return `1:${max}`;
            };
            const stats = isProp
              ? [
                  { label: "Account Size", value: broker.avg_spread || "$5K–$400K" },
                  { label: "Max Leverage", value: cleanLeverage(broker.leverage) },
                  { label: "Start From", value: broker.min_deposit || "$10" },
                  { label: "Complaints", value: String(broker.complaints || 0) },
                  { label: "Rating", value: `${broker.stars}/5` },
                ]
              : [
                  { label: "Min Deposit", value: broker.min_deposit || "—" },
                  { label: "Avg Spread", value: cleanSpread(broker.avg_spread) },
                  { label: "Max Leverage", value: cleanLeverage(broker.leverage) },
                  { label: "Complaints", value: String(broker.complaints || 0) },
                  { label: "Rating", value: `${broker.stars}/5` },
                ];
            return (
              <div className="glass-card rounded-2xl p-5 md:p-7 mb-6 overflow-hidden relative">
                {/* Top row: identity ←→ trust score panel */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
                  {/* Identity */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center shrink-0 overflow-hidden">
                      {broker.logo_url ? (
                        <img src={broker.logo_url} alt={`${broker.name} logo`} className="w-full h-full object-contain p-1.5" loading="lazy" />
                      ) : (
                        <span className="text-3xl font-display font-extrabold text-primary">{broker.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground truncate">{broker.name}</h1>
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
                        {scamAlerts.length > 0 && (
                          <a href="#investigations" className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-full text-destructive bg-destructive/10 border-destructive/30 hover:bg-destructive/20 transition-colors animate-pulse">
                            <ShieldAlert className="w-3 h-3" /> Under Investigation
                          </a>
                        )}
                      </div>

                      {/* Rating + reviews + trust light + type tag */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StarRating value={broker.stars} size={14} />
                        <span className="text-sm font-semibold text-foreground">{broker.stars}</span>
                        <span className="text-xs text-muted-foreground">({reviews.length} review{reviews.length === 1 ? "" : "s"})</span>
                        <span className="text-muted-foreground">|</span>
                        <TrustLight score={broker.score} complaints={broker.complaints} showLabel />
                        <span className="text-muted-foreground">|</span>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-border bg-secondary/50 text-foreground">
                          {isProp ? "Prop Firm" : broker.type || "Broker"}
                        </span>
                      </div>

                      {/* Regulation chips — short names only, full details in Regulation & Safety section */}
                      {broker.regulation?.length ? (
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap" title={broker.regulation.join(" · ")}>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mr-1">Regulated by:</span>
                          {broker.regulation.map((r) => {
                            const short = r.split(/[\s(\-–—]/)[0].trim();
                            return (
                              <span key={r} className="text-[10px] font-mono font-bold text-foreground bg-secondary px-2 py-0.5 rounded">
                                {short}
                              </span>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* Last updated */}
                      {broker.updated_at && (
                        <p className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-wider">
                          Last updated: {new Date(broker.updated_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </p>
                      )}

                      {/* Claim + verified-ago row */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {claimStatus === "claimed" ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-primary bg-primary/10 border-primary/20">
                            <CheckCircle className="w-3 h-3" /> Claimed
                          </span>
                        ) : claimStatus === "pending" ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        ) : (
                          <button onClick={handleClaimClick} disabled={claimLoading} className="flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-semibold border rounded-full text-accent bg-accent/10 border-accent/20 hover:bg-accent/20 transition-colors disabled:opacity-50">
                            <Shield className="w-3 h-3" /> Claim This Profile
                          </button>
                        )}
                        {formatVerifiedAgo(broker.last_verified_at) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border border-primary/30 bg-primary/5 text-primary">
                            <CheckCircle className="w-3 h-3" /> Verified {formatVerifiedAgo(broker.last_verified_at)}
                          </span>
                        )}
                      </div>

                      {/* 5-tile stat strip — inside left column */}
                      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 rounded-xl border border-border/60 bg-background/30 divide-x divide-border/40">
                        {stats.map((s) => (
                          <div key={s.label} className="px-3 py-3 text-center">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
                            <div className="text-base font-display font-extrabold text-foreground">{s.value}</div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Trust score panel + CTAs */}
                  <div className="w-full lg:w-[260px] shrink-0">
                    <div className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">NAFT Trust Score</span>
                        <span className={`text-[10px] font-mono font-bold uppercase ${broker.score >= 8 ? "text-primary" : broker.score >= 6 ? "text-accent" : "text-destructive"}`}>{scoreLabel}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-5xl font-display font-extrabold ${broker.score >= 8 ? "text-primary" : broker.score >= 6 ? "text-accent" : "text-destructive"}`}>{scoreOutOf100}</span>
                        <span className="text-sm font-mono text-muted-foreground">/100</span>
                      </div>
                      <div className="score-bar mt-2">
                        <div className={`score-bar-fill ${scoreColor} opacity-80`} style={{ width: `${scoreOutOf100}%` }} />
                      </div>
                      {(broker as any).health_score != null && (() => {
                        const hs = Number((broker as any).health_score);
                        const tier =
                          hs >= 80 ? { label: "Excellent", color: "text-green-500", bg: "bg-green-500/60" } :
                          hs >= 60 ? { label: "Healthy",   color: "text-primary",   bg: "bg-primary/60"   } :
                          hs >= 40 ? { label: "Watch",     color: "text-yellow-500",bg: "bg-yellow-500/60"} :
                                     { label: "Risk",      color: "text-destructive",bg: "bg-destructive/60"};
                        const updated = (broker as any).health_updated_at;
                        return (
                          <div
                            className="mt-3 pt-3 border-t border-border"
                            title={updated ? `Updated ${new Date(updated).toLocaleDateString()}` : undefined}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                                Broker Health
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className={`text-sm font-display font-extrabold ${tier.color}`}>{hs.toFixed(0)}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">/100</span>
                                <span className={`ml-1.5 text-[9px] font-mono font-bold uppercase ${tier.color}`}>
                                  {tier.label}
                                </span>
                              </div>
                            </div>
                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${tier.bg}`} style={{ width: `${Math.max(2, Math.min(100, hs))}%` }} />
                            </div>
                            <p className="mt-1.5 text-[9px] leading-tight text-muted-foreground">
                              Based on complaints, scam alerts, ratings &amp; withdrawal proofs.
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {broker.website_url ? (
                        <a href={broker.website_url} target="_blank" rel="noopener noreferrer sponsored" className="block">
                          <Button size="sm" className="w-full font-display font-bold">
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Account
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" className="w-full font-display font-bold" disabled>
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Coming Soon
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setActiveTab("reviews"); setShowReviewForm(true); }}>
                          Add Review
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => user ? setShowComplaintModal(true) : setShowAuthModal(true)}
                        >
                          <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Complaint
                          {(broker.complaints || 0) > 0 && (
                            <span className="ml-1 px-1 py-0.5 text-[9px] font-mono bg-destructive/20 text-destructive rounded">{broker.complaints}</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer rail */}
                {(broker.website_url || (broker as any).affiliate_url) && (
                  <div className="mt-4">
                    <OfferRail
                      code={isProp ? (broker as any).promo_code : null}
                      label={(broker as any).promo_label}
                      url={(broker as any).affiliate_url || broker.website_url}
                      entityName={broker.name}
                      variant="wide"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {scamAlerts.length > 0 && (
            <section id="investigations" className="mb-6 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-5 md:p-6 scroll-mt-24">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                  <h2 className="text-lg md:text-xl font-display font-extrabold uppercase tracking-wider text-destructive">
                    Active Investigations
                  </h2>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                    {scamAlerts.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Verified user complaints under review
                </p>
              </div>

              <div className="space-y-4">
                {scamAlerts.map((a) => (
                  <div key={a.id} className="rounded-lg border border-destructive/30 bg-background/40 p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-display font-bold text-foreground">{a.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono uppercase ${
                          a.severity === "high"
                            ? "bg-destructive/15 text-destructive border-destructive/30"
                            : "bg-accent/10 text-accent border-accent/20"
                        }`}>
                          {a.severity} severity
                        </span>
                        {a.is_repeat_offender && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-destructive/20 text-destructive border border-destructive/50 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Repeat Offender
                          </span>
                        )}
                      </div>
                    </div>

                    {a.description && (
                      <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                    )}

                    {a.show_full_report && a.full_report && a.full_report.trim().length > 0 && (
                      <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert className="w-4 h-4 text-destructive" />
                          <h4 className="text-xs font-display font-extrabold uppercase tracking-wider text-destructive">
                            Full Investigation Report
                          </h4>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                          {a.full_report}
                        </p>
                      </div>
                    )}

                    <div className="mt-3">
                      <Link
                        to={`/scam-alerts/${a.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-destructive hover:underline"
                      >
                        View Full Alert <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

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
            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Our Verdict */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" /> Our Verdict
                </h2>
                <div className="glass-card rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed">{broker.description?.trim() || review.verdict}</p>
                </div>
              </section>

              {/* Trust Amplifiers */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <BeforeYouDepositChecklist brokerName={broker.name} />
                </div>
                <SentimentSparkline
                  score={broker.score}
                  reviewCount={broker.review_count || 0}
                  complaints={broker.complaints || 0}
                />
              </div>

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
                <div className="glass-card rounded-xl p-6 space-y-3">
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
                          <th className="px-4 py-2.5 text-left font-mono text-xs text-muted-foreground">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(broker.account_types && broker.account_types.length > 0 ? broker.account_types : [
                          { name: "Standard", min_deposit: broker.min_deposit, spread: broker.avg_spread, leverage: broker.leverage, commission: "—" },
                        ]).map((at, i) => (
                          <tr key={i} className="border-t border-border/50">
                            <td className="px-4 py-2.5 text-foreground">{at.name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{at.min_deposit}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{at.spread}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{at.leverage || broker.leverage}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{at.commission || "—"}</td>
                          </tr>
                        ))}
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
                  {(broker.platforms && broker.platforms.length > 0 ? broker.platforms : ["MetaTrader 4", "MetaTrader 5", "Web Trader"]).map(p => (
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
                      {(broker.payment_method_details && broker.payment_method_details.length > 0
                        ? broker.payment_method_details
                        : broker.payment_methods && broker.payment_methods.length > 0
                        ? broker.payment_methods.map(m => ({ method: m, min: "—", processing: "—", fee: "—" }))
                        : [
                          { method: "Bank Transfer", min: "$50", processing: "1-3 days", fee: "Free" },
                          { method: "Credit/Debit Card", min: "$10", processing: "Instant", fee: "Free" },
                          { method: "Crypto (USDT)", min: "$10", processing: "10-30 min", fee: "Network fee" },
                          { method: "E-wallets", min: "$1", processing: "Instant", fee: "Free" },
                        ]).map((m, i) => (
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

              {/* Trust Score Breakdown */}
              <section>
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Trust Score Breakdown</h2>
                <div className="glass-card rounded-xl p-6 space-y-5">
                  {(() => {
                    const regScore = Math.min(10, (broker.regulation?.length || 0) * 2.5);
                    const reviewScore = Math.min(10, (broker.stars || 0) * 2);
                    const complaintScore = Math.max(0, 10 - (broker.complaints || 0) * 0.3);
                    const wdScore = Math.min(10, Math.max(0, broker.score + (broker.withdrawal_time?.toLowerCase().includes("instant") ? 0.5 : 0)));
                    const items = [
                      { label: "Regulation", weight: "30%", value: regScore, hint: `${broker.regulation?.length || 0} active license${(broker.regulation?.length || 0) === 1 ? "" : "s"} verified against public registers.` },
                      { label: "User Reviews", weight: "25%", value: reviewScore, hint: `${broker.review_count || 0} verified review${(broker.review_count || 0) === 1 ? "" : "s"} from real traders.` },
                      { label: "Withdrawal Speed", weight: "25%", value: wdScore, hint: broker.withdrawal_time ? `Reported processing: ${broker.withdrawal_time}.` : "Processing time inferred from user reports." },
                      { label: "Complaint History", weight: "20%", value: complaintScore, hint: `${broker.complaints || 0} complaint${(broker.complaints || 0) === 1 ? "" : "s"} filed on NAFT.` },
                    ];
                    return items.map((it) => {
                      const color = it.value >= 8 ? "bg-primary" : it.value >= 6 ? "bg-accent" : "bg-destructive";
                      return (
                        <div key={it.label}>
                          <div className="flex items-baseline justify-between mb-1.5">
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-display font-bold text-foreground">{it.label}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{it.weight}</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-foreground">{it.value.toFixed(1)}/10</span>
                          </div>
                          <div className="score-bar mb-1.5">
                            <div className={`score-bar-fill ${color}`} style={{ width: `${it.value * 10}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">{it.hint}</p>
                        </div>
                      );
                    });
                  })()}
                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-display font-bold text-foreground">Overall Trust Score</div>
                      <Link to="/how-we-review" className="text-xs text-primary hover:underline">How we calculate this →</Link>
                    </div>
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
                    {broker.website_url ? (
                      <a href={broker.website_url} target="_blank" rel="noopener noreferrer sponsored">
                        <Button className="font-display font-bold">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Account with {broker.name}
                        </Button>
                      </a>
                    ) : (
                      <Button className="font-display font-bold" disabled>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </section>

            </TabsContent>

            {/* ===== REVIEWS TAB ===== */}
            <TabsContent value="reviews" className="mt-6" id="reviews-anchor">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-foreground">Community Reviews</h2>
                <Button size="sm" onClick={() => setShowReviewForm(!showReviewForm)}>
                  Write a Review
                </Button>
              </div>

              {showReviewForm && (
                <div className="mb-6">
                  <ReviewSubmissionForm
                    defaultBrokerId={broker?.id}
                    onSuccess={() => { setShowReviewForm(false); fetchData(); }}
                  />
                </div>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground glass-card rounded-xl p-6">No reviews yet. Be the first to review this broker!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => {
                    const reply = replies[r.id];
                    const isEditing = !!replyOpen[r.id];
                    return (
                      <div key={r.id} className="glass-card rounded-xl p-5">
                        <div className="flex items-start justify-between mb-2 gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">{r.author}</span>
                              <VerifiedDepositorBadge
                                verified={!!r.verified_account}
                                hasProof={!!r.account_proof_url}
                                hasAccountId={!!r.account_id_masked}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{r.role}</span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < (r.rating || 0) ? "text-accent fill-accent" : "text-border"}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{r.content}</p>
                        {r.photo_urls && r.photo_urls.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {r.photo_urls.map((url, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setLightboxUrl(url)}
                                className="w-20 h-20 rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors"
                              >
                                <img src={url} alt={`Review photo ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString()}
                          </span>
                          <ReviewReactions reviewId={r.id} />
                          {canReply && !isEditing && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => {
                                setReplyOpen((s) => ({ ...s, [r.id]: true }));
                                setReplyDrafts((s) => ({ ...s, [r.id]: reply?.content || "" }));
                              }}
                            >
                              {reply ? "Edit Reply" : "Reply"}
                            </Button>
                          )}
                        </div>

                        {/* Existing broker reply */}
                        {reply && !isEditing && (
                          <div className="mt-4 ml-4 border-l-2 border-primary/40 pl-4 py-2 bg-primary/5 rounded-r-md">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="w-3.5 h-3.5 text-primary" />
                              <span className="text-xs font-semibold text-primary">Official response from {broker.name}</span>
                            </div>
                            <p className="text-sm text-foreground whitespace-pre-wrap">{reply.content}</p>
                            <span className="text-[10px] text-muted-foreground mt-1 block">
                              {new Date(reply.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Inline reply editor */}
                        {canReply && isEditing && (
                          <div className="mt-4 border-t border-border pt-3 space-y-2">
                            <textarea
                              value={replyDrafts[r.id] || ""}
                              onChange={(e) => setReplyDrafts((s) => ({ ...s, [r.id]: e.target.value }))}
                              placeholder={`Write an official response as ${broker.name}...`}
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            />
                            <div className="flex items-center gap-2 justify-end">
                              {reply && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteReply(r.id)}
                                >
                                  Delete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => setReplyOpen((s) => ({ ...s, [r.id]: false }))}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                disabled={replySaving === r.id}
                                onClick={() => handleSaveReply(r.id)}
                              >
                                {replySaving === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Reply"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            <TabsContent value="comparison" className="mt-6 space-y-6">
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
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-display font-bold text-lg mb-1">Position Size Calculator</h3>
                <p className="text-xs text-muted-foreground mb-4">Size your trade on {broker.name} based on your account risk.</p>
                <PositionSizeCalculator compact />
                <div className="text-center mt-4">
                  <Link to="/calculators" className="text-xs font-mono text-primary hover:underline">
                    Open full calculators →
                  </Link>
                </div>
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

          <WithdrawalProofGallery brokerId={broker.id} brokerName={broker.name} />
          <PeerBrokersRail brokerId={broker.id} type={broker.type} />

          {/* Page-level data source disclosure — quiet footer note */}
          <div className="mt-8 pt-6 border-t border-border/40 flex items-start gap-2 text-[11px] font-mono text-muted-foreground/80 leading-relaxed">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
            <p>
              Information on this page is sourced from public data and the NAFT community.{claimStatus !== "claimed" && ` ${broker.name} hasn't claimed this profile yet — if you represent the broker, use the “Claim This Profile” button at the top to respond to community reviews.`} NAFT may earn a commission when you open an account through our links — this does not affect our ratings or research.
            </p>
          </div>
        </div>
      </div>

      <StickyBrokerCTA
        broker={{ name: broker.name, slug: broker.slug, score: broker.score, website_url: broker.website_url, logo_url: broker.logo_url }}
        onWriteReview={() => { setActiveTab("reviews"); setTimeout(() => document.getElementById("reviews-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50); }}
      />

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

      {/* Photo lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={(open) => !open && setLightboxUrl(null)}>
        <DialogContent className="max-w-3xl p-2 bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Review photo</DialogTitle>
            <DialogDescription>Enlarged review photo</DialogDescription>
          </DialogHeader>
          {lightboxUrl && (
            <img loading="lazy" decoding="async" src={lightboxUrl} alt="Review photo" className="w-full h-auto max-h-[80vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {broker && (
        <FileComplaintModal
          open={showComplaintModal}
          onOpenChange={setShowComplaintModal}
          brokerId={broker.id}
          brokerName={broker.name}
          onSuccess={fetchData}
        />
      )}
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </MainLayout>
  );
};

export default BrokerDetail;
