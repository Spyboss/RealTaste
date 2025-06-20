import React from 'react';
import { Order } from '@/types/shared'; // Import the shared Order type

interface OrderStatusWidgetProps {
  orderId: string; 
  currentStatus: Order['status']; // Use shared type
  orderType: 'pickup' | 'delivery';
  onStatusChange: (newStatus: Order['status']) => void; 
}

// Define available statuses based on order type
const getAvailableStatuses = (orderType: 'pickup' | 'delivery'): { value: Order['status']; label: string }[] => {
  const baseStatuses = [
    { value: 'received' as const, label: 'Received' },
    { value: 'confirmed' as const, label: 'Confirmed' },
    { value: 'preparing' as const, label: 'Preparing' },
  ];

  if (orderType === 'pickup') {
    return [
      ...baseStatuses,
      { value: 'ready_for_pickup' as const, label: 'Ready for Pickup' },
      { value: 'picked_up' as const, label: 'Picked Up' },
      { value: 'completed' as const, label: 'Completed' },
      { value: 'cancelled' as const, label: 'Cancelled' },
    ];
  } else {
    return [
      ...baseStatuses,
      { value: 'ready_for_delivery' as const, label: 'Ready for Delivery' },
      { value: 'delivered' as const, label: 'Delivered' },
      { value: 'completed' as const, label: 'Completed' },
      { value: 'cancelled' as const, label: 'Cancelled' },
    ];
  }
};

const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({ orderId, currentStatus, orderType, onStatusChange }) => {
  const availableStatuses = getAvailableStatuses(orderType);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(event.target.value as Order['status']);
  };

  return (
    <div className="mt-2">
      <label htmlFor={`status-select-${orderId}`} className="block text-sm font-medium text-gray-700 mb-1">
        Update Status ({orderType === 'pickup' ? 'Pickup' : 'Delivery'}):
      </label>
      <select 
        id={`status-select-${orderId}`}
        value={currentStatus} 
        onChange={handleSelectChange}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
      >
        {availableStatuses.map((statusOption) => (
          <option key={statusOption.value} value={statusOption.value}>
            {statusOption.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default OrderStatusWidget;