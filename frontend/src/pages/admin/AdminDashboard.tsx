import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAdminStore } from '@/stores/adminStore';
import { fetchDashboardStats, fetchOrderQueue, fetchDailyAnalytics, fetchTopItems, fetchTrendsData } from '@/services/adminService';
import { useBulkUpdateOrders } from '@/hooks/useAdmin';
import DashboardStats from '@/components/admin/DashboardStats';
import OrderQueue from '@/components/admin/OrderQueue';
import Layout from '@/components/layout/Layout';
import { LayoutGrid, BarChart2, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Order } from '@/types/shared';
import AnalyticsSummary from '@/components/admin/AnalyticsSummary';
import SalesChart from '@/components/admin/SalesChart';
import ItemPerformance from '@/components/admin/ItemPerformance';

const AdminDashboard: React.FC = () => {
  const {
    dashboardStats,
    orderQueue,
    lastUpdated,
    isRealtimeConnected,
    isPollingFallback,
    setOrderQueue,
    subscribeToOrders,
    fetchDailySummary,
    fetchTopItems,
    fetchTrendsData
  } = useAdminStore();
  
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const isQueueLoading = useAdminStore(state => state.isLoading);

  // Initialize realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToOrders();
    return unsubscribe;
  }, [subscribeToOrders]);

  // Fetch initial order queue
  const { isLoading: isInitialQueueLoading } = useQuery(
    'orderQueue',
    () => {
      return fetchOrderQueue().then((orders: Order[]) => {
        setOrderQueue(orders);
        return orders;
      });
    },
    { enabled: orderQueue.length === 0 }
  );

  const { data: dashboardStatsData, isLoading: isDashboardLoading } = useQuery(
    'dashboardStats',
    fetchDashboardStats
  );

  // Fetch analytics data when tab is selected
  useEffect(() => {
    if (selectedTab === 'analytics') {
      fetchDailySummary();
      fetchTopItems();
      fetchTrendsData();
    }
  }, [selectedTab, fetchDailySummary, fetchTopItems, fetchTrendsData]);
  
  const bulkUpdateMutation = useBulkUpdateOrders();
  
  const handlePriorityChange = (orderId: string, priority: string) => {
    bulkUpdateMutation.mutate({
      orderIds: [orderId],
      priority,
    });
  };

  // Status indicator component
  const renderStatusIndicator = () => {
    if (isPollingFallback) {
      return (
        <div className="flex items-center text-yellow-600">
          <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
          <span>Polling</span>
        </div>
      );
    }
    return isRealtimeConnected ? (
      <div className="flex items-center text-green-600">
        <Wifi className="w-4 h-4 mr-1" />
        <span>Realtime</span>
      </div>
    ) : (
      <div className="flex items-center text-red-600">
        <WifiOff className="w-4 h-4 mr-1" />
        <span>Disconnected</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            {renderStatusIndicator()}
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTab('dashboard')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'dashboard'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'analytics'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setSelectedTab('orderQueue')}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === 'orderQueue'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            Order Queue
          </button>
        </div>

        {selectedTab === 'dashboard' && (
          <DashboardStats
            stats={dashboardStats || dashboardStatsData}
            isLoading={isDashboardLoading}
          />
        )}

        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Analytics Dashboard</h3>
              <p className="text-blue-600">Analytics features coming soon!</p>
              <p className="text-sm text-blue-500 mt-2">
                We're working on bringing you detailed sales analytics and performance metrics.
              </p>
            </div>
          </div>
        )}

        {selectedTab === 'orderQueue' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {(isQueueLoading || isInitialQueueLoading) ? (
              <div className="p-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading order queue...</p>
              </div>
            ) : (
              <OrderQueue
                orders={orderQueue}
                isLoading={false}
                onPriorityChange={handlePriorityChange}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
