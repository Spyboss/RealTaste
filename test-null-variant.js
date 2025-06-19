// Test null variant_id specifically
const axios = require('axios');

const API_BASE = 'https://realtaste-api.fly.dev/api';

async function testNullVariant() {
  try {
    console.log('🧪 Testing null variant_id locally...');

    // Get menu first
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
          variant_id: null,  // This is what frontend sends
          quantity: 1,
          notes: 'Test item',
          addon_ids: []
        }
      ]
    };

    console.log('Testing with variant_id: null');
    const response = await axios.post(`${API_BASE}/orders`, orderData);
    console.log('✅ Success! Order ID:', response.data.data.id);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
  }
}

testNullVariant();
