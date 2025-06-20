import React, { useState } from 'react';
import { signUp } from '@/services/supabase';
import toast from 'react-hot-toast';

const SignupTest: React.FC = () => {
  const [email, setEmail] = useState('test@realtaste.com');
  const [password, setPassword] = useState('testpassword123');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSignup = async () => {
    setIsLoading(true);
    setResult('Creating test user...');
    
    try {
      const { data, error } = await signUp(email, password);
      
      if (error) {
        setResult(`Signup error: ${error.message}`);
        toast.error(error.message);
        console.error('Signup error:', error);
      } else {
        setResult(`Signup success! User created: ${data.user?.email}`);
        toast.success('Test user created successfully!');
        console.log('Signup success:', data);
      }
    } catch (err: any) {
      setResult(`Signup exception: ${err.message}`);
      toast.error(err.message);
      console.error('Signup exception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm max-w-md">
      <h3 className="text-lg font-semibold mb-4">Create Test User</h3>
      
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
        
        <button
          onClick={handleSignup}
          disabled={isLoading || !email || !password}
          className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Test User'}
        </button>
        
        {result && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupTest;