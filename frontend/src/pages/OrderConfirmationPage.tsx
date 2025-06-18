import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Clock, Phone } from 'lucide-react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, Order } from '@/types/shared';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery<Order>(
    ['order', orderId],
    async () => {
      const response = await api.get(`/orders/${orderId}`);
      return (response.data as any).data as Order;
    },
    {
      enabled: !!orderId,
      retry: 1,
    }
  );

  useEffect(() => {
    if (!orderId) {
      navigate('/orders');
    }
  }, [orderId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }



  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'preparing':
        return 'text-yellow-600 bg-yellow-100';
      case 'ready':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Thank you for your order. We'll prepare it with care.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
              <p className="text-gray-900">{order.customer_name}</p>
              <div className="flex items-center mt-1">
                <Phone className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-gray-600">{order.customer_phone}</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Order Type</h3>
              <p className="text-gray-900 capitalize">{(order as any).order_type || 'pickup'}</p>
              {(order as any).order_type === 'delivery' && (order as any).delivery_address && (
                <p className="text-gray-600 text-sm mt-1">{(order as any).delivery_address}</p>
              )}
            </div>
          </div>

          {/* Timing Info */}
          {order.estimated_pickup_time && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Estimated {(order as any).order_type === 'delivery' ? 'Delivery' : 'Pickup'} Time
                  </p>
                  <p className="text-orange-700">
                    {formatDate(order.estimated_pickup_time)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  {item.menu_item?.image_url && (
                    <img
                      src={item.menu_item.image_url}
                      alt={item.menu_item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.menu_item?.name}</h4>
                    {item.variant && (
                      <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                    )}
                    {item.order_item_addons && item.order_item_addons.length > 0 && (
                      <p className="text-sm text-gray-600">
                        Add-ons: {item.order_item_addons.map(addon => addon.addon?.name).filter(Boolean).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Method</h3>
                <p className="text-gray-900 capitalize">{order.payment_method}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                <p className="text-gray-900 capitalize">{order.payment_status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/orders"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          View All Orders
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;