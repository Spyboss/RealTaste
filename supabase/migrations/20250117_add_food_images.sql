-- Migration: Add food images to menu items
-- This fixes the placeholder image issue by adding real food images

-- Update Rice & Curry items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Traditional Rice & Curry';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Fish Curry Rice';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Chicken Curry Rice';

-- Update Kottu items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Vegetable Kottu';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Chicken Kottu';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Seafood Kottu';

-- Update Fried Rice items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Vegetable Fried Rice';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Chicken Fried Rice';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Seafood Fried Rice';

-- Update Noodles items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Vegetable Noodles';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Chicken Noodles';

-- Update Beverages items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Fresh Lime Juice';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'King Coconut';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Soft Drinks';

-- Update Desserts items
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Watalappan';

UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80&auto=format&fit=crop' 
WHERE name = 'Ice Cream';

-- Verify the updates
SELECT name, image_url FROM menu_items WHERE image_url IS NOT NULL;