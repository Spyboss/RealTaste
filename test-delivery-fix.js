const axios = require('axios');

// Test coordinates near the restaurant (should be within range)
const testLocations = [
  {
    name: "Very Close (0.04km)",
    lat: 6.2652,
    lng: 80.9103
  },
  {
    name: "Close (0.43km)", 
    lat: 6.265,
    lng: 80.910
  },
  {
    name: "Medium (1km)",
    lat: 6.270,
    lng: 80.915
  },
  {
    name: "Far but within range (3km)",
    lat: 6.290,
    lng: 80.930
  },
  {
    name: "Outside range (10km)",
    lat: 6.350,
    lng: 81.000
  }
];

const API_URL = 'https://realtaste.fly.dev/api';

async function testDeliveryCalculation() {
  console.log('=== Testing Delivery Range Calculation ===\n');
  
  // First test the settings endpoint
  try {
    console.log('1. Checking delivery settings...');
    const settingsResponse = await axios.get(`${API_URL}/delivery/settings`);
    
    if (settingsResponse.data.success) {
      const settings = settingsResponse.data.data;
      console.log('✅ Delivery Settings:');
      console.log(`   Max Range: ${settings.max_delivery_range_km} km`);
      console.log(`   Base Fee: LKR ${settings.base_fee}`);
      console.log(`   Per KM Fee: LKR ${settings.per_km_fee}`);
      console.log(`   Delivery Enabled: ${settings.is_delivery_enabled}\n`);
      
      if (settings.max_delivery_range_km === undefined || settings.max_delivery_range_km === null) {
        console.log('❌ PROBLEM: max_delivery_range_km is still undefined!');
        console.log('   Please run the SQL script to fix the database.\n');
        return;
      }
    } else {
      console.log('❌ Failed to get delivery settings:', settingsResponse.data.error);
      return;
    }
  } catch (error) {
    console.log('❌ Settings API failed:', error.message);
    return;
  }
  
  // Test delivery calculation for each location
  console.log('2. Testing delivery calculations...');
  
  for (const location of testLocations) {
    try {
      const response = await axios.post(`${API_URL}/delivery/calculate-fee`, {
        delivery_latitude: location.lat,
        delivery_longitude: location.lng
      });
      
      if (response.data.success) {
        const data = response.data.data;
        const status = data.isWithinRange ? '✅ WITHIN RANGE' : '❌ OUTSIDE RANGE';
        
        console.log(`\n${location.name}:`);
        console.log(`   ${status}`);
        console.log(`   Distance: ${data.distance} km`);
        console.log(`   Delivery Fee: LKR ${data.deliveryFee}`);
        console.log(`   Estimated Time: ${data.estimatedTime} minutes`);
        
        // Validate the result
        if (data.distance <= 5 && !data.isWithinRange) {
          console.log(`   ⚠️  WARNING: Should be within range but marked as outside!`);
        } else if (data.distance > 5 && data.isWithinRange) {
          console.log(`   ⚠️  WARNING: Should be outside range but marked as within!`);
        }
      } else {
        console.log(`\n${location.name}: ❌ API Error - ${response.data.error}`);
      }
    } catch (error) {
      console.log(`\n${location.name}: ❌ Request failed - ${error.message}`);
    }
  }
  
  console.log('\n=== Test Complete ===');
}

testDeliveryCalculation().catch(console.error);