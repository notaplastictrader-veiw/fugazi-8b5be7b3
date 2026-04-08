import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import CookieConsent from "@/components/CookieConsent";
import LiveChatButton from "@/components/LiveChatButton";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CookieConsent />
          <Routes>
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
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
