import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ItemPerformance from './ItemPerformance';
import SalesChart from './SalesChart';
import { Calendar, RefreshCw, Download, TrendingUp, Package, DollarSign } from 'lucide-react';
import { formatPrice } from '@/utils/tempUtils';

const AnalyticsSummary: React.FC = () => {
  const {
    dailySummary,
    topItems,
    trendsData,
    loadingDaily,
    loadingItems,
    loadingTrends,
    error,
    fetchDailySummary,
    fetchTopItems,
    fetchTrendsData,
    lastUpdated,
  } = useAdminStore((state) => ({
    dailySummary: state.dailySummary,
    topItems: state.topItems,
    trendsData: state.trendsData,
    loadingDaily: state.loadingDaily,
    loadingItems: state.loadingItems,
    loadingTrends: state.loadingTrends,
    error: state.error,
    fetchDailySummary: state.fetchDailySummary,
    fetchTopItems: state.fetchTopItems,
    fetchTrendsData: state.fetchTrendsData,
    lastUpdated: state.lastUpdated,
  }));

  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(7);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  useEffect(() => {
    fetchDailySummary(selectedDate);
    fetchTopItems(selectedTimeframe);
    fetchTrendsData(selectedTimeframe);
  }, [selectedTimeframe, selectedDate, fetchDailySummary, fetchTopItems, fetchTrendsData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDailySummary(selectedDate);
      fetchTopItems(selectedTimeframe);
      fetchTrendsData(selectedTimeframe);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedDate, selectedTimeframe, fetchDailySummary, fetchTopItems, fetchTrendsData]);

  const handleRefresh = () => {
    fetchDailySummary(selectedDate);
    fetchTopItems(selectedTimeframe);
    fetchTrendsData(selectedTimeframe);
  };

  const handleExportData = () => {
    const data = {
      dailySummary,
      topItems,
      trendsData,
      exportDate: new Date().toISOString(),
      timeframe: selectedTimeframe
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `realtaste-analytics-${selectedDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLoading = loadingDaily || loadingItems || loadingTrends;

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-100 rounded-md">
        <div className="flex items-center justify-between">
          <span>Error: {error}</span>
          <button
            onClick={handleRefresh}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Timeframe Selector */}
          <div className="flex space-x-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedTimeframe(days)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === days
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export */}
          <button
            onClick={handleExportData}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-40 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailySummary && (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Package className="w-4 h-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailySummary.total_orders}</div>
                    <p className="text-xs text-muted-foreground">Orders for {selectedDate}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(dailySummary.total_revenue)}</div>
                    <p className="text-xs text-muted-foreground">Total revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(dailySummary.avg_order_value)}</div>
                    <p className="text-xs text-muted-foreground">Average per order</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <Package className="w-4 h-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dailySummary.completed_orders}</div>
                    <p className="text-xs text-muted-foreground">Completed orders</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Charts and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ItemPerformance items={topItems} isLoading={loadingItems} />
            <SalesChart data={trendsData} isLoading={loadingTrends} />
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsSummary;