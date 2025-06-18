import React from 'react';
import { Truck, Store } from 'lucide-react';

interface OrderTypeSelectorProps {
  orderType: 'pickup' | 'delivery';
  onOrderTypeChange: (type: 'pickup' | 'delivery') => void;
  deliveryEnabled?: boolean;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  onOrderTypeChange,
  deliveryEnabled = true
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Type</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Pickup Option */}
        <button
          type="button"
          onClick={() => onOrderTypeChange('pickup')}
          className={`
            relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200
            ${orderType === 'pickup'
              ? 'border-orange-500 bg-orange-50 text-orange-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }
          `}
        >
          <Store className="w-8 h-8 mb-2" />
          <span className="font-medium">Pickup</span>
          <span className="text-sm text-center mt-1">
            Collect from restaurant
          </span>
          {orderType === 'pickup' && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full" />
          )}
        </button>

        {/* Delivery Option */}
        <button
          type="button"
          onClick={() => deliveryEnabled && onOrderTypeChange('delivery')}
          disabled={!deliveryEnabled}
          className={`
            relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200
            ${!deliveryEnabled
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : orderType === 'delivery'
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }
          `}
        >
          <Truck className="w-8 h-8 mb-2" />
          <span className="font-medium">Delivery</span>
          <span className="text-sm text-center mt-1">
            {deliveryEnabled ? 'Delivered to your location' : 'Currently unavailable'}
          </span>
          {orderType === 'delivery' && deliveryEnabled && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {orderType === 'delivery' && deliveryEnabled && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            </div>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Delivery Information:</p>
              <ul className="space-y-1 text-blue-600">
                <li>• Base fee: LKR 180 for first 1km</li>
                <li>• Additional: LKR 40 per km up to 5km range</li>
                <li>• Estimated delivery time will be calculated based on distance</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTypeSelector;