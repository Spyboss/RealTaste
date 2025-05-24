const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

async function testPayHereIntegration() {
  console.log('🧪 Testing PayHere Integration...\n');

  try {
    // Step 1: Create a card payment order
    console.log('1️⃣ Creating order with card payment...');

    const orderData = {
      customer_phone: '0771234567',
      customer_name: 'Test Customer',
      payment_method: 'card',
      notes: 'Test order for PayHere integration',
      items: [
        {
          menu_item_id: '660e8400-e29b-41d4-a716-446655440001', // Traditional Rice & Curry
          quantity: 2,
          notes: 'Extra spicy'
        }
      ]
    };

    const orderResponse = await axios.post(`${API_BASE}/orders`, orderData);

    if (orderResponse.data.success) {
      console.log('✅ Order created successfully!');
      console.log(`📋 Order ID: ${orderResponse.data.data.order.id}`);

      // Check if payment data is included
      if (orderResponse.data.data.payment) {
        console.log('✅ PayHere payment data included!');
        console.log(`💳 Payment URL: ${orderResponse.data.data.payment.paymentUrl}`);
        console.log(`🔐 Merchant ID: ${orderResponse.data.data.payment.paymentData.merchant_id}`);
        console.log(`💰 Amount: ${orderResponse.data.data.payment.paymentData.amount} ${orderResponse.data.data.payment.paymentData.currency}`);
        console.log(`🔑 Hash: ${orderResponse.data.data.payment.paymentData.hash.substring(0, 10)}...`);

        // Step 2: Test payment initiation endpoint
        console.log('\n2️⃣ Testing payment initiation endpoint...');

        const paymentResponse = await axios.post(`${API_BASE}/payments/initiate`, {
          orderId: orderResponse.data.data.order.id
        });

        if (paymentResponse.data.success) {
          console.log('✅ Payment initiation endpoint working!');
          console.log(`💳 Payment URL: ${paymentResponse.data.data.paymentUrl}`);
        } else {
          console.log('❌ Payment initiation failed:', paymentResponse.data.error);
        }

      } else {
        console.log('❌ PayHere payment data missing from order response!');
      }
    } else {
      console.log('❌ Order creation failed:', orderResponse.data.error);
    }

    // Step 3: Test cash payment (should work normally)
    console.log('\n3️⃣ Testing cash payment (control test)...');

    const cashOrderData = {
      ...orderData,
      payment_method: 'cash'
    };

    const cashOrderResponse = await axios.post(`${API_BASE}/orders`, cashOrderData);

    if (cashOrderResponse.data.success && !cashOrderResponse.data.data.payment) {
      console.log('✅ Cash payment working correctly (no PayHere data)!');
      console.log(`📋 Cash Order ID: ${cashOrderResponse.data.data.id}`);
    } else {
      console.log('❌ Cash payment test failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPayHereIntegration();
