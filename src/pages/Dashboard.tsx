import React from 'react';
import {
  Users,
  DollarSign,
  FileCheck,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
  Home,
  FileText,
  BarChart3,
  Bell,
  Clock
} from 'lucide-react';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, isPositive, icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <div className="flex items-center mt-2">
          {isPositive ? (
            <ArrowUp size={16} className="text-green-500" />
          ) : (
            <ArrowDown size={16} className="text-red-500" />
          )}
          <span className={`text-sm font-medium ml-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </span>
          <span className="text-sm text-gray-500 ml-2">from last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12.5%',
      isPositive: true,
      icon: <Users size={24} className="text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Allocation',
      value: 'KSh 12.5M',
      change: '+8.2%',
      isPositive: true,
      icon: <DollarSign size={24} className="text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Applications',
      value: '156',
      change: '-3.2%',
      isPositive: false,
      icon: <FileCheck size={24} className="text-white" />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Completion Rate',
      value: '94.2%',
      change: '+2.1%',
      isPositive: true,
      icon: <TrendingUp size={24} className="text-white" />,
      color: 'bg-purple-500'
    }
  ];

  const recentActivities = [
    { id: 1, student: 'John Kamau', action: 'Allocation approved', amount: 'KSh 45,000', time: '2 mins ago', status: 'approved' },
    { id: 2, student: 'Mary Wanjiku', action: 'Application submitted', amount: 'KSh 60,000', time: '15 mins ago', status: 'pending' },
    { id: 3, student: 'Peter Ochieng', action: 'Disbursement made', amount: 'KSh 30,000', time: '1 hour ago', status: 'completed' },
    { id: 4, student: 'Sarah Muthoni', action: 'Documents verified', amount: '-', time: '2 hours ago', status: 'verified' },
    { id: 5, student: 'David Mutua', action: 'Application rejected', amount: 'KSh 50,000', time: '5 hours ago', status: 'rejected' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Administrator! 👋</h1>
            <p className="text-blue-100 mt-2">Here's what's happening with Chepalungu CDF today.</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Calendar size={20} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    activity.status === 'approved' ? 'bg-green-100' :
                    activity.status === 'pending' ? 'bg-yellow-100' :
                    activity.status === 'completed' ? 'bg-blue-100' :
                    activity.status === 'verified' ? 'bg-purple-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-xs font-semibold ${
                      activity.status === 'approved' ? 'text-green-600' :
                      activity.status === 'pending' ? 'text-yellow-600' :
                      activity.status === 'completed' ? 'text-blue-600' :
                      activity.status === 'verified' ? 'text-purple-600' : 'text-red-600'
                    }`}>
                      {activity.action.split(' ')[0][0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.student}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{activity.amount}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              New Student Application
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-4 rounded-lg border border-blue-600 transition-colors">
              Process Disbursement
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors">
              Generate Report
            </button>
            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors">
              View Analytics
            </button>
          </div>

          {/* Allocation Summary */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-4">Allocation Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="font-medium">KSh 50,000,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Allocated</span>
                <span className="font-medium text-green-600">KSh 32,500,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Remaining</span>
                <span className="font-medium text-blue-600">KSh 17,500,000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;