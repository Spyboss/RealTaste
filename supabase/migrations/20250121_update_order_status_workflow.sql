-- Update order status enum to include new workflow statuses
-- This migration adds the new order statuses for the complete workflow

-- First, add the new enum values
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'ready_for_delivery';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'delivered';

-- Note: 'confirmed', 'picked_up', and 'completed' should already exist from previous migrations
-- But let's ensure they exist
DO $$
BEGIN
    -- Add confirmed status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'confirmed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'confirmed';
    END IF;
    
    -- Add picked_up status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'picked_up' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'picked_up';
    END IF;
    
    -- Add completed status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'completed' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')) THEN
        ALTER TYPE order_status ADD VALUE 'completed';
    END IF;
END$$;

-- Add order_type column if it doesn't exist (from delivery system migration)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'pickup' CHECK (order_type IN ('pickup', 'delivery'));

-- Add delivery-related columns if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance_km DECIMAL(5, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_gps_location TEXT;

-- Create index for order_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Update any existing orders that might have old status values
-- This is a safety measure in case there are any inconsistencies
UPDATE orders SET status = 'completed' WHERE status = 'picked_up' AND order_type = 'pickup';
UPDATE orders SET status = 'completed' WHERE status = 'delivered' AND order_type = 'delivery';

-- Add a comment to track this migration
COMMENT ON TABLE orders IS 'Orders table with complete pickup/delivery workflow: received -> confirmed -> preparing -> ready_for_pickup/ready_for_delivery -> picked_up/delivered -> completed';