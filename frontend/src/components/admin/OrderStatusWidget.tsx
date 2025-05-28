import React from 'react';

interface OrderStatusWidgetProps {
  orderId: string; // Or the full order object
  currentStatus: string;
  onStatusChange: (newStatus: string) => void; // Callback for when status changes
}

const OrderStatusWidget: React.FC<OrderStatusWidgetProps> = ({ orderId, currentStatus, onStatusChange }) => {
  // Placeholder for status options - this would likely come from a config or API
  const availableStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled'];

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(event.target.value);
  };

  return (
    <div>
      <h4>Order ID: {orderId}</h4>
      <p>Current Status: {currentStatus}</p>
      <select value={currentStatus} onChange={handleSelectChange}>
        {availableStatuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {/* Button to submit status change might be here, or select might auto-submit */}
    </div>
  );
};

export default OrderStatusWidget; 