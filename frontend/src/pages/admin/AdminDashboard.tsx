import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useUpdateOrderPriority } from '@/hooks/useAdmin';
import DashboardStats from '@/components/admin/DashboardStats';
import OrderQueue from '@/components/admin/OrderQueue';
import NotificationCenter from '@/components/admin/NotificationCenter';
import PerformanceMonitor from '@/components/admin/PerformanceMonitor';
import { LayoutGrid, BarChart2, Clock, ListOrdered, Activity } from 'lucide-react';
import { Order, DashboardStats as DashboardStatsType } from '@/types/shared';
import AnalyticsSummary from '@/components/admin/AnalyticsSummary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import OrderManagementPage from '@/pages/admin/OrderManagementPage';

const AdminDashboard: React.FC = () => {
  const {
    orderQueue,
    dailySummary,
    topItems,
    trendsData,
    isLoading: adminStoreLoading,
    error: adminStoreError,
    fetchDailySummary: storeFetchDailySummary,
    fetchTopItems: storeFetchTopItems,
    fetchTrendsData: storeFetchTrendsData,
    subscribeToOrders: storeSubscribeToOrders,
    lastUpdated,
    isRealtimeConnected,
  } = useAdminStore(
    (state) => ({
      orderQueue: state.orderQueue,
      dailySummary: state.dailySummary,
      topItems: state.topItems,
      trendsData: state.trendsData,
      isLoading: state.isLoading,
      error: state.error,
      fetchDailySummary: state.fetchDailySummary,
      fetchTopItems: state.fetchTopItems,
      fetchTrendsData: state.fetchTrendsData,
      subscribeToOrders: state.subscribeToOrders,
      lastUpdated: state.lastUpdated,
      isRealtimeConnected: state.isRealtimeConnected,
    })
  );

  const [activeTab, setActiveTab] = useState('dashboard');
  const isQueueLoading = useAdminStore(state => state.isLoading);

  const { mutate: updatePriority } = useUpdateOrderPriority();

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'analytics') {
      storeFetchDailySummary();
      storeFetchTopItems();
      storeFetchTrendsData();
    }

    // Initialize realtime subscription
    const unsubscribe = storeSubscribeToOrders();

    return () => {
      console.log('AdminDashboard unmounting - cleaning up realtime subscription');
      unsubscribe();
    };
  }, []);

  const handlePriorityChange = (orderId: string, priority: number) => {
    updatePriority({ orderId, priority: String(priority) });
  };

  const dashboardStatsData: DashboardStatsType | null =
    dailySummary && topItems && trendsData ? {
      timeframe: 'today',
      stats: {
        total_revenue: dailySummary.total_revenue || 0,
        total_orders: dailySummary.total_orders || 0,
        avg_order_value: dailySummary.avg_order_value || 0,
        completed_orders: 0,
        avg_prep_time: 0,
        popular_items: topItems.map(item => ({ name: item.name, count: item.quantity, revenue: item.revenue })),
      },
      chart_data: trendsData.map(td => ({ label: td.date, orders: td.orders, revenue: td.revenue })),
      pending_orders: orderQueue.filter(o => o.status === 'received' || o.status === 'preparing'),
      queue_length: orderQueue.filter(o => o.status === 'received' || o.status === 'preparing').length,
    } : null;

  const renderStatusIndicator = () => {
    if (isRealtimeConnected) {
      return <div className="flex items-center text-green-600"><Clock className="w-4 h-4 mr-1" /> Real-time Active</div>;
    }
    return <div className="flex items-center text-red-600"><Clock className="w-4 h-4 mr-1" /> Real-time Disconnected</div>;
  };

  const renderContent = () => {
    if (adminStoreLoading && activeTab !== 'orderQueue') {
      return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (adminStoreError) {
      console.error('AdminDashboard API error:', adminStoreError);

      // Check if error is HTML content
      if (typeof adminStoreError === 'string' && adminStoreError.includes('<!doctype html>')) {
        return (
          <div className="text-red-500 p-4 bg-red-100 rounded-md">
            Error: Server returned an unexpected response. Please try again later.
          </div>
        );
      }

      return (
        <div className="text-red-500 p-4 bg-red-100 rounded-md">
          Error: {adminStoreError}
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={dashboardStatsData} isLoading={adminStoreLoading && !dailySummary} />;
      case 'analytics':
        return <AnalyticsSummary />;
      case 'orderManagement':
        return <OrderManagementPage />;
      case 'performance':
        return <PerformanceMonitor />;
      default:
        return null;
    }
  };

  return (
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
          <NotificationCenter />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('orderQueue')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orderQueue'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Order Queue
        </button>
        <button
          onClick={() => setActiveTab('orderManagement')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'orderManagement'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ListOrdered className="w-4 h-4 mr-2" />
          Order Management
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'performance'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 mr-2" />
          Performance
        </button>
      </div>

      {activeTab === 'orderQueue' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isQueueLoading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading order queue...</p>
            </div>
          ) : (
            <OrderQueue
              orders={orderQueue as Order[]}
              isLoading={isQueueLoading}
              onPriorityChange={handlePriorityChange}
            />
          )}
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default AdminDashboard;
