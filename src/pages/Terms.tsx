import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Terms = () => (
  <MainLayout>
    <SEO title="Terms & Conditions" description="Read the terms and conditions for using Not A Fugazi Trader platform." path="/terms" />
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-8">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using Not A Fugazi Trader ("NAFT", "we", "us"), you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of our platform immediately.</p>

      <h2>2. Description of Service</h2>
      <p>NAFT is an independent broker review, comparison, trading education, and community platform. We provide user-generated reviews, broker ratings, signal channel references, sports predictions, market forecasts, and educational content. We do not act as a broker, dealer, exchange, financial advisor, signal provider, or licensed betting operator, and we do not solicit, accept, or hold client funds of any kind.</p>

      <h2>3. User Accounts</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. You must be at least 18 years of age to register. We reserve the right to suspend or terminate accounts that violate these Terms.</p>

      <h2>4. User Content</h2>
      <p>By submitting reviews, complaints, or other content, you grant NAFT a non-exclusive, royalty-free licence to use, display, and distribute your content on the platform. You represent that your submissions are truthful, accurate, and do not infringe on any third-party rights.</p>

      <h2>5. Prohibited Activities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Submit false, misleading, or defamatory reviews or content</li>
        <li>Impersonate another person or entity</li>
        <li>Attempt to manipulate broker ratings or platform data</li>
        <li>Use automated systems, bots, or scrapers to access the platform</li>
        <li>Engage in any unlawful activity through or in connection with the platform</li>
      </ul>

      <h2>6. Financial &amp; Trading Disclaimer</h2>
      <p>NAFT does not provide financial, investment, or trading advice. All broker listings, signal channel references, reviews, ratings, market analysis, and forecasts are provided for informational and educational purposes only and do not constitute financial, investment, legal, or tax advice. Trading foreign exchange, CFDs, cryptocurrencies, and other leveraged instruments carries a high level of risk and may result in the loss of all invested capital. Past performance is never a guarantee of future results. You should seek independent advice from a licensed financial advisor before making any investment decisions.</p>

      <h2>7. Sports Predictions &amp; Betting-Related Content</h2>
      <p>Any sports predictions, tips, or references to third-party betting platforms featured on NAFT are provided strictly for informational and entertainment purposes only. NAFT does not operate as a licensed betting operator or gambling service. Online sports betting and gambling may be restricted or prohibited in your jurisdiction — you are solely responsible for ensuring compliance with applicable local laws before engaging with any listed platform. You must be of legal age in your jurisdiction to access betting-related content.</p>

      <h2>8. Affiliate Disclosure</h2>
      <p>Some broker and platform listings may contain affiliate links. NAFT may receive compensation when you open an account or register through these links. This does not influence our review methodology, ratings, or editorial independence, which are based on verified user experiences and independent assessment.</p>

      <h2>9. Third-Party Services</h2>
      <p>You are solely responsible for verifying that any broker, signal service, or betting platform you engage with is properly authorised and regulated in your jurisdiction. NAFT does not endorse, recommend, or guarantee the services, reliability, or regulatory status of any third party featured on this platform.</p>

      <h2>10. Limitation of Liability</h2>
      <p>NAFT, its team, partners, and contributors shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to trading losses, gambling-related losses, or reliance on any third-party information featured here. Our total liability shall not exceed the amount paid by you, if any, for accessing premium services.</p>

      <h2>11. Eligibility &amp; Jurisdictional Compliance</h2>
      <p>By using NAFT, you confirm that accessing this platform is lawful in your country, that you are at least 18 years of age, and that you comply with all applicable local regulations.</p>

      <h2>12. Changes to Terms</h2>
      <p>We reserve the right to modify these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the updated Terms.</p>

      <h2>13. Contact</h2>
      <p>For questions about these Terms, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>
    </section>
  </MainLayout>
);

export default Terms;
