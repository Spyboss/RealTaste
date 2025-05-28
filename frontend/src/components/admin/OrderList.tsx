import React from 'react';

// Define a type for an order (placeholder)
interface Order {
  id: string;
  customerName: string;
  status: string;
  // Add other relevant order properties here
}

interface OrderListProps {
  orders: Order[];
}

const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p>No orders to display.</p>;
  }

  return (
    <div>
      <h2>Current Orders</h2>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.customerName} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList; 