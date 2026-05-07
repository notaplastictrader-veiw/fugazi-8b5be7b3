import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema } from "@/components/seo/JsonLd";
import LegalLayout, { LegalList, type LegalSection } from "@/components/legal/LegalLayout";
import { ScrollText } from "lucide-react";

const sections: LegalSection[] = [
  {
    id: "acceptance",
    number: "01",
    title: "Acceptance of Terms",
    content: (
      <p>
        By accessing or using Not A Fugazi Trader ("NAFT", "we", "us"), you agree to be bound by these
        Terms and Conditions. If you do not agree, please discontinue use of our platform immediately.
      </p>
    ),
  },
  {
    id: "service",
    number: "02",
    title: "Description of Service",
    content: (
      <p>
        NAFT is an independent broker review, comparison, trading education, and community platform. We
        provide user-generated reviews, broker ratings, signal channel references, sports predictions,
        market forecasts, and educational content. We do not act as a broker, dealer, exchange, financial
        advisor, signal provider, or licensed betting operator, and we do not solicit, accept, or hold
        client funds of any kind.
      </p>
    ),
  },
  {
    id: "accounts",
    number: "03",
    title: "User Accounts",
    content: (
      <p>
        You must provide accurate information when creating an account. You are responsible for maintaining
        the confidentiality of your credentials. You must be at least 18 years of age to register. We
        reserve the right to suspend or terminate accounts that violate these Terms.
      </p>
    ),
  },
  {
    id: "user-content",
    number: "04",
    title: "User Content",
    content: (
      <p>
        By submitting reviews, complaints, or other content, you grant NAFT a non-exclusive, royalty-free
        licence to use, display, and distribute your content on the platform. You represent that your
        submissions are truthful, accurate, and do not infringe on any third-party rights.
      </p>
    ),
  },
  {
    id: "prohibited",
    number: "05",
    title: "Prohibited Activities",
    content: (
      <>
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Submit false, misleading, or defamatory reviews or content",
            "Impersonate another person or entity",
            "Attempt to manipulate broker ratings or platform data",
            "Use automated systems, bots, or scrapers to access the platform",
            "Engage in any unlawful activity through or in connection with the platform",
          ]}
        />
      </>
    ),
  },
  {
    id: "financial",
    number: "06",
    title: "Financial & Trading Disclaimer",
    content: (
      <p>
        NAFT does not provide financial, investment, or trading advice. All broker listings, signal channel
        references, reviews, ratings, market analysis, and forecasts are provided for{" "}
        <strong className="text-foreground">informational and educational purposes only</strong> and do
        not constitute financial, investment, legal, or tax advice. Trading foreign exchange, CFDs,
        cryptocurrencies, and other leveraged instruments carries a high level of risk and may result in
        the loss of all invested capital. Past performance is never a guarantee of future results. You
        should seek independent advice from a licensed financial advisor before making any investment
        decisions.
      </p>
    ),
  },
  {
    id: "sports",
    number: "07",
    title: "Sports Predictions & Betting-Related Content",
    content: (
      <p>
        Any sports predictions, tips, or references to third-party betting platforms featured on NAFT are
        provided strictly for{" "}
        <strong className="text-foreground">informational and entertainment purposes only</strong>. NAFT
        does not operate as a licensed betting operator or gambling service. Online sports betting and
        gambling may be restricted or prohibited in your jurisdiction — you are solely responsible for
        ensuring compliance with applicable local laws before engaging with any listed platform. You must
        be of legal age in your jurisdiction to access betting-related content.
      </p>
    ),
  },
  {
    id: "affiliate",
    number: "08",
    title: "Affiliate Disclosure",
    content: (
      <p>
        Some broker and platform listings may contain affiliate links. NAFT may receive compensation when
        you open an account or register through these links. This does not influence our review
        methodology, ratings, or editorial independence, which are based on verified user experiences and
        independent assessment.
      </p>
    ),
  },
  {
    id: "third-party",
    number: "09",
    title: "Third-Party Services",
    content: (
      <p>
        You are solely responsible for verifying that any broker, signal service, or betting platform you
        engage with is properly authorised and regulated in your jurisdiction. NAFT does not endorse,
        recommend, or guarantee the services, reliability, or regulatory status of any third party
        featured on this platform.
      </p>
    ),
  },
  {
    id: "liability",
    number: "10",
    title: "Limitation of Liability",
    content: (
      <p>
        NAFT, its team, partners, and contributors shall not be liable for any direct, indirect,
        incidental, or consequential damages arising from your use of the platform, including but not
        limited to trading losses, gambling-related losses, or reliance on any third-party information
        featured here. Our total liability shall not exceed the amount paid by you, if any, for accessing
        premium services.
      </p>
    ),
  },
  {
    id: "eligibility",
    number: "11",
    title: "Eligibility & Jurisdictional Compliance",
    content: (
      <p>
        By using NAFT, you confirm that accessing this platform is lawful in your country, that you are at
        least 18 years of age, and that you comply with all applicable local regulations.
      </p>
    ),
  },
  {
    id: "changes",
    number: "12",
    title: "Changes to Terms",
    content: (
      <p>
        We reserve the right to modify these Terms at any time. Continued use of the platform after
        changes are posted constitutes your acceptance of the updated Terms.
      </p>
    ),
  },
  {
    id: "contact",
    number: "13",
    title: "Contact",
    content: (
      <p>
        For questions about these Terms, contact us at{" "}
        <a href="mailto:notafugazitrader@gmail.com">notafugazitrader@gmail.com</a>.
      </p>
    ),
  },
];

const Terms = () => (
  <MainLayout>
    <JsonLd data={organizationSchema} />
    <SEO
      title="Terms & Conditions"
      description="Read the terms and conditions for using Not A Fugazi Trader platform."
      path="/terms"
    />
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      lastUpdated="April 2026"
      intro="The rules and agreements that govern your use of the NAFT platform. Please read carefully before creating an account or using our services."
      icon={ScrollText}
      accent="primary"
      sections={sections}
    />
  </MainLayout>
);

export default Terms;
