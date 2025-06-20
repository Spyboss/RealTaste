import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Package, CheckCircle, XCircle } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatDateTime, getOrderStatusDisplay, getOrderStatusColor } from '@/utils/tempUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

const OrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading, error } = useOrders({
    status: statusFilter || undefined,
  });

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
          Unable to load orders
        </h2>
        <p className="text-gray-600">
          Please try refreshing the page or contact us if the problem persists.
        </p>
      </div>
    );
  }

  const orders = data?.orders || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="w-5 h-5" />;
      case 'preparing':
        return <Package className="w-5 h-5" />;
      case 'ready_for_pickup':
        return <CheckCircle className="w-5 h-5" />;
      case 'picked_up':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <Link to="/">
          <Button>Order More Food</Button>
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            statusFilter === ''
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Orders
        </button>
        {['received', 'confirmed', 'preparing', 'ready_for_pickup', 'ready_for_delivery', 'picked_up', 'delivered', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === status
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getOrderStatusDisplay(status)}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600 mb-6">
            {statusFilter
              ? `No orders with status "${getOrderStatusDisplay(statusFilter)}" found.`
              : "You haven't placed any orders yet."
            }
          </p>
          <Link to="/">
            <Button>Browse Menu</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getOrderStatusDisplay(order.status)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on {formatDateTime(order.created_at)}
                  </p>
                  {order.estimated_pickup_time && (
                    <p className="text-sm text-gray-600">
                      Estimated pickup: {formatDateTime(order.estimated_pickup_time)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-primary-600">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.items?.length || 0} items
                  </p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <div className="space-y-1">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.menu_item?.name}
                        {item.variant && ` (${item.variant.name})`}
                      </span>
                      <span className="text-gray-900">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Payment: {order.payment_method === 'cash' ? 'Cash on Pickup' : 'Card'}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    order.payment_status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment_status === 'completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <Link to={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
