import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import { Shield, Eye, Users, Globe, Mail } from "lucide-react";

const values = [
  { icon: Shield, title: "Independent", desc: "No broker can buy a better score. Every rating is calculated from real user data." },
  { icon: Eye, title: "Transparent", desc: "Open complaint tracking, public scam alerts, proof-based reviews." },
  { icon: Users, title: "Community-First", desc: "Built by traders, for traders. Every feature exists because real traders need it." },
  { icon: Globe, title: "South Asia Focus", desc: "Serving the fastest-growing retail trading market in the world." },
];

const About = () => (
  <MainLayout>
    <SEO
      title="About Us"
      description="Learn about NAFT — the most transparent broker review platform built by traders, for traders. Independent, community-first, and South Asia focused."
      path="/about"
    />
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary mb-4">
          OUR STORY
        </span>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-6 leading-tight">
          The Forex Industry Has a<br />
          <span className="text-primary">Trust Problem.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We're here to fix it — one verified review, one published complaint, one exposed scam at a time.
        </p>
      </div>

      {/* Story */}
      <div className="glass-card rounded-2xl p-8 md:p-12 mb-12 space-y-5 text-muted-foreground leading-relaxed">
        <p>
          Brokers disappear with funds. Signal sellers fake screenshots. Review sites take money to hide complaints.
          Traders lose — not because they traded badly, but because they trusted the wrong people.
        </p>
        <p>
          <strong className="text-foreground">NAFT</strong> was built to fix that.
        </p>
        <p>
          We started as traders ourselves. We experienced withdrawal delays, manipulated spreads, fake "regulated" brokers,
          and signal providers who disappeared after the first loss. Every problem on this platform exists because we lived it.
        </p>
        <p>
          This isn't a review site that takes money to rank brokers higher. Every score on this platform is calculated from
          real user data — complaints, withdrawal reports, regulation strength. No broker can buy a better score. No signal
          provider can pay to hide bad reviews.
        </p>
        <p className="text-foreground font-semibold text-lg">
          We are independent. We are transparent. And we are not fugazi.
        </p>
        <p>
          Our mission is simple: make the trading industry safer for every trader in South Asia and beyond.
        </p>
        <p>
          If you've been cheated, we want to know. If you've found a broker you trust, tell others. This platform only
          works because real traders use it honestly.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {values.map((v) => (
          <div key={v.title} className="glass-card rounded-xl p-6 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <v.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground mb-1">{v.title}</h3>
              <p className="text-sm text-muted-foreground">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="glass-card rounded-2xl p-8 md:p-12 text-center mb-12">
        <h2 className="text-2xl font-display font-extrabold text-foreground mb-3">Our Team</h2>
        <p className="text-muted-foreground mb-6">
          A small, focused team of traders and developers building the most trusted platform in the market.
        </p>
        <div className="flex justify-center gap-6">
          {["Founder", "Lead Dev", "Content Lead"].map((role) => (
            <div key={role} className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-muted-foreground mb-2 text-sm">Founded 2024 · Based in the UK · Global Mission</p>
        <a href="mailto:notafugazitrader@gmail.com" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
          <Mail className="w-4 h-4" /> notafugazitrader@gmail.com
        </a>
      </div>
    </section>
  </MainLayout>
);

export default About;
