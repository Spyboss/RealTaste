import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Package, CheckCircle, XCircle, Phone } from 'lucide-react';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { subscribeToOrderUpdates } from '@/services/supabase';
import { formatPrice, formatDateTime, getOrderStatusDisplay } from '@/utils/tempUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, error, refetch } = useOrder(id!);
  const cancelOrderMutation = useCancelOrder();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!id) return;

    const subscription = subscribeToOrderUpdates(id, (payload) => {
      console.log('Order updated:', payload);
      refetch();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [id, refetch]);

  const handleCancelOrder = () => {
    if (!id) return;
    cancelOrderMutation.mutate(id);
    setShowCancelConfirm(false);
  };

  const canCancelOrder = order && ['received', 'confirmed'].includes(order.status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order not found
        </h2>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <Clock className="w-6 h-6" />;
      case 'preparing':
        return <Package className="w-6 h-6" />;
      case 'ready_for_pickup':
        return <CheckCircle className="w-6 h-6" />;
      case 'picked_up':
        return <CheckCircle className="w-6 h-6" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'received', label: 'Order Received', icon: Clock },
      { key: 'preparing', label: 'Preparing', icon: Package },
      { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: CheckCircle },
      { key: 'picked_up', label: 'Picked Up', icon: CheckCircle },
    ];

    const currentIndex = steps.findIndex(step => step.key === order.status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const statusSteps = getStatusSteps();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-600">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>

            <div className="space-y-4">
              {statusSteps.map((step) => (
                <div key={step.key} className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      step.completed ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    {step.current && order.estimated_pickup_time && (
                      <p className="text-sm text-primary-600">
                        Estimated pickup: {formatDateTime(order.estimated_pickup_time)}
                      </p>
                    )}
                  </div>
                  {step.current && (
                    <span className="text-sm font-medium text-primary-600">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>

            {order.status === 'ready_for_pickup' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-medium text-green-800">Your order is ready!</h3>
                    <p className="text-green-600 text-sm">
                      Please come to the restaurant to collect your order.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>

            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start py-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.menu_item?.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-gray-600">Size: {item.variant.name}</p>
                    )}
                    {item.order_item_addons && item.order_item_addons.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.order_item_addons.map(addon => addon.addon?.name).join(', ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 italic">Note: {item.notes}</p>
                    )}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Special Instructions:</h4>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Current Status Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              {getStatusIcon(order.status)}
              <div>
                <h3 className="font-semibold text-gray-900">
                  {getOrderStatusDisplay(order.status)}
                </h3>
                <p className="text-sm text-gray-600">Current status</p>
              </div>
            </div>
            
            {/* Cancel Order Button */}
            {canCancelOrder && (
              <div className="mt-4 pt-4 border-t">
                {!showCancelConfirm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(false)}
                        className="flex-1"
                      >
                        Keep Order
                      </Button>
                      <Button
                        onClick={handleCancelOrder}
                        disabled={cancelOrderMutation.isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        {cancelOrderMutation.isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Show message for cancelled orders */}
            {order.status === 'cancelled' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-800">Order Cancelled</h4>
                    <p className="text-red-600 text-sm">
                      This order has been cancelled.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">{formatPrice(order.tax_amount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary-600">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">
                  {order.payment_method === 'cash' ? 'Cash on Pickup' : 'Card Payment'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.payment_status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment_status === 'completed' ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{order.customer_phone}</span>
              </div>
              {order.customer_name && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
