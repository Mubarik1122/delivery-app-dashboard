import React from 'react';
import { Bell, Search, User, ChevronDown, Settings, LogOut, UserCircle } from 'lucide-react';

interface HeaderProps {
  onProfileAction: (action: 'profile' | 'logout' | 'login') => void;
  userRole: 'admin' | 'vendor';
}

export default function Header({ onProfileAction, userRole }: HeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search - Hidden on mobile, shown on tablet+ */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Menu..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          {/* Mobile search button */}
          <button className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Notifications */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </button>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 cursor-pointer group p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden lg:block">
              <div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 capitalize">{userRole}</span>
                <div className="text-xs text-gray-500">Master {userRole}</div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-800 hidden lg:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    onProfileAction('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <UserCircle className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    onProfileAction('logout');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}