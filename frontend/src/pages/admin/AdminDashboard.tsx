import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BarChart3, Package, Users, Settings } from 'lucide-react';

// Admin components (we'll create these)
const AdminOverview = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Overview</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Today's Orders</h3>
        <p className="text-3xl font-bold text-primary-600 mt-2">12</p>
        <p className="text-sm text-gray-600 mt-1">+3 from yesterday</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">Rs. 8,450</p>
        <p className="text-sm text-gray-600 mt-1">+12% from yesterday</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Pending Orders</h3>
        <p className="text-3xl font-bold text-yellow-600 mt-2">3</p>
        <p className="text-sm text-gray-600 mt-1">Needs attention</p>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Avg Order Value</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">Rs. 704</p>
        <p className="text-sm text-gray-600 mt-1">-2% from yesterday</p>
      </div>
    </div>
  </div>
);

const AdminOrders = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h2>
    <p className="text-gray-600">Order management interface coming soon...</p>
  </div>
);

const AdminMenu = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Menu Management</h2>
    <p className="text-gray-600">Menu management interface coming soon...</p>
  </div>
);

const AdminSettings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
    <p className="text-gray-600">Settings interface coming soon...</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: BarChart3, current: location.pathname === '/admin' },
    { name: 'Orders', href: '/admin/orders', icon: Package, current: location.pathname === '/admin/orders' },
    { name: 'Menu', href: '/admin/menu', icon: Users, current: location.pathname === '/admin/menu' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: location.pathname === '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <div className="px-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
