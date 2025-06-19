// Test script to create an order
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testOrderCreation() {
  try {
    console.log('🧪 Testing order creation...');

    // First, get menu (categories with items)
    console.log('📋 Fetching menu...');
    const menuResponse = await axios.get(`${API_BASE}/menu`);
    console.log('Categories count:', menuResponse.data.data?.length || 0);

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

    // Create a test order
    const orderData = {
      customer_phone: '+94 76 195 2541',
      customer_name: 'Test Customer',
      payment_method: 'cash',
      notes: 'Test order from script',
      items: [
        {
          menu_item_id: firstItem.id,
          quantity: 1,
          notes: 'Test item'
        }
      ]
    };

    console.log('🛒 Creating order with data:', JSON.stringify(orderData, null, 2));

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData);
    console.log('✅ Order created successfully!');
    console.log('Order ID:', orderResponse.data.data.id);
    console.log('Total amount:', orderResponse.data.data.total_amount);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
  }
}

testOrderCreation();
