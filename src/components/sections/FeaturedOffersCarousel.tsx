import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ArrowUpRight } from "lucide-react";
import NeonCard from "@/components/ui/NeonCard";
import DiscountChip from "@/components/ui/DiscountChip";

interface FeaturedOffer {
  id: string;
  slug: string;
  title: string;
  broker_name?: string;
  bonus_amount?: string;
  link_url?: string;
  promo_type?: string;
}

const parsePct = (s?: string): number => {
  if (!s) return 0;
  const m = s.match(/(\d{1,3})\s*%/);
  return m ? parseInt(m[1], 10) : 0;
};

const FeaturedOffersCarousel = () => {
  const [offers, setOffers] = useState<FeaturedOffer[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("promotions")
        .select("id, slug, title, broker_name, bonus_amount, referral_url, link_url, promo_type, is_featured, created_at")
        .eq("status", "published")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (cancelled || !data) return;
      setOffers(
        data.map((p: any) => ({
          id: p.id,
          slug: p.slug || p.id,
          title: p.title,
          broker_name: p.broker_name,
          bonus_amount: p.bonus_amount,
          link_url: p.referral_url || p.link_url,
          promo_type: p.promo_type,
        }))
      );
    })();
    return () => { cancelled = true; };
  }, []);

  if (!offers.length) return null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mb-8 animate-[fade-up_0.6s_ease_0.05s_both]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
            Exclusive Offers · Updated Today
          </span>
        </div>
        <Link to="/promotions" className="text-xs text-primary hover:underline font-mono">
          See all →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
        {offers.map((offer) => {
          const pct = parsePct(offer.bonus_amount);
          const card = (
            <NeonCard className="min-w-[280px] max-w-[280px] p-4 snap-start cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {offer.broker_name || "Broker Offer"}
                </span>
                {pct > 0 ? (
                  <DiscountChip pct={pct} label={offer.promo_type === "discount" ? "OFF" : "BONUS"} />
                ) : (
                  <span className="text-xs font-display font-bold text-primary">
                    {offer.bonus_amount}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-3">
                {offer.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-primary font-mono">
                <span>View offer</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </NeonCard>
          );
          return offer.link_url ? (
            <a
              key={offer.id}
              href={offer.link_url}
              target="_blank"
              rel="noopener noreferrer sponsored"
            >
              {card}
            </a>
          ) : (
            <Link key={offer.id} to={`/promotions/${offer.slug}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedOffersCarousel;
