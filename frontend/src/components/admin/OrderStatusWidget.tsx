import React from 'react';
import { Order } from '@/types/shared'; // Import the shared Order type

interface OrderStatusWidgetProps {
  orderId: string; 
  currentStatus: Order['status']; // Use shared type
  onStatusChange: (newStatus: Order['status']) => void; 
}

// Define available statuses based on the shared Order type
const availableStatuses: { value: Order['status']; label: string }[] = [
  { value: 'received', label: 'Received' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready for Pickup' },
  { value: 'ready', label: 'Ready (Generic)' }, // Added from frontend type
  { value: 'completed', label: 'Completed' },     // Added from frontend type
  { value: 'cancelled', label: 'Cancelled' },
];

const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({ orderId, currentStatus, onStatusChange }) => {

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(event.target.value as Order['status']);
  };

  return (
    <div className="mt-2">
      <label htmlFor={`status-select-${orderId}`} className="block text-sm font-medium text-gray-700 mb-1">
        Update Status:
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