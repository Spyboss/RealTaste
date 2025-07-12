-- Fix delivery settings in the database
-- This script ensures proper delivery settings are configured

-- First, delete any existing delivery settings to start fresh
DELETE FROM delivery_settings;

-- Insert correct delivery settings
INSERT INTO delivery_settings (
  base_fee, 
  per_km_fee, 
  max_delivery_range_km, 
  min_order_for_delivery, 
  is_delivery_enabled
) VALUES (
  180.00,  -- LKR 180 base fee for first 1km
  40.00,   -- LKR 40 per additional km
  5.0,     -- 5km maximum delivery range
  0,       -- No minimum order amount for delivery
  true     -- Delivery is enabled
);

-- Verify the settings were inserted correctly
SELECT 
  id,
  base_fee,
  per_km_fee,
  max_delivery_range_km,
  min_order_for_delivery,
  is_delivery_enabled,
  created_at,
  updated_at
FROM delivery_settings;