import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { breadcrumbSchema, articleSchema } from "@/components/seo/JsonLd";
import { AlertTriangle, ArrowLeft, ShieldAlert, ExternalLink } from "lucide-react";
import NaftVerificationBanner from "@/components/common/NaftVerificationBanner";
import NaftVerifiedBadge from "@/components/common/NaftVerifiedBadge";

interface ScamAlertFull {
  id: string;
  title: string;
  description: string;
  severity: string;
  created_at: string;
  story: string | null;
  is_repeat_offender?: boolean;
  show_full_report?: boolean;
  full_report?: string | null;
  broker_id?: string | null;
  naft_verified?: boolean | null;
}

const fallbackAlerts: ScamAlertFull[] = [
  {
    id: "sa1", title: "TradeWave Markets",
    description: "Withdrawal refused after profit — $12,400 unresolved.",
    severity: "high",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    story: "TradeWave Markets has been flagged after multiple users reported withdrawal refusals following profitable trades. A total of $12,400 remains unresolved across 8 verified complaints.",
  },
  {
    id: "sa2", title: "GoldFX Pro",
    description: "Fake regulation, platform manipulation — $8,200 under investigation.",
    severity: "high",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    story: "GoldFX Pro has been identified as operating with falsified regulatory credentials. A combined $8,200 is currently under investigation.",
  },
  {
    id: "sa3", title: "CryptoEdge BD",
    description: "Account frozen, no response 30+ days — $3,800 unresolved.",
    severity: "medium",
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    story: "CryptoEdge BD has frozen multiple user accounts without prior notice or explanation. The total amount held in frozen accounts is approximately $3,800.",
  },
];

const ScamAlertDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<ScamAlertFull | null>(null);
  const [brokerSlug, setBrokerSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("scam_alerts")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

      if (data) {
        setAlert(data as unknown as ScamAlertFull);
        if ((data as any).broker_id) {
          const { data: br } = await supabase
            .from("brokers")
            .select("slug")
            .eq("id", (data as any).broker_id)
            .maybeSingle();
          if (br) setBrokerSlug(br.slug);
        }
      } else {
        const fallback = fallbackAlerts.find(a => a.id === id);
        setAlert(fallback || null);
      }
      setLoading(false);
    };
    fetchAlert();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (!alert) {
    return (
      <MainLayout>
        <SEO title="Alert Not Found" description="Scam alert not found" path={`/scam-alerts/${id}`} />
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <AlertTriangle className="w-12 h-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">Scam alert not found.</p>
          <Link to="/scam-alerts" className="text-sm text-destructive hover:underline">← Back to all alerts</Link>
        </div>
      </MainLayout>
    );
  }

  const daysAgo = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 86400000);
  const showInvestigation = !!(alert.show_full_report && alert.full_report && alert.full_report.trim().length > 0);

  return (
    <MainLayout>
      <SEO
        title={`${alert.title} — Scam Alert & Investigation Report`}
        description={alert.description || `Verified scam alert and investigation report for ${alert.title}. Severity: ${alert.severity}.`}
        path={`/scam-alerts/${id}`}
      />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Scam Alerts", path: "/scam-alerts" },
        { name: alert.title, path: `/scam-alerts/${id}` },
      ])} />
      <JsonLd data={articleSchema({
        title: `${alert.title} — Scam Alert`,
        description: alert.description || `Verified scam alert for ${alert.title}.`,
        path: `/scam-alerts/${id}`,
        datePublished: alert.created_at,
      })} />
      <section className="pt-6 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/scam-alerts" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Scam Alerts
          </Link>

          <div className="glass-card rounded-xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
              <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground">{alert.title}</h1>
            </div>

            <div className="flex items-center flex-wrap gap-2 mb-6">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                alert.severity === "high"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-accent/10 text-accent border-accent/20"
              }`}>
                {alert.severity} severity
              </span>
              {alert.is_repeat_offender && (
                <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold uppercase bg-destructive/15 text-destructive border border-destructive/40 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Repeat Offender
                </span>
              )}
              <span className="text-xs font-mono text-muted-foreground">{daysAgo}d ago</span>
            </div>

            <p className="text-sm text-muted-foreground mb-6 border-b border-border pb-6">{alert.description}</p>

            {alert.story ? (
              <div className="prose prose-sm max-w-none mb-6">
                <h2 className="text-lg font-display font-bold text-foreground mb-3">Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{alert.story}</p>
              </div>
            ) : (
              !showInvestigation && <p className="text-sm text-muted-foreground italic">Full report coming soon.</p>
            )}

            {showInvestigation && (
              <div className="mt-2 rounded-xl border border-destructive/30 bg-destructive/5 p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-destructive" />
                  <h2 className="text-base md:text-lg font-display font-extrabold uppercase tracking-wider text-destructive">
                    Full Investigation Report
                  </h2>
                </div>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {alert.full_report}
                </p>
              </div>
            )}

            {brokerSlug && (
              <div className="mt-6">
                <Link
                  to={`/brokers/${brokerSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-mono text-destructive hover:underline"
                >
                  View Broker Profile <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ScamAlertDetail;
