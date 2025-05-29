import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getUserRole } from '@/services/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, loading } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingRole, setCheckingRole] = useState<boolean>(true);
  const location = useLocation();

  useEffect(() => {
    const checkRole = async () => {
      if (isAuthenticated && requireAdmin) {
        console.time('getUserRole');
        const role = await getUserRole();
        console.timeEnd('getUserRole');
        console.log(`Admin role check: ${role === 'admin' ? 'admin' : 'not admin'}`);
        setIsAdmin(role === 'admin');
      }
      setCheckingRole(false);
    };

    console.log('ProtectedRoute: Checking role...');
    checkRole();
  }, [isAuthenticated, requireAdmin]);

  if (loading || (requireAdmin && checkingRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
