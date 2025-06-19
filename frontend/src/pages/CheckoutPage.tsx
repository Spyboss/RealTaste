import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, Banknote, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { CreateOrderRequest } from '../../../shared/src/types';
import { formatPrice, validatePhoneNumber } from '../utils/tempUtils';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import OrderTypeSelector from '../components/OrderTypeSelector';
import DeliveryAddressInput from '../components/DeliveryAddressInput';
import { toast } from 'react-hot-toast';
import { api } from '../services/api';

// PayHere JavaScript SDK types
declare global {
  interface Window {
    payhere: {
      startPayment: (payment: any) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

interface CheckoutForm {
  customerPhone: string;
  customerName?: string;
  paymentMethod: 'card' | 'cash';
  orderType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  deliveryNotes?: string;
  customerGpsLocation?: string;
  notes?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getItemPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Delivery state
  const [deliveryAddress, setDeliveryAddress] = React.useState<string>('');
  const [deliveryCoordinates, setDeliveryCoordinates] = React.useState<{ lat: number; lng: number } | null>(null);
  const [deliveryNotes, setDeliveryNotes] = React.useState<string>('');
  const [deliveryFee, setDeliveryFee] = React.useState<number>(0);
  const [isWithinRange, setIsWithinRange] = React.useState<boolean>(true);
  const [customerGpsLocation, setCustomerGpsLocation] = React.useState<string>('');
  const [gpsLocation, setGpsLocation] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      customerPhone: '',
      customerName: user?.user_metadata?.first_name || '',
      paymentMethod: 'cash',
      orderType: 'pickup',
      deliveryAddress: '',
      deliveryLatitude: undefined,
      deliveryLongitude: undefined,
      deliveryNotes: '',
      customerGpsLocation: '',
      notes: ''
    },
  });
  
  const paymentMethod = watch('paymentMethod');
  const orderType = watch('orderType');
  const subtotal = getTotalPrice();
  const currentDeliveryFee = orderType === 'delivery' ? deliveryFee : 0;
  const onlinePaymentFee = paymentMethod === 'card' ? Math.round(subtotal * 0.02) : 0; // 2% online payment fee
  const totalPrice = subtotal + currentDeliveryFee + onlinePaymentFee;

  // Update form values when delivery data changes
  React.useEffect(() => {
    setValue('deliveryAddress', deliveryAddress);
    setValue('deliveryLatitude', deliveryCoordinates?.lat);
    setValue('deliveryLongitude', deliveryCoordinates?.lng);
    setValue('deliveryNotes', deliveryNotes);
    setValue('customerGpsLocation', customerGpsLocation);
  }, [deliveryAddress, deliveryCoordinates, deliveryNotes, customerGpsLocation, setValue]);



  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
        <Button onClick={() => navigate('/')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  // PayHere payment callbacks
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.payhere) {
      window.payhere.onCompleted = function(orderId: string) {
        console.log('Payment completed for order:', orderId);
        clearCart();
        toast.success('Payment successful! Order placed.');
        navigate(`/payment/success?order_id=${orderId}`);
      };

      window.payhere.onDismissed = function() {
        console.log('Payment dismissed');
        toast.error('Payment was cancelled');
        setIsSubmitting(false);
      };

      window.payhere.onError = function(error: string) {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again.');
        setIsSubmitting(false);
      };
    }
  }, [navigate, clearCart]);

  const onSubmit = async (data: CheckoutForm) => {
    // Check if delivery is selected but required data is missing
    if (data.orderType === 'delivery') {
      if (!deliveryAddress.trim()) {
        toast.error('Please enter a delivery address');
        return;
      }
      // GPS coordinates are optional, but if provided, check if within range
      if (deliveryCoordinates && !isWithinRange) {
        toast.error('Sorry, delivery is not available to your location (outside 5km range)');
        return;
      }
    }

    try {
      const orderData: CreateOrderRequest = {
        customer_phone: data.customerPhone,
        customer_name: data.customerName || undefined,
        payment_method: data.paymentMethod,
        order_type: data.orderType,
        delivery_address: data.orderType === 'delivery' ? deliveryAddress : undefined,
        delivery_latitude: data.orderType === 'delivery' ? deliveryCoordinates?.lat : undefined,
        delivery_longitude: data.orderType === 'delivery' ? deliveryCoordinates?.lng : undefined,
        delivery_notes: data.orderType === 'delivery' ? deliveryNotes : undefined,
        customer_gps_location: data.orderType === 'delivery' ? customerGpsLocation : undefined,
        notes: data.notes || undefined,
        items: items.map(item => ({
          menu_item_id: item.menu_item?.id || item.menu_item_id,
          variant_id: item.variant?.id,
          quantity: item.quantity,
          notes: item.notes,
          addon_ids: item.addons.map(addon => addon.id),
        })),
      };

      setIsSubmitting(true);
      
      try {
        if (data.paymentMethod === 'card') {
          // Check if PayHere is loaded
          if (!window.payhere || !window.payhere.startPayment) {
            throw new Error('PayHere payment gateway is not available. Please try again.');
          }

          // First create the order to get the order ID
          const result = await api.post('/orders', orderData);
          console.log('Order creation result:', result.data);
          // For card payments, order is nested in data.order, for cash it's directly in data
          const orderId = (result.data as any).data?.order?.id || (result.data as any).data?.id;
          console.log('Extracted order ID:', orderId);
          
          if (!orderId) {
            throw new Error('Order ID not found in response');
          }

          // PayHere payment
          const payment = {
            sandbox: true, // Use sandbox for testing
            merchant_id: '1230547', // Your PayHere merchant ID
            return_url: `${window.location.origin}/payment/success?order_id=${orderId}`,
            cancel_url: `${window.location.origin}/payment/cancelled?order_id=${orderId}`,
            notify_url: `${window.location.origin}/api/payments/payhere/notify`,
            order_id: orderId,
            items: 'Food Order',
            amount: (subtotal + currentDeliveryFee + onlinePaymentFee).toFixed(2),
            currency: 'LKR',
            first_name: data.customerName || 'Customer',
            last_name: '',
            email: user?.email || 'customer@example.com',
            phone: data.customerPhone,
            address: data.orderType === 'delivery' ? deliveryAddress : 'Pickup',
            city: 'Colombo',
            country: 'Sri Lanka',
          };

          window.payhere.startPayment(payment);
        } else {
          // Cash payment - create order directly
          const result = await api.post('/orders', orderData);
          console.log('Order creation result:', result.data);
          // For cash payments, order is directly in data
          const orderId = (result.data as any).data?.id;
          console.log('Extracted order ID:', orderId);
          
          if (!orderId) {
            throw new Error('Order ID not found in response');
          }
          
          clearCart();
          toast.success('Order placed successfully!');
          navigate(`/order-confirmation/${orderId}`);
        }
      } catch (error) {
        console.error('Order creation failed:', error);
        toast.error('Failed to place order. Please try again.');
      } finally {
        if (data.paymentMethod !== 'card') {
          setIsSubmitting(false);
        }
        // For card payments, setIsSubmitting(false) is handled in PayHere callbacks
      }
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Review your order and complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.menu_item?.name || item.name}</h3>
                  {item.variant && (
                    <p className="text-sm text-gray-600">Size: {item.variant.name}</p>
                  )}
                  {item.addons.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.addons.map(addon => addon.name).join(', ')}
                    </p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-gray-600 italic">Note: {item.notes}</p>
                  )}
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-primary-600">
                  {formatPrice(getItemPrice(item))}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {orderType === 'delivery' && currentDeliveryFee > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Delivery Fee:
                </span>
                <span>{formatPrice(currentDeliveryFee)}</span>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="flex justify-between items-center text-sm">
                <span>Online Payment Fee (2%):</span>
                <span>{formatPrice(onlinePaymentFee)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span className="text-primary-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Contact Information</h3>

              <div>
                <Input
                  label="Phone Number *"
                  type="tel"
                  placeholder="07X XXX XXXX"
                  error={errors.customerPhone?.message}
                  {...register('customerPhone', {
                    required: 'Phone number is required',
                    validate: (value) =>
                      validatePhoneNumber(value) || 'Please enter a valid Sri Lankan phone number',
                  })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll use this to contact you about your order
                </p>
              </div>

              <div>
                <Input
                  label="Name (Optional)"
                  type="text"
                  placeholder="Your name for the order"
                  {...register('customerName')}
                />
              </div>
            </div>

            {/* Order Type */}
            <OrderTypeSelector
              orderType={orderType}
              onOrderTypeChange={(type: 'pickup' | 'delivery') => setValue('orderType', type)}
              deliveryEnabled={true}
            />

            {/* Delivery Address */}
            {orderType === 'delivery' && (
              <DeliveryAddressInput
              address={deliveryAddress}
              notes={deliveryNotes}
              coordinates={deliveryCoordinates}
              gpsLocation={gpsLocation}
              onGpsLocationChange={setGpsLocation}
              customerGpsLocation={customerGpsLocation}
              deliveryFee={deliveryFee}
              isWithinRange={isWithinRange}
              onAddressChange={setDeliveryAddress}
              onNotesChange={setDeliveryNotes}
              onCoordinatesChange={setDeliveryCoordinates}
              onCustomerGpsLocationChange={setCustomerGpsLocation}
              onDeliveryFeeChange={setDeliveryFee}
              onRangeStatusChange={setIsWithinRange}
            />
            )}

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Payment Method</h3>

              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="mr-3 text-primary-600"
                  />
                  <Banknote className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <span className="font-medium">
                       {orderType === 'delivery' ? 'Cash on Delivery' : 'Cash on Pickup'}
                     </span>
                     <p className="text-sm text-gray-600">
                       {orderType === 'delivery' ? 'Pay when your order is delivered' : 'Pay when you collect your order'}
                     </p>
                  </div>
                </label>

                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="card"
                    {...register('paymentMethod')}
                    className="mr-3 text-primary-600"
                  />
                  <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                  <div>
                    <span className="font-medium">Card Payment</span>
                    <p className="text-sm text-gray-600">Pay online with PayHere</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block font-medium text-gray-900 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                {...register('notes')}
                placeholder="Any special requests or dietary requirements..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (paymentMethod === 'card' ? 'Pay Now' : 'Place Order')}
            </Button>
          </form>

          {/* Login Prompt for Guest Users */}
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Want to track your orders?</strong>
                <span className="ml-1">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Sign in
                  </button>
                  {' '}or{' '}
                  <button
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    create an account
                  </button>
                  {' '}to save your order history.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default CheckoutPage;
