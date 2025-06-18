import { useEffect } from 'react';
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
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
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
  const { initialize, loading, setupAuthResetListener } = useAuthStore();
  const { fetchBusinessInfo } = useBusinessStore();

  useEffect(() => {
    // Initialize auth and business info
    const initializeApp = async () => {
      await Promise.all([
        initialize(),
        fetchBusinessInfo(),
      ]);
    };

    initializeApp();
    
    // Setup auth reset listener
    const cleanup = setupAuthResetListener();
    
    // Cleanup on unmount
    return cleanup;
  }, [initialize, fetchBusinessInfo, setupAuthResetListener]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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

            <Route path="/order-confirmation/:orderId" element={
              <Layout>
                <OrderConfirmationPage />
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
