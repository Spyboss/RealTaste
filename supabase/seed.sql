-- Sample data for RealTaste restaurant

-- Insert categories
INSERT INTO categories (id, name, description, sort_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Rice & Curry', 'Traditional Sri Lankan rice and curry dishes', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Kottu', 'Delicious kottu roti varieties', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Fried Rice', 'Flavorful fried rice dishes', 3, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Noodles', 'Tasty noodle preparations', 4, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Beverages', 'Refreshing drinks and beverages', 5, true),
  ('550e8400-e29b-41d4-a716-446655440006', 'Desserts', 'Sweet treats and desserts', 6, true);

-- Insert menu items for Rice & Curry
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Traditional Rice & Curry', 'Rice with dhal curry, vegetable curry, and papadam', 450.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Fish Curry Rice', 'Rice with spicy fish curry and vegetables', 650.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Chicken Curry Rice', 'Rice with tender chicken curry and sides', 750.00, true, 3);

-- Insert menu items for Kottu
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Vegetable Kottu', 'Mixed vegetable kottu with egg', 550.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Chicken Kottu', 'Spicy chicken kottu roti', 750.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Seafood Kottu', 'Mixed seafood kottu with prawns', 850.00, true, 3);

-- Insert menu items for Fried Rice
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Vegetable Fried Rice', 'Wok-fried rice with mixed vegetables', 500.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Chicken Fried Rice', 'Fried rice with tender chicken pieces', 650.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Seafood Fried Rice', 'Special fried rice with mixed seafood', 750.00, true, 3);

-- Insert menu items for Noodles
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'Vegetable Noodles', 'Stir-fried noodles with fresh vegetables', 480.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440004', 'Chicken Noodles', 'Noodles with chicken and vegetables', 580.00, true, 2);

-- Insert menu items for Beverages
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440005', 'Fresh Lime Juice', 'Refreshing lime juice with mint', 150.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440005', 'King Coconut', 'Fresh king coconut water', 200.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440005', 'Soft Drinks', 'Coca Cola, Sprite, Fanta', 120.00, true, 3);

-- Insert menu items for Desserts
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440006', 'Watalappan', 'Traditional Sri Lankan coconut custard', 250.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440006', 'Ice Cream', 'Vanilla, chocolate, or strawberry', 180.00, true, 2);

-- Insert variants for some items
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  -- Kottu variants
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Regular', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Large', 150.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440005', 'Regular', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', 'Large', 150.00, true, 2),
  
  -- Fried Rice variants
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440007', 'Regular', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440007', 'Large', 100.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440008', 'Regular', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440008', 'Large', 100.00, true, 2),
  
  -- Beverage variants
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440012', 'Regular', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440012', 'Large', 50.00, true, 2);

-- Insert addons
INSERT INTO menu_addons (id, menu_item_id, name, price, is_available, sort_order) VALUES
  -- Rice & Curry addons
  ('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Extra Curry', 100.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Fried Egg', 80.00, true, 2),
  ('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Extra Fish', 150.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440003', 'Extra Chicken', 120.00, true, 1),
  
  -- Kottu addons
  ('880e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440004', 'Extra Egg', 80.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440004', 'Cheese', 100.00, true, 2),
  ('880e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440005', 'Extra Chicken', 120.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440005', 'Cheese', 100.00, true, 2),
  
  -- Fried Rice addons
  ('880e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440007', 'Fried Egg', 80.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440008', 'Extra Chicken', 120.00, true, 1),
  
  -- Beverage addons
  ('880e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', 'Extra Mint', 20.00, true, 1),
  ('880e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440012', 'Less Sugar', 0.00, true, 2);
