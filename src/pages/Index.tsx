import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema, websiteSchema } from "@/components/seo/JsonLd";
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
        title="Not A Fugazi Trader — Broker Reviews & Signals"
        description="Most trusted broker review platform. Real reviews, real complaints, real withdrawal proof. Compare 280+ brokers, get verified signals, and avoid scams."
        path="/"
      />
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
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
