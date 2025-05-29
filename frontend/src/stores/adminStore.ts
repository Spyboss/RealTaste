import { create } from 'zustand';
import { Order, DashboardStats } from '../types/shared';
import { supabase, subscribeToOrderQueue } from '@/services/supabase';
import { useAuthStore } from './authStore';

import { DailyAnalytics, TopItem, TrendData } from '../types/shared';

interface AdminState {
  // Dashboard data
  dashboardStats: DashboardStats | null;
  orderQueue: Order[];
  selectedOrders: string[];

  // Analytics data
  dailySummary: DailyAnalytics | null;
  topItems: TopItem[];
  trendsData: TrendData[];

  // Loading states
  isLoading: boolean;
  loadingDaily: boolean;
  loadingItems: boolean;
  loadingTrends: boolean;

  error: string | null;
  lastUpdated: Date | null;

  // Sound settings
  soundEnabled: boolean;

  // Realtime connection state
  isRealtimeConnected: boolean;
  connectionAttempts: number;
  isPollingFallback: boolean;

  // Queue management
  queueFilters: {
    status: Order['status'][] | 'all';
    priority: string | 'all';
    timeRange: string;
  };

  // Notifications
  notifications: Array<{
    id: string;
    type: 'new_order' | 'status_change' | 'priority_change';
    message: string;
    timestamp: Date;
    read: boolean;
  }>;

  // Actions
  setDashboardStats: (stats: DashboardStats) => void;
  setOrderQueue: (orders: Order[]) => void;
  setSelectedOrders: (orderIds: string[]) => void;
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: () => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  updateLastUpdated: () => void;
  setRealtimeStatus: (connected: boolean) => void;
  setPollingFallback: (isPolling: boolean) => void;

  // Analytics actions
  fetchDailySummary: (date?: string) => Promise<void>;
  fetchTopItems: (days?: number) => Promise<void>;
  fetchTrendsData: (days?: number) => Promise<void>;

  // New actions for admin order management
  fetchAllAdminOrders: () => Promise<void>;
  updateAdminOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;

  // Real-time updates
  addNewOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;

  // Queue management actions
  setQueueFilters: (filters: Partial<AdminState['queueFilters']>) => void;
  fetchOrderQueue: () => Promise<void>;
  bulkUpdateOrderStatus: (orderIds: string[], status: Order['status']) => Promise<boolean>;

  // Notification actions
  addNotification: (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Subscription management
  subscribeToOrders: () => () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://realtaste.fly.dev/api';

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  dashboardStats: null,
  orderQueue: [],
  selectedOrders: [],
  dailySummary: null,
  topItems: [],
  trendsData: [],
  isLoading: false,
  loadingDaily: false,
  loadingItems: false,
  loadingTrends: false,
  error: null,
  lastUpdated: null,
  soundEnabled: true,
  isRealtimeConnected: false,
  connectionAttempts: 0,
  isPollingFallback: false,

  // Queue management
  queueFilters: {
    status: 'all',
    priority: 'all',
    timeRange: 'today'
  },

  // Notifications
  notifications: [],

  // Actions
  setDashboardStats: (stats) => set({ dashboardStats: stats, lastUpdated: new Date() }),
  setOrderQueue: (orders) => set({ orderQueue: orders, lastUpdated: new Date() }),
  setSelectedOrders: (orderIds) => set({ selectedOrders: orderIds }),
  toggleOrderSelection: (orderId) => {
    const { selectedOrders } = get();
    const newSelection = selectedOrders.includes(orderId)
      ? selectedOrders.filter(id => id !== orderId)
      : [...selectedOrders, orderId];
    set({ selectedOrders: newSelection });
  },
  selectAllOrders: () => {
    const { orderQueue } = get();
    set({ selectedOrders: orderQueue.map(order => order.id) });
  },
  clearSelection: () => set({ selectedOrders: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  updateLastUpdated: () => set({ lastUpdated: new Date() }),
  setRealtimeStatus: (connected) => set({ isRealtimeConnected: connected }),
  setPollingFallback: (isPolling) => set({ isPollingFallback: isPolling }),

  // Analytics actions
  fetchDailySummary: async (date?: string) => {
    set({ loadingDaily: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ loadingDaily: false, error: 'Authentication token not found.' });
      return;
    }

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/admin/daily-summary?date=${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fetchDailySummary API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('fetchDailySummary JSON parse error. Response text:', responseText.substring(0, 500));
        throw new Error('Failed to parse server response as JSON. Content: ' + responseText.substring(0, 200) + '...');
      }

      if (result.success && result.data) {
        set({ dailySummary: result.data, loadingDaily: false });
      } else {
        throw new Error(result.error || 'Failed to fetch daily summary: Invalid response structure');
      }
    } catch (error: any) {
      console.error('fetchDailySummary caught error:', error);
      set({ loadingDaily: false, error: error.message || 'Failed to fetch daily summary' });
    }
  },

  fetchTopItems: async (days: number = 7) => {
    set({ loadingItems: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ loadingItems: false, error: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/top-items?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fetchTopItems API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success && result.data) {
        set({ topItems: result.data, loadingItems: false });
      } else {
        throw new Error(result.error || 'Failed to fetch top items: Invalid response structure');
      }
    } catch (error: any) {
      console.error('fetchTopItems error:', error);
      set({ loadingItems: false, error: error.message || 'Failed to fetch top items' });
    }
  },

  fetchTrendsData: async (days: number = 7) => {
    set({ loadingTrends: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ loadingTrends: false, error: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/trends?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fetchTrendsData API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success && result.data) {
        set({ trendsData: result.data, loadingTrends: false });
      } else {
        throw new Error(result.error || 'Failed to fetch trends data: Invalid response structure');
      }
    } catch (error: any) {
      console.error('fetchTrendsData error:', error);
      set({ loadingTrends: false, error: error.message || 'Failed to fetch trends data: ' + error.message });
    }
  },

  // New actions for admin order management
  fetchAllAdminOrders: async () => {
    set({ isLoading: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ isLoading: false, error: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fetchAllAdminOrders API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success && result.data) {
        set({ orderQueue: result.data, isLoading: false, lastUpdated: new Date() });
      } else {
        throw new Error(result.error || 'Failed to fetch orders: Invalid response structure');
      }
    } catch (error: any) {
      console.error('fetchAllAdminOrders error:', error);
      set({ isLoading: false, error: error.message || 'Failed to fetch orders' });
    }
  },

  updateAdminOrderStatus: async (orderId: string, status: Order['status']) => {
    set({ isLoading: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ isLoading: false, error: 'Authentication token not found.' });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('updateAdminOrderStatus API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success && result.data) {
        get().updateOrder(orderId, { ...result.data, status: result.data.status, updated_at: result.data.updated_at || new Date().toISOString() });
        set({ isLoading: false, lastUpdated: new Date() });
        return true;
      } else {
        throw new Error(result.error || 'Failed to update order status: Invalid response structure');
      }
    } catch (error: any) {
      console.error('updateAdminOrderStatus error:', error);
      set({ isLoading: false, error: error.message || 'Failed to update order status' });
      return false;
    }
  },

  // Real-time updates
  addNewOrder: (order) => {
    const { orderQueue, soundEnabled, addNotification } = get();

    // Add to queue if it's a pending order
    if (['received', 'preparing'].includes(order.status)) {
      const newQueue = [order, ...orderQueue].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      set({ orderQueue: newQueue, lastUpdated: new Date() });

      // Add notification
      addNotification({
        type: 'new_order',
        message: `New order #${order.id.substring(0, 8)} received`,
        read: false
      });

      // Play sound notification
      if (soundEnabled) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(console.warn);
        } catch (error) {
          console.warn('Could not play notification sound:', error);
        }
      }
    }
  },

  updateOrder: (orderId, updates) => {
    const { orderQueue } = get();
    const updatedQueue = orderQueue.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    ).filter(order => ['received', 'preparing'].includes(order.status));

    set({ orderQueue: updatedQueue, lastUpdated: new Date() });
  },

  removeOrder: (orderId) => {
    const { orderQueue, selectedOrders } = get();
    const newQueue = orderQueue.filter(order => order.id !== orderId);
    const newSelection = selectedOrders.filter(id => id !== orderId);

    set({
      orderQueue: newQueue,
      selectedOrders: newSelection,
      lastUpdated: new Date()
    });
  },

  // Queue management actions
  setQueueFilters: (filters) => {
    const { queueFilters } = get();
    set({ queueFilters: { ...queueFilters, ...filters } });
  },

  fetchOrderQueue: async () => {
    set({ isLoading: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ isLoading: false, error: 'Authentication token not found.' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/queue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('fetchOrderQueue API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success && result.data) {
        set({ orderQueue: result.data, isLoading: false, lastUpdated: new Date() });
      } else {
        throw new Error(result.error || 'Failed to fetch order queue: Invalid response structure');
      }
    } catch (error: any) {
      console.error('fetchOrderQueue error:', error);
      set({ isLoading: false, error: error.message || 'Failed to fetch order queue' });
    }
  },

  bulkUpdateOrderStatus: async (orderIds: string[], status: Order['status']) => {
    set({ isLoading: true, error: null });
    const token = useAuthStore.getState().session?.access_token;

    if (!token) {
      set({ isLoading: false, error: 'Authentication token not found.' });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/bulk-update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds, status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('bulkUpdateOrderStatus API !response.ok. Status:', response.status, 'Response text:', errorText.substring(0, 500));

        // Check if response is HTML
        if (errorText.includes('<!doctype html>')) {
          throw new Error('Server returned an unexpected HTML response. Please try again later.');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 200)}...`);
        }
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        const { orderQueue } = get();
        const updatedQueue = orderQueue.map(order =>
          orderIds.includes(order.id) ? { ...order, status, updated_at: new Date().toISOString() } : order
        );
        set({ orderQueue: updatedQueue, isLoading: false, lastUpdated: new Date() });
        return true;
      } else {
        throw new Error(result.error || 'Failed to bulk update orders: Invalid response structure');
      }
    } catch (error: any) {
      console.error('bulkUpdateOrderStatus error:', error);
      set({ isLoading: false, error: error.message || 'Failed to bulk update orders' });
      return false;
    }
  },

  // Notification actions
  addNotification: (notification) => {
    const { notifications } = get();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    set({ notifications: [newNotification, ...notifications].slice(0, 50) }); // Keep only last 50
  },

  markNotificationRead: (id) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    set({ notifications: updatedNotifications });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Subscription management
  subscribeToOrders: () => {
    const { setRealtimeStatus, setPollingFallback, addNewOrder, updateOrder, removeOrder } = get();
    let reconnectAttempts = 0;
    let fallbackPolling: NodeJS.Timeout | null = null;

    const reconnect = () => {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      setTimeout(initRealtime, delay);
    };

    const startPolling = () => {
      setPollingFallback(true);
      if (fallbackPolling) clearInterval(fallbackPolling);
      // Polling logic would go here
    };

    const generalCleanup = () => {
      setRealtimeStatus(false);
      if (fallbackPolling) clearInterval(fallbackPolling);
    };

    const initRealtime = () => {
      let channel: any;
      try {
        channel = subscribeToOrderQueue((payload) => {
          if (payload.eventType === 'INSERT') {
            addNewOrder(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            updateOrder(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            removeOrder(payload.old.id);
          }
        }, (status: string, err?: Error) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus(true);
            reconnectAttempts = 0;
            if (fallbackPolling) {
              clearInterval(fallbackPolling);
              setPollingFallback(false);
            }
            console.log('Realtime: SUBSCRIBED to', channel.topic);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime: CHANNEL_ERROR on', channel.topic, err);
            setRealtimeStatus(false);
            if (reconnectAttempts < 5) reconnect(); else startPolling();
          } else if (status === 'TIMED_OUT') {
            console.error('Realtime: TIMED_OUT on', channel.topic, err);
            setRealtimeStatus(false);
            if (reconnectAttempts < 5) reconnect(); else startPolling();
          } else if (status === 'CLOSED') {
            console.log('Realtime: CLOSED for', channel.topic);
            setRealtimeStatus(false);
          }
        });

        return () => {
          if (channel) {
            console.log('Realtime: Attempting to remove channel:', channel.topic);
            supabase.removeChannel(channel)
              .then(status => console.log('Realtime: Channel removal status for', channel.topic, '-', status))
              .catch(error => console.error('Realtime: Error removing channel', channel.topic, '-', error));
          }
          generalCleanup();
        };
      } catch (error) {
        console.error('Error initializing realtime subscription process:', error);
        startPolling();
        return () => {
          if (channel) {
            console.log('Realtime (init error cleanup): Attempting to remove channel:', channel.topic);
            supabase.removeChannel(channel)
              .then(status => console.log('Realtime (init error cleanup): Channel removal status for', channel.topic, '-', status))
              .catch(error => console.error('Realtime (init error cleanup): Error removing channel', channel.topic, '-', error));
          }
          generalCleanup();
        };
      }
    };

    return initRealtime();
  },
}));
