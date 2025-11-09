import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, CheckSquare } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg">
                <CheckSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TaskMaster</h1>
                <p className="text-xs text-gray-500">Stay organized</p>
              </div>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1">
                <User className="w-4 h-4" />
                <span>Welcome!</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-gray-600">
              © 2024 TaskMaster. Stay productive.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Built with React + Vite</span>
              <span className="hidden sm:inline">•</span>
              <span>Powered by Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;