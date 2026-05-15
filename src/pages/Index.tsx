import { lazy, Suspense } from "react";
import MainLayout from "@/components/layout/MainLayout";
import SEO from "@/components/SEO";
import JsonLd, { organizationSchema, websiteSchema, faqSchema } from "@/components/seo/JsonLd";
import LazySection from "@/components/LazySection";
import HeroSection from "@/components/sections/HeroSection";
import LiveTrustTicker from "@/components/sections/LiveTrustTicker";
import BrokerTrustHub from "@/components/sections/BrokerTrustHub";
import BrokerHealthGrid from "@/components/sections/BrokerHealthGrid";

// Below-fold sections — lazy-loaded chunks, mounted on scroll
const TrustTimeline = lazy(() => import("@/components/sections/TrustTimeline"));
const WithdrawalProofWall = lazy(() => import("@/components/sections/WithdrawalProofWall"));
const PayoutSpeedLeaderboard = lazy(() => import("@/components/sections/PayoutSpeedLeaderboard"));
const AIMatcherTeaser = lazy(() => import("@/components/sections/AIMatcherTeaser"));
const ScamPulseRadar = lazy(() => import("@/components/sections/ScamPulseRadar"));
const ScamAlertSection = lazy(() => import("@/components/sections/ScamAlertSection"));
const SponsoredBanner = lazy(() => import("@/components/sponsored/SponsoredBanner"));
const FeaturedOffersCarousel = lazy(() => import("@/components/sections/FeaturedOffersCarousel"));
const SignalHub = lazy(() => import("@/components/sections/SignalHub"));
const ForecastSection = lazy(() => import("@/components/sections/ForecastSection"));
const HomepageCalendarWidget = lazy(() => import("@/components/sections/HomepageCalendarWidget"));
const LatestForexNews = lazy(() => import("@/components/sections/LatestForexNews"));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks"));
const CommunityReviews = lazy(() => import("@/components/sections/CommunityReviews"));
const BrokerJoinSection = lazy(() => import("@/components/sections/BrokerJoinSection"));
const ForumActivityWidget = lazy(() => import("@/components/sections/ForumActivityWidget"));

const Index = () => {
  return (
    <MainLayout>
      <SEO
        title="Not A Fugazi Trader | Broker Reviews & Scam Alerts"
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
      <LiveTrustTicker />
      <BrokerTrustHub />
      <BrokerHealthGrid />
      <Suspense fallback={null}>
        <LazySection><TrustTimeline /></LazySection>
        <LazySection><WithdrawalProofWall /></LazySection>
        <LazySection><PayoutSpeedLeaderboard /></LazySection>
        <LazySection><AIMatcherTeaser /></LazySection>
        <LazySection><ScamPulseRadar /></LazySection>
        <LazySection><ScamAlertSection /></LazySection>
        <LazySection minHeight={200}><SponsoredBanner placement="homepage-banner" /></LazySection>
        <LazySection><FeaturedOffersCarousel /></LazySection>
        <LazySection><SignalHub /></LazySection>
        <LazySection><ForecastSection /></LazySection>
        <LazySection><HomepageCalendarWidget /></LazySection>
        <LazySection><LatestForexNews /></LazySection>
        <LazySection><CommunityReviews /></LazySection>
        <LazySection><ForumActivityWidget /></LazySection>
        <LazySection><HowItWorks /></LazySection>
        <LazySection><BrokerJoinSection /></LazySection>
      </Suspense>
    </MainLayout>
  );
};

export default Index;
