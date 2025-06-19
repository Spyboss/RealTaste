import React, { useState } from 'react';
import { Plus, Star } from 'lucide-react';
import { MenuItem } from '../../types/shared';
import { formatPrice } from '@/utils/tempUtils';
import { useCartStore } from '@/stores/cartStore';
import Button from '@/components/ui/Button';
import MenuItemModal from './MenuItemModal';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const { addItem } = useCartStore();

  const hasVariantsOrAddons = (item.variants && item.variants.length > 0) ||
                              (item.menu_variants && item.menu_variants.length > 0) ||
                              (item.addons && item.addons.length > 0) ||
                              (item.menu_addons && item.menu_addons.length > 0);

  // Get the lowest price (base price + smallest variant modifier)
  const getLowestPrice = () => {
    const variants = item.variants || item.menu_variants || [];
    if (variants.length === 0) {
      return item.base_price;
    }
    const lowestModifier = Math.min(...variants.map(v => v.price_modifier || 0));
    return item.base_price + lowestModifier;
  };

  const handleQuickAdd = () => {
    if (hasVariantsOrAddons) {
      setShowModal(true);
    } else {
      addItem(item);
    }
  };

  const handleCustomize = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
        {/* Image */}
        {item.image_url ? (
          <div className="aspect-w-16 aspect-h-9">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-primary-600 text-4xl font-bold">
              {item.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {item.name}
            </h3>
            {/* Rating placeholder - can be added later */}
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          {item.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Price and variants info */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xl font-bold text-primary-600">
                {formatPrice(getLowestPrice())}
              </span>
              {hasVariantsOrAddons && (
                <span className="text-sm text-gray-500 ml-1">starting from</span>
              )}
            </div>
            {hasVariantsOrAddons && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Customizable
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleQuickAdd}
              className="flex-1"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              {hasVariantsOrAddons ? 'Customize' : 'Add to Cart'}
            </Button>
            {hasVariantsOrAddons && (
              <Button
                onClick={handleCustomize}
                variant="outline"
                size="sm"
                className="px-3"
              >
                Options
              </Button>
            )}
          </div>
        </div>

        {/* Availability indicator */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Modal for customization */}
      {showModal && (
        <MenuItemModal
          item={item}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default MenuCard;
