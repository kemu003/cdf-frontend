import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'home' },
    { name: 'Students', href: '/students', icon: 'users' },
    { name: 'Student Allocations', href: '/student-allocations', icon: 'cash' },
    { name: 'Reports', href: '/reports', icon: 'document-chart-bar' },
    { name: 'Admin', href: '/admin', icon: 'cog', adminOnly: true },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-white">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <h1 className="text-xl font-bold">Chepalungu CDF</h1>
        </div>
        <nav className="mt-6">
          {navigation.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {/* Icon placeholder */}
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-64 overflow-auto">
        {/* Top bar */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name || 'User'}!</h2>
              <p className="text-sm text-gray-600">{user?.role}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;