// Simple Node.js script to test Supabase connection directly
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vyqcamhvltkwjsnrfkkj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cWNhbWh2bHRrd2pzbnJma2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTExNzUsImV4cCI6MjA2MzU2NzE3NX0.CaumUp46LsXd5VK30ITKXqYPeeDixZQCcUGRT196Sdo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Get session
    console.log('\n1. Testing getSession...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session success:', !!sessionData.session);
    }
    
    // Test sign in with invalid credentials
    console.log('\n--- Testing signInWithPassword with invalid credentials ---');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    console.log('Sign in result:', { data: signInData, error: signInError });
    
    // Test sign in with real email but wrong password
    console.log('\n--- Testing signInWithPassword with real email but wrong password ---');
    const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
      email: 'uminda.h.aberathne@gmail.com',
      password: 'wrongpassword'
    });
    
    console.log('Sign in result with real email:', { data: signInData2, error: signInError2 });
    
    // Test sign in with real credentials (you'll need to provide the correct password)
    console.log('\n--- Testing signInWithPassword with real credentials ---');
    console.log('Please manually test with the correct password for uminda.h.aberathne@gmail.com');
    console.log('If you know the password, uncomment and modify the following lines:');
    console.log('// const { data: realSignIn, error: realSignInError } = await supabase.auth.signInWithPassword({');
    console.log('//   email: "uminda.h.aberathne@gmail.com",');
    console.log('//   password: "YOUR_ACTUAL_PASSWORD"');
    console.log('// });');
    console.log('// console.log("Real sign in result:", { data: realSignIn, error: realSignInError });');
    
  } catch (error) {
    console.error('Test failed with exception:', error);
  }
}

testSupabase();