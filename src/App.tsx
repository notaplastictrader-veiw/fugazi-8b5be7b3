import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";
import LiveChatButton from "@/components/LiveChatButton";
import SearchPalette from "@/components/search/SearchPalette";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import Brokers from "./pages/Brokers.tsx";
import BrokerDetail from "./pages/BrokerDetail.tsx";
import PropFirms from "./pages/PropFirms.tsx";
import ScamAlerts from "./pages/ScamAlerts.tsx";
import Signals from "./pages/Signals.tsx";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BrokersAdmin from "./pages/admin/BrokersAdmin";
import SignalsAdmin from "./pages/admin/SignalsAdmin";
import ForecastsAdmin from "./pages/admin/ForecastsAdmin";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";
import ComplaintsAdmin from "./pages/admin/ComplaintsAdmin";
import ScamAlertsAdmin from "./pages/admin/ScamAlertsAdmin";
import ApprovalQueueAdmin from "./pages/admin/ApprovalQueueAdmin";
import SiteSettingsAdmin from "./pages/admin/SiteSettingsAdmin";
import UsersAdmin from "./pages/admin/UsersAdmin";
import RevenueAdmin from "./pages/admin/RevenueAdmin";
import BrokerDashboard from "./pages/admin/BrokerDashboard";
import SignalDashboard from "./pages/admin/SignalDashboard";
import SportsDashboard from "./pages/admin/SportsDashboard";
import UserDashboardAdmin from "./pages/admin/UserDashboardAdmin";
import PromotionsAdmin from "./pages/admin/PromotionsAdmin";
import NewsAdmin from "./pages/admin/NewsAdmin";
import CalendarAdmin from "./pages/admin/CalendarAdmin";
import SportsAdmin from "./pages/admin/SportsAdmin";
import AuditLog from "./pages/admin/AuditLog";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import MyReviews from "./pages/dashboard/MyReviews";
import MyComplaints from "./pages/dashboard/MyComplaints";
import Watchlist from "./pages/dashboard/Watchlist";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Compare from "./pages/Compare";
import Education from "./pages/Education";
import Promotions from "./pages/Promotions";
import News from "./pages/News";
import Calendar from "./pages/Calendar";
import Sports from "./pages/Sports";

const queryClient = new QueryClient();

const AppContent = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Expose openSearch globally for HeroSection
  useEffect(() => {
    (window as any).__openGlobalSearch = openSearch;
    return () => { delete (window as any).__openGlobalSearch; };
  }, [openSearch]);

  return (
    <>
      <CookieConsent />
      <LiveChatButton />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} initialQuery={searchQuery} />
      <Routes>
        {/* User Dashboard */}
        <Route path="/dashboard" element={<DashboardLayout><Overview /></DashboardLayout>} />
        <Route path="/dashboard/reviews" element={<DashboardLayout><MyReviews /></DashboardLayout>} />
        <Route path="/dashboard/complaints" element={<DashboardLayout><MyComplaints /></DashboardLayout>} />
        <Route path="/dashboard/watchlist" element={<DashboardLayout><Watchlist /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><ProfileSettings /></DashboardLayout>} />

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
        
        {/* Public listing pages */}
        <Route path="/brokers" element={<Brokers />} />
        <Route path="/brokers/:slug" element={<BrokerDetail />} />
        <Route path="/prop-firms" element={<PropFirms />} />
        <Route path="/scam-alerts" element={<ScamAlerts />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/education" element={<Education />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/news" element={<News />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/sports" element={<Sports />} />
        
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
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
