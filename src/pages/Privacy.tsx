import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Privacy = () => (
  <MainLayout>
    <SEO title="Privacy Policy" description="Learn how Not A Fugazi Trader collects, uses, and protects your personal data." path="/privacy" />
    <section className="max-w-4xl mx-auto px-4 py-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly (name, email, phone number, reviews, complaints) and automatically (IP address, browser type, device information, usage data via cookies).</p>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain our services</li>
        <li>To process and display your reviews and complaints</li>
        <li>To send notifications and updates (with your consent)</li>
        <li>To improve our platform and user experience</li>
        <li>To prevent fraud and ensure security</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal data. We may share information with:</p>
      <ul>
        <li>Service providers (hosting, analytics, email services)</li>
        <li>Brokers (only if you submit a complaint and consent to sharing)</li>
        <li>Law enforcement (when legally required)</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures including encryption, secure authentication, and regular security audits. However, no method of transmission over the Internet is 100% secure.</p>

      <h2>5. Your Rights (GDPR)</h2>
      <p>If you are in the EU/EEA, you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Rectify inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time</li>
      </ul>

      <h2>6. Cookies</h2>
      <p>We use cookies to enhance your experience. See our <a href="/cookies" className="text-primary">Cookie Policy</a> for details on how we use cookies and how to manage your preferences.</p>

      <h2>7. Data Retention</h2>
      <p>We retain your data for as long as your account is active or as needed to provide services. You may request deletion at any time by contacting us.</p>

      <h2>8. Children's Privacy</h2>
      <p>Our services are not directed at individuals under 18. We do not knowingly collect data from minors.</p>

      <h2>9. Changes to This Policy</h2>
      <p>We may update this policy periodically. We will notify you of significant changes via email or platform notification.</p>

      <h2>10. Contact</h2>
      <p>For privacy inquiries, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>
    </section>
  </MainLayout>
);

export default Privacy;
