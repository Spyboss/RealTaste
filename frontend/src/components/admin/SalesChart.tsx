import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminStore } from '@/stores/adminStore';

const SalesChart: React.FC = () => {
  const { trendsData, loadingTrends } = useAdminStore();

  if (loadingTrends) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-80 flex items-center justify-center">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (!trendsData || trendsData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-80 flex items-center justify-center">
        <p>No data available for the selected period</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={trendsData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `Rs. ${value}`}
          />
          <Tooltip
            formatter={(value) => [`Rs. ${value}`, 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="Revenue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;