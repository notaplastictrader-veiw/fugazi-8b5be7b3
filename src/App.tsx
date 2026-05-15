import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import CookieConsent from "@/components/CookieConsent";
import FloatingActions from "@/components/FloatingActions";
import SearchPalette from "@/components/search/SearchPalette";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import InstallAppPrompt from "@/components/InstallAppPrompt";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import LayoutSkeleton from "@/components/layout/LayoutSkeleton";
import ErrorBoundary from "@/components/ErrorBoundary";

// Eager-loaded pages (critical path)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Brokers = lazy(() => import("./pages/Brokers"));
const BrokerDetail = lazy(() => import("./pages/BrokerDetail"));
const PropFirms = lazy(() => import("./pages/PropFirms"));
const ScamAlerts = lazy(() => import("./pages/ScamAlerts"));
const ScamAlertDetail = lazy(() => import("./pages/ScamAlertDetail"));
const Signals = lazy(() => import("./pages/Signals"));
const SignalGroupDetail = lazy(() => import("./pages/SignalGroupDetail"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Compare = lazy(() => import("./pages/Compare"));
const Education = lazy(() => import("./pages/Education"));
const EducationArticle = lazy(() => import("./pages/EducationArticle"));
const Promotions = lazy(() => import("./pages/Promotions"));
const PromotionDetail = lazy(() => import("./pages/PromotionDetail"));
const News = lazy(() => import("./pages/News"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Sports = lazy(() => import("./pages/Sports"));
const Ideas = lazy(() => import("./pages/Ideas"));
const Partnership = lazy(() => import("./pages/Partnership"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const CookiesPage = lazy(() => import("./pages/Cookies"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Advertise = lazy(() => import("./pages/Advertise"));
const Forecasts = lazy(() => import("./pages/Forecasts"));
const HowWeReview = lazy(() => import("./pages/HowWeReview"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const BrokerClaimProfile = lazy(() => import("./pages/BrokerClaimProfile"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Match = lazy(() => import("./pages/Match"));
const Forum = lazy(() => import("./pages/Forum"));
const ForumThread = lazy(() => import("./pages/ForumThread"));
const Awards = lazy(() => import("./pages/Awards"));
const AwardsResults = lazy(() => import("./pages/AwardsResults"));
const AnnualReport = lazy(() => import("./pages/AnnualReport"));
const Ask = lazy(() => import("./pages/Ask"));
const RegulatorsIndex = lazy(() => import("./pages/RegulatorsIndex"));
const RegulatorDetail = lazy(() => import("./pages/RegulatorDetail"));
const CountryBrokers = lazy(() => import("./pages/CountryBrokers"));
const GlossaryIndex = lazy(() => import("./pages/GlossaryIndex"));
const GlossaryDetail = lazy(() => import("./pages/GlossaryDetail"));
const CompareVs = lazy(() => import("./pages/CompareVs"));
const Calculators = lazy(() => import("./pages/Calculators"));
const Pro = lazy(() => import("./pages/Pro"));

// Dashboard (lazy chunk)
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const MyReviews = lazy(() => import("./pages/dashboard/MyReviews"));
const MyComplaints = lazy(() => import("./pages/dashboard/MyComplaints"));
const Watchlist = lazy(() => import("./pages/dashboard/Watchlist"));
const ProfileSettings = lazy(() => import("./pages/dashboard/ProfileSettings"));
const Referrals = lazy(() => import("./pages/dashboard/Referrals"));
const Journal = lazy(() => import("./pages/dashboard/Journal"));
const SavedMatches = lazy(() => import("./pages/dashboard/SavedMatches"));
const NotificationPreferences = lazy(() => import("./pages/dashboard/NotificationPreferences"));

// Admin (lazy chunk)
const ProtectedAdminRoute = lazy(() => import("./components/admin/ProtectedAdminRoute"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const BrokersAdmin = lazy(() => import("./pages/admin/BrokersAdmin"));
const SignalsAdmin = lazy(() => import("./pages/admin/SignalsAdmin"));
const ForecastsAdmin = lazy(() => import("./pages/admin/ForecastsAdmin"));
const ReviewsAdmin = lazy(() => import("./pages/admin/ReviewsAdmin"));
const ComplaintsAdmin = lazy(() => import("./pages/admin/ComplaintsAdmin"));
const ScamAlertsAdmin = lazy(() => import("./pages/admin/ScamAlertsAdmin"));
const ApprovalQueueAdmin = lazy(() => import("./pages/admin/ApprovalQueueAdmin"));
const WithdrawalProofsAdmin = lazy(() => import("./pages/admin/WithdrawalProofsAdmin"));

const UsersAdmin = lazy(() => import("./pages/admin/UsersAdmin"));
const RevenueAdmin = lazy(() => import("./pages/admin/RevenueAdmin"));
const BrokerDashboard = lazy(() => import("./pages/admin/BrokerDashboard"));
const SignalDashboard = lazy(() => import("./pages/admin/SignalDashboard"));
const SportsDashboard = lazy(() => import("./pages/admin/SportsDashboard"));
const UserDashboardAdmin = lazy(() => import("./pages/admin/UserDashboardAdmin"));
const PromotionsAdmin = lazy(() => import("./pages/admin/PromotionsAdmin"));
const NewsAdmin = lazy(() => import("./pages/admin/NewsAdmin"));
const CalendarAdmin = lazy(() => import("./pages/admin/CalendarAdmin"));
const SportsAdmin = lazy(() => import("./pages/admin/SportsAdmin"));
const AuditLog = lazy(() => import("./pages/admin/AuditLog"));
const ReferralAnalyticsAdmin = lazy(() => import("./pages/admin/ReferralAnalyticsAdmin"));
const EducationAdmin = lazy(() => import("./pages/admin/EducationAdmin"));
const CoursesAdmin = lazy(() => import("./pages/admin/CoursesAdmin"));
const TradingIdeasAdmin = lazy(() => import("./pages/admin/TradingIdeasAdmin"));
const SubmissionsAdmin = lazy(() => import("./pages/admin/SubmissionsAdmin"));
const BettingSitesAdmin = lazy(() => import("./pages/admin/BettingSitesAdmin"));
const SiteContentAdmin = lazy(() => import("./pages/admin/SiteContentAdmin"));
const SectionEditor = lazy(() => import("./pages/admin/SectionEditor"));
const BrokerDashboardsList = lazy(() => import("./pages/admin/BrokerDashboardsList"));
const SignalDashboardsList = lazy(() => import("./pages/admin/SignalDashboardsList"));
const BettingDashboardsList = lazy(() => import("./pages/admin/BettingDashboardsList"));
const UserDashboardsList = lazy(() => import("./pages/admin/UserDashboardsList"));
const BrokerClaimsAdmin = lazy(() => import("./pages/admin/BrokerClaimsAdmin"));
const TierUpgradesAdmin = lazy(() => import("./pages/admin/TierUpgradesAdmin"));
const ApplicationsAdmin = lazy(() => import("./pages/admin/ApplicationsAdmin"));
const SupportMessagesAdmin = lazy(() => import("./pages/admin/SupportMessagesAdmin"));
const AdvertisePlacementsAdmin = lazy(() => import("./pages/admin/AdvertisePlacementsAdmin"));
const AdvertiseEnquiriesAdmin = lazy(() => import("./pages/admin/AdvertiseEnquiriesAdmin"));
const AdvertiseCampaignsAdmin = lazy(() => import("./pages/admin/AdvertiseCampaignsAdmin"));
const ForumAdmin = lazy(() => import("./pages/admin/ForumAdmin"));
const AwardsAdmin = lazy(() => import("./pages/admin/AwardsAdmin"));
const ErrorLogAdmin = lazy(() => import("./pages/admin/ErrorLogAdmin"));
const ResearchPromptsAdmin = lazy(() => import("./pages/admin/ResearchPromptsAdmin"));
const ImportJsonAdmin = lazy(() => import("./pages/admin/ImportJsonAdmin"));
const HealthScoreAdmin = lazy(() => import("./pages/admin/HealthScoreAdmin"));
const AudioDigestsAdmin = lazy(() => import("./pages/admin/AudioDigestsAdmin"));

// Provider Portal
const ProviderLayout = lazy(() => import("./components/portal/ProviderLayout"));
const PortalSubscription = lazy(() => import("./pages/portal/Subscription"));
const PortalMyListing = lazy(() => import("./pages/portal/MyListing"));

const queryClient = new QueryClient();

const PageLoader = () => <LayoutSkeleton />;

const AppContent = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  useReferralTracking();

  const openSearch = useCallback((q = "") => {
    setSearchQuery(q);
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    (window as any).__openGlobalSearch = openSearch;
    return () => { delete (window as any).__openGlobalSearch; };
  }, [openSearch]);

  return (
    <>
      <AnalyticsTracker />
      <CookieConsent />
      <InstallAppPrompt />
      <FloatingActions />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchQuery} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* User Dashboard */}
          <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
          <Route path="/dashboard/reviews" element={<DashboardLayout><MyReviews /></DashboardLayout>} />
          <Route path="/dashboard/complaints" element={<DashboardLayout><MyComplaints /></DashboardLayout>} />
          <Route path="/dashboard/watchlist" element={<DashboardLayout><Watchlist /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />
          <Route path="/dashboard/referrals" element={<DashboardLayout><Referrals /></DashboardLayout>} />
          <Route path="/dashboard/journal" element={<DashboardLayout><Journal /></DashboardLayout>} />
          <Route path="/dashboard/matches" element={<DashboardLayout><SavedMatches /></DashboardLayout>} />
          <Route path="/dashboard/notifications" element={<DashboardLayout><NotificationPreferences /></DashboardLayout>} />

          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/user" element={<Navigate to="/login" replace />} />
          <Route path="/login/broker" element={<Navigate to="/login" replace />} />
          <Route path="/login/admin" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/join/trader" element={<Signup />} />
          <Route path="/join/broker" element={<Signup />} />
          <Route path="/join/signal" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/brokers" element={<Brokers />} />
          <Route path="/brokers/country/:slug" element={<CountryBrokers />} />
          <Route path="/brokers/:slug" element={<BrokerDetail />} />
          <Route path="/prop-firms" element={<PropFirms />} />
          <Route path="/scam-alerts" element={<ScamAlerts />} />
          <Route path="/scam-alerts/:id" element={<ScamAlertDetail />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/signals/:id" element={<SignalGroupDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/:vsSlug" element={<CompareVs />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/regulators" element={<RegulatorsIndex />} />
          <Route path="/regulators/:slug" element={<RegulatorDetail />} />
          <Route path="/glossary" element={<GlossaryIndex />} />
          <Route path="/glossary/:slug" element={<GlossaryDetail />} />
          <Route path="/glossary/:slug" element={<GlossaryDetail />} />
          <Route path="/match" element={<Match />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:slug" element={<ForumThread />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/awards/results" element={<AwardsResults />} />
          <Route path="/reports/:year" element={<AnnualReport />} />
          <Route path="/reports" element={<AnnualReport />} />
          <Route path="/education" element={<Education />} />
          <Route path="/education/:slug" element={<EducationArticle />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/promotions/:slug" element={<PromotionDetail />} />
          <Route path="/news" element={<News />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/how-we-review" element={<HowWeReview />} />
          <Route path="/methodology" element={<HowWeReview />} />
          <Route path="/profile/:username" element={<UserProfile />} />
          <Route path="/claim-broker" element={<BrokerClaimProfile />} />
          <Route path="/pro" element={<Pro />} />

          {/* Admin Panel */}
          <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="brokers" element={<BrokersAdmin />} />
            <Route path="signals" element={<SignalsAdmin />} />
            <Route path="forecasts" element={<ForecastsAdmin />} />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="complaints" element={<ComplaintsAdmin />} />
            <Route path="scam-alerts" element={<ScamAlertsAdmin />} />
            <Route path="approvals" element={<ApprovalQueueAdmin />} />
            <Route path="withdrawal-proofs" element={<WithdrawalProofsAdmin />} />
            
            <Route path="users" element={<UsersAdmin />} />
            <Route path="revenue" element={<RevenueAdmin />} />
            <Route path="promotions" element={<PromotionsAdmin />} />
            <Route path="news" element={<NewsAdmin />} />
            <Route path="calendar" element={<CalendarAdmin />} />
            <Route path="sports" element={<SportsAdmin />} />
            <Route path="broker-dashboard" element={<BrokerDashboard />} />
            <Route path="signal-dashboard" element={<SignalDashboard />} />
            <Route path="sports-dashboard" element={<SportsDashboard />} />
            <Route path="user-dashboard" element={<UserDashboardAdmin />} />
            <Route path="referrals" element={<ReferralAnalyticsAdmin />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="errors" element={<ErrorLogAdmin />} />
            <Route path="education" element={<EducationAdmin />} />
            <Route path="courses" element={<CoursesAdmin />} />
            <Route path="trading-ideas" element={<TradingIdeasAdmin />} />
            <Route path="submissions" element={<SubmissionsAdmin />} />
            <Route path="betting-sites" element={<BettingSitesAdmin />} />
            <Route path="site-content" element={<SiteContentAdmin />} />
            <Route path="site-content/:section" element={<SectionEditor />} />
            <Route path="broker-dashboards" element={<BrokerDashboardsList />} />
            <Route path="broker-dashboards/:id" element={<BrokerDashboardsList />} />
            <Route path="signal-dashboards" element={<SignalDashboardsList />} />
            <Route path="signal-dashboards/:id" element={<SignalDashboardsList />} />
            <Route path="betting-dashboards" element={<BettingDashboardsList />} />
            <Route path="betting-dashboards/:id" element={<BettingDashboardsList />} />
            <Route path="user-dashboards" element={<UserDashboardsList />} />
            <Route path="user-dashboards/:id" element={<UserDashboardsList />} />
            <Route path="claims" element={<BrokerClaimsAdmin />} />
            <Route path="tier-upgrades" element={<TierUpgradesAdmin />} />
            <Route path="applications" element={<ApplicationsAdmin />} />
            <Route path="support" element={<SupportMessagesAdmin />} />
            <Route path="advertise/placements" element={<AdvertisePlacementsAdmin />} />
            <Route path="advertise/enquiries" element={<AdvertiseEnquiriesAdmin />} />
            <Route path="advertise/campaigns" element={<AdvertiseCampaignsAdmin />} />
            <Route path="forum" element={<ForumAdmin />} />
            <Route path="awards" element={<AwardsAdmin />} />
            <Route path="research-prompts" element={<ResearchPromptsAdmin />} />
            <Route path="health-scores" element={<HealthScoreAdmin />} />
            <Route path="audio-digests" element={<AudioDigestsAdmin />} />
            <Route path="import-json" element={<ImportJsonAdmin />} />
          </Route>

          {/* Provider Portals */}
          <Route path="/portal/broker" element={<ProviderLayout requiredRole="broker" />}>
            <Route index element={<BrokerDashboard />} />
            <Route path="listing" element={<PortalMyListing portalType="broker" />} />
            <Route path="upgrade" element={<PortalSubscription portalType="broker" />} />
          </Route>
          <Route path="/portal/signal" element={<ProviderLayout requiredRole="signal_provider" />}>
            <Route index element={<SignalDashboard />} />
            <Route path="channel" element={<PortalMyListing portalType="signal" />} />
            <Route path="upgrade" element={<PortalSubscription portalType="signal" />} />
          </Route>
          <Route path="/portal/betting" element={<ProviderLayout requiredRole="betting_site" />}>
            <Route index element={<SportsDashboard />} />
            <Route path="profile" element={<PortalMyListing portalType="betting" />} />
            <Route path="upgrade" element={<PortalSubscription portalType="betting" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <AuthProvider>
            <I18nProvider>
              <AppContent />
            </I18nProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
