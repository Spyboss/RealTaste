const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

// Initialize Supabase client with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDeliverySettings() {
  console.log('=== Fixing Delivery Settings Database Issue ===\n');
  
  try {
    // First, check current delivery settings
    console.log('1. Checking current delivery settings...');
    const { data: currentSettings, error: fetchError } = await supabase
      .from('delivery_settings')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching delivery settings:', fetchError);
      return;
    }
    
    console.log('📋 Current settings:', currentSettings);
    
    if (currentSettings && currentSettings.length > 0) {
      const current = currentSettings[0];
      console.log('\n📊 Current Values:');
      console.log(`   Base Fee: LKR ${current.base_fee} (Expected: 180)`);
      console.log(`   Per KM Rate: LKR ${current.per_km_rate} (Expected: 40)`);
      console.log(`   Max Distance: ${current.max_delivery_distance_km} km (Expected: 5)`);
      console.log(`   Delivery Enabled: ${current.is_delivery_enabled}`);
      
      // Check if fix is needed
      const needsFix = current.base_fee !== 180 || current.per_km_rate !== 40 || current.max_delivery_distance_km !== 5;
      
      if (needsFix) {
        console.log('\n🔧 Updating delivery settings to correct values...');
        const { data: updatedSettings, error: updateError } = await supabase
          .from('delivery_settings')
          .update({
            base_fee: 180.00,
            per_km_rate: 40.00,
            max_delivery_distance_km: 5.0,
            min_order_for_delivery: 0,
            is_delivery_enabled: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', current.id)
          .select();
        
        if (updateError) {
          console.error('❌ Error updating delivery settings:', updateError);
          return;
        }
        
        console.log('✅ Successfully updated delivery settings!');
        console.log('📊 New Values:');
        const updated = updatedSettings[0];
        console.log(`   Base Fee: LKR ${updated.base_fee}`);
        console.log(`   Per KM Rate: LKR ${updated.per_km_rate}`);
        console.log(`   Max Distance: ${updated.max_delivery_distance_km} km`);
        console.log(`   Delivery Enabled: ${updated.is_delivery_enabled}`);
      } else {
        console.log('\n✅ Delivery settings are already correct!');
      }
    } else {
      // Insert new settings if none exist
      console.log('\n🆕 No delivery settings found. Creating new settings...');
      const { data: newSettings, error: insertError } = await supabase
        .from('delivery_settings')
        .insert({
          base_fee: 180.00,
          per_km_rate: 40.00,
          max_delivery_distance_km: 5.0,
          min_order_for_delivery: 0,
          is_delivery_enabled: true
        })
        .select();
      
      if (insertError) {
        console.error('❌ Error inserting delivery settings:', insertError);
        return;
      }
      
      console.log('✅ Successfully created new delivery settings!');
      console.log('📊 New Values:', newSettings[0]);
    }
    
    console.log('\n🎉 Database fix completed successfully!');
    console.log('\n📝 Summary of correct delivery fee structure:');
    console.log('   • Base fee: LKR 180 for first 1km');
    console.log('   • Additional: LKR 40 per km up to 5km range');
    console.log('   • Example: 2.3km = LKR 180 + (2 × LKR 40) = LKR 260');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixDeliverySettings().catch(console.error);