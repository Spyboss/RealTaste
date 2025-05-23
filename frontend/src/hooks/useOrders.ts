import { useQuery, useMutation, useQueryClient } from 'react-query';
import { orderService } from '@/services/orderService';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../types/shared';
import toast from 'react-hot-toast';

export const useOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        toast.success('Order placed successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to place order');
        throw error;
      },
    }
  );
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation(
    ({
      id,
      statusData
    }: {
      id: string;
      statusData: UpdateOrderStatusRequest
    }) => orderService.updateOrderStatus(id, statusData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['order', data.id]);
        toast.success('Order status updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update order status');
      },
    }
  );
};
