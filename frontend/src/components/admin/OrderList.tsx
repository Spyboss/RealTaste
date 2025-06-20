import React from 'react';
import { Order } from '@/types/shared'; // Import the shared Order type
import OrderStatusWidget from './OrderStatusWidget'; // Import the widget

interface OrderListProps {
  orders: Order[];
  onStatusChange: (orderId: string, newStatus: Order['status']) => void;
}

const OrderList: React.FC<OrderListProps> = ({ orders, onStatusChange }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-600">No orders to display at the moment.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Order ID: {order.id.substring(0, 8)}...</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
              order.status === 'received' ? 'bg-blue-100 text-blue-700' :
              order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-700' :
              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
              order.status === 'ready_for_pickup' ? 'bg-green-100 text-green-700' :
              order.status === 'ready_for_delivery' ? 'bg-emerald-100 text-emerald-700' :
              order.status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
              order.status === 'delivered' ? 'bg-teal-100 text-teal-700' :
              order.status === 'completed' ? 'bg-gray-100 text-gray-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600">Customer: {order.customer_name || 'N/A'} ({order.customer_phone})</p>
          <p className="text-sm text-gray-600">Total: Rs. {order.total_amount.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Created: {new Date(order.created_at).toLocaleString()}</p>
          {order.estimated_pickup_time && 
            <p className="text-sm text-gray-500">Est. Pickup: {new Date(order.estimated_pickup_time).toLocaleString()}</p>
          }
          <div className="mt-3">
            <OrderStatusWidget 
              orderId={order.id} 
              currentStatus={order.status} 
              orderType={order.order_type || 'pickup'}
              // Pass down a specific handler for this order's status change
              onStatusChange={(newStatus) => onStatusChange(order.id, newStatus as Order['status'])} 
            />
          </div>
          {/* Consider adding a button to view full order details later */}
        </div>
      ))}
    </div>
  );
};

export default OrderList;