import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, isAuthenticated } = useAuthStore(state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }));
  const location = useLocation();

  // Temporarily disable loading check to fix persistent spinner issue
  // if (authLoading) {
  //   console.log('ProtectedRoute: Auth store is loading...');
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <LoadingSpinner size="lg" />
  //     </div>
  //   );
  // }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin) {
    const userRole = user?.app_metadata?.role;
    console.log(`ProtectedRoute: Admin check. User role from store: ${userRole}`);
    if (userRole !== 'admin') {
      console.log('ProtectedRoute: User is not admin, redirecting to home.');
      return <Navigate to="/" replace />;
    }
    console.log('ProtectedRoute: User is admin, proceeding.');
  }

  return <>{children}</>;
};

export default ProtectedRoute;
