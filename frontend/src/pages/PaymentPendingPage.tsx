import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useOrder } from '@/hooks/useOrders';

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [checkCount, setCheckCount] = useState(0);

  const { data: order, refetch, isLoading } = useOrder(orderId || '');

  useEffect(() => {
    if (!orderId) {
      navigate('/menu');
      return;
    }

    // Auto-refresh order status every 5 seconds for up to 2 minutes
    const interval = setInterval(() => {
      if (checkCount < 24) { // 24 * 5 seconds = 2 minutes
        refetch();
        setCheckCount(prev => prev + 1);
      } else {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, navigate, refetch, checkCount]);

  useEffect(() => {
    if (order?.payment_status === 'completed') {
      // Payment completed, redirect to success page
      navigate(`/payment/success?orderId=${orderId}`);
    } else if (order?.payment_status === 'failed') {
      // Payment failed, redirect to error page
      navigate(`/payment/error?orderId=${orderId}&message=Payment verification failed`);
    }
  }, [order, navigate, orderId]);

  const handleCheckStatus = () => {
    refetch();
    setCheckCount(0);
  };

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Pending Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-yellow-600 animate-pulse" />
          </div>
        </div>

        {/* Pending Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
          <p className="text-gray-600">
            We're verifying your payment. This usually takes a few moments.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono font-medium">{orderId}</span>
            </p>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Verifying Payment</span>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Please don't close this page. We're checking with PayHere to confirm your payment.
          </p>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking payment status...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckStatus}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Check Status
          </Button>

          {order && (
            <Button
              onClick={handleViewOrder}
              variant="outline"
              className="w-full"
              size="lg"
            >
              View Order Details
            </Button>
          )}

          <Button
            onClick={handleBackToMenu}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Payment verification can take up to 2-3 minutes.</p>
          <p>If the status doesn't update, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
