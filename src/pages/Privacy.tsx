import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Privacy = () => (
  <MainLayout>
    <SEO title="Privacy Policy" description="Learn how Not A Fugazi Trader collects, uses, and protects your personal data." path="/privacy" />
    <section className="max-w-4xl mx-auto px-4 pt-6 pb-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly — such as your name, email address, phone number, reviews, and complaints — as well as information collected automatically, including IP address, browser type, device information, and usage data via cookies and similar technologies.</p>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Process and display your reviews and complaints</li>
        <li>Send notifications and updates (with your consent)</li>
        <li>Personalise your platform experience</li>
        <li>Prevent fraud, abuse, and ensure platform security</li>
        <li>Comply with applicable legal obligations</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>We do not sell your personal data. We may share information with:</p>
      <ul>
        <li>Service providers (hosting, analytics, email delivery)</li>
        <li>Third-party brokers or platforms, only if you submit a complaint and explicitly consent to sharing</li>
        <li>Law enforcement or regulatory authorities, when legally required</li>
      </ul>

      <h2>4. Data Security</h2>
      <p>We implement industry-standard security measures including encryption, secure authentication, and regular security reviews. However, no method of transmission over the Internet is entirely secure, and we cannot guarantee absolute security of your data.</p>

      <h2>5. Your Rights (GDPR)</h2>
      <p>If you are located in the EU or EEA, you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Rectify inaccurate or incomplete data</li>
        <li>Request deletion of your data ("right to be forgotten")</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
        <li>Withdraw consent at any time without affecting prior processing</li>
      </ul>
      <p>To exercise any of these rights, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>

      <h2>6. Cookies</h2>
      <p>We use cookies to enhance your experience and analyse platform usage. See our <a href="/cookies" className="text-primary">Cookie Policy</a> for full details on how we use cookies and how to manage your preferences.</p>

      <h2>7. Data Retention</h2>
      <p>We retain your personal data for as long as your account is active or as necessary to provide our services and meet legal obligations. You may request deletion of your data at any time by contacting us.</p>

      <h2>8. Children's Privacy</h2>
      <p>Our platform is not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has provided personal data, we will promptly delete it.</p>

      <h2>9. Third-Party Links &amp; Platforms</h2>
      <p>Our platform may contain links or references to third-party brokers, signal services, and betting platforms. NAFT is not responsible for the privacy practices of any third party. We encourage you to review the privacy policies of any external platform you engage with.</p>

      <h2>10. Changes to This Policy</h2>
      <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will notify you of significant changes via email or platform notification. Continued use of the platform after updates constitutes acceptance.</p>

      <h2>11. Contact</h2>
      <p>For privacy-related inquiries or to exercise your rights, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>
    </section>
  </MainLayout>
);

export default Privacy;
