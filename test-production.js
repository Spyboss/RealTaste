// Test script to test production API
const axios = require('axios');

const API_BASE = 'https://realtaste.fly.dev/api';

async function testProductionAPI() {
  try {
    console.log('🧪 Testing production API...');

    // Test health
    console.log('🏥 Testing health endpoint...');
    const healthResponse = await axios.get('https://realtaste.fly.dev/health');
    console.log('Health:', healthResponse.data.message);

    // Test menu
    console.log('📋 Testing menu endpoint...');
    const menuResponse = await axios.get(`${API_BASE}/menu`);
    console.log('Menu categories:', menuResponse.data.data?.length || 0);

    if (!menuResponse.data.data || menuResponse.data.data.length === 0) {
      console.log('❌ No menu categories found');
      return;
    }

    // Find first available menu item
    let firstItem = null;
    for (const category of menuResponse.data.data) {
      if (category.menu_items && category.menu_items.length > 0) {
        firstItem = category.menu_items[0];
        break;
      }
    }

    if (!firstItem) {
      console.log('❌ No menu items found');
      return;
    }

    console.log('First menu item:', firstItem.name, 'Price:', firstItem.base_price);

    // Test order creation
    const orderData = {
      customer_phone: '+94 76 195 2541',
      customer_name: 'Test Customer',
      payment_method: 'card', // Test with card payment method
      notes: 'Test order from production test',
      items: [
        {
          menu_item_id: firstItem.id,
          quantity: 1,
          notes: 'Test item'
        }
      ]
    };

    console.log('🛒 Testing order creation...');
    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData);
    console.log('✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data.data.id);
    console.log('Total amount:', orderResponse.data.data.total_amount);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
  }
}

testProductionAPI();
