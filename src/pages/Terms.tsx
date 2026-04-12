import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Terms = () => (
  <MainLayout>
    <SEO title="Terms & Conditions" description="Read the terms and conditions for using Not A Fugazi Trader platform." path="/terms" />
    <section className="max-w-4xl mx-auto px-4 py-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-8">Terms &amp; Conditions</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing or using Not A Fugazi Trader ("NAFT", "we", "us"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

      <h2>2. Description of Service</h2>
      <p>NAFT is a broker review, comparison, and trading education platform. We provide user-generated reviews, broker ratings, signal services, market forecasts, and educational content. We do not act as a broker, financial advisor, or intermediary.</p>

      <h2>3. User Accounts</h2>
      <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. We reserve the right to suspend or terminate accounts that violate these terms.</p>

      <h2>4. User Content</h2>
      <p>By submitting reviews, complaints, or ideas, you grant NAFT a non-exclusive, royalty-free license to use, display, and distribute your content. You represent that your submissions are truthful and do not infringe on any third-party rights.</p>

      <h2>5. Prohibited Activities</h2>
      <ul>
        <li>Submitting false or misleading reviews</li>
        <li>Impersonating another person or entity</li>
        <li>Attempting to manipulate broker ratings</li>
        <li>Using automated systems to access the platform</li>
        <li>Engaging in any illegal activity through the platform</li>
      </ul>

      <h2>6. Financial Disclaimer</h2>
      <p>NAFT does not provide financial, investment, or trading advice. All content is for informational purposes only. Trading forex, CFDs, and cryptocurrencies carries significant risk. You should consult a licensed financial advisor before making any investment decisions.</p>

      <h2>7. Affiliate Disclosure</h2>
      <p>Some broker listings may contain affiliate links. We may receive compensation when you open an account through these links. This does not affect our review methodology or ratings, which are based on verified user experiences.</p>

      <h2>8. Limitation of Liability</h2>
      <p>NAFT shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you, if any, for accessing premium services.</p>

      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>

      <h2>10. Contact</h2>
      <p>For questions about these terms, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>
    </section>
  </MainLayout>
);

export default Terms;
