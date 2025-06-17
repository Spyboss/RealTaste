import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Stores
import { useAuthStore } from '@/stores/authStore';
import { useBusinessStore } from '@/stores/businessStore';

// Layout
import Layout from '@/components/layout/Layout';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OrdersPage from '@/pages/OrdersPage';
import OrderDetailsPage from '@/pages/OrderDetailsPage';
import CheckoutPage from '@/pages/CheckoutPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Payment Pages
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentErrorPage from '@/pages/PaymentErrorPage';
import PaymentPendingPage from '@/pages/PaymentPendingPage';
import PaymentCancelledPage from '@/pages/PaymentCancelledPage';

// Components
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LocationPermission from '@/components/LocationPermission';

// Services
import { type Location } from '@/services/locationService';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { initialize, loading } = useAuthStore();
  const { fetchBusinessInfo } = useBusinessStore();
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize auth and business info
    const initializeApp = async () => {
      await Promise.all([
        initialize(),
        fetchBusinessInfo(),
      ]);
    };

    initializeApp();
  }, [initialize, fetchBusinessInfo]);

  const handleLocationVerified = (location: Location, distance: number) => {
    setLocationVerified(true);
    setLocationError('');
    
    // Store location data globally for delivery calculations
    window.userDeliveryInfo = {
      location,
      distance,
      verified: true
    };
  };

  const handleLocationDenied = (error: string) => {
    setLocationError(error);
    setLocationVerified(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show location permission screen if not verified
  if (!locationVerified && !locationError?.includes('deliver within')) {
    return (
      <LocationPermission
        onLocationVerified={handleLocationVerified}
        onLocationDenied={handleLocationDenied}
      />
    );
  }

  // Show location error screen for out-of-range users
  if (locationError?.includes('deliver within')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">📍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service Area Restriction</h1>
          <p className="text-gray-600 mb-6">{locationError}</p>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-700">
              We're working to expand our delivery area. Please check back soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={
              <Layout>
                <HomePage />
              </Layout>
            } />

            <Route path="/login" element={
              <Layout>
                <LoginPage />
              </Layout>
            } />

            <Route path="/register" element={
              <Layout>
                <RegisterPage />
              </Layout>
            } />

            <Route path="/checkout" element={
              <Layout>
                <CheckoutPage />
              </Layout>
            } />

            {/* Payment routes */}
            <Route path="/payment/success" element={
              <Layout>
                <PaymentSuccessPage />
              </Layout>
            } />

            <Route path="/payment/error" element={
              <Layout>
                <PaymentErrorPage />
              </Layout>
            } />

            <Route path="/payment/pending" element={
              <Layout>
                <PaymentPendingPage />
              </Layout>
            } />

            <Route path="/payment/cancelled" element={
              <Layout>
                <PaymentCancelledPage />
              </Layout>
            } />

            {/* Protected routes */}
            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <OrdersPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <Layout>
                  <OrderDetailsPage />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute requireAdmin>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <Layout>
                <div className="text-center py-12">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              </Layout>
            } />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
