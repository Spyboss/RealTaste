import { api, handleApiResponse } from './api';
import { ApiResponse, Order, DashboardStats, AnalyticsData, DailyAnalytics, TopItem, TrendData } from '@/types/shared';

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard');
  return handleApiResponse<DashboardStats>(response);
};

export const fetchAnalytics = async (timeframe: string): Promise<AnalyticsData> => {
  const response = await api.get('/admin/analytics', { params: { timeframe } });
  return handleApiResponse<AnalyticsData>(response);
};

export const fetchDailyAnalytics = async (date?: string): Promise<DailyAnalytics> => {
  const response = await api.get('/admin/analytics/daily', { 
    params: { date } 
  });
  return handleApiResponse<DailyAnalytics>(response);
};

export const fetchTopItems = async (days: number = 1): Promise<TopItem[]> => {
  const response = await api.get('/admin/analytics/items', { 
    params: { days } 
  });
  return handleApiResponse<TopItem[]>(response);
};

export const fetchTrendsData = async (days: number = 7): Promise<TrendData[]> => {
  const response = await api.get('/admin/analytics/trends', { 
    params: { days } 
  });
  return handleApiResponse<TrendData[]>(response);
};

export const fetchOrderQueue = async (): Promise<Order[]> => {
  const response = await api.get('/admin/orders/queue');
  return handleApiResponse<Order[]>(response);
};

export const bulkUpdateOrders = async (orderIds: string[], status: string, estimated_pickup_time?: string) => {
  const response = await api.patch('/admin/orders/bulk-update', {
    orderIds,
    status,
    estimated_pickup_time
  });
  return handleApiResponse(response);
};

export const updateOrderPriority = async (orderId: string, priority: string) => {
  const response = await api.patch(`/admin/orders/${orderId}/priority`, { priority });
  return handleApiResponse(response);
};

export const assignOrderToStaff = async (orderId: string, staffId: string) => {
  const response = await api.patch(`/admin/orders/${orderId}/assign`, { staff_id: staffId });
  return handleApiResponse(response);
};
