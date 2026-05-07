import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { AlertTriangle, TrendingDown, Dices, ShieldAlert, Building2, Link2, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Callout = ({
  icon: Icon,
  title,
  accent,
  children,
}: {
  icon: any;
  title: string;
  accent: "amber" | "orange" | "destructive";
  children: React.ReactNode;
}) => {
  const styles = {
    amber: {
      border: "border-l-amber-500",
      bg: "bg-amber-500/5",
      ring: "ring-amber-500/20",
      icon: "text-amber-500 bg-amber-500/10",
    },
    orange: {
      border: "border-l-orange-500",
      bg: "bg-orange-500/5",
      ring: "ring-orange-500/20",
      icon: "text-orange-500 bg-orange-500/10",
    },
    destructive: {
      border: "border-l-destructive",
      bg: "bg-destructive/5",
      ring: "ring-destructive/20",
      icon: "text-destructive bg-destructive/10",
    },
  }[accent];

  return (
    <div
      className={`rounded-lg border border-border ${styles.border} border-l-4 ${styles.bg} ring-1 ${styles.ring} p-6`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-md ${styles.icon}`}>
          <Icon className="w-5 h-5" />
        </span>
        <h2 className="text-xl md:text-2xl font-display font-extrabold tracking-tight text-foreground m-0">
          {title}
        </h2>
      </div>
      <div className="text-foreground/90 leading-relaxed text-[0.95rem] space-y-3">{children}</div>
    </div>
  );
};

const PlainSection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <section className="pb-6 border-b border-border/40 last:border-b-0">
    <div className="flex items-center gap-2 mb-3 text-muted-foreground">
      <Icon className="w-4 h-4" />
      <h2 className="text-lg md:text-xl font-display font-bold tracking-tight text-foreground m-0">
        {title}
      </h2>
    </div>
    <div className="text-muted-foreground leading-relaxed text-[0.95rem] space-y-3">{children}</div>
  </section>
);

const Highlight = ({ children }: { children: React.ReactNode }) => (
  <span className="inline bg-foreground/10 text-foreground font-semibold px-1.5 py-0.5 rounded">
    {children}
  </span>
);

const Disclaimer = () => (
  <MainLayout>
    <SEO
      title="Risk & Liability Disclaimer"
      description="Not A Fugazi Trader (NAFT) is an independent information and review platform. Read our full risk, liability, and third-party services disclaimer."
      path="/disclaimer"
    />

    <section className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      {/* Hero warning band */}
      <div className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent p-6 md:p-8 mb-10">
        <div className="flex items-start gap-4">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/15 text-destructive shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </span>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-destructive mb-1">
              Important — Please Read
            </p>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-2 leading-tight">
              Risk &amp; Liability Disclaimer
            </h1>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* About — plain */}
        <PlainSection icon={Building2} title="About NAFT">
          <p>
            Not A Fugazi Trader ("NAFT") is an independent information, review, and community platform. We are{" "}
            <strong className="text-foreground">
              not a broker, dealer, exchange, financial advisor, signal provider, or bookmaker
            </strong>
            , and we do not solicit, accept, or hold client funds of any kind.
          </p>
        </PlainSection>

        {/* Three highlighted callouts */}
        <Callout icon={TrendingDown} title="Financial & Trading Content" accent="amber">
          <p>
            All broker listings, signal channel references, reviews, ratings, market analysis, and forecasts are
            provided for <Highlight>informational and educational purposes only</Highlight>. They do not
            constitute financial, investment, legal, or tax advice.
          </p>
          <p>
            Trading foreign exchange, CFDs, cryptocurrencies, and other leveraged instruments carries a{" "}
            <strong className="text-foreground">high level of risk</strong> and may result in the loss of all
            invested capital. <Highlight>Past performance is never a guarantee of future results.</Highlight>
          </p>
        </Callout>

        <Callout icon={Dices} title="Sports Predictions & Betting-Related Content" accent="orange">
          <p>
            Any sports predictions, tips, or references to third-party betting platforms featured on NAFT are
            provided strictly for <Highlight>informational and entertainment purposes only</Highlight>. NAFT
            does <strong className="text-foreground">not</strong> operate as a licensed betting operator or
            gambling service.
          </p>
          <p>
            Engaging with any listed betting platform is done <strong className="text-foreground">entirely at
            your own risk and discretion</strong>. Online sports betting and gambling may be restricted or
            prohibited in your jurisdiction — you are solely responsible for ensuring compliance with local laws
            before participating.
          </p>
        </Callout>

        {/* Third-party — plain */}
        <PlainSection icon={Link2} title="Third-Party Services">
          <p>
            You are solely responsible for verifying that any broker, signal service, or betting platform you
            engage with is properly authorised and regulated in your jurisdiction. NAFT does not endorse,
            recommend, or guarantee the services of any third party featured on this platform.
          </p>
        </PlainSection>

        <Callout icon={ShieldAlert} title="Liability" accent="destructive">
          <p>
            NAFT, its team, partners, and contributors accept{" "}
            <Highlight>no liability for any direct, indirect, or consequential loss</Highlight> arising from
            the use of this site or reliance on any third-party information featured here — including but not
            limited to <strong className="text-foreground">trading losses or gambling-related losses</strong>.
          </p>
        </Callout>

        {/* By using NAFT — plain */}
        <PlainSection icon={UserCheck} title="By Using NAFT">
          <p>
            You confirm that accessing this platform is lawful in your country, that you are of legal age, and
            that you have read and accepted our{" "}
            <Link to="/terms" className="text-primary font-semibold hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary font-semibold hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </PlainSection>
      </div>

      {/* Bottom CTA strip */}
      <div className="mt-10 rounded-lg border border-border bg-card/50 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground m-0">
          Have questions? Review our policies or get in touch.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/terms"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition"
          >
            Terms of Service
          </Link>
          <Link
            to="/privacy"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition"
          >
            Privacy Policy
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  </MainLayout>
);

export default Disclaimer;
