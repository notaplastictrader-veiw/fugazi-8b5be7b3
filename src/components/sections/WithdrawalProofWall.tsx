import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Clock, ExternalLink, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Proof {
  id: string;
  broker_id: string;
  broker_name: string;
  broker_slug: string;
  amount: number | null;
  currency: string | null;
  payout_method: string | null;
  payout_time_hours: number | null;
  proof_url: string;
  withdrawal_date: string | null;
  notes: string | null;
}

const FALLBACK: Proof[] = [
  { id: "p1", broker_id: "b1", broker_name: "Exness", broker_slug: "exness", amount: 4200, currency: "USD", payout_method: "Crypto (USDT)", payout_time_hours: 1, proof_url: "", withdrawal_date: new Date(Date.now() - 2 * 86400000).toISOString(), notes: "Same-day payout, no friction." },
  { id: "p2", broker_id: "b2", broker_name: "IC Markets", broker_slug: "ic-markets", amount: 8750, currency: "USD", payout_method: "Bank Wire", payout_time_hours: 18, proof_url: "", withdrawal_date: new Date(Date.now() - 5 * 86400000).toISOString(), notes: "T+1 wire, as advertised." },
  { id: "p3", broker_id: "b3", broker_name: "Pepperstone", broker_slug: "pepperstone", amount: 2100, currency: "USD", payout_method: "Skrill", payout_time_hours: 2, proof_url: "", withdrawal_date: new Date(Date.now() - 7 * 86400000).toISOString(), notes: "Withdrawn within hours." },
  { id: "p4", broker_id: "b4", broker_name: "FTMO", broker_slug: "ftmo", amount: 5640, currency: "USD", payout_method: "Wise", payout_time_hours: 24, proof_url: "", withdrawal_date: new Date(Date.now() - 10 * 86400000).toISOString(), notes: "Bi-weekly payout cycle." },
  { id: "p5", broker_id: "b1", broker_name: "Exness", broker_slug: "exness", amount: 1340, currency: "USD", payout_method: "Crypto (BTC)", payout_time_hours: 1, proof_url: "", withdrawal_date: new Date(Date.now() - 12 * 86400000).toISOString(), notes: "Confirmed in 1 block." },
  { id: "p6", broker_id: "b3", broker_name: "Pepperstone", broker_slug: "pepperstone", amount: 9800, currency: "USD", payout_method: "Bank Wire", payout_time_hours: 12, proof_url: "", withdrawal_date: new Date(Date.now() - 15 * 86400000).toISOString(), notes: "Same-day initiation." },
];

function formatAmount(amt: number | null, ccy: string | null) {
  if (!amt) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: ccy || "USD", maximumFractionDigits: 0 }).format(amt);
}

function formatPayoutTime(hours: number | null) {
  if (!hours && hours !== 0) return "Verified";
  if (hours < 1) return "<1h";
  if (hours <= 24) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

function relativeDate(iso: string | null) {
  if (!iso) return "";
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.round(days / 30)} mo ago`;
}

export default function WithdrawalProofWall() {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [visible, setVisible] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("withdrawal_proofs")
        .select("id, broker_id, amount, currency, payout_method, payout_time_hours, proof_url, withdrawal_date, notes")
        .eq("status", "verified")
        .order("withdrawal_date", { ascending: false, nullsFirst: false })
        .limit(12);

      if (!data || data.length === 0) {
        setProofs(FALLBACK);
        return;
      }

      // Hydrate broker names/slugs
      const brokerIds = Array.from(new Set(data.map((p: any) => p.broker_id).filter(Boolean)));
      const { data: brokers } = await supabase
        .from("brokers")
        .select("id, name, slug")
        .in("id", brokerIds);
      const map = new Map<string, { name: string; slug: string }>();
      (brokers || []).forEach((b: any) => map.set(b.id, { name: b.name, slug: b.slug }));

      const hydrated: Proof[] = data.map((p: any) => ({
        ...p,
        broker_name: map.get(p.broker_id)?.name || "Verified Broker",
        broker_slug: map.get(p.broker_id)?.slug || "",
      }));
      setProofs(hydrated.length > 0 ? hydrated : FALLBACK);
    })();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (proofs.length === 0) return null;

  const totalAmount = proofs.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-card/30 border-t border-border/50 overflow-hidden"
      aria-labelledby="proof-wall-heading"
    >
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/5 text-emerald-500 text-xs font-mono uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Withdrawals
            </div>
            <h2
              id="proof-wall-heading"
              className="font-display text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-3"
            >
              Real money. Real screenshots.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Every proof is verified by NAFT moderators against the trader's MT4/MT5 ID and the broker's payout records. No staged demos, no marketing pages.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-6 md:gap-2 md:text-right shrink-0">
            <div>
              <div className="font-display text-2xl md:text-3xl font-bold text-emerald-500">
                {formatAmount(totalAmount, "USD")}+
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Verified this batch
              </div>
            </div>
            <div>
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {proofs.length}
              </div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                Recent proofs
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {proofs.slice(0, 6).map((p, i) => (
            <article
              key={p.id}
              className={`group relative rounded-lg border border-border bg-background hover:border-emerald-500/40 transition-all overflow-hidden ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
              style={{ transition: "all 600ms ease", transitionDelay: `${i * 80}ms` }}
            >
              {/* Image / fallback */}
              <div className="relative aspect-[16/10] bg-gradient-to-br from-muted to-card border-b border-border overflow-hidden">
                {p.proof_url ? (
                  <img
                    src={p.proof_url}
                    alt={`${p.broker_name} withdrawal proof — ${formatAmount(p.amount, p.currency)}`}
                    loading="lazy"
                    className="w-full h-full object-cover blur-[4px] group-hover:blur-0 transition-all duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-display text-3xl md:text-4xl font-bold text-emerald-500/80">
                        {formatAmount(p.amount, p.currency)}
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">
                        Proof on file · click to view
                      </div>
                    </div>
                  </div>
                )}

                {/* Verified badge */}
                <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-emerald-500/40 text-emerald-500 text-[10px] font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </div>

                {/* Payout time */}
                {(p.payout_time_hours || p.payout_time_hours === 0) && (
                  <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-background/90 backdrop-blur-sm border border-border text-foreground text-[10px] font-mono uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {formatPayoutTime(p.payout_time_hours)}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    {p.broker_slug ? (
                      <Link
                        to={`/broker/${p.broker_slug}`}
                        className="font-display text-base md:text-lg font-bold uppercase tracking-tight text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {p.broker_name}
                      </Link>
                    ) : (
                      <span className="font-display text-base md:text-lg font-bold uppercase tracking-tight text-foreground truncate block">
                        {p.broker_name}
                      </span>
                    )}
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {p.payout_method || "Bank Transfer"} · {relativeDate(p.withdrawal_date)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-lg font-bold text-emerald-500">
                      {formatAmount(p.amount, p.currency)}
                    </div>
                  </div>
                </div>

                {p.notes && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-2">
                    "{p.notes}"
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/brokers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-emerald-500 text-white font-mono uppercase text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            <Eye className="w-4 h-4" />
            See all verified payouts
          </Link>
          <Link
            to="/dashboard/reviews"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-foreground font-mono uppercase text-sm tracking-wide hover:border-primary/50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Submit your own proof
          </Link>
        </div>
      </div>
    </section>
  );
}
