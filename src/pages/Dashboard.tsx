import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  FileCheck,
  TrendingUp,
  Home,
  FileText,
  BarChart3,
  Bell,
  Clock,
  PieChart,
  Shield,
  ArrowUpRight,
  Wallet,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { bursariesAPI, studentsAPI } from '../services/api';

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
        </div>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [budgetOverview, setBudgetOverview] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [budgetRes, studentsRes] = await Promise.all([
          bursariesAPI.getBudgetOverview(),
          studentsAPI.getAll()
        ]);

        const budgetData = budgetRes.data;
        setBudgetOverview(budgetData);

        const students = studentsRes.data.results || studentsRes.data;
        const verifiedStudents = students.filter((s: any) => s.status === 'approved' || s.status === 'disbursed').length;

        setStats([
          {
            title: 'Total Students',
            value: students.length.toString(),
            change: '+12.5%',
            isPositive: true,
            icon: <Users size={24} className="text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Verified Students',
            value: verifiedStudents.toString(),
            change: '+8.2%',
            isPositive: true,
            icon: <FileCheck size={24} className="text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Total Budget (2026)',
            value: `KES ${(budgetData.total_budget / 1000000).toFixed(1)}M`,
            change: 'FY 2026',
            isPositive: true,
            icon: <Wallet size={24} className="text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Remaining Funds',
            value: `KES ${(budgetData.remaining_budget / 1000000).toFixed(1)}M`,
            change: `${((budgetData.remaining_budget / budgetData.total_budget) * 100).toFixed(1)}%`,
            isPositive: true,
            icon: <TrendingUp size={24} className="text-white" />,
            color: 'bg-orange-500'
          }
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Chepalungu CDF: Streamlining Constituency Development Funds for a better and brighter future</h1>
        <p className="text-blue-100 mt-2">Financial Overview & Bursary Management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Overview - Ward Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Ward Fund Distribution</h2>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {budgetOverview?.wards.map((ward: any) => (
              <div key={ward.id}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">{ward.name}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ward.student_count || 0} students
                    </span>
                  </div>
                  <span className="text-gray-500">
                    KES {ward.remaining_balance.toLocaleString()} / KES {ward.total_allocated.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(ward.remaining_balance / ward.total_allocated) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Budget Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Global Budget 2026</h2>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 font-medium">Total Allocated</p>
              <p className="text-2xl font-bold text-blue-900">KES {budgetOverview?.total_budget.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-green-600 font-medium">Currently Remaining</p>
              <p className="text-2xl font-bold text-green-900">KES {budgetOverview?.remaining_budget.toLocaleString()}</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Utilization Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {(((budgetOverview?.total_budget - budgetOverview?.remaining_budget) / budgetOverview?.total_budget) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${((budgetOverview?.total_budget - budgetOverview?.remaining_budget) / budgetOverview?.total_budget) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;