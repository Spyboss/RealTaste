const axios = require('axios');

// Test delivery fee calculation logic
// const BASE_URL = 'https://realtaste-backend.fly.dev';
const BASE_URL = 'http://localhost:3001';

// Expected fee structure:
// Base fee: LKR 180 for first 1km
// Additional: LKR 40 per km up to 5km range

function calculateExpectedFee(distance) {
  const baseFee = 180;
  const perKmFee = 40;
  
  if (distance <= 1) {
    return baseFee;
  }
  
  // For distances > 1km, add LKR 40 per additional km
  const additionalKm = distance - 1;
  const additionalFee = additionalKm * perKmFee;
  
  return baseFee + additionalFee;
}

function calculateExpectedFeeWithCeiling(distance) {
  const baseFee = 180;
  const perKmFee = 40;
  
  if (distance <= 1) {
    return baseFee;
  }
  
  // Current backend logic: Math.ceil(distance - 1)
  const additionalKm = Math.ceil(distance - 1);
  const additionalFee = additionalKm * perKmFee;
  
  return baseFee + additionalFee;
}

async function testDeliveryCalculation() {
  console.log('Testing Delivery Fee Calculation Logic\n');
  console.log('Expected Fee Structure:');
  console.log('• Base fee: LKR 180 for first 1km');
  console.log('• Additional: LKR 40 per km up to 5km range\n');
  
  const testCases = [
    { distance: 0.5, description: '0.5km (within first 1km)' },
    { distance: 1.0, description: '1.0km (exactly 1km)' },
    { distance: 1.1, description: '1.1km (just over 1km)' },
    { distance: 1.5, description: '1.5km (1.5km)' },
    { distance: 2.0, description: '2.0km (exactly 2km)' },
    { distance: 2.3, description: '2.3km (2.3km)' },
    { distance: 3.0, description: '3.0km (exactly 3km)' },
    { distance: 4.5, description: '4.5km (4.5km)' },
    { distance: 5.0, description: '5.0km (maximum range)' }
  ];
  
  console.log('Distance Analysis:');
  console.log('Distance | Expected (Linear) | Expected (Ceiling) | API Result | Status');
  console.log('---------|-------------------|-------------------|------------|--------');
  
  for (const testCase of testCases) {
    const expectedLinear = calculateExpectedFee(testCase.distance);
    const expectedCeiling = calculateExpectedFeeWithCeiling(testCase.distance);
    
    try {
      // Test coordinates that result in the desired distance
      // Restaurant: 6.261449, 80.906462
      // Calculate approximate coordinates for the test distance
      const lat = 6.261449 + (testCase.distance * 0.009); // Rough approximation
      const lng = 80.906462;
      
      const response = await axios.post(`${BASE_URL}/api/delivery/calculate-fee`, {
        delivery_latitude: lat,
        delivery_longitude: lng
      });
      
      if (response.data.success) {
        const result = response.data.data;
        const actualDistance = result.distance;
        const actualFee = result.deliveryFee;
        
        const status = result.isWithinRange ? '✓ In Range' : '✗ Out of Range';
        
        console.log(`${testCase.distance.toFixed(1)}km    | LKR ${expectedLinear.toFixed(2)}        | LKR ${expectedCeiling.toFixed(2)}        | LKR ${actualFee.toFixed(2)}   | ${status}`);
        
        // Check if the calculation matches expected logic
        if (Math.abs(actualFee - expectedCeiling) > 0.01 && result.isWithinRange) {
          console.log(`  ⚠️  Fee mismatch for ${testCase.distance}km: Expected ${expectedCeiling}, Got ${actualFee}`);
        }
        
        if (Math.abs(actualDistance - testCase.distance) > 0.5) {
          console.log(`  ℹ️  Distance variance: Target ${testCase.distance}km, Actual ${actualDistance}km`);
        }
      } else {
        console.log(`${testCase.distance.toFixed(1)}km    | LKR ${expectedLinear.toFixed(2)}        | LKR ${expectedCeiling.toFixed(2)}        | ERROR      | Failed`);
      }
    } catch (error) {
      console.log(`${testCase.distance.toFixed(1)}km    | LKR ${expectedLinear.toFixed(2)}        | LKR ${expectedCeiling.toFixed(2)}        | ERROR      | ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\nFee Calculation Logic Analysis:');
  console.log('\nLinear Calculation (distance * rate):');
  testCases.forEach(tc => {
    const fee = calculateExpectedFee(tc.distance);
    console.log(`  ${tc.distance}km → LKR ${fee.toFixed(2)}`);
  });
  
  console.log('\nCeiling Calculation (Math.ceil for additional km):');
  testCases.forEach(tc => {
    const fee = calculateExpectedFeeWithCeiling(tc.distance);
    const additionalKm = tc.distance > 1 ? Math.ceil(tc.distance - 1) : 0;
    console.log(`  ${tc.distance}km → Base 180 + (${additionalKm} × 40) = LKR ${fee.toFixed(2)}`);
  });
  
  console.log('\nRecommendation:');
  console.log('The current backend uses Math.ceil() for additional kilometers.');
  console.log('This means:');
  console.log('• 1.1km charges for 1 additional km (LKR 220)');
  console.log('• 1.9km charges for 1 additional km (LKR 220)');
  console.log('• 2.1km charges for 2 additional km (LKR 260)');
  console.log('\nThis is a common practice for delivery services (rounding up partial kilometers).');
}

testDeliveryCalculation().catch(console.error);