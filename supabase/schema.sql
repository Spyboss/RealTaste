-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_status AS ENUM ('received', 'confirmed', 'preparing', 'ready_for_pickup', 'completed', 'picked_up', 'cancelled');
CREATE TYPE payment_method AS ENUM ('card', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE user_role AS ENUM ('customer', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  role user_role DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu variants table (sizes, etc.)
CREATE TABLE menu_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Small", "Large"
  price_modifier DECIMAL(10,2) DEFAULT 0, -- +/- from base price
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu addons table (extras)
CREATE TABLE menu_addons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Extra Cheese"
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for guest orders
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  status order_status DEFAULT 'received',
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  notes TEXT,
  estimated_pickup_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES menu_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order item addons table
CREATE TABLE order_item_addons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id UUID REFERENCES menu_addons(id) ON DELETE RESTRICT,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_variants_menu_item_id ON menu_variants(menu_item_id);
CREATE INDEX idx_menu_addons_menu_item_id ON menu_addons(menu_item_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON public.order_items(menu_item_id);
CREATE INDEX idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX idx_order_item_addons_order_item_id ON order_item_addons(order_item_id);
CREATE INDEX idx_order_item_addons_addon_id ON public.order_item_addons(addon_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_variants_updated_at BEFORE UPDATE ON menu_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_addons_updated_at BEFORE UPDATE ON menu_addons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_addons ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY users_select_policy ON users 
FOR SELECT 
USING (
    id = (SELECT auth.uid()) OR 
    (SELECT auth.jwt() ->> 'role') = 'admin'
);
CREATE POLICY users_update_policy ON users FOR UPDATE USING (id = (SELECT auth.uid()));

-- Menu Policies (using optimized syntax)
CREATE POLICY categories_access_policy ON categories FOR ALL 
USING (is_active = true OR (SELECT auth.jwt() ->> 'role') = 'admin') 
WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY menu_items_access_policy ON menu_items FOR ALL 
USING (is_available = true OR (SELECT auth.jwt() ->> 'role') = 'admin') 
WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY menu_variants_access_policy ON menu_variants FOR ALL 
USING (is_available = true OR (SELECT auth.jwt() ->> 'role') = 'admin') 
WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

CREATE POLICY menu_addons_access_policy ON menu_addons FOR ALL 
USING (is_available = true OR (SELECT auth.jwt() ->> 'role') = 'admin') 
WITH CHECK ((SELECT auth.jwt() ->> 'role') = 'admin');

-- Order policies
CREATE POLICY orders_view_policy ON orders FOR SELECT USING (
  customer_id = (SELECT auth.uid()) OR 
  (SELECT auth.jwt() ->> 'role') = 'admin'
);

CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY orders_admin_policy ON orders FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'role') = 'admin'
);

-- Order items policies
CREATE POLICY order_items_view_policy ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.customer_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'admin')
  )
);

CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);

-- Order item addons policies
CREATE POLICY order_item_addons_view_policy ON order_item_addons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM order_items
    JOIN orders ON orders.id = order_items.order_id
    WHERE order_items.id = order_item_addons.order_item_id
    AND (orders.customer_id = (SELECT auth.uid()) OR (SELECT auth.jwt() ->> 'role') = 'admin')
  )
);

CREATE POLICY "Anyone can create order item addons" ON order_item_addons FOR INSERT WITH CHECK (true);
