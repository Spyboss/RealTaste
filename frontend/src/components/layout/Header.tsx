import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Menu as MenuIcon, 
  User, 
  Settings, 
  History, 
  LogOut, 
  Bell, 
  CreditCard,
  ChevronDown,
  X,
  Shield
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useBusinessStore } from '@/stores/businessStore';
import Button from '@/components/ui/Button';
import { Dropdown, DropdownItem, DropdownSeparator } from '@/components/ui/Dropdown';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems, toggleCart } = useCartStore();
  const { restaurantName, isOpen } = useBusinessStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalItems = getTotalItems();
  const isHomePage = location.pathname === '/';

  // Generate user initials from email
  const getUserInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return `${parts[0][0].toUpperCase()}. ${parts[1][0].toUpperCase()}${parts[1].slice(1)}`;
    }
    return email.split('@')[0].charAt(0).toUpperCase() + '.';
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Restaurant Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/favicon-32x32.png" 
                alt="RealTaste Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{restaurantName}</h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isOpen ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isHomePage 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Menu
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Desktop Authentication */}
            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <Dropdown
                  trigger={
                    <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {/* User Avatar */}
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      {/* User Name */}
                      <span className="text-sm font-medium text-gray-700">
                        {user?.email ? getUserInitials(user.email) : 'User'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  }
                >
                  <DropdownItem 
                    icon={<User className="w-4 h-4" />}
                    onClick={() => handleNavigation('/profile')}
                  >
                    Profile Settings
                  </DropdownItem>
                  <DropdownItem 
                    icon={<Bell className="w-4 h-4" />}
                    onClick={() => handleNavigation('/notifications')}
                  >
                    Notifications
                  </DropdownItem>
                  <DropdownItem 
                    icon={<History className="w-4 h-4" />}
                    onClick={() => handleNavigation('/orders')}
                  >
                    Order History
                  </DropdownItem>
                  <DropdownItem 
                    icon={<CreditCard className="w-4 h-4" />}
                    onClick={() => handleNavigation('/payment-methods')}
                  >
                    Payment Methods
                  </DropdownItem>
                  {user?.app_metadata?.role === 'admin' && (
                    <>
                      <DropdownSeparator />
                      <DropdownItem 
                        icon={<Shield className="w-4 h-4" />}
                        onClick={() => handleNavigation('/admin')}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        Admin Dashboard
                      </DropdownItem>
                    </>
                  )}
                  <DropdownSeparator />
                  <DropdownItem 
                    icon={<Settings className="w-4 h-4" />}
                    onClick={() => handleNavigation('/settings')}
                  >
                    Account Settings
                  </DropdownItem>
                  <DropdownItem 
                    icon={<LogOut className="w-4 h-4" />}
                    onClick={handleLogout}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </DropdownItem>
                </Dropdown>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <Link 
                  to="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isHomePage 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Menu
                </Link>
                <Link 
                  to="/about" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                >
                  Contact
                </Link>
              </div>

              {/* Mobile Authentication */}
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 px-3 py-2 mb-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user?.email ? getUserInitials(user.email) : 'User'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  {/* User Menu Items */}
                  <div className="space-y-1">
                    <button
                      onClick={() => handleNavigation('/profile')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile Settings</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/notifications')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Notifications</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/orders')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <History className="w-4 h-4" />
                      <span>Order History</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('/payment-methods')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Payment Methods</span>
                    </button>
                    {user?.app_metadata?.role === 'admin' && (
                      <button
                        onClick={() => handleNavigation('/admin')}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleNavigation('/settings')}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button variant="ghost" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link 
                    to="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full justify-center">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
