import React from 'react';
import { TrendingUp, Clock, DollarSign, Package, Users } from 'lucide-react';
import { formatPrice } from '@/utils/tempUtils';
import { DashboardStats as DashboardStatsType, Order } from '@/types/shared';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  isLoading: boolean;
}

interface PopularItem {
  name: string;
  count: number;
  revenue: number;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
        {icon}
      </div>
    </div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const { stats: data } = stats;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders (All Time)"
          value={data.total_completed_orders}
          icon={<Package className="w-6 h-6" />}
          color="text-blue-600"
          subtitle={`${data.total_orders} ${stats.timeframe}`}
        />
        
        <StatCard
          title="Revenue"
          value={formatPrice(data.total_revenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="text-green-600"
          subtitle={`${stats.timeframe} total`}
        />
        
        <StatCard
          title="Avg Order Value"
          value={formatPrice(data.avg_order_value)}
          icon={<TrendingUp className="w-6 h-6" />}
          color="text-purple-600"
        />
        
        <StatCard
          title="Avg Prep Time"
          value={`${data.avg_prep_time}m`}
          icon={<Clock className="w-6 h-6" />}
          color="text-orange-600"
          subtitle="minutes"
        />
      </div>

      {/* Daily Completed Orders Stats */}
      {stats.daily_completed_stats && stats.daily_completed_stats.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Completed Orders (Last 7 Days)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {stats.daily_completed_stats.map((day, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">{day.date}</div>
                <div className="text-lg font-semibold text-gray-900">{day.completed_orders}</div>
                <div className="text-xs text-gray-600">{formatPrice(day.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Queue</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            stats.queue_length === 0 
              ? 'bg-green-100 text-green-800' 
              : stats.queue_length <= 3 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {stats.queue_length} orders pending
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {stats.pending_orders.filter((o: Order) => o.status === 'received').length} received
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {stats.pending_orders.filter((o: Order) => o.status === 'preparing').length} preparing
            </span>
          </div>
        </div>
      </div>

      {/* Popular Items */}
      {data.popular_items.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Items</h3>
          <div className="space-y-3">
            {data.popular_items.slice(0, 5).map((item: PopularItem, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{item.count} sold</div>
                  <div className="text-xs text-gray-500">{formatPrice(item.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
