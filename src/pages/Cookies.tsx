import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import LegalLayout, { LegalList, type LegalSection } from "@/components/legal/LegalLayout";
import { Cookie } from "lucide-react";

const sections: LegalSection[] = [
  {
    id: "what-are-cookies",
    number: "01",
    title: "What Are Cookies?",
    content: (
      <p>
        Cookies are small text files placed on your device when you visit our website. They help us provide
        a better user experience, remember your preferences, and understand how you use our platform.
      </p>
    ),
  },
  {
    id: "essential",
    number: "02",
    title: "Essential Cookies",
    content: (
      <>
        <p>
          Required for the website to function properly. These include authentication tokens, session
          identifiers, and security cookies. You cannot opt out of these.
        </p>
        <LegalList
          items={[
            <><strong className="text-foreground">naft-cookie-consent</strong> — Stores your cookie preference</>,
            <><strong className="text-foreground">naft-theme</strong> — Stores your selected theme (Dark/Light/Sentinel)</>,
            <><strong className="text-foreground">supabase-auth-token</strong> — Authentication session</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "functional",
    number: "03",
    title: "Functional Cookies",
    content: (
      <p>
        Help us remember your preferences like language selection, recently viewed brokers, and search
        history.
      </p>
    ),
  },
  {
    id: "analytics",
    number: "04",
    title: "Analytics Cookies",
    content: (
      <p>
        Help us understand how visitors interact with our website. We use this data to improve the platform.
        These cookies collect anonymous usage statistics.
      </p>
    ),
  },
  {
    id: "marketing",
    number: "05",
    title: "Marketing Cookies",
    content: (
      <p>
        Used to track visitors across websites for displaying relevant advertisements. We currently do not
        use third-party marketing cookies.
      </p>
    ),
  },
  {
    id: "managing",
    number: "06",
    title: "Managing Cookies",
    content: (
      <>
        <p>You can manage your cookie preferences through:</p>
        <LegalList
          items={[
            "Our cookie consent banner (shown on first visit)",
            "Your browser settings (to block or delete cookies)",
            "Individual browser privacy controls",
          ]}
        />
        <p>Note: Disabling essential cookies may affect the functionality of the website.</p>
      </>
    ),
  },
  {
    id: "third-party",
    number: "07",
    title: "Third-Party Cookies",
    content: (
      <p>
        Some third-party services integrated into our platform may set their own cookies. We do not control
        these cookies. Please refer to the respective third-party privacy policies for more information.
      </p>
    ),
  },
  {
    id: "contact",
    number: "08",
    title: "Contact",
    content: (
      <p>
        For questions about our cookie usage, contact us at{" "}
        <a href="mailto:notafugazitrader@gmail.com">notafugazitrader@gmail.com</a>.
      </p>
    ),
  },
];

const Cookies = () => (
  <MainLayout>
    <SEO
      title="Cookie Policy"
      description="Understand how Not A Fugazi Trader uses cookies and similar technologies."
      path="/cookies"
    />
    <LegalLayout
      eyebrow="Cookies"
      title="Cookie Policy"
      lastUpdated="April 2026"
      intro="How NAFT uses cookies and similar technologies to power your experience, remember preferences, and improve the platform."
      icon={Cookie}
      accent="primary"
      sections={sections}
    />
  </MainLayout>
);

export default Cookies;
