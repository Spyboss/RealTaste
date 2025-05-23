import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { CreateOrderRequest } from '../types/shared';
import { formatPrice, validatePhoneNumber } from '@/utils/tempUtils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface CheckoutForm {
  customerPhone: string;
  customerName?: string;
  paymentMethod: 'card' | 'cash';
  notes?: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getItemPrice, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const createOrderMutation = useCreateOrder();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    defaultValues: {
      customerPhone: '',
      customerName: user?.user_metadata?.first_name || '',
      paymentMethod: 'cash',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const totalPrice = getTotalPrice();

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

  const onSubmit = async (data: CheckoutForm) => {
    try {
      const orderData: CreateOrderRequest = {
        customer_phone: data.customerPhone,
        customer_name: data.customerName || undefined,
        payment_method: data.paymentMethod,
        notes: data.notes || undefined,
        items: items.map(item => ({
          menu_item_id: item.menu_item?.id || item.menu_item_id,
          variant_id: item.variant?.id,
          quantity: item.quantity,
          notes: item.notes,
          addon_ids: item.addons.map(addon => addon.id),
        })),
      };

      const order = await createOrderMutation.mutateAsync(orderData);

      // Clear cart and redirect to order details
      clearCart();
      navigate(`/orders/${order.id}`);

      toast.success('Order placed successfully!');
    } catch (error) {
      // Error is handled by the mutation
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

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
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
                    <span className="font-medium">Cash on Pickup</span>
                    <p className="text-sm text-gray-600">Pay when you collect your order</p>
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
              loading={createOrderMutation.isLoading}
              className="w-full"
              size="lg"
            >
              {paymentMethod === 'cash' ? 'Place Order' : 'Proceed to Payment'}
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
