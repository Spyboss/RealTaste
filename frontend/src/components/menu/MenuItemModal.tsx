import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, MenuVariant, MenuAddon } from '../../types/shared';
import { formatPrice, calculateItemTotal } from '@/utils/tempUtils';
import { useCartStore } from '@/stores/cartStore';
import Button from '@/components/ui/Button';

interface MenuItemModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({ item, isOpen, onClose }) => {
  // Get variants from either variants or menu_variants
  const variants = item.variants || item.menu_variants || [];
  const addons = item.addons || item.menu_addons || [];
  
  const [selectedVariant, setSelectedVariant] = useState<MenuVariant | undefined>(
    variants[0]
  );
  const [selectedAddons, setSelectedAddons] = useState<MenuAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const { addItem } = useCartStore();

  if (!isOpen) return null;

  const handleAddonToggle = (addon: MenuAddon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const calculateTotal = () => {
    const variantModifier = selectedVariant?.price_modifier || 0;
    const addonPrices = selectedAddons.map(addon => addon.price);

    return calculateItemTotal(
      item.base_price,
      variantModifier,
      addonPrices,
      quantity
    );
  };

  const handleAddToCart = () => {
    addItem(item, selectedVariant, selectedAddons, quantity, notes || undefined);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">{item.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Image and description */}
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {item.description && (
              <p className="text-gray-600">{item.description}</p>
            )}

            {/* Variants */}
            {variants && variants.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Size</h3>
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <label
                      key={variant.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="variant"
                          checked={selectedVariant?.id === variant.id}
                          onChange={() => setSelectedVariant(variant)}
                          className="mr-3 text-primary-600"
                        />
                        <span className="font-medium">{variant.name}</span>
                      </div>
                      <span className="text-gray-600">
                        {variant.price_modifier > 0 && '+'}
                        {formatPrice(variant.price_modifier)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {addons && addons.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Add-ons</h3>
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAddons.some(a => a.id === addon.id)}
                          onChange={() => handleAddonToggle(addon)}
                          className="mr-3 text-primary-600"
                        />
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="text-gray-600">
                        +{formatPrice(addon.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Special instructions */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or modifications..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {notes.length}/200 characters
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-primary-600">
                {formatPrice(calculateTotal())}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full"
              size="lg"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuItemModal;
