import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as adminService from '@/services/adminService';
import { useAdminStore } from '@/stores/adminStore';
import toast from 'react-hot-toast';
import { Order } from '@/types/shared';

// Define BulkUpdateRequest locally
interface BulkUpdateRequest {
  orderIds: string[];
  status: string;
  estimated_pickup_time?: string;
}

export const useDashboardStats = (timeframe: 'today' | 'week' | 'month' = 'today') => {
  const setDashboardStats = useAdminStore(state => state.setDashboardStats);
  const setError = useAdminStore(state => state.setError);

  return useQuery({
    queryKey: ['admin', 'dashboard', timeframe],
    queryFn: () => adminService.fetchDashboardStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    onSuccess: (data) => {
      setDashboardStats(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to fetch dashboard stats');
    },
  });
};

export const useOrderQueue = () => {
  const setOrderQueue = useAdminStore(state => state.setOrderQueue);
  const setError = useAdminStore(state => state.setError);

  return useQuery({
    queryKey: ['admin', 'orderQueue'],
    queryFn: adminService.fetchOrderQueue,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    onSuccess: (data: Order[]) => {
      setOrderQueue(data);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to fetch order queue');
    },
  });
};

export const useBulkUpdateOrders = () => {
  const queryClient = useQueryClient();
  const clearSelection = useAdminStore(state => state.clearSelection);

  return useMutation(
    (data: BulkUpdateRequest) => adminService.bulkUpdateOrders(data.orderIds, data.status, data.estimated_pickup_time),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['admin', 'orderQueue']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
        clearSelection();
        toast.success(`${variables.orderIds.length} orders updated successfully!`);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update orders');
      },
    }
  );
};

export const useUpdateOrderPriority = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ orderId, priority }: { orderId: string; priority: string }) => 
      adminService.updateOrderPriority(orderId, priority),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin', 'orderQueue']);
        queryClient.invalidateQueries(['admin', 'dashboard']);
        toast.success('Order priority updated!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update priority');
      },
    }
  );
};

export const useAnalytics = (days: number = 7) => {
  return useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => adminService.fetchAnalytics(days ? days.toString() : '7'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
