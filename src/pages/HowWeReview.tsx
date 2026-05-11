import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Shield, Users, Banknote, AlertTriangle, CheckCircle2, RefreshCw, Scale } from "lucide-react";

const weights = [
  { icon: Shield, label: "Regulation & Licensing", weight: 30, color: "bg-primary",
    desc: "Tier-1 regulators (FCA, ASIC, CySEC, NFA) score highest. Offshore-only, unregulated, or revoked licenses pull the score down sharply." },
  { icon: Users, label: "User Reviews & Ratings", weight: 25, color: "bg-accent",
    desc: "Verified reviews from real traders — weighted by reviewer reputation. We discount obvious astroturfing and incentivized reviews." },
  { icon: Banknote, label: "Withdrawal Speed & Reliability", weight: 25, color: "bg-primary",
    desc: "Reported processing times, success rate, and proof submitted by users. Slow or denied withdrawals are the strongest scam signal." },
  { icon: AlertTriangle, label: "Complaint History", weight: 20, color: "bg-destructive",
    desc: "Volume, severity, and resolution rate of complaints filed on NAFT. Repeat offenders and unresolved disputes carry the most weight." },
];

const principles = [
  { icon: CheckCircle2, title: "Independent & unpaid", text: "We are not a broker, IB, or affiliate of any reviewed broker. Sponsored placements are clearly labelled and never affect a broker's score." },
  { icon: RefreshCw, title: "Continuously updated", text: "Scores recalculate as new reviews, complaints, and regulator updates come in. Each listing carries a 'Last verified' date." },
  { icon: Scale, title: "Right of reply", text: "Brokers can claim their profile and respond to reviews publicly. We never delete user reviews to favour brokers." },
];

const HowWeReview = () => (
  <MainLayout>
    <SEO
      title="How We Review Brokers | NAFT Methodology"
      description="The NAFT scoring methodology — regulation 30%, user reviews 25%, withdrawal speed 25%, complaint history 20%. Independent, transparent, continuously updated."
      keywords="broker review methodology, how naft scores brokers, broker trust score, forex broker rating system"
    />

    <div className="max-w-4xl mx-auto px-4 py-16">
      <span className="section-tag">// METHODOLOGY</span>
      <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mt-3 mb-4">
        How We <span className="text-primary">Review Brokers</span>
      </h1>
      <p className="text-base text-muted-foreground mb-12 max-w-2xl">
        Every broker on NAFT is scored from real, verifiable signals — not press releases, not paid placements.
        Here's exactly what goes into a Trust Score.
      </p>

      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Scoring weights</h2>
        <div className="space-y-4">
          {weights.map(({ icon: Icon, label, weight, color, desc }) => (
            <div key={label} className="glass-card rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="text-base font-display font-bold text-foreground">{label}</h3>
                    <span className="text-sm font-mono font-bold text-primary shrink-0">{weight}%</span>
                  </div>
                  <div className="score-bar mb-3">
                    <div className={`score-bar-fill ${color}`} style={{ width: `${weight * 2.5}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Where the data comes from</h2>
        <div className="glass-card rounded-xl p-6 space-y-3 text-sm text-muted-foreground">
          <p><strong className="text-foreground">Regulator registers:</strong> we cross-check license numbers against the public databases of FCA, ASIC, CySEC, NFA, FSCA, and others.</p>
          <p><strong className="text-foreground">Community reviews:</strong> traders who have an account with the broker can submit a review with optional MT4/MT5 ID for verification.</p>
          <p><strong className="text-foreground">Complaints:</strong> users file complaints with screenshots and timestamps. Each is reviewed before publishing.</p>
          <p><strong className="text-foreground">Withdrawal proof:</strong> we encourage users to attach payment screenshots to back up their experience.</p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Update cadence</h2>
        <p className="text-sm text-muted-foreground">
          Trust Scores recalculate automatically whenever a new review, complaint, or regulatory change is recorded.
          Every broker page also displays a <strong className="text-foreground">"Last verified"</strong> timestamp so you know how fresh the data is.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Our principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {principles.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card rounded-xl p-5">
              <Icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="text-sm font-display font-bold text-foreground mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-4">Conflict-of-interest policy</h2>
        <div className="glass-card rounded-xl p-6 text-sm text-muted-foreground space-y-2">
          <p>NAFT earns revenue from clearly-labelled sponsorships, advertising placements, and tier upgrades for claimed broker profiles.</p>
          <p><strong className="text-foreground">None of these affect a broker's Trust Score, ranking position, or visibility in scam alerts.</strong> Sponsored content is always tagged "Sponsored" or "Featured".</p>
          <p>If you spot a conflict, email <a href="mailto:hello@notafugazitrader.com" className="text-primary hover:underline">hello@notafugazitrader.com</a> — we publish corrections.</p>
        </div>
      </section>
    </div>
  </MainLayout>
);

export default HowWeReview;
