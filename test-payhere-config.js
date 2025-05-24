const axios = require('axios');

async function testPayHereConfig() {
  console.log('🔍 Testing PayHere Configuration...\n');

  try {
    // Test the payment initiation to see what URL is being generated
    const orderData = {
      customer_phone: '0771234567',
      customer_name: 'Test Customer',
      payment_method: 'card',
      notes: 'Test order for PayHere config check',
      items: [
        {
          menu_item_id: '660e8400-e29b-41d4-a716-446655440001', // Traditional Rice & Curry
          quantity: 1,
          notes: 'Test'
        }
      ]
    };

    console.log('1️⃣ Creating card payment order...');
    const orderResponse = await axios.post('http://localhost:3001/api/orders', orderData);
    
    if (orderResponse.data.success && orderResponse.data.data.payment) {
      console.log('✅ Order created with payment data!');
      console.log(`🔗 Payment URL: ${orderResponse.data.data.payment.paymentUrl}`);
      console.log(`🏪 Merchant ID: ${orderResponse.data.data.payment.paymentData.merchant_id}`);
      console.log(`💰 Amount: ${orderResponse.data.data.payment.paymentData.amount} ${orderResponse.data.data.payment.paymentData.currency}`);
      console.log(`📞 Return URL: ${orderResponse.data.data.payment.paymentData.return_url}`);
      console.log(`📞 Cancel URL: ${orderResponse.data.data.payment.paymentData.cancel_url}`);
      console.log(`📞 Notify URL: ${orderResponse.data.data.payment.paymentData.notify_url}`);
      
      // Check if it's sandbox or production
      if (orderResponse.data.data.payment.paymentUrl.includes('sandbox')) {
        console.log('✅ SANDBOX MODE - Correct!');
      } else {
        console.log('❌ PRODUCTION MODE - This should be sandbox!');
        console.log('🔧 Check PAYHERE_SANDBOX environment variable');
      }
    } else {
      console.log('❌ No payment data in response');
      console.log('Response:', JSON.stringify(orderResponse.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPayHereConfig();
