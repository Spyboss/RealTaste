# Food Images Implementation Plan

## Current Issue
Menu items are displaying placeholder letters instead of actual food images because:
1. The `image_url` field in the database is empty/null for all menu items
2. The frontend falls back to showing the first letter of the food name

## Solution Options

### Option 1: Free Stock Images (Immediate Fix)
Use high-quality free food images from sources like:
- Unsplash (unsplash.com)
- Pexels (pexels.com)
- Pixabay (pixabay.com)

### Option 2: AI-Generated Images
Use AI services to generate food images:
- DALL-E 3
- Midjourney
- Stable Diffusion

### Option 3: Professional Photography
Hire a photographer to take actual photos of the restaurant's dishes.

## Implementation Steps

### Step 1: Update Database with Image URLs
We'll use high-quality stock images that match Sri Lankan cuisine:

```sql
-- Update menu items with appropriate food images
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500' WHERE name = 'Traditional Rice & Curry';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500' WHERE name = 'Fish Curry Rice';
UPDATE menu_items SET image_url = 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=500' WHERE name = 'Chicken Curry Rice';
-- ... more updates for all items
```

### Step 2: Admin Dashboard for Image Management
Create an admin interface to:
- Upload new images
- Edit existing image URLs
- Preview images before saving
- Bulk image operations

### Step 3: Image Optimization
- Implement image compression
- Use WebP format for better performance
- Add lazy loading
- Implement responsive images

## Food Image URLs for Sri Lankan Cuisine

### Rice & Curry
- Traditional Rice & Curry: `https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80`
- Fish Curry Rice: `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&q=80`
- Chicken Curry Rice: `https://images.unsplash.com/photo-1574484284002-952d92456975?w=500&q=80`

### Kottu
- Vegetable Kottu: `https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80`
- Chicken Kottu: `https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&q=80`
- Seafood Kottu: `https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80`

### Fried Rice
- Vegetable Fried Rice: `https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80`
- Chicken Fried Rice: `https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80`
- Seafood Fried Rice: `https://images.unsplash.com/photo-1563379091339-03246963d96c?w=500&q=80`

### Noodles
- Vegetable Noodles: `https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&q=80`
- Chicken Noodles: `https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80`

### Beverages
- Fresh Lime Juice: `https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500&q=80`
- King Coconut: `https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=500&q=80`
- Soft Drinks: `https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500&q=80`

### Desserts
- Watalappan: `https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&q=80`
- Ice Cream: `https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80`

## Next Steps
1. Apply the database migration for user creation
2. Update menu items with food images
3. Test the frontend with new images
4. Implement admin image management interface
5. Add image optimization features