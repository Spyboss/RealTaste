const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Image mappings for different food categories
const imageMap = {
  'rice': 'https://images.unsplash.com/photo-1613526949297-1aba25022d0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'noodles': 'https://images.unsplash.com/photo-1619714604882-db1396d4a718?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'fish': 'https://images.unsplash.com/photo-1561827978-45f07fa822fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'chicken': 'https://images.unsplash.com/photo-1588594907301-823478af8be5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'vegetable': 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'koththu': 'https://images.unsplash.com/photo-1581925775929-92da8316b559?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'soup': 'https://images.unsplash.com/photo-1581420515590-cee76de451b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400',
  'starter': 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=400'
};

// Correct pricing from menu items.txt
const correctPrices = {
  // Starters
  'Chicken Rolls': { small: 120, large: 200 },
  'Vegetable Rolls': { small: 100, large: 180 },
  'Fish Rolls': { small: 130, large: 220 },
  'Chicken Patties': { small: 120, large: 200 },
  'Vegetable Patties': { small: 100, large: 180 },
  'Fish Patties': { small: 130, large: 220 },
  
  // Soups
  'Chicken Soup': { small: 180, large: 280 },
  'Vegetable Soup': { small: 150, large: 250 },
  'Fish Soup': { small: 200, large: 300 },
  'Mushroom Soup': { small: 170, large: 270 },
  'Sweet Corn Soup': { small: 160, large: 260 },
  
  // Rice Basmathi
  'Chicken Fried Rice': { small: 350, large: 500 },
  'Vegetable Fried Rice': { small: 300, large: 450 },
  'Fish Fried Rice': { small: 380, large: 530 },
  'Prawn Fried Rice': { small: 400, large: 550 },
  'Mixed Fried Rice': { small: 420, large: 570 },
  'Chicken Biriyani': { small: 400, large: 600 },
  'Mutton Biriyani': { small: 450, large: 650 },
  'Fish Biriyani': { small: 420, large: 620 },
  'Vegetable Biriyani': { small: 350, large: 550 },
  
  // Continue with other categories...
  // This is a sample - you would need to add all items from the menu items.txt
};

async function updateImages() {
  console.log('Updating menu item images...');
  
  try {
    // Get all menu items with their categories
    const { data: items, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        category_id,
        categories!inner(name)
      `);
    
    if (error) throw error;
    
    for (const item of items) {
      let imageUrl = imageMap.starter; // default
      const itemName = item.name.toLowerCase();
      const categoryName = item.categories.name.toLowerCase();
      
      // Determine image based on item name or category
      if (itemName.includes('rice') || itemName.includes('biriyani')) {
        imageUrl = imageMap.rice;
      } else if (itemName.includes('noodles') || itemName.includes('chow')) {
        imageUrl = imageMap.noodles;
      } else if (itemName.includes('fish') || itemName.includes('cuttle') || itemName.includes('prawn')) {
        imageUrl = imageMap.fish;
      } else if (itemName.includes('chicken') || itemName.includes('pork')) {
        imageUrl = imageMap.chicken;
      } else if (itemName.includes('vegetable') || itemName.includes('omelette')) {
        imageUrl = imageMap.vegetable;
      } else if (itemName.includes('koththu')) {
        imageUrl = imageMap.koththu;
      } else if (itemName.includes('soup')) {
        imageUrl = imageMap.soup;
      } else if (categoryName.includes('starter')) {
        imageUrl = imageMap.starter;
      }
      
      // Update the item
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ image_url: imageUrl })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Error updating image for ${item.name}:`, updateError);
      } else {
        console.log(`Updated image for ${item.name}`);
      }
    }
    
    console.log('Image update completed!');
  } catch (error) {
    console.error('Error updating images:', error);
  }
}

async function updatePricing() {
  console.log('Updating menu item pricing...');
  
  try {
    // Get all menu items with their variants
    const { data: items, error } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        base_price,
        menu_variants(id, name, price_modifier)
      `);
    
    if (error) throw error;
    
    for (const item of items) {
      const correctPrice = correctPrices[item.name];
      if (!correctPrice) continue;
      
      // Update base price to small size price
      const { error: itemError } = await supabase
        .from('menu_items')
        .update({ base_price: correctPrice.small })
        .eq('id', item.id);
      
      if (itemError) {
        console.error(`Error updating base price for ${item.name}:`, itemError);
        continue;
      }
      
      // Update variant price modifiers
      for (const variant of item.menu_variants) {
        let priceModifier = 0;
        
        if (variant.name.toLowerCase() === 'small') {
          priceModifier = 0; // Small is base price
        } else if (variant.name.toLowerCase() === 'large') {
          priceModifier = correctPrice.large - correctPrice.small;
        }
        
        const { error: variantError } = await supabase
          .from('menu_variants')
          .update({ price_modifier: priceModifier })
          .eq('id', variant.id);
        
        if (variantError) {
          console.error(`Error updating variant ${variant.name} for ${item.name}:`, variantError);
        }
      }
      
      console.log(`Updated pricing for ${item.name}: Small Rs.${correctPrice.small}, Large Rs.${correctPrice.large}`);
    }
    
    console.log('Pricing update completed!');
  } catch (error) {
    console.error('Error updating pricing:', error);
  }
}

async function main() {
  console.log('Starting database fixes...');
  
  await updateImages();
  await updatePricing();
  
  console.log('Database fixes completed!');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { updateImages, updatePricing };