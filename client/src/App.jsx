import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { SocketProvider } from './context/SocketContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AIChatWidget from './components/common/AIChatWidget';

// Pages
import LandingPage from './pages/LandingPage';
import CataloguePage from './pages/CataloguePage';
import AIAdvisorPage from './pages/AIAdvisorPage';
import QuoteBuilderPage from './pages/QuoteBuilderPage';
import SmartKYCPage from './pages/SmartKYCPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackerPage from './pages/OrderTrackerPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import PartnerDashboardPage from './pages/PartnerDashboardPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        Verifying security session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Core Journey Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/advisor" element={<AIAdvisorPage />} />
          <Route path="/quote" element={<QuoteBuilderPage />} />
          <Route path="/kyc" element={<SmartKYCPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<OrderTrackerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dedicated Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['customer', 'partner', 'admin', 'technician']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Role-Specific Dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer', 'partner', 'admin']}>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner"
            element={
              <ProtectedRoute allowedRoles={['partner', 'admin']}>
                <PartnerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={['technician', 'admin']}>
                <TechnicianDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <AIChatWidget />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <OnboardingProvider>
              <AppContent />
            </OnboardingProvider>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;

