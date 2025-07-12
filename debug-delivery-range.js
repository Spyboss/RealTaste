const axios = require('axios');

// Test coordinates - these should be within 5km of the restaurant
const testCoordinates = [
  { name: 'Restaurant Location', lat: 6.261449, lng: 80.906462 },
  { name: 'Test Location 1 (0.43km away)', lat: 6.265, lng: 80.910 },
  { name: 'Test Location 2 (1km away)', lat: 6.270, lng: 80.915 },
  { name: 'Test Location 3 (3km away)', lat: 6.285, lng: 80.930 },
  { name: 'Test Location 4 (6km away - should be outside)', lat: 6.310, lng: 80.960 }
];

// Haversine formula to calculate distance
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function testDeliveryRange() {
  const API_URL = 'https://realtaste.fly.dev/api';
  const restaurantLat = 6.261449;
  const restaurantLng = 80.906462;
  
  console.log('=== Delivery Range Debug Test ===\n');
  console.log(`Restaurant Location: ${restaurantLat}, ${restaurantLng}\n`);
  
  for (const coord of testCoordinates) {
    console.log(`Testing: ${coord.name}`);
    console.log(`Coordinates: ${coord.lat}, ${coord.lng}`);
    
    // Calculate distance using our formula
    const calculatedDistance = calculateDistance(restaurantLat, restaurantLng, coord.lat, coord.lng);
    console.log(`Calculated Distance: ${calculatedDistance.toFixed(2)} km`);
    
    try {
      // Test the API endpoint
      const response = await axios.post(`${API_URL}/delivery/calculate-fee`, {
        delivery_latitude: coord.lat,
        delivery_longitude: coord.lng
      });
      
      if (response.data.success) {
        const data = response.data.data;
        console.log(`API Response:`);
        console.log(`  - Distance: ${data.distance} km`);
        console.log(`  - Within Range: ${data.isWithinRange}`);
        console.log(`  - Delivery Fee: LKR ${data.deliveryFee}`);
        console.log(`  - Estimated Time: ${data.estimatedTime} minutes`);
        
        // Check for discrepancies
        const distanceDiff = Math.abs(calculatedDistance - data.distance);
        if (distanceDiff > 0.01) {
          console.log(`  ⚠️  Distance mismatch! Calculated: ${calculatedDistance.toFixed(2)}, API: ${data.distance}`);
        }
        
        if (data.distance <= 5 && !data.isWithinRange) {
          console.log(`  ❌ ERROR: Should be within range but marked as outside!`);
        } else if (data.distance > 5 && data.isWithinRange) {
          console.log(`  ❌ ERROR: Should be outside range but marked as within!`);
        } else {
          console.log(`  ✅ Range validation correct`);
        }
      } else {
        console.log(`API Error: ${response.data.error}`);
      }
    } catch (error) {
      console.log(`Request failed: ${error.message}`);
      if (error.response) {
        console.log(`Status: ${error.response.status}`);
        console.log(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    
    console.log('---\n');
  }
  
  // Test delivery settings
  console.log('=== Checking Delivery Settings ===');
  try {
    const settingsResponse = await axios.get(`${API_URL}/delivery/settings`);
    if (settingsResponse.data.success) {
      const settings = settingsResponse.data.data;
      console.log('Current Delivery Settings:');
      console.log(`  - Max Range: ${settings.max_delivery_range_km} km`);
      console.log(`  - Base Fee: LKR ${settings.base_fee}`);
      console.log(`  - Per KM Fee: LKR ${settings.per_km_fee}`);
      console.log(`  - Delivery Enabled: ${settings.is_delivery_enabled}`);
    }
  } catch (error) {
    console.log(`Failed to get delivery settings: ${error.message}`);
  }
}

testDeliveryRange().catch(console.error);