import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ExternalLink, Building2, Star, MessageSquare } from "lucide-react";

interface Props {
  contentId: string;
  reviewerNotes?: string;
}

interface AlertData {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  is_repeat_offender: boolean;
  broker_id: string | null;
}

interface BrokerData {
  id: string;
  name: string;
  slug: string;
  stars: number | null;
  review_count: number | null;
}

const ScamAlertAutoCard = ({ contentId, reviewerNotes }: Props) => {
  const [alert, setAlert] = useState<AlertData | null>(null);
  const [broker, setBroker] = useState<BrokerData | null>(null);
  const [counts, setCounts] = useState<{ complaints: number; lowReviews: number; totalReviews: number; avg: number }>({
    complaints: 0, lowReviews: 0, totalReviews: 0, avg: 0,
  });

  useEffect(() => {
    (async () => {
      const { data: a } = await supabase
        .from("scam_alerts")
        .select("id, title, description, severity, is_repeat_offender, broker_id")
        .eq("id", contentId)
        .maybeSingle();
      if (!a) return;
      setAlert(a as AlertData);

      if (a.broker_id) {
        const { data: b } = await supabase
          .from("brokers")
          .select("id, name, slug, stars, review_count")
          .eq("id", a.broker_id)
          .maybeSingle();
        if (b) setBroker(b as BrokerData);

        const [{ count: comp }, { data: revs }] = await Promise.all([
          supabase.from("complaints").select("id", { count: "exact", head: true })
            .eq("broker_id", a.broker_id).eq("status", "published"),
          supabase.from("reviews").select("rating")
            .eq("broker_id", a.broker_id).eq("status", "published"),
        ]);
        const ratings = (revs || []).map((r) => r.rating || 0).filter((r) => r > 0);
        const lowReviews = ratings.filter((r) => r <= 2).length;
        const avg = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0;
        setCounts({ complaints: comp || 0, lowReviews, totalReviews: ratings.length, avg });
      }
    })();
  }, [contentId]);

  if (!alert) {
    return <div className="text-xs font-mono text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <span className="font-bold text-sm text-destructive uppercase font-['Barlow_Condensed'] tracking-wide">
            Auto-Detected Scam Alert
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-destructive/40 bg-destructive/10 text-destructive font-mono uppercase">
            {alert.severity}
          </span>
          {alert.is_repeat_offender && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground font-mono uppercase">
              Repeat Offender
            </span>
          )}
        </div>
        <p className="text-sm font-semibold">{alert.title}</p>
        <p className="text-xs text-muted-foreground">{alert.description}</p>
      </div>

      {broker && (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{broker.name}</span>
            </div>
            <a
              href={`/brokers/${broker.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-primary hover:underline flex items-center gap-1"
            >
              View Broker <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="border border-border rounded p-2 text-center">
              <MessageSquare className="w-3 h-3 mx-auto mb-1 text-destructive" />
              <p className="text-base font-bold text-destructive">{counts.complaints}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Complaints</p>
            </div>
            <div className="border border-border rounded p-2 text-center">
              <Star className="w-3 h-3 mx-auto mb-1 text-amber-500" />
              <p className="text-base font-bold text-amber-500">{counts.lowReviews}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Low Reviews</p>
            </div>
            <div className="border border-border rounded p-2 text-center">
              <Star className="w-3 h-3 mx-auto mb-1 text-foreground" />
              <p className="text-base font-bold">{counts.avg.toFixed(1)}</p>
              <p className="text-[9px] text-muted-foreground uppercase">Avg ({counts.totalReviews})</p>
            </div>
          </div>
        </div>
      )}

      {reviewerNotes && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Trigger</p>
          <p className="text-xs font-mono">{reviewerNotes}</p>
        </div>
      )}

      <p className="text-[10px] font-mono text-muted-foreground">
        Approve to publish this alert on the broker profile and Scam Alerts page. Reject to dismiss.
      </p>
    </div>
  );
};

export default ScamAlertAutoCard;
