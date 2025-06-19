-- Update menu items with food images from Unsplash
-- This script adds image URLs to all menu items

-- Update Starters
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1556710986-4a70434a76c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NjYwNTR8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllcyUyMGNyaXNweSUyMGdvbGRlbnxlbnwwfHx8fDE3NTAzMDY0NTd8MA&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'French Fries';

-- Update Soups
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Cream of Chicken Soup';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken and Egg Soup';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592180-85f173990554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Hot and Sour Soup';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Hot and Sour Soup';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Cream of Vegetable Soup';

-- Update Rice Basmathi
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Real Taste Special Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sea Food Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Nasi Goreng';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable and Egg Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Garlic Fried Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Steam Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Chopsuey Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512058564366-18510be2db19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sea Food Chopsuey Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Chopsuey Rice';

-- Update Noodles
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Real Taste Special Noodles';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken Fried Noodles';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sea Food Fried Noodles';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Fried Noodles';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable and Egg Fried Noodles';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Fried Noodles';

-- Update Fish
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fried Fish';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Fish';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Crispy Fish';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sweet and Sour Fish';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fish with Hot Garlic Sauce';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fish Hot Curry';

-- Update Cuttle Fish
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Cuttle Fish with Hot Butter Sauce';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Cuttle Fish';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Cuttle Fish Curry';

-- Update Prawns
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Batter Fried Prawns';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Prawns';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sweet & Sour Prawns';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Prawns with Hot Garlic Sauce';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Prawns Curry';

-- Update Chicken
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fried Chicken';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Chicken';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Crispy Chicken';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sweet & Sour Chicken';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chilli Chicken with Cashew Nut';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken Curry';

-- Update Pork
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fried Pork';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Pork';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sweet & Sour Pork';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Pork Curry';

-- Update Omelette
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Omelette';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken Omelette';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Prawns Omelette';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Omelette';

-- Update Vegetable
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Boiled Vegetable';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Vegetable Chopsuey';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Devilled Mushroom';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Onion Salad';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Salad';

-- Update Koththu
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Egg Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Chicken Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Fish Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Pork Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Sea Food Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Mix Koththu';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400' WHERE name = 'Vegetable Koththu';