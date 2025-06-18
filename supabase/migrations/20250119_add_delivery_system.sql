-- Add delivery system features
-- LKR 180 base fee for first 1km + LKR 40 per additional km up to 5km range

-- Add delivery fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(5, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_gps_location TEXT; -- For GPS location sharing

-- Create delivery settings table for admin configuration
CREATE TABLE IF NOT EXISTS delivery_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  base_fee DECIMAL(10,2) NOT NULL DEFAULT 180.00, -- LKR 180 for first 1km
  per_km_fee DECIMAL(10,2) NOT NULL DEFAULT 40.00, -- LKR 40 per additional km
  max_delivery_range_km DECIMAL(5,2) NOT NULL DEFAULT 5.0, -- 5km maximum
  min_order_for_delivery DECIMAL(10,2) DEFAULT 0,
  is_delivery_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default delivery settings
INSERT INTO delivery_settings (base_fee, per_km_fee, max_delivery_range_km) 
VALUES (180.00, 40.00, 5.0)
ON CONFLICT DO NOTHING;

-- Create delivery time slots table for admin management
CREATE TABLE IF NOT EXISTS delivery_time_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  estimated_prep_time INTEGER DEFAULT 30, -- minutes
  estimated_delivery_time INTEGER DEFAULT 20, -- minutes
  actual_prep_time INTEGER,
  actual_delivery_time INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered')),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_distance ON orders(delivery_distance_km);
CREATE INDEX IF NOT EXISTS idx_delivery_time_slots_order_id ON delivery_time_slots(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_time_slots_status ON delivery_time_slots(status);

-- Enable RLS on new tables
ALTER TABLE delivery_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_time_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery_settings (admin only)
CREATE POLICY "Admin can view delivery settings" ON delivery_settings
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update delivery settings" ON delivery_settings
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- RLS policies for delivery_time_slots
CREATE POLICY "Admin can manage delivery time slots" ON delivery_time_slots
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their delivery time slots" ON delivery_time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = delivery_time_slots.order_id 
      AND orders.user_id = auth.uid()
    )
  );