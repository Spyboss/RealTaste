// Test script to mimic exact frontend request
const axios = require('axios');

const API_BASE = 'https://realtaste-api.fly.dev/api';

async function testFrontendRequest() {
  try {
    console.log('🧪 Testing frontend-like request...');
    
    // Get menu first
    const menuResponse = await axios.get(`${API_BASE}/menu`);
    const firstItem = menuResponse.data.data[0].menu_items[0];
    
    console.log('First menu item:', firstItem.name);
    
    // Test with different cart item structures that frontend might send
    const testCases = [
      {
        name: 'Basic item (like our test)',
        data: {
          customer_phone: '+94771234567',
          customer_name: 'Test Customer',
          payment_method: 'cash',
          notes: 'Test order',
          items: [
            {
              menu_item_id: firstItem.id,
              quantity: 1,
              notes: 'Test item'
            }
          ]
        }
      },
      {
        name: 'Item with empty addon_ids array',
        data: {
          customer_phone: '+94771234567',
          customer_name: 'Test Customer',
          payment_method: 'cash',
          notes: 'Test order',
          items: [
            {
              menu_item_id: firstItem.id,
              quantity: 1,
              notes: 'Test item',
              addon_ids: []
            }
          ]
        }
      },
      {
        name: 'Item with null variant_id',
        data: {
          customer_phone: '+94771234567',
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
        }
      },
      {
        name: 'Item with undefined variant_id',
        data: {
          customer_phone: '+94771234567',
          customer_name: 'Test Customer',
          payment_method: 'cash',
          notes: 'Test order',
          items: [
            {
              menu_item_id: firstItem.id,
              variant_id: undefined,
              quantity: 1,
              notes: 'Test item',
              addon_ids: []
            }
          ]
        }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      console.log('Data:', JSON.stringify(testCase.data, null, 2));
      
      try {
        const response = await axios.post(`${API_BASE}/orders`, testCase.data);
        console.log('✅ Success! Order ID:', response.data.data.id);
      } catch (error) {
        console.log('❌ Failed:', error.response?.data?.error || error.message);
        if (error.response?.data?.details) {
          console.log('Details:', error.response.data.details);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testFrontendRequest();
