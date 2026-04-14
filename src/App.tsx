import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import CookieConsent from "@/components/CookieConsent";
import LiveChatButton from "@/components/LiveChatButton";
import SearchPalette from "@/components/search/SearchPalette";
import { useReferralTracking } from "@/hooks/useReferralTracking";
import { Skeleton } from "@/components/ui/skeleton";

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
const Advertise = lazy(() => import("./pages/Advertise"));
const Forecasts = lazy(() => import("./pages/Forecasts"));

// Dashboard (lazy chunk)
const DashboardLayout = lazy(() => import("./components/dashboard/DashboardLayout"));
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const MyReviews = lazy(() => import("./pages/dashboard/MyReviews"));
const MyComplaints = lazy(() => import("./pages/dashboard/MyComplaints"));
const Watchlist = lazy(() => import("./pages/dashboard/Watchlist"));
const ProfileSettings = lazy(() => import("./pages/dashboard/ProfileSettings"));
const Referrals = lazy(() => import("./pages/dashboard/Referrals"));

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
const SiteSettingsAdmin = lazy(() => import("./pages/admin/SiteSettingsAdmin"));
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

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  </div>
);

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
      <CookieConsent />
      <LiveChatButton />
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

          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/user" element={<Login />} />
          <Route path="/login/broker" element={<Login />} />
          <Route path="/login/admin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/join/trader" element={<Signup />} />
          <Route path="/join/broker" element={<Signup />} />
          <Route path="/join/signal" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/brokers" element={<Brokers />} />
          <Route path="/brokers/:slug" element={<BrokerDetail />} />
          <Route path="/prop-firms" element={<PropFirms />} />
          <Route path="/scam-alerts" element={<ScamAlerts />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/signals/:id" element={<SignalGroupDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/compare" element={<Compare />} />
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
          <Route path="/advertise" element={<Advertise />} />
          <Route path="/forecasts" element={<Forecasts />} />

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
            <Route path="settings" element={<SiteSettingsAdmin />} />
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
            <Route path="education" element={<EducationAdmin />} />
            <Route path="courses" element={<CoursesAdmin />} />
            <Route path="trading-ideas" element={<TradingIdeasAdmin />} />
            <Route path="submissions" element={<SubmissionsAdmin />} />
            <Route path="betting-sites" element={<BettingSitesAdmin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
            <AppContent />
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
