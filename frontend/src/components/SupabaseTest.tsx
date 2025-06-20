import React, { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Check environment variables
        const env = {
          url: import.meta.env.VITE_SUPABASE_URL,
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
          keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0
        };
        setEnvVars(env);
        
        console.log('Environment variables:', env);
        
        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase connection error:', error);
          setConnectionStatus(`Error: ${error.message}`);
        } else {
          console.log('Supabase connection successful:', data);
          setConnectionStatus('Connection successful!');
        }
        
        // Test a simple sign-in attempt with dummy credentials to see the actual error
        console.log('Testing sign-in with dummy credentials...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'testpassword'
        });
        
        if (signInError) {
          console.log('Sign-in test error (expected):', signInError);
        } else {
          console.log('Sign-in test unexpected success:', signInData);
        }
        
      } catch (err: any) {
        console.error('Test failed:', err);
        setConnectionStatus(`Test failed: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      <div className="space-y-2">
        <p><strong>Status:</strong> {connectionStatus}</p>
        <p><strong>URL:</strong> {envVars.url || 'Not set'}</p>
        <p><strong>API Key:</strong> {envVars.key} ({envVars.keyLength} chars)</p>
      </div>
    </div>
  );
};

export default SupabaseTest;