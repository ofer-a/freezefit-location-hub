
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import VerifyResetCodePage from "./pages/auth/VerifyResetCodePage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import FindInstitute from "./pages/customer/FindInstitute";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import OrderManagement from "./pages/provider/OrderManagement";
import StoreManagement from "./pages/provider/StoreManagement";
import UserPageManagement from "./pages/provider/UserPageManagement";
import UserProfile from "./pages/customer/UserProfile";
import AddReview from "./pages/customer/AddReview";
import CustomerInquiries from "./pages/provider/CustomerInquiries";

// Providers
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-reset-code" element={<VerifyResetCodePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Customer Routes */}
              <Route path="/find-institute" element={<FindInstitute />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/add-review/:instituteId/:therapistId" element={<AddReview />} />
              
              {/* Provider Routes */}
              <Route path="/dashboard" element={<ProviderDashboard />} />
              <Route path="/order-management" element={<OrderManagement />} />
              <Route path="/store-management" element={<StoreManagement />} />
              <Route path="/user-page-management" element={<UserPageManagement />} />
              <Route path="/customer-inquiries" element={<CustomerInquiries />} />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
