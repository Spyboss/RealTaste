import { create } from 'zustand';
import { Order, DashboardStats } from '../types/shared';
import { subscribeToOrderQueue } from '@/services/supabase';

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
  
  // Real-time updates
  addNewOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  
  // Subscription management
  subscribeToOrders: () => () => void;
}

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
  fetchDailySummary: async (_date?: string) => {
    set({ loadingDaily: true, error: null });
    try {
      // Actual API call would go here
      // const data = await adminService.getDailyAnalytics(date);
      // set({ dailySummary: data });
    } catch (error) {
      set({ error: 'Failed to fetch daily summary' });
    } finally {
      set({ loadingDaily: false });
    }
  },
  
  fetchTopItems: async (_days?: number) => {
    set({ loadingItems: true, error: null });
    try {
      // Actual API call would go here
      // const data = await adminService.getTopItems(days);
      // set({ topItems: data });
    } catch (error) {
      set({ error: 'Failed to fetch top items' });
    } finally {
      set({ loadingItems: false });
    }
  },
  
  fetchTrendsData: async (_days?: number) => {
    set({ loadingTrends: true, error: null });
    try {
      // Actual API call would go here
      // const data = await adminService.getTrendsData(days);
      // set({ trendsData: data });
    } catch (error) {
      set({ error: 'Failed to fetch trends data' });
    } finally {
      set({ loadingTrends: false });
    }
  },

  // Real-time updates
  addNewOrder: (order) => {
    const { orderQueue, soundEnabled } = get();
    
    // Add to queue if it's a pending order
    if (['received', 'preparing'].includes(order.status)) {
      const newQueue = [order, ...orderQueue].sort((a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      set({ orderQueue: newQueue, lastUpdated: new Date() });
      
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
  
  // Subscription management
  subscribeToOrders: () => {
    const { setRealtimeStatus, setPollingFallback, addNewOrder, updateOrder, removeOrder } = get();
    let reconnectAttempts = 0;
    let fallbackPolling: NodeJS.Timeout | null = null;
    
    // Exponential backoff function
    const reconnect = () => {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30s delay
      setTimeout(initRealtime, delay);
    };
    
    // Fallback to polling
    const startPolling = () => {
      setPollingFallback(true);
      if (fallbackPolling) clearInterval(fallbackPolling);
      // Implement actual polling logic here (not shown for brevity)
      // For example, periodically call fetchOrderQueue()
    };
    
    // Cleanup function
    const cleanup = () => {
      setRealtimeStatus(false);
      if (fallbackPolling) clearInterval(fallbackPolling);
    };
    
    // Realtime subscription handler
    const initRealtime = () => {
      let channel: any; // Declare channel here to be accessible in return cleanup
      try {
        channel = subscribeToOrderQueue((payload) => { // subscribeToOrderQueue returns the channel
          if (payload.eventType === 'INSERT') {
            addNewOrder(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            updateOrder(payload.new.id, payload.new);
          } else if (payload.eventType === 'DELETE') {
            removeOrder(payload.old.id);
          }
        });
        
        channel.subscribe((status: string, err?: Error) => {
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus(true);
            reconnectAttempts = 0;
            if (fallbackPolling) {
              clearInterval(fallbackPolling);
              setPollingFallback(false);
            }
            console.log('Realtime: SUBSCRIBED');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime: CHANNEL_ERROR', err);
            setRealtimeStatus(false);
            if (reconnectAttempts < 5) {
              reconnect();
            } else {
              startPolling();
            }
          } else if (status === 'TIMED_OUT') {
            console.error('Realtime: TIMED_OUT', err);
            setRealtimeStatus(false);
            if (reconnectAttempts < 5) {
              reconnect();
            } else {
              startPolling();
            }
          } else if (status === 'CLOSED') {
            console.log('Realtime: CLOSED');
            setRealtimeStatus(false);
            // Optionally attempt to reconnect or just wait for next manual init/app refresh
          }
        });
        
        return () => {
          if (channel) {
            // Supabase client might handle removal differently,
            // but channel.unsubscribe() is standard for a specific channel.
            // Or use supabase.removeChannel(channel) if channel object and supabase client are in scope.
            channel.unsubscribe(); 
          }
          cleanup();
        };
      } catch (error) {
        console.error('Error initializing realtime:', error);
        startPolling(); // Fallback to polling on initial setup error
        return () => { // Ensure cleanup is returned even if setup fails
            if (channel) {
              channel.unsubscribe();
            }
            cleanup();
        };
      }
    };
    
    // Initialize realtime
    return initRealtime();
  },
}));
