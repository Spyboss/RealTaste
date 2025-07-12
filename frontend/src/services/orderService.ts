import { api, handleApiResponse } from './api';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest, CreateOrderResponse } from '../types/shared';

export const orderService = {
  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<CreateOrderResponse> => {
    const response = await api.post('/orders', orderData);
    return handleApiResponse(response);
  },

  // Get orders (user's orders or all orders for admin)
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await api.get('/orders', { params });
    return handleApiResponse(response);
  },

  // Get specific order
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return handleApiResponse(response);
  },

  // Admin: Update order status
  updateOrderStatus: async (
    id: string,
    statusData: UpdateOrderStatusRequest
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, statusData);
    return handleApiResponse(response);
  },

  // Customer: Cancel order
  cancelOrder: async (id: string): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/cancel`);
    return handleApiResponse(response);
  },
};
