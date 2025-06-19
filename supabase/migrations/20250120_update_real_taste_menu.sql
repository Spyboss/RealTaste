-- Update Real Taste Chinese Food Menu
-- Clear existing data and add new categories and menu items

-- First, clear existing data
DELETE FROM order_item_addons;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM menu_addons;
DELETE FROM menu_variants;
DELETE FROM menu_items;
DELETE FROM categories;

-- Insert new categories based on Real Taste menu
INSERT INTO categories (id, name, description, sort_order, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Starters', 'Delicious appetizers to start your meal', 1, true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Soups', 'Warm and comforting soup varieties', 2, true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Rice Basmathi', 'Aromatic basmathi rice dishes', 3, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'Noodles', 'Fresh and flavorful noodle preparations', 4, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'Fish', 'Fresh fish dishes prepared to perfection', 5, true),
  ('550e8400-e29b-41d4-a716-446655440006', 'Cuttle Fish', 'Tender cuttle fish specialties', 6, true),
  ('550e8400-e29b-41d4-a716-446655440007', 'Prawns', 'Succulent prawn dishes', 7, true),
  ('550e8400-e29b-41d4-a716-446655440008', 'Chicken', 'Tender chicken preparations', 8, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Pork', 'Flavorful pork dishes', 9, true),
  ('550e8400-e29b-41d4-a716-446655440010', 'Omelette', 'Fluffy and delicious omelettes', 10, true),
  ('550e8400-e29b-41d4-a716-446655440011', 'Vegetable', 'Fresh vegetable dishes and salads', 11, true),
  ('550e8400-e29b-41d4-a716-446655440012', 'Koththu', 'Traditional Sri Lankan koththu varieties', 12, true);

-- Insert menu items for Starters
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'French Fries', 'Crispy golden french fries', 700.00, true, 1);

-- Insert menu items for Soups
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Cream of Chicken Soup', 'Rich and creamy chicken soup', 380.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Chicken and Egg Soup', 'Hearty chicken and egg soup', 360.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Mix Hot and Sour Soup', 'Spicy and tangy mixed soup', 450.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Vegetable Hot and Sour Soup', 'Vegetarian hot and sour soup', 370.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Cream of Vegetable Soup', 'Smooth and creamy vegetable soup', 350.00, true, 5);

-- Insert menu items for Rice Basmathi
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Real Taste Special Rice', 'Our signature special rice dish', 800.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Chicken Fried Rice', 'Wok-fried rice with tender chicken', 600.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Sea Food Fried Rice', 'Mixed seafood fried rice', 700.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Mix Fried Rice', 'Mixed ingredients fried rice', 750.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Nasi Goreng', 'Indonesian style fried rice', 800.00, true, 5),
  ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Vegetable and Egg Fried Rice', 'Vegetarian fried rice with egg', 550.00, true, 6),
  ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Vegetable Fried Rice', 'Pure vegetarian fried rice', 500.00, true, 7),
  ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'Garlic Fried Rice', 'Aromatic garlic fried rice', 900.00, true, 8),
  ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'Steam Rice', 'Plain steamed basmathi rice', 470.00, true, 9),
  ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 'Mix Chopsuey Rice', 'Mixed chopsuey with rice', 950.00, true, 10),
  ('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', 'Sea Food Chopsuey Rice', 'Seafood chopsuey with rice', 920.00, true, 11),
  ('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', 'Vegetable Chopsuey Rice', 'Vegetable chopsuey with rice', 750.00, true, 12);

-- Insert menu items for Noodles
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', 'Real Taste Special Noodles', 'Our signature special noodles', 750.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', 'Chicken Fried Noodles', 'Stir-fried noodles with chicken', 580.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440004', 'Sea Food Fried Noodles', 'Mixed seafood fried noodles', 680.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440004', 'Mix Fried Noodles', 'Mixed ingredients fried noodles', 730.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440004', 'Vegetable and Egg Fried Noodles', 'Vegetarian noodles with egg', 550.00, true, 5),
  ('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440004', 'Vegetable Fried Noodles', 'Pure vegetarian fried noodles', 500.00, true, 6);

-- Insert menu items for Fish
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440005', 'Fried Fish', 'Crispy fried fish fillet', 900.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', 'Devilled Fish', 'Spicy devilled fish', 900.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440005', 'Crispy Fish', 'Extra crispy fish preparation', 900.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440005', 'Sweet and Sour Fish', 'Fish in sweet and sour sauce', 950.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440005', 'Fish with Hot Garlic Sauce', 'Fish in spicy garlic sauce', 900.00, true, 5),
  ('660e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440005', 'Fish Hot Curry', 'Spicy fish curry', 930.00, true, 6);

-- Insert menu items for Cuttle Fish
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440006', 'Cuttle Fish with Hot Butter Sauce', 'Cuttle fish in spicy butter sauce', 900.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440006', 'Devilled Cuttle Fish', 'Spicy devilled cuttle fish', 900.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440006', 'Cuttle Fish Curry', 'Traditional cuttle fish curry', 930.00, true, 3);

-- Insert menu items for Prawns
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440007', 'Batter Fried Prawns', 'Crispy batter fried prawns', 930.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440007', 'Devilled Prawns', 'Spicy devilled prawns', 900.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440007', 'Sweet & Sour Prawns', 'Prawns in sweet and sour sauce', 1050.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440007', 'Prawns with Hot Garlic Sauce', 'Prawns in spicy garlic sauce', 900.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440007', 'Prawns Curry', 'Traditional prawns curry', 930.00, true, 5);

-- Insert menu items for Chicken
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440008', 'Fried Chicken', 'Crispy fried chicken pieces', 800.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440008', 'Devilled Chicken', 'Spicy devilled chicken', 800.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440008', 'Crispy Chicken', 'Extra crispy chicken preparation', 900.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440008', 'Sweet & Sour Chicken', 'Chicken in sweet and sour sauce', 930.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440008', 'Chilli Chicken with Cashew Nut', 'Spicy chicken with cashew nuts', 950.00, true, 5),
  ('660e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440008', 'Chicken Curry', 'Traditional chicken curry', 830.00, true, 6);

-- Insert menu items for Pork
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440009', 'Fried Pork', 'Crispy fried pork pieces', 900.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440009', 'Devilled Pork', 'Spicy devilled pork', 900.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440009', 'Sweet & Sour Pork', 'Pork in sweet and sour sauce', 980.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440009', 'Pork Curry', 'Traditional pork curry', 930.00, true, 4);

-- Insert menu items for Omelette
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440010', 'Vegetable Omelette', 'Fluffy omelette with vegetables', 400.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440010', 'Chicken Omelette', 'Omelette with chicken pieces', 500.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440010', 'Prawns Omelette', 'Omelette with prawns', 550.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440010', 'Mix Omelette', 'Mixed ingredients omelette', 600.00, true, 4);

-- Insert menu items for Vegetable
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440011', 'Boiled Vegetable', 'Healthy boiled vegetables', 600.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440011', 'Mix Vegetable Chopsuey', 'Mixed vegetable chopsuey', 600.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440011', 'Devilled Mushroom', 'Spicy devilled mushrooms', 650.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440011', 'Onion Salad', 'Fresh onion salad', 350.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440011', 'Mix Salad', 'Mixed fresh salad', 400.00, true, 5);

-- Insert menu items for Koththu
INSERT INTO menu_items (id, category_id, name, description, base_price, is_available, sort_order) VALUES
  ('660e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440012', 'Egg Koththu', 'Traditional egg koththu', 500.00, true, 1),
  ('660e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440012', 'Chicken Koththu', 'Spicy chicken koththu', 700.00, true, 2),
  ('660e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440012', 'Fish Koththu', 'Fresh fish koththu', 600.00, true, 3),
  ('660e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440012', 'Pork Koththu', 'Flavorful pork koththu', 750.00, true, 4),
  ('660e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440012', 'Sea Food Koththu', 'Mixed seafood koththu', 750.00, true, 5),
  ('660e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440012', 'Mix Koththu', 'Mixed ingredients koththu', 800.00, true, 6),
  ('660e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440012', 'Vegetable Koththu', 'Vegetarian koththu', 400.00, true, 7);

-- Insert variants for items with small and large portions
-- Starters variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Large', 200.00, true, 2);

-- Soups variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'Large', 70.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440003', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', 'Large', 70.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440004', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004', 'Large', 50.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440005', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440005', 'Large', 50.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440006', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440006', 'Large', 50.00, true, 2);

-- Rice variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440007', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440007', 'Large', 650.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440008', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440008', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440009', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440009', 'Large', 600.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440010', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440010', 'Large', 600.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440011', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440011', 'Large', 650.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440012', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440012', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440013', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440013', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440014', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440014', 'Large', 550.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440015', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440015', 'Large', 410.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440016', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440016', 'Large', 600.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440017', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440017', 'Large', 580.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440018', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440018', 'Large', 350.00, true, 2);

-- Noodles variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440037', '660e8400-e29b-41d4-a716-446655440019', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440038', '660e8400-e29b-41d4-a716-446655440019', 'Large', 650.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440039', '660e8400-e29b-41d4-a716-446655440020', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440020', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440021', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440021', 'Large', 570.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440022', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440022', 'Large', 570.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440045', '660e8400-e29b-41d4-a716-446655440023', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440046', '660e8400-e29b-41d4-a716-446655440023', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440047', '660e8400-e29b-41d4-a716-446655440024', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440048', '660e8400-e29b-41d4-a716-446655440024', 'Large', 400.00, true, 2);

-- Fish variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440049', '660e8400-e29b-41d4-a716-446655440025', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440025', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440051', '660e8400-e29b-41d4-a716-446655440026', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440052', '660e8400-e29b-41d4-a716-446655440026', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440053', '660e8400-e29b-41d4-a716-446655440027', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440054', '660e8400-e29b-41d4-a716-446655440027', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440055', '660e8400-e29b-41d4-a716-446655440028', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440056', '660e8400-e29b-41d4-a716-446655440028', 'Large', 450.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440057', '660e8400-e29b-41d4-a716-446655440029', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440058', '660e8400-e29b-41d4-a716-446655440029', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440059', '660e8400-e29b-41d4-a716-446655440030', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440060', '660e8400-e29b-41d4-a716-446655440030', 'Large', 420.00, true, 2);

-- Cuttle Fish variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440061', '660e8400-e29b-41d4-a716-446655440031', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440062', '660e8400-e29b-41d4-a716-446655440031', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440063', '660e8400-e29b-41d4-a716-446655440032', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440064', '660e8400-e29b-41d4-a716-446655440032', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440065', '660e8400-e29b-41d4-a716-446655440033', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440066', '660e8400-e29b-41d4-a716-446655440033', 'Large', 420.00, true, 2);

-- Prawns variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440067', '660e8400-e29b-41d4-a716-446655440034', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440068', '660e8400-e29b-41d4-a716-446655440034', 'Large', 420.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440069', '660e8400-e29b-41d4-a716-446655440035', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440070', '660e8400-e29b-41d4-a716-446655440035', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440071', '660e8400-e29b-41d4-a716-446655440036', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440072', '660e8400-e29b-41d4-a716-446655440036', 'Large', 350.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440073', '660e8400-e29b-41d4-a716-446655440037', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440074', '660e8400-e29b-41d4-a716-446655440037', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440075', '660e8400-e29b-41d4-a716-446655440038', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440076', '660e8400-e29b-41d4-a716-446655440038', 'Large', 420.00, true, 2);

-- Chicken variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440077', '660e8400-e29b-41d4-a716-446655440039', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440078', '660e8400-e29b-41d4-a716-446655440039', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440079', '660e8400-e29b-41d4-a716-446655440040', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440080', '660e8400-e29b-41d4-a716-446655440040', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440081', '660e8400-e29b-41d4-a716-446655440041', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440082', '660e8400-e29b-41d4-a716-446655440041', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440083', '660e8400-e29b-41d4-a716-446655440042', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440084', '660e8400-e29b-41d4-a716-446655440042', 'Large', 420.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440085', '660e8400-e29b-41d4-a716-446655440043', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440086', '660e8400-e29b-41d4-a716-446655440043', 'Large', 530.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440087', '660e8400-e29b-41d4-a716-446655440044', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440088', '660e8400-e29b-41d4-a716-446655440044', 'Large', 420.00, true, 2);

-- Pork variants (Note: Fixed the price for Fried Pork large - was 120, should be 1250)
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440089', '660e8400-e29b-41d4-a716-446655440045', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440090', '660e8400-e29b-41d4-a716-446655440045', 'Large', 350.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440091', '660e8400-e29b-41d4-a716-446655440046', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440092', '660e8400-e29b-41d4-a716-446655440046', 'Large', 350.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440093', '660e8400-e29b-41d4-a716-446655440047', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440094', '660e8400-e29b-41d4-a716-446655440047', 'Large', 370.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440095', '660e8400-e29b-41d4-a716-446655440048', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440096', '660e8400-e29b-41d4-a716-446655440048', 'Large', 350.00, true, 2);

-- Vegetable variants (only items with two prices)
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440097', '660e8400-e29b-41d4-a716-446655440053', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440098', '660e8400-e29b-41d4-a716-446655440053', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440099', '660e8400-e29b-41d4-a716-446655440054', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440100', '660e8400-e29b-41d4-a716-446655440054', 'Large', 400.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440101', '660e8400-e29b-41d4-a716-446655440055', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440102', '660e8400-e29b-41d4-a716-446655440055', 'Large', 100.00, true, 2);

-- Koththu variants
INSERT INTO menu_variants (id, menu_item_id, name, price_modifier, is_available, sort_order) VALUES
  ('770e8400-e29b-41d4-a716-446655440103', '660e8400-e29b-41d4-a716-446655440058', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440104', '660e8400-e29b-41d4-a716-446655440058', 'Large', 100.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440105', '660e8400-e29b-41d4-a716-446655440059', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440106', '660e8400-e29b-41d4-a716-446655440059', 'Large', 200.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440107', '660e8400-e29b-41d4-a716-446655440060', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440108', '660e8400-e29b-41d4-a716-446655440060', 'Large', 150.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440109', '660e8400-e29b-41d4-a716-446655440061', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440110', '660e8400-e29b-41d4-a716-446655440061', 'Large', 200.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440111', '660e8400-e29b-41d4-a716-446655440062', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440112', '660e8400-e29b-41d4-a716-446655440062', 'Large', 200.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440113', '660e8400-e29b-41d4-a716-446655440063', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440114', '660e8400-e29b-41d4-a716-446655440063', 'Large', 200.00, true, 2),
  ('770e8400-e29b-41d4-a716-446655440115', '660e8400-e29b-41d4-a716-446655440064', 'Small', 0.00, true, 1),
  ('770e8400-e29b-41d4-a716-446655440116', '660e8400-e29b-41d4-a716-446655440064', 'Large', 100.00, true, 2);