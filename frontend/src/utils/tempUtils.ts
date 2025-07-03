// Temporary utility functions until shared package module resolution is fixed

export const formatPrice = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rs. 0.00';
  }
  return `Rs. ${amount.toFixed(2)}`;
};

export const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const calculateItemTotal = (
  basePrice: number,
  variantModifier: number = 0,
  addonPrices: number[] = [],
  quantity: number = 1
): number => {
  const itemPrice = basePrice + variantModifier;
  const addonTotal = addonPrices.reduce((sum, price) => sum + price, 0);
  return (itemPrice + addonTotal) * quantity;
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const getOrderStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    received: 'Order Received',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready_for_pickup: 'Ready for Pickup',
    ready_for_delivery: 'Ready for Delivery',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    received: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-indigo-100 text-indigo-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    ready_for_pickup: 'bg-green-100 text-green-800',
    ready_for_delivery: 'bg-emerald-100 text-emerald-800',
    picked_up: 'bg-purple-100 text-purple-800',
    delivered: 'bg-teal-100 text-teal-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Sri Lankan phone number validation
  const cleaned = phone.replace(/\D/g, '');

  // Check for valid Sri Lankan formats
  if (cleaned.startsWith('94')) {
    // International format: +94XXXXXXXXX (should be 11 digits total)
    return cleaned.length === 11;
  } else if (cleaned.startsWith('0')) {
    // Local format: 0XXXXXXXXX (should be 10 digits total)
    return cleaned.length === 10 && (cleaned.startsWith('07') || cleaned.startsWith('01'));
  }

  return false;
};
