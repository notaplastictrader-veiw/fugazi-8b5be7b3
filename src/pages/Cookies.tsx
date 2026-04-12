import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";

const Cookies = () => (
  <MainLayout>
    <SEO title="Cookie Policy" description="Understand how Not A Fugazi Trader uses cookies and similar technologies." path="/cookies" />
    <section className="max-w-4xl mx-auto px-4 py-24 prose prose-sm dark:prose-invert max-w-none">
      <h1 className="text-4xl font-display font-extrabold text-foreground mb-8">Cookie Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 2026</p>

      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files placed on your device when you visit our website. They help us provide a better user experience, remember your preferences, and understand how you use our platform.</p>

      <h2>Types of Cookies We Use</h2>

      <h3>Essential Cookies</h3>
      <p>Required for the website to function properly. These include authentication tokens, session identifiers, and security cookies. You cannot opt out of these.</p>
      <ul>
        <li><strong>naft-cookie-consent</strong> — Stores your cookie preference</li>
        <li><strong>naft-theme</strong> — Stores your selected theme (Dark/Light/Sentinel)</li>
        <li><strong>supabase-auth-token</strong> — Authentication session</li>
      </ul>

      <h3>Functional Cookies</h3>
      <p>Help us remember your preferences like language selection, recently viewed brokers, and search history.</p>

      <h3>Analytics Cookies</h3>
      <p>Help us understand how visitors interact with our website. We use this data to improve the platform. These cookies collect anonymous usage statistics.</p>

      <h3>Marketing Cookies</h3>
      <p>Used to track visitors across websites for displaying relevant advertisements. We currently do not use third-party marketing cookies.</p>

      <h2>Managing Cookies</h2>
      <p>You can manage your cookie preferences through:</p>
      <ul>
        <li>Our cookie consent banner (shown on first visit)</li>
        <li>Your browser settings (to block or delete cookies)</li>
        <li>Individual browser privacy controls</li>
      </ul>
      <p>Note: Disabling essential cookies may affect the functionality of the website.</p>

      <h2>Third-Party Cookies</h2>
      <p>Some third-party services integrated into our platform may set their own cookies. We do not control these cookies. Please refer to the respective third-party privacy policies for more information.</p>

      <h2>Contact</h2>
      <p>For questions about our cookie usage, contact us at <a href="mailto:notafugazitrader@gmail.com" className="text-primary">notafugazitrader@gmail.com</a>.</p>
    </section>
  </MainLayout>
);

export default Cookies;
