import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import LegalLayout, { LegalList, type LegalSection } from "@/components/legal/LegalLayout";
import { ShieldCheck } from "lucide-react";

const sections: LegalSection[] = [
  {
    id: "info-collected",
    number: "01",
    title: "Information We Collect",
    content: (
      <p>
        We collect information you provide directly — such as your name, email address, phone number,
        reviews, and complaints — as well as information collected automatically, including IP address,
        browser type, device information, and usage data via cookies and similar technologies.
      </p>
    ),
  },
  {
    id: "how-we-use",
    number: "02",
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use your information to:</p>
        <LegalList
          items={[
            "Provide, maintain, and improve our services",
            "Process and display your reviews and complaints",
            "Send notifications and updates (with your consent)",
            "Personalise your platform experience",
            "Prevent fraud, abuse, and ensure platform security",
            "Comply with applicable legal obligations",
          ]}
        />
      </>
    ),
  },
  {
    id: "data-sharing",
    number: "03",
    title: "Data Sharing",
    content: (
      <>
        <p>
          We <strong className="text-foreground">do not sell</strong> your personal data. We may share
          information with:
        </p>
        <LegalList
          items={[
            "Service providers (hosting, analytics, email delivery)",
            "Third-party brokers or platforms, only if you submit a complaint and explicitly consent to sharing",
            "Law enforcement or regulatory authorities, when legally required",
          ]}
        />
      </>
    ),
  },
  {
    id: "security",
    number: "04",
    title: "Data Security",
    content: (
      <p>
        We implement industry-standard security measures including encryption, secure authentication, and
        regular security reviews. However, no method of transmission over the Internet is entirely secure,
        and we cannot guarantee absolute security of your data.
      </p>
    ),
  },
  {
    id: "gdpr-rights",
    number: "05",
    title: "Your Rights (GDPR)",
    content: (
      <>
        <p>If you are located in the EU or EEA, you have the right to:</p>
        <LegalList
          items={[
            "Access your personal data",
            "Rectify inaccurate or incomplete data",
            'Request deletion of your data ("right to be forgotten")',
            "Restrict or object to processing",
            "Data portability",
            "Withdraw consent at any time without affecting prior processing",
          ]}
        />
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:notafugazitrader@gmail.com">notafugazitrader@gmail.com</a>.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    number: "06",
    title: "Cookies",
    content: (
      <p>
        We use cookies to enhance your experience and analyse platform usage. See our{" "}
        <a href="/cookies">Cookie Policy</a> for full details on how we use cookies and how to manage your
        preferences.
      </p>
    ),
  },
  {
    id: "retention",
    number: "07",
    title: "Data Retention",
    content: (
      <p>
        We retain your personal data for as long as your account is active or as necessary to provide our
        services and meet legal obligations. You may request deletion of your data at any time by
        contacting us.
      </p>
    ),
  },
  {
    id: "children",
    number: "08",
    title: "Children's Privacy",
    content: (
      <p>
        Our platform is not directed at individuals under the age of 18. We do not knowingly collect
        personal data from minors. If we become aware that a minor has provided personal data, we will
        promptly delete it.
      </p>
    ),
  },
  {
    id: "third-party-links",
    number: "09",
    title: "Third-Party Links & Platforms",
    content: (
      <p>
        Our platform may contain links or references to third-party brokers, signal services, and betting
        platforms. NAFT is not responsible for the privacy practices of any third party. We encourage you
        to review the privacy policies of any external platform you engage with.
      </p>
    ),
  },
  {
    id: "changes",
    number: "10",
    title: "Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy periodically to reflect changes in our practices or applicable
        law. We will notify you of significant changes via email or platform notification. Continued use
        of the platform after updates constitutes acceptance.
      </p>
    ),
  },
  {
    id: "contact",
    number: "11",
    title: "Contact",
    content: (
      <p>
        For privacy-related inquiries or to exercise your rights, contact us at{" "}
        <a href="mailto:notafugazitrader@gmail.com">notafugazitrader@gmail.com</a>.
      </p>
    ),
  },
];

const Privacy = () => (
  <MainLayout>
    <SEO
      title="Privacy Policy"
      description="Learn how Not A Fugazi Trader collects, uses, and protects your personal data."
      path="/privacy"
    />
    <LegalLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      lastUpdated="April 2026"
      intro="How we collect, use, share, and protect your personal data when you use the NAFT platform."
      icon={ShieldCheck}
      accent="primary"
      sections={sections}
    />
  </MainLayout>
);

export default Privacy;
