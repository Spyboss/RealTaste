import React, { useState, useEffect } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  avgOrderProcessingTime: number;
  orderCompletionRate: number;
  peakHourOrders: number;
  currentQueueLength: number;
  systemLoad: 'low' | 'medium' | 'high';
}

const PerformanceMonitor: React.FC = () => {
  const { orderQueue, dailySummary, isRealtimeConnected } = useAdminStore((state) => ({
    orderQueue: state.orderQueue,
    dailySummary: state.dailySummary,
    isRealtimeConnected: state.isRealtimeConnected,
  }));

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgOrderProcessingTime: 0,
    orderCompletionRate: 0,
    peakHourOrders: 0,
    currentQueueLength: 0,
    systemLoad: 'low'
  });

  useEffect(() => {
    // Calculate performance metrics
    const calculateMetrics = () => {
      const currentQueueLength = orderQueue.length;
      
      // Calculate average processing time (mock calculation)
      const avgProcessingTime = orderQueue.length > 0 
        ? orderQueue.reduce((acc, order) => {
            const orderAge = Date.now() - new Date(order.created_at).getTime();
            return acc + (orderAge / 60000); // Convert to minutes
          }, 0) / orderQueue.length
        : 0;

      // Calculate completion rate
      const totalOrders = dailySummary?.total_orders || 0;
      const completedOrders = dailySummary?.completed_orders || 0;
      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      // Determine system load based on queue length
      let systemLoad: 'low' | 'medium' | 'high' = 'low';
      if (currentQueueLength > 10) systemLoad = 'high';
      else if (currentQueueLength > 5) systemLoad = 'medium';

      setMetrics({
        avgOrderProcessingTime: Math.round(avgProcessingTime),
        orderCompletionRate: Math.round(completionRate),
        peakHourOrders: Math.max(totalOrders, 0),
        currentQueueLength,
        systemLoad
      });
    };

    calculateMetrics();
    
    // Update metrics every 30 seconds
    const interval = setInterval(calculateMetrics, 30000);
    return () => clearInterval(interval);
  }, [orderQueue, dailySummary]);

  const getSystemLoadColor = (load: string) => {
    switch (load) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getSystemLoadIcon = (load: string) => {
    switch (load) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isRealtimeConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgOrderProcessingTime}m</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgOrderProcessingTime > 30 ? 'Above target' : 'Within target'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.orderCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.orderCompletionRate > 90 ? 'Excellent' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Queue</CardTitle>
            <Activity className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentQueueLength}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.currentQueueLength === 0 ? 'All caught up!' : 'Orders pending'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
            {getSystemLoadIcon(metrics.systemLoad)}
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getSystemLoadColor(metrics.systemLoad)}`}>
              {metrics.systemLoad.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on queue length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      {(metrics.avgOrderProcessingTime > 30 || metrics.currentQueueLength > 10) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-orange-800">Performance Alert</h4>
                <p className="text-sm text-orange-700">
                  {metrics.avgOrderProcessingTime > 30 && "Order processing time is above target. "}
                  {metrics.currentQueueLength > 10 && "Queue length is high - consider adding more staff."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors">
              Refresh Data
            </button>
            <button className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors">
              Export Report
            </button>
            <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 transition-colors">
              View Trends
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
