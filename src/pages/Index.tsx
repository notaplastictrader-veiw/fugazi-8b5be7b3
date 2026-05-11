import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema, websiteSchema, faqSchema } from "@/components/seo/JsonLd";
import HeroSection from "@/components/sections/HeroSection";
import SponsoredBanner from "@/components/sponsored/SponsoredBanner";
import BrokerTrustHub from "@/components/sections/BrokerTrustHub";
import ScamAlertSection from "@/components/sections/ScamAlertSection";
import SignalChannel from "@/components/sections/SignalChannel";
import SignalHub from "@/components/sections/SignalHub";
import ForecastSection from "@/components/sections/ForecastSection";
import HomepageCalendarWidget from "@/components/sections/HomepageCalendarWidget";
import LatestForexNews from "@/components/sections/LatestForexNews";
import HowItWorks from "@/components/sections/HowItWorks";
import CommunityReviews from "@/components/sections/CommunityReviews";
import BrokerJoinSection from "@/components/sections/BrokerJoinSection";

const Index = () => {
  return (
    <MainLayout>
      <SEO
        title="Not A Fugazi — Broker Reviews & Signals"
        description="Most trusted broker review platform. Real reviews, real complaints, real withdrawal proof. Compare 280+ brokers, get verified signals, and avoid scams."
        path="/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <JsonLd data={faqSchema([
        {
          question: "Is Not A Fugazi Trader free to use?",
          answer: "Yes — broker reviews, scam alerts, the economic calendar, news, forecasts, and free signal groups are 100% free. Premium signal channels and advanced courses are optional paid upgrades.",
        },
        {
          question: "How do you verify broker reviews?",
          answer: "Reviews require a real account ID (MT4/MT5 or platform login screenshot) before they're published. Our moderation team checks every submission and we display verified-trader badges on confirmed reviews.",
        },
        {
          question: "How are trust scores calculated?",
          answer: "Trust scores combine regulation tier, verified user reviews, withdrawal-proof complaints, scam alert history, account-funding evidence, and on-platform feedback. Brokers cannot pay to change their score.",
        },
        {
          question: "What should I do if a broker refuses my withdrawal?",
          answer: "File a complaint on the broker's profile with screenshots and proof of deposit. Our team escalates verified cases publicly via Scam Alerts and tries to mediate with the broker when possible.",
        },
        {
          question: "Are forex signals on this platform reliable?",
          answer: "Every listed signal group is reviewed for win-rate transparency and verified track record. We disclose past performance and never guarantee profits — trading involves risk.",
        },
        {
          question: "Do you accept payments from brokers to influence rankings?",
          answer: "No. Sponsored placements are clearly labeled and never affect trust scores or rankings. Independence is the entire reason this platform exists.",
        },
      ])} />
      <HeroSection />
      <SponsoredBanner placement="homepage-banner" />
      <BrokerTrustHub />
      <ScamAlertSection />
      <SignalChannel />
      <SignalHub />
      <ForecastSection />
      <HomepageCalendarWidget />
      <LatestForexNews />
      <HowItWorks />
      <CommunityReviews />
      <BrokerJoinSection />
    </MainLayout>
  );
};

export default Index;
