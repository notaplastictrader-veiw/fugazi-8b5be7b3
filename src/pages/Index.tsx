import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import HeroSection from "@/components/sections/HeroSection";
import BrokerTrustHub from "@/components/sections/BrokerTrustHub";
import ScamAlertSection from "@/components/sections/ScamAlertSection";
import SignalChannel from "@/components/sections/SignalChannel";
import SignalHub from "@/components/sections/SignalHub";
import ForecastSection from "@/components/sections/ForecastSection";
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
      <HeroSection />
      <BrokerTrustHub />
      <ScamAlertSection />
      <SignalChannel />
      <SignalHub />
      <ForecastSection />
      <HowItWorks />
      <CommunityReviews />
      <BrokerJoinSection />
    </MainLayout>
  );
};

export default Index;
