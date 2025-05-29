#!/usr/bin/env node

// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase credentials are missing in the environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function reduceOrders() {
  try {
    console.log('Connecting to Supabase...');

    // Get all orders
    console.log('Retrieving all orders...');
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      throw new Error(`Error retrieving orders: ${error.message}`);
    }

    if (!orders || orders.length === 0) {
      console.log('No orders found in the database.');
      return;
    }

    console.log(`Found ${orders.length} orders.`);

    // Keep only a sample of 10-20 orders (let's use 15 for this example)
    const sampleSize = 15;
    const sampleOrders = orders.slice(0, sampleSize);
    const ordersToDelete = orders.slice(sampleSize);

    console.log(`Keeping ${sampleOrders.length} sample orders.`);
    console.log(`Deleting ${ordersToDelete.length} orders.`);

    // Delete the orders that are not in the sample
    for (const order of ordersToDelete) {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      if (deleteError) {
        console.error(`Error deleting order ${order.id}: ${deleteError.message}`);
      } else {
        console.log(`Deleted order ${order.id}`);
      }
    }

    console.log('Order reduction complete.');
  } catch (err) {
    console.error(`An error occurred: ${err.message}`);
  } finally {
    console.log('Disconnecting from Supabase...');
  }
}

// Run the script
reduceOrders();