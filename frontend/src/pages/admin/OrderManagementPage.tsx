import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import OrderList from '@/components/admin/OrderList';
import LoadingSpinner from '@/components/ui/LoadingSpinner'; // Assuming you have this
import { Order } from '@/types/shared'; // Import Order type

const OrderManagementPage: React.FC = () => {
  const {
    orderQueue,
    isManagementLoading,
    error,
    fetchAllAdminOrders,
    updateAdminOrderStatus,
    deleteOrder,
  } = useAdminStore((state) => ({
    orderQueue: state.orderQueue,
    isManagementLoading: state.isManagementLoading,
    error: state.error,
    fetchAllAdminOrders: state.fetchAllAdminOrders,
    updateAdminOrderStatus: state.updateAdminOrderStatus,
    deleteOrder: state.deleteOrder,
  }));

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      if (hasLoaded) return;
      
      try {
        await fetchAllAdminOrders();
        setHasLoaded(true);
      } catch (error) {
        console.error('Failed to load orders:', error);
      }
    };

    loadOrders();
  }, [fetchAllAdminOrders, hasLoaded]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    // Call the store action to update status
    // The store action itself handles API call and local state update (optimistically)
    const success = await updateAdminOrderStatus(orderId, newStatus);
    if (success) {
      // Optionally show a success toast/message
      console.log(`Order ${orderId} status update initiated to ${newStatus}`);
    } else {
      // Optionally show an error toast/message if the store action indicates failure
      console.error(`Failed to initiate status update for order ${orderId}`);
    }
  };

  if (isManagementLoading && orderQueue.length === 0) { // Show loading only if no orders yet
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-md">
        <p>Error fetching orders: {error}</p>
        <button onClick={() => fetchAllAdminOrders()} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Full Order Management</h1>
      {/* We'll pass orders and the status change handler to OrderList */}
      <OrderList
          orders={orderQueue}
          onStatusChange={handleStatusChange}
          onDeleteOrder={deleteOrder}
        />
      {isManagementLoading && orderQueue.length > 0 && (
        <div className="mt-4 text-center">
            <p>Updating order list...</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;