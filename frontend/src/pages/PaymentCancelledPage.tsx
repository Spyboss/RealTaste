import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Show cancellation message
    toast.error('Payment was cancelled');
  }, []);

  const handleRetryPayment = () => {
    if (orderId) {
      // Navigate back to order with payment retry option
      navigate(`/orders/${orderId}?retry=true`);
    } else {
      // Navigate back to cart/checkout
      navigate('/cart');
    }
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Cancelled Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-gray-600" />
          </div>
        </div>

        {/* Cancelled Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
          <p className="text-gray-600">
            You cancelled the payment process. Your order is still pending payment.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-gray-800 text-sm space-y-2">
            <p className="font-medium">What happened?</p>
            <ul className="text-left space-y-1 text-xs">
              <li>• Payment process was cancelled</li>
              <li>• No charges were made to your card</li>
              <li>• Your order is still waiting for payment</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderId && (
            <Button
              onClick={handleRetryPayment}
              className="w-full"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Payment Again
            </Button>
          )}

          <Button
            onClick={handleBackToMenu}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Menu
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>You can complete the payment later from your order details.</p>
          <p>Orders without payment will be automatically cancelled after 30 minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
