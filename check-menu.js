async function checkMenu() {
  try {
    const response = await fetch('http://localhost:3001/api/menu');
    const data = await response.json();
    console.log('Menu items:');
    if (data.success && data.data.length > 0) {
      data.data.forEach(category => {
        console.log(`\nCategory: ${category.name}`);
        category.menu_items.forEach(item => {
          console.log(`  - ${item.name} (ID: ${item.id})`);
        });
      });
    } else {
      console.log('No menu items found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkMenu();