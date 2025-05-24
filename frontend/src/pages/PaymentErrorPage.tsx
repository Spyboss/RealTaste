import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const PaymentErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  useEffect(() => {
    // Show error message
    toast.error('Payment failed. Please try again.');
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

  const handleContactSupport = () => {
    // You can implement contact support logic here
    toast.success('Please call +94 77 123 4567 for assistance');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-600">
            {message || 'There was an issue processing your payment. Please try again.'}
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm space-y-2">
            <p className="font-medium">What happened?</p>
            <ul className="text-left space-y-1 text-xs">
              <li>• Payment was not completed</li>
              <li>• Your card was not charged</li>
              <li>• Order is still pending payment</li>
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
              Retry Payment
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

          <Button
            onClick={handleContactSupport}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Phone className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>If you continue to experience issues, please contact our support team.</p>
          <p>We're here to help: +94 77 123 4567</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;
