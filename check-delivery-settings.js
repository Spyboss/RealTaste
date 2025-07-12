const axios = require('axios');

async function checkDeliverySettings() {
  const BASE_URL = 'http://localhost:3001';
  
  console.log('=== Checking Current Delivery Settings ===\n');
  
  try {
    // Check delivery settings
    console.log('1. Fetching delivery settings...');
    const settingsResponse = await axios.get(`${BASE_URL}/api/delivery/settings`);
    
    if (settingsResponse.data.success) {
      const settings = settingsResponse.data.data;
      console.log('✅ Current Delivery Settings:');
      console.log(`   Base Fee: LKR ${settings.base_fee}`);
      console.log(`   Per KM Fee: LKR ${settings.per_km_fee}`);
      console.log(`   Max Range: ${settings.max_delivery_range_km} km`);
      console.log(`   Min Order: LKR ${settings.min_order_for_delivery}`);
      console.log(`   Delivery Enabled: ${settings.is_delivery_enabled}`);
      console.log(`   Settings ID: ${settings.id}`);
      
      // Check if settings match expected values
      const expectedBaseFee = 180;
      const expectedPerKmFee = 40;
      const expectedMaxRange = 5;
      
      console.log('\n2. Validation:');
      
      if (settings.base_fee !== expectedBaseFee) {
        console.log(`❌ Base fee mismatch: Expected ${expectedBaseFee}, Got ${settings.base_fee}`);
      } else {
        console.log(`✅ Base fee correct: ${settings.base_fee}`);
      }
      
      if (settings.per_km_fee !== expectedPerKmFee) {
        console.log(`❌ Per KM fee mismatch: Expected ${expectedPerKmFee}, Got ${settings.per_km_fee}`);
      } else {
        console.log(`✅ Per KM fee correct: ${settings.per_km_fee}`);
      }
      
      if (settings.max_delivery_range_km !== expectedMaxRange) {
        console.log(`❌ Max range mismatch: Expected ${expectedMaxRange}, Got ${settings.max_delivery_range_km}`);
      } else {
        console.log(`✅ Max range correct: ${settings.max_delivery_range_km}`);
      }
      
      if (!settings.is_delivery_enabled) {
        console.log(`❌ Delivery is disabled`);
      } else {
        console.log(`✅ Delivery is enabled`);
      }
      
    } else {
      console.log('❌ Failed to fetch delivery settings:', settingsResponse.data.error);
    }
    
    // Test a simple calculation
    console.log('\n3. Testing fee calculation for 2km distance...');
    const calcResponse = await axios.post(`${BASE_URL}/api/delivery/calculate-fee`, {
      delivery_latitude: 6.271449, // ~1.1km from restaurant
      delivery_longitude: 80.906462
    });
    
    if (calcResponse.data.success) {
      const result = calcResponse.data.data;
      console.log(`✅ Calculation Result:`);
      console.log(`   Distance: ${result.distance} km`);
      console.log(`   Delivery Fee: LKR ${result.deliveryFee}`);
      console.log(`   Within Range: ${result.isWithinRange}`);
      console.log(`   Estimated Time: ${result.estimatedTime} minutes`);
      
      // Expected fee for ~1.1km should be 180 + 40 = 220
      const expectedFee = 220;
      if (Math.abs(result.deliveryFee - expectedFee) > 10) {
        console.log(`❌ Fee calculation issue: Expected ~${expectedFee}, Got ${result.deliveryFee}`);
      } else {
        console.log(`✅ Fee calculation looks correct`);
      }
    } else {
      console.log('❌ Failed to calculate delivery fee:', calcResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

checkDeliverySettings().catch(console.error);