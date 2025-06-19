async function testPickupOrder() {
  try {
    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_phone: '+94 76 195 2541',
        customer_name: 'Test Customer',
        payment_method: 'cash',
        order_type: 'pickup',
        items: [{
          menu_item_id: '660e8400-e29b-41d4-a716-446655440001',
          quantity: 1
        }]
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPickupOrder();