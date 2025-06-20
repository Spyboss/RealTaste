import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Re-initialize auth state to handle the OAuth callback
        await initialize();
        
        // Show success message
        toast.success('Successfully signed in with Google!');
        
        // Redirect to home page
        navigate('/', { replace: true });
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [initialize, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;