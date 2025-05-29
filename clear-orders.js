// clear-orders.js
// Usage: node clear-orders.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function clearOrders() {
  try {
    console.log('Deleting from order_item_addons...');
    await supabase.from('order_item_addons').delete().neq('id', '');
    console.log('Deleting from order_items...');
    await supabase.from('order_items').delete().neq('id', '');
    console.log('Deleting from orders...');
    await supabase.from('orders').delete().neq('id', '');
    console.log('✅ All orders and related items deleted!');
  } catch (err) {
    console.error('Error clearing orders:', err);
  }
}

clearOrders(); 