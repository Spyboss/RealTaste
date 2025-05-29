const axios = require('axios');

// Replace with your actual backend URL
const BASE_URL = 'http://localhost:3001';

// Replace with valid credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function testTokenExpiration() {
  try {
    // Step 1: Login to get token
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const token = loginRes.data.token;
    console.log('Login successful. Token:', token);

    // Step 2: Extract token expiration time
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const expiration = new Date(payload.exp * 1000);
    const now = new Date();
    const expiresInSeconds = Math.floor((expiration - now) / 1000);
    
    console.log(`Token expires at: ${expiration}`);
    console.log(`Token will expire in: ${expiresInSeconds} seconds`);

    // Step 3: Wait until token expires (add 5 seconds buffer)
    const waitTime = expiresInSeconds > 0 ? (expiresInSeconds + 5) * 1000 : 5000;
    console.log(`Waiting ${waitTime/1000} seconds for token to expire...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Step 4: Make authenticated request
    console.log('Making authenticated request after expiration...');
    const protectedRes = await axios.get(`${BASE_URL}/api/protected-route`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Request succeeded:', protectedRes.data);
  } catch (error) {
    console.error('Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testTokenExpiration();