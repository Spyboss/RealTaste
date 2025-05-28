import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatPrice } from '@/utils/tempUtils';
import { AnalyticsData } from '@/types/shared';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface AnalyticsProps {
  stats: AnalyticsData | null;
  isLoading: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ stats, isLoading }) => {
  const [chartType, setChartType] = useState<'orders' | 'revenue'>('orders');

  const handleExport = () => {
    if (!stats || stats.stats.length === 0) return;

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Prepare data for export
    const exportData = stats.stats.map(day => ({
      Date: day.date,
      Orders: day.total_orders,
      Revenue: day.total_revenue,
      AvgOrderValue: day.avg_order_value,
      PopularItems: day.popular_items.map(item => `${item.menu_item_name} (${item.quantity_sold} sold)`).join(', ')
    }));

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: ['Date', 'Orders', 'Revenue', 'Avg Order Value', 'Popular Items'],
    });

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');

    // Generate the Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Save the file
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `real_taste_analytics_${stats.timeframe}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats || stats.stats.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  // Convert daily stats to chart format
  const chartData = stats.stats.map(day => ({
    label: day.date,
    orders: day.total_orders,
    revenue: day.total_revenue
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {chartType === 'orders' ? (
            <p className="text-blue-600">
              Orders: <span className="font-semibold">{payload[0].value}</span>
            </p>
          ) : (
            <p className="text-green-600">
              Revenue: <span className="font-semibold">{formatPrice(payload[0].value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Analytics - {stats.timeframe}
        </h3>

        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('orders')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              chartType === 'orders'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setChartType('revenue')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              chartType === 'revenue'
                ? 'bg-green-100 text-green-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'orders' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="orders"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(value) => `Rs. ${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-lg font-semibold text-gray-900">
            {chartData.reduce((sum, item) => sum + item.orders, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatPrice(chartData.reduce((sum, item) => sum + item.revenue, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Peak Day</p>
          <p className="text-lg font-semibold text-gray-900">
            {chartData.reduce((max, item) =>
              item.orders > max.orders ? item : max, chartData[0]
            )?.label || 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg per Day</p>
          <p className="text-lg font-semibold text-gray-900">
            {Math.round(chartData.reduce((sum, item) => sum + item.orders, 0) / chartData.length)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
