import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Receipt } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Show success message
    toast.success('Payment completed successfully!');
  }, []);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate('/orders');
    }
  };

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600">
            Your payment has been processed successfully and your order has been confirmed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Order Status Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-green-800">
            <Receipt className="w-5 h-5" />
            <span className="font-medium">Order Confirmed</span>
          </div>
          <p className="text-sm text-green-700 mt-2">
            We'll start preparing your order right away. You'll receive updates on the order status.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleViewOrder}
            className="w-full"
            size="lg"
          >
            <Receipt className="w-5 h-5 mr-2" />
            View Order Details
          </Button>

          <Button
            onClick={handleContinueShopping}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>You will receive SMS updates about your order status.</p>
          <p>Estimated pickup time will be provided shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
