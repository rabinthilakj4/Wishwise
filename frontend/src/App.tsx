import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AiChatDrawer } from './components/ai/AiChatDrawer';
import { SplashScreen } from './components/common/SplashScreen';
import { LoginModal } from './components/common/LoginModal';

// Customer / Public Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { WishlistsPage } from './pages/WishlistsPage';
import { ComparePage } from './pages/ComparePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminDemandPage } from './pages/admin/AdminDemandPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

import { useAuthStore } from './store/useAuthStore';
import { Heart } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: string[] }) => {
  const { user, token, isInitialAuthChecking } = useAuthStore();

  if (isInitialAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md animate-pulse">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <p className="text-xs font-semibold text-gray-500">Checking session...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const GuestOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { user, token, isInitialAuthChecking } = useAuthStore();

  if (isInitialAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-md animate-pulse">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <p className="text-xs font-semibold text-gray-500">Checking session...</p>
        </div>
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppContent: React.FC = () => {
  const { fetchProfile } = useAuthStore();
  const splashSeen = sessionStorage.getItem('wishwise_splash_seen');

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* 3-Second Splash Screen on First Website Load */}
      {!splashSeen && <SplashScreen durationMs={3000} />}

      {/* Guest Login Trigger Modal */}
      <LoginModal />

      <Routes>
        {/* Guest Routes (Login & Register) */}
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />

        {/* Admin Portal (Isolated Layout) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <Routes>
                <Route path="/" element={<AdminDashboardPage />} />
                <Route path="/products" element={<AdminProductsPage />} />
                <Route path="/demand" element={<AdminDemandPage />} />
                <Route path="/users" element={<AdminUsersPage />} />
                <Route path="/audit-logs" element={<AdminAuditLogsPage />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Main Application Layout (Public Guest Browsing + Protected Account Routes) */}
        <Route
          path="*"
          element={
            <>
              <Navbar />
              <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4">
                <Routes>
                  {/* Public Browsing Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/compare" element={<ComparePage />} />

                  {/* Protected Account Routes */}
                  <Route path="/wishlists" element={<ProtectedRoute><WishlistsPage /></ProtectedRoute>} />
                  <Route path="/wishlists/:id" element={<ProtectedRoute><WishlistsPage /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/assistant" element={<ProtectedRoute><WishlistsPage /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
              <AiChatDrawer />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
