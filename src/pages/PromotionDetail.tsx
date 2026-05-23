import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { getPromoBySlug, PromotionDetail as PromotionType } from "@/data/promotionsData";
import { ArrowLeft, Clock, ExternalLink, CheckCircle2, AlertTriangle, Gift, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NaftVerificationBanner from "@/components/common/NaftVerificationBanner";
import NaftVerifiedBadge from "@/components/common/NaftVerifiedBadge";

const typeColors: Record<string, string> = {
  bonus: "bg-primary/20 text-primary",
  discount: "bg-accent/20 text-accent",
  "no-deposit": "bg-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]",
  spread: "bg-[hsl(var(--purple))]/20 text-[hsl(var(--purple))]",
  "profit-split": "bg-[hsl(var(--coral))]/20 text-[hsl(var(--coral))]",
  "low-deposit": "bg-muted-foreground/20 text-muted-foreground",
  cashback: "bg-accent/20 text-accent",
};

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const interval = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
        <div key={unit} className="flex flex-col items-center">
          <span className="text-2xl md:text-3xl font-extrabold text-primary font-mono tabular-nums">
            {String(timeLeft[unit]).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">{unit}</span>
        </div>
      ))}
    </div>
  );
};

const PromotionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [promo, setPromo] = useState<PromotionType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    (async () => {
      // Try Supabase first by slug, then by id (for legacy links)
      let row: any = null;
      const { data: bySlug } = await supabase
        .from("promotions")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      row = bySlug;

      if (!row) {
        const { data: byId } = await supabase
          .from("promotions")
          .select("*")
          .eq("id", slug)
          .eq("status", "published")
          .maybeSingle();
        row = byId;
      }

      if (row) {
        setPromo({
          id: row.id,
          slug: row.slug || row.id,
          title: row.title,
          description: row.description || "",
          full_description: row.full_description || row.description || "",
          promo_type: row.promo_type,
          bonus_amount: row.bonus_amount || "",
          expiry_date: row.expiry_date,
          link_url: row.referral_url || row.link_url || "",
          image_url: row.image_url || "",
          is_featured: !!row.is_featured,
          how_to_claim: row.how_to_claim || [],
          terms: row.terms || [],
          broker_name: row.broker_name || "",
          created_at: row.created_at,
        });
      } else {
        const fallback = getPromoBySlug(slug);
        if (fallback) setPromo(fallback);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>
      </MainLayout>
    );
  }

  if (!promo) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Promotion Not Found</h1>
          <Link to="/promotions" className="text-primary hover:underline">← Back to Promotions</Link>
        </div>
      </MainLayout>
    );
  }

  const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
  const claimUrl = promo.link_url;
  const canClaim = !!claimUrl && !isExpired;

  return (
    <MainLayout>
      <SEO
        title={`${promo.title} | NAFT Promotions`}
        description={promo.description}
        path={`/promotions/${promo.slug}`}
      />

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-12 left-0 right-0 z-50 md:hidden px-4 pb-3">
        {canClaim ? (
          <a href={claimUrl} target="_blank" rel="noopener noreferrer sponsored" className="block">
            <Button className="w-full h-12 text-base font-bold shadow-[0_-4px_20px_hsl(var(--primary)/0.3)]">
              <Gift className="w-5 h-5 mr-2" /> Claim This Offer
            </Button>
          </a>
        ) : (
          <Button className="w-full h-12 text-base font-bold" disabled>
            {isExpired ? "Offer Expired" : "Coming Soon"}
          </Button>
        )}
      </div>

      <section className="max-w-4xl mx-auto px-4 pt-6 pb-24 md:pb-20">
        <Link to="/promotions" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Promotions
        </Link>

        <NaftVerificationBanner verified={(promo as any).naft_verified} entityLabel="promotion" className="mb-6" />

        <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge className={`text-[10px] font-mono uppercase ${typeColors[promo.promo_type] || "bg-muted text-muted-foreground"}`}>
                  {promo.promo_type.replace("-", " ")}
                </Badge>
                {promo.is_featured && (
                  <Badge className="bg-accent/20 text-accent text-[10px] font-mono uppercase">
                    <Star className="w-3 h-3 mr-1 fill-accent" /> Featured
                  </Badge>
                )}
                <NaftVerifiedBadge verified={(promo as any).naft_verified} />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground mb-2">
                {promo.title}
              </h1>
              <p className="text-muted-foreground">{promo.description}</p>
              {promo.broker_name && <p className="text-sm text-muted-foreground/60 mt-2">by <span className="text-foreground font-medium">{promo.broker_name}</span></p>}
            </div>
            <div className="flex flex-col items-center gap-3">
              {promo.bonus_amount && <span className="text-4xl md:text-5xl font-extrabold text-primary">{promo.bonus_amount}</span>}
              {canClaim ? (
                <a href={claimUrl} target="_blank" rel="noopener noreferrer sponsored" className="hidden md:block">
                  <Button size="lg" className="font-bold">
                    <ExternalLink className="w-4 h-4 mr-2" /> Claim This Offer
                  </Button>
                </a>
              ) : (
                <Button size="lg" className="font-bold hidden md:flex" disabled>
                  {isExpired ? "Offer Expired" : "Coming Soon"}
                </Button>
              )}
            </div>
          </div>

          {promo.expiry_date && !isExpired && (
            <div className="border-t border-border pt-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Clock className="w-4 h-4" /> Offer ends {new Date(promo.expiry_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
              <CountdownTimer targetDate={promo.expiry_date} />
            </div>
          )}
          {isExpired && (
            <div className="border-t border-border pt-5 flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> This promotion has expired.
            </div>
          )}
        </div>

        {promo.full_description && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">About This Promotion</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {promo.full_description}
            </div>
          </div>
        )}

        {promo.how_to_claim && promo.how_to_claim.length > 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> How to Claim
            </h2>
            <ol className="space-y-3">
              {promo.how_to_claim.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {promo.terms && promo.terms.length > 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent" /> Terms & Conditions
            </h2>
            <ul className="space-y-2">
              {promo.terms.map((term, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  {term}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          {canClaim ? (
            <a href={claimUrl} target="_blank" rel="noopener noreferrer sponsored">
              <Button size="lg" className="font-bold px-10">
                <ExternalLink className="w-4 h-4 mr-2" /> Claim This Offer Now
              </Button>
            </a>
          ) : (
            <Button size="lg" className="font-bold px-10" disabled>
              {isExpired ? "Offer Expired" : "Coming Soon"}
            </Button>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default PromotionDetail;
