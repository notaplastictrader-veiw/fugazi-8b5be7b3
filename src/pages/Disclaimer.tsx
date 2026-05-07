import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Disclaimer = () => (
  <MainLayout>
    <SEO
      title="Risk & Liability Disclaimer"
      description="Not A Fugazi Trader (NAFT) is an independent information and review platform. Read our full risk, liability, and third-party services disclaimer."
      path="/disclaimer"
    />
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-4">Risk &amp; Liability Disclaimer</h1>
      <p className="text-muted-foreground mb-8">Last updated: May 2026</p>

      <h2>About NAFT</h2>
      <p>
        Not A Fugazi Trader ("NAFT") is an independent information, review, and community platform. We are
        <strong> not a broker, dealer, exchange, financial advisor, signal provider, or bookmaker</strong>, and we
        do not solicit, accept, or hold client funds of any kind.
      </p>

      <h2>Financial &amp; Trading Content</h2>
      <p>
        All broker listings, signal channel references, reviews, ratings, market analysis, and forecasts are provided
        for <strong>informational and educational purposes only</strong>. They do not constitute financial,
        investment, legal, or tax advice. Trading foreign exchange, CFDs, cryptocurrencies, and other leveraged
        instruments carries a high level of risk and may result in the loss of all invested capital. Past performance
        is never a guarantee of future results.
      </p>

      <h2>Sports Predictions &amp; Betting-Related Content</h2>
      <p>
        Any sports predictions, tips, or references to third-party betting platforms featured on NAFT are provided
        strictly for <strong>informational and entertainment purposes only</strong>. NAFT does not operate as a
        licensed betting operator or gambling service. Engaging with any listed betting platform is done entirely at
        your own risk and discretion. Online sports betting and gambling may be restricted or prohibited in your
        jurisdiction — you are solely responsible for ensuring compliance with local laws before participating.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        You are solely responsible for verifying that any broker, signal service, or betting platform you engage with
        is properly authorised and regulated in your jurisdiction. NAFT does not endorse, recommend, or guarantee the
        services of any third party featured on this platform.
      </p>

      <h2>Liability</h2>
      <p>
        NAFT, its team, partners, and contributors accept <strong>no liability for any direct, indirect, or
        consequential loss</strong> arising from the use of this site or reliance on any third-party information
        featured here — including but not limited to trading losses or gambling-related losses.
      </p>

      <h2>By Using NAFT</h2>
      <p>
        You confirm that accessing this platform is lawful in your country, that you are of legal age, and that you
        have read and accepted our <a href="/terms" className="text-primary">Terms of Service</a> and{" "}
        <a href="/privacy" className="text-primary">Privacy Policy</a>.
      </p>
    </section>
  </MainLayout>
);

export default Disclaimer;
