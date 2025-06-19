// Test with authentication like frontend does
const axios = require('axios');

const API_BASE = 'https://realtaste-api.fly.dev/api';

async function testWithAuth() {
  try {
    console.log('🧪 Testing with authentication...');
    
    // First, let's try to authenticate (this is just a test - we don't have real tokens)
    // But let's see what happens when we send a request with auth headers
    
    const menuResponse = await axios.get(`${API_BASE}/menu`);
    const firstItem = menuResponse.data.data[0].menu_items[0];
    
    const orderData = {
      customer_phone: '+94 76 195 2541',
      customer_name: 'Test Customer',
      payment_method: 'cash',
      notes: 'Test order',
      items: [
        {
          menu_item_id: firstItem.id,
          variant_id: null,
          quantity: 1,
          notes: 'Test item',
          addon_ids: []
        }
      ]
    };
    
    // Test with fake auth header (like frontend might send)
    const headers = {
      'Authorization': 'Bearer fake-token-for-testing',
      'Content-Type': 'application/json'
    };
    
    console.log('Testing with auth headers...');
    try {
      const response = await axios.post(`${API_BASE}/orders`, orderData, { headers });
      console.log('✅ Success with auth! Order ID:', response.data.data.id);
    } catch (error) {
      console.log('❌ Failed with auth:', error.response?.data?.error || error.message);
      if (error.response?.data?.details) {
        console.log('Auth error details:', error.response.data.details);
      }
    }
    
    // Test without auth headers
    console.log('\nTesting without auth headers...');
    try {
      const response = await axios.post(`${API_BASE}/orders`, orderData);
      console.log('✅ Success without auth! Order ID:', response.data.data.id);
    } catch (error) {
      console.log('❌ Failed without auth:', error.response?.data?.error || error.message);
      if (error.response?.data?.details) {
        console.log('No-auth error details:', error.response.data.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWithAuth();
