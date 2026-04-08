import MainLayout from "@/components/layout/MainLayout";
import PromoTicker from "@/components/sections/PromoTicker";
import HeroSection from "@/components/sections/HeroSection";
import TickerBar from "@/components/sections/TickerBar";
import BrokerTrustHub from "@/components/sections/BrokerTrustHub";
import ScamAlertSection from "@/components/sections/ScamAlertSection";
import SignalChannel from "@/components/sections/SignalChannel";
import SignalHub from "@/components/sections/SignalHub";
import ForecastSection from "@/components/sections/ForecastSection";
import HowItWorks from "@/components/sections/HowItWorks";
import CommunityReviews from "@/components/sections/CommunityReviews";
import BrokerJoinSection from "@/components/sections/BrokerJoinSection";
import BottomTicker from "@/components/sections/BottomTicker";

const Index = () => {
  return (
    <>
      <PromoTicker />
      <MainLayout>
        <HeroSection />
        <TickerBar />
        <BrokerTrustHub />
        <ScamAlertSection />
        <SignalChannel />
        <SignalHub />
        <ForecastSection />
        <HowItWorks />
        <CommunityReviews />
        <BrokerJoinSection />
      </MainLayout>
      <BottomTicker />
    </>
  );
};

export default Index;
