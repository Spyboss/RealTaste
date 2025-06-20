import React, { useState } from 'react';
import { Search, Clock, Phone } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useBusinessStore } from '@/stores/businessStore';
import { formatTime } from '@/utils/tempUtils';
import MenuCard from '@/components/menu/MenuCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Input from '@/components/ui/Input';
import { MenuItem, MenuCategory } from '@/types/shared';

const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories, isLoading, error } = useMenu();
  const { businessHours, isOpen, restaurantPhone } = useBusinessStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load menu
        </h2>
        <p className="text-gray-600">
          Please try refreshing the page or contact us if the problem persists.
        </p>
      </div>
    );
  }

  // Filter categories and items based on search
  const filteredCategories = categories?.map((category: MenuCategory) => ({
    ...category,
    menu_items: category.menu_items?.filter((item: MenuItem) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  })).filter(category =>
    selectedCategory ? category.id === selectedCategory : true
  ).filter(category =>
    searchTerm ? category.menu_items.length > 0 : true
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to {import.meta.env.VITE_RESTAURANT_NAME || import.meta.env.VITE_APP_NAME || 'RealTaste'}
          </h1>
          <p className="text-primary-100 mb-4">
            Chinese foods take away specialists in outdoor catering. Order now for quick pickup!
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>
                {isOpen ? 'Open Now' : 'Closed'} •
                {businessHours && (
                  <span className="ml-1">
                    {formatTime(businessHours.open_time)} - {formatTime(businessHours.close_time)}
                  </span>
                )}
              </span>
            </div>
            {restaurantPhone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{restaurantPhone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Status */}
      {!isOpen && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">We're Currently Closed</h3>
              <p className="text-red-600 text-sm">
                We'll be back tomorrow at {businessHours && formatTime(businessHours.open_time)}.
                You can still browse our menu!
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Search and Filters */
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories?.map((category: MenuCategory) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Categories */}
      {filteredCategories?.map((category: MenuCategory) => (
        <div key={category.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {category.name}
            </h2>
            <span className="text-sm text-gray-500">
              {category.menu_items?.length || 0} items
            </span>
          </div>

          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.menu_items?.map((item: MenuItem) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* No results */}
      {searchTerm && filteredCategories?.every(cat => cat.menu_items.length === 0) && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No dishes found
          </h3>
          <p className="text-gray-600">
            Try searching with different keywords or browse our categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
