import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Banknote, Clock, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import WithdrawalProofUploadModal from "./WithdrawalProofUploadModal";
import { useAuth } from "@/contexts/AuthContext";

interface Proof {
  id: string;
  amount: number | null;
  currency: string | null;
  withdrawal_date: string | null;
  payout_method: string | null;
  payout_time_hours: number | null;
  proof_url: string;
  notes: string | null;
  verified_at: string | null;
}

interface Props {
  brokerId: string;
  brokerName: string;
}

const DEMO_PROOFS: Proof[] = [
  { id: "demo-1", amount: 4200, currency: "USD", withdrawal_date: new Date(Date.now() - 2 * 86400000).toISOString(), payout_method: "Crypto (USDT)", payout_time_hours: 1, proof_url: "", notes: "Same-day payout — no friction, no extra KYC.", verified_at: new Date().toISOString() },
  { id: "demo-2", amount: 1850, currency: "USD", withdrawal_date: new Date(Date.now() - 5 * 86400000).toISOString(), payout_method: "Skrill", payout_time_hours: 3, proof_url: "", notes: "Withdrew profits from EUR/USD scalping.", verified_at: new Date().toISOString() },
  { id: "demo-3", amount: 8750, currency: "USD", withdrawal_date: new Date(Date.now() - 9 * 86400000).toISOString(), payout_method: "Bank Wire", payout_time_hours: 22, proof_url: "", notes: "T+1 wire — as advertised on website.", verified_at: new Date().toISOString() },
  { id: "demo-4", amount: 640, currency: "USD", withdrawal_date: new Date(Date.now() - 12 * 86400000).toISOString(), payout_method: "Crypto (BTC)", payout_time_hours: 1, proof_url: "", notes: "Confirmed in 1 block. Fastest payout I've had.", verified_at: new Date().toISOString() },
  { id: "demo-5", amount: 3200, currency: "USD", withdrawal_date: new Date(Date.now() - 18 * 86400000).toISOString(), payout_method: "Neteller", payout_time_hours: 4, proof_url: "", notes: "Smooth withdrawal, no questions asked.", verified_at: new Date().toISOString() },
  { id: "demo-6", amount: 12400, currency: "USD", withdrawal_date: new Date(Date.now() - 25 * 86400000).toISOString(), payout_method: "Bank Wire", payout_time_hours: 36, proof_url: "", notes: "Large amount — extra verification but paid in full.", verified_at: new Date().toISOString() },
];

const PAGE_SIZE = 3;

const WithdrawalProofGallery = ({ brokerId, brokerName }: Props) => {
  const { user } = useAuth();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUpload, setOpenUpload] = useState(false);
  const [page, setPage] = useState(0);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("withdrawal_proofs")
      .select("id, amount, currency, withdrawal_date, payout_method, payout_time_hours, proof_url, notes, verified_at")
      .eq("broker_id", brokerId)
      .eq("status", "verified")
      .order("verified_at", { ascending: false })
      .limit(12);
    setProofs((data as Proof[]) || []);
    setLoading(false);
    setPage(0);
  };

  useEffect(() => { load(); }, [brokerId]);

  return (
    <section id="proofs" className="py-12 border-t border-border/40">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="section-tag">// Verified Withdrawal Proofs</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold mt-2">
            Real payouts from real traders
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Every screenshot below has been admin-verified. No stock images, no marketing — just
            evidence that {brokerName} actually paid traders.
          </p>
        </div>
        <Button onClick={() => setOpenUpload(true)} variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" /> Submit your payout
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading proofs…</div>
      ) : (() => {
        const isDemo = proofs.length === 0;
        const list = isDemo ? DEMO_PROOFS : proofs;
        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
        const safePage = Math.min(page, totalPages - 1);
        const visible = list.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
        const showNav = list.length > PAGE_SIZE;
        return (
          <>
            {isDemo && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-md border border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs">
                <Banknote className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Example payouts shown — be the first to submit a verified proof for {brokerName} and replace these.
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visible.map((p) => (
                <div key={p.id} className="relative border border-border rounded-lg overflow-hidden bg-card hover:border-primary/40 transition-colors">
                  {isDemo && (
                    <span className="absolute top-2 right-2 z-10 text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-500/50 bg-background/90 backdrop-blur-sm text-amber-600 dark:text-amber-400">
                      Demo
                    </span>
                  )}
                  {p.proof_url ? (
                    <a href={p.proof_url} target="_blank" rel="noopener noreferrer" className="block aspect-video bg-secondary/40 overflow-hidden">
                      <img src={p.proof_url} alt={`Verified ${brokerName} payout`} loading="lazy" className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-muted to-card border-b border-border flex items-center justify-center">
                      <div className="text-center">
                        <div className="font-display text-2xl font-bold text-emerald-500/80">
                          {p.currency || "$"}{Number(p.amount || 0).toLocaleString()}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-1">
                          {isDemo ? "Example payout" : "Proof on file"}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {isDemo ? "Sample verified" : "Admin verified"}
                      </span>
                      {p.amount && (
                        <span className="text-sm font-mono text-foreground">
                          {p.currency || "$"}{Number(p.amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      {p.payout_method && <span>{p.payout_method}</span>}
                      {p.payout_time_hours != null && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {p.payout_time_hours}h
                        </span>
                      )}
                      {p.withdrawal_date && <span>{new Date(p.withdrawal_date).toLocaleDateString()}</span>}
                    </div>
                    {p.notes && <p className="text-xs text-foreground/80 line-clamp-2">{p.notes}</p>}
                  </div>
                </div>
              ))}
            </div>

            {showNav && (
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={safePage === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-display font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous payouts"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Payout pages">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      aria-label={`Go to page ${i + 1}`}
                      aria-current={safePage === i ? "page" : undefined}
                      className={`h-1.5 rounded-full transition-all ${
                        safePage === i ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={safePage >= totalPages - 1}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-display font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next payouts"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        );
      })()}

      <WithdrawalProofUploadModal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        brokerId={brokerId}
        brokerName={brokerName}
        onSubmitted={load}
      />
    </section>
  );
};

export default WithdrawalProofGallery;
