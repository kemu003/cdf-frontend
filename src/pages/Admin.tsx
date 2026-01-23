import React from 'react';
import { Shield, Users, Settings, Award } from 'lucide-react';

const Admin: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600">Manage system settings and users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold mt-2">24</p>
            </div>
            <Users className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold mt-2">8</p>
            </div>
            <Shield className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Health</p>
              <p className="text-2xl font-bold mt-2">100%</p>
            </div>
            <Settings className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Wards</p>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
            <Award className="text-yellow-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-center transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Manage Users</span>
          </button>
          <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-center transition-colors">
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">System Settings</span>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-center transition-colors">
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Manage Wards</span>
          </button>
          <button className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg text-center transition-colors">
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Permissions</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Version</h3>
            <p className="text-gray-600">Chepalungu CDF System v1.0.0</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Last Updated</h3>
            <p className="text-gray-600">December 2024</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Database</h3>
            <p className="text-gray-600">PostgreSQL 14.0</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">API Status</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;