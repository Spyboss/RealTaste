// Create multiple test orders for admin testing
const axios = require('axios');

const API_BASE = 'https://realtaste.fly.dev/api';

async function createTestOrders() {
  try {
    console.log('🧪 Creating test orders for admin testing...');

    // Get menu first
    const menuResponse = await axios.get(`${API_BASE}/menu`);
    const categories = menuResponse.data.data;
    
    if (!categories || categories.length === 0) {
      console.log('❌ No menu categories found');
      return;
    }

    // Collect all menu items
    const allItems = [];
    categories.forEach(category => {
      if (category.menu_items) {
        allItems.push(...category.menu_items);
      }
    });

    if (allItems.length === 0) {
      console.log('❌ No menu items found');
      return;
    }

    console.log(`Found ${allItems.length} menu items`);

    // Create 5 test orders with different items and customers
    const testOrders = [
      {
        customer_phone: '+94771234567',
        customer_name: 'John Silva',
        payment_method: 'cash',
        notes: 'Test order 1 - Regular customer',
        items: [
          {
            menu_item_id: allItems[0].id,
            quantity: 2,
            notes: 'Extra spicy'
          }
        ]
      },
      {
        customer_phone: '+94772345678',
        customer_name: 'Mary Fernando',
        payment_method: 'card',
        notes: 'Test order 2 - Card payment',
        items: [
          {
            menu_item_id: allItems[1] ? allItems[1].id : allItems[0].id,
            quantity: 1,
            notes: 'No onions'
          },
          {
            menu_item_id: allItems[2] ? allItems[2].id : allItems[0].id,
            quantity: 1,
            notes: 'Medium spice'
          }
        ]
      },
      {
        customer_phone: '+94773456789',
        customer_name: 'David Perera',
        payment_method: 'cash',
        notes: 'Test order 3 - Large order',
        items: [
          {
            menu_item_id: allItems[0].id,
            quantity: 3,
            notes: 'Family pack'
          }
        ]
      },
      {
        customer_phone: '+94774567890',
        customer_name: 'Sarah Jayawardena',
        payment_method: 'card',
        notes: 'Test order 4 - Mixed items',
        items: [
          {
            menu_item_id: allItems[3] ? allItems[3].id : allItems[0].id,
            quantity: 1,
            notes: 'Less salt'
          }
        ]
      },
      {
        customer_phone: '+94775678901',
        customer_name: 'Ravi Mendis',
        payment_method: 'cash',
        notes: 'Test order 5 - Quick pickup',
        items: [
          {
            menu_item_id: allItems[4] ? allItems[4].id : allItems[0].id,
            quantity: 2,
            notes: 'ASAP please'
          }
        ]
      }
    ];

    // Create all orders
    for (let i = 0; i < testOrders.length; i++) {
      const orderData = testOrders[i];
      console.log(`\n📦 Creating order ${i + 1}: ${orderData.customer_name}`);
      
      try {
        const response = await axios.post(`${API_BASE}/orders`, orderData);
        console.log(`✅ Order created for ${orderData.customer_name}`);
        
        // Add a small delay between orders
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`❌ Failed to create order for ${orderData.customer_name}:`, error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎉 Test orders creation completed!');
    console.log('📱 Now go to https://realtaste.pages.dev/admin to see the orders in the admin dashboard');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestOrders();
