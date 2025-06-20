import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { signIn } from '@/services/supabase';
import toast from 'react-hot-toast';

const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('uminda.h.aberathne@gmail.com');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user, isAuthenticated, error } = useAuthStore();

  const testDirectSignIn = async () => {
    setIsLoading(true);
    setTestResult('Testing direct Supabase sign-in...');
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setTestResult(`Direct sign-in error: ${error.message}`);
        console.error('Direct sign-in error:', error);
      } else {
        setTestResult(`Direct sign-in success! User: ${data.user?.email}`);
        console.log('Direct sign-in success:', data);
      }
    } catch (err: any) {
      setTestResult(`Direct sign-in exception: ${err.message}`);
      console.error('Direct sign-in exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testStoreLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing auth store login...');
    
    try {
      await login(email, password);
      setTestResult('Auth store login success!');
      toast.success('Login successful!');
    } catch (err: any) {
      setTestResult(`Auth store login error: ${err.message}`);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter password"
          />
        </div>
        
        <div className="space-y-2">
          <button
            onClick={testDirectSignIn}
            disabled={isLoading || !email || !password}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Direct Sign-In
          </button>
          
          <button
            onClick={testStoreLogin}
            disabled={isLoading || !email || !password}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Test Store Login
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">Current Auth State:</p>
          <p className="text-xs">Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p className="text-xs">User: {user?.email || 'None'}</p>
          <p className="text-xs">Error: {error || 'None'}</p>
        </div>
        
        {testResult && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm font-medium">Test Result:</p>
            <p className="text-xs">{testResult}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthTest;