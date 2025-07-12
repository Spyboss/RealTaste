const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yycamhkfkgys.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDeliverySettings() {
  console.log('=== Fixing Delivery Settings ===\n');
  
  try {
    // First, check current delivery settings
    console.log('1. Checking current delivery settings...');
    const { data: currentSettings, error: fetchError } = await supabase
      .from('delivery_settings')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching delivery settings:', fetchError);
      return;
    }
    
    console.log('Current settings:', currentSettings);
    
    if (currentSettings && currentSettings.length > 0) {
      // Update existing settings
      console.log('\n2. Updating existing delivery settings...');
      const { data: updatedSettings, error: updateError } = await supabase
        .from('delivery_settings')
        .update({
          base_fee: 180.00,
          per_km_fee: 40.00,
          max_delivery_range_km: 5.0,
          min_order_for_delivery: 0,
          is_delivery_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSettings[0].id)
        .select();
      
      if (updateError) {
        console.error('Error updating delivery settings:', updateError);
        return;
      }
      
      console.log('✅ Updated delivery settings:', updatedSettings[0]);
    } else {
      // Insert new settings
      console.log('\n2. Inserting new delivery settings...');
      const { data: newSettings, error: insertError } = await supabase
        .from('delivery_settings')
        .insert({
          base_fee: 180.00,
          per_km_fee: 40.00,
          max_delivery_range_km: 5.0,
          min_order_for_delivery: 0,
          is_delivery_enabled: true
        })
        .select();
      
      if (insertError) {
        console.error('Error inserting delivery settings:', insertError);
        return;
      }
      
      console.log('✅ Inserted new delivery settings:', newSettings[0]);
    }
    
    // Test the API endpoint to verify the fix
    console.log('\n3. Testing delivery calculation API...');
    const axios = require('axios');
    const API_URL = 'https://realtaste.fly.dev/api';
    
    try {
      const response = await axios.post(`${API_URL}/delivery/calculate-fee`, {
        delivery_latitude: 6.265,
        delivery_longitude: 80.910
      });
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('✅ API Test Results:');
        console.log(`  - Distance: ${data.distance} km`);
        console.log(`  - Within Range: ${data.isWithinRange}`);
        console.log(`  - Delivery Fee: LKR ${data.deliveryFee}`);
        console.log(`  - Estimated Time: ${data.estimatedTime} minutes`);
        
        if (data.isWithinRange && data.distance <= 5) {
          console.log('\n🎉 SUCCESS: Delivery range calculation is now working correctly!');
        } else {
          console.log('\n❌ ISSUE: Still having problems with range calculation');
        }
      } else {
        console.log('❌ API Error:', response.data.error);
      }
    } catch (apiError) {
      console.log('❌ API Test failed:', apiError.message);
    }
    
    // Also test the settings endpoint
    console.log('\n4. Testing delivery settings API...');
    try {
      const settingsResponse = await axios.get(`${API_URL}/delivery/settings`);
      if (settingsResponse.data.success) {
        const settings = settingsResponse.data.data;
        console.log('✅ Settings API Response:');
        console.log(`  - Max Range: ${settings.max_delivery_range_km} km`);
        console.log(`  - Base Fee: LKR ${settings.base_fee}`);
        console.log(`  - Per KM Fee: LKR ${settings.per_km_fee}`);
        console.log(`  - Delivery Enabled: ${settings.is_delivery_enabled}`);
      }
    } catch (settingsError) {
      console.log('❌ Settings API failed:', settingsError.message);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixDeliverySettings().catch(console.error);