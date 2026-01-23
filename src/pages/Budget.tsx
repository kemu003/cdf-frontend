import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Download,
  Filter,
  Calendar,
  Wallet,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Award,
  Building,
  Users,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface BudgetItem {
  id: number;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on_track' | 'overspent' | 'under_utilized';
  description: string;
  year: string;
  last_updated: string;
}

interface BudgetTransaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'allocation' | 'expense' | 'adjustment';
  category: string;
  reference: string;
  status: 'completed' | 'pending' | 'cancelled';
}

const Budget: React.FC = () => {
  const { user } = useAuth();
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [transactions, setTransactions] = useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: 'Education & Bursaries' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'health', label: 'Health Services' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'youth', label: 'Youth & Sports' },
    { value: 'women', label: 'Women Development' },
    { value: 'administration', label: 'Administration' },
    { value: 'emergency', label: 'Emergency Fund' }
  ];

  const years = ['2024', '2023', '2022', '2021', '2020'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      // Fetch budget data
      const budgetResponse = await api.get('/budget/');
      setBudgetData(budgetResponse.data);

      // Fetch transactions
      const transactionsResponse = await api.get('/budget/transactions/');
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // Mock data for demonstration
      setBudgetData([
        { id: 1, category: 'education', allocated: 25000000, spent: 18500000, remaining: 6500000, percentage: 74, status: 'on_track', description: 'Student bursaries and scholarships', year: '2024', last_updated: '2024-01-15' },
        { id: 2, category: 'infrastructure', allocated: 15000000, spent: 8500000, remaining: 6500000, percentage: 57, status: 'under_utilized', description: 'Roads, schools, and health centers', year: '2024', last_updated: '2024-01-10' },
        { id: 3, category: 'health', allocated: 8000000, spent: 6500000, remaining: 1500000, percentage: 81, status: 'on_track', description: 'Medical equipment and supplies', year: '2024', last_updated: '2024-01-12' },
        { id: 4, category: 'agriculture', allocated: 6000000, spent: 4500000, remaining: 1500000, percentage: 75, status: 'on_track', description: 'Farm inputs and training', year: '2024', last_updated: '2024-01-08' },
        { id: 5, category: 'youth', allocated: 5000000, spent: 4800000, remaining: 200000, percentage: 96, status: 'overspent', description: 'Youth empowerment programs', year: '2024', last_updated: '2024-01-14' }
      ]);

      setTransactions([
        { id: 1, date: '2024-01-15', description: 'Q1 Student Bursaries Disbursement', amount: 12000000, type: 'expense', category: 'education', reference: 'BUR-2024-001', status: 'completed' },
        { id: 2, date: '2024-01-10', description: 'Road Construction - Phase 1', amount: 5000000, type: 'expense', category: 'infrastructure', reference: 'INF-2024-001', status: 'completed' },
        { id: 3, date: '2024-01-12', description: 'Medical Equipment Purchase', amount: 3500000, type: 'expense', category: 'health', reference: 'HLT-2024-001', status: 'completed' },
        { id: 4, date: '2024-01-08', description: 'Farm Inputs Distribution', amount: 3000000, type: 'expense', category: 'agriculture', reference: 'AGR-2024-001', status: 'completed' },
        { id: 5, date: '2024-01-14', description: 'Youth Sports Tournament', amount: 2500000, type: 'expense', category: 'youth', reference: 'YTH-2024-001', status: 'completed' },
        { id: 6, date: '2024-01-05', description: 'Annual Budget Allocation', amount: 50000000, type: 'allocation', category: 'administration', reference: 'ALLOC-2024', status: 'completed' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [selectedYear]);

  const filteredBudget = budgetData.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedYear !== 'all' && item.year !== selectedYear) return false;
    return true;
  });

  const totalAllocated = filteredBudget.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = filteredBudget.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const utilizationRate = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  const stats = [
    {
      title: 'Total Budget',
      value: formatCurrency(totalAllocated),
      change: '+8.5%',
      isPositive: true,
      icon: <DollarSign size={24} className="text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      change: '+12.2%',
      isPositive: true,
      icon: <TrendingDown size={24} className="text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Remaining',
      value: formatCurrency(totalRemaining),
      change: '-3.7%',
      isPositive: false,
      icon: <Wallet size={24} className="text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Utilization Rate',
      value: `${utilizationRate}%`,
      change: '+5.1%',
      isPositive: true,
      icon: <Target size={24} className="text-white" />,
      color: 'bg-yellow-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'overspent': return 'bg-red-100 text-red-800';
      case 'under_utilized': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track': return <CheckCircle size={16} className="text-green-500" />;
      case 'overspent': return <AlertCircle size={16} className="text-red-500" />;
      case 'under_utilized': return <Clock size={16} className="text-yellow-500" />;
      default: return null;
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'committee')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">You need admin or committee privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-2">Manage and track Chepalungu CDF budget allocations and expenditures</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchBudgetData}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Add Budget Item
          </button>
          <button 
            onClick={() => setShowTransactionForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DollarSign size={18} className="mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.isPositive ? (
                    <TrendingUp size={16} className="text-green-500" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500" />
                  )}
                  <span className={`text-sm font-medium ml-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Download size={16} className="mr-1" />
              Export Report
            </button>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <BarChart3 size={16} className="mr-1" />
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Budget Categories</h2>
            <p className="text-sm text-gray-600 mt-1">Detailed breakdown by category</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredBudget.length > 0 ? (
                  filteredBudget.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {categories.find(c => c.value === item.category)?.label || item.category}
                          </div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.allocated)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.spent)}</div>
                        <div className="text-xs text-gray-500">{item.percentage}% utilized</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.remaining)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            <span className="ml-1">
                              {item.status === 'on_track' ? 'On Track' : 
                               item.status === 'overspent' ? 'Overspent' : 'Under Utilized'}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">No budget data found for the selected filters</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-600 mt-1">Latest budget activities</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'allocation' ? 'bg-green-100' :
                        transaction.type === 'expense' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <DollarSign size={18} className={
                          transaction.type === 'allocation' ? 'text-green-600' :
                          transaction.type === 'expense' ? 'text-red-600' : 'text-blue-600'
                        } />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'allocation' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'allocation' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.reference}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent transactions</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(
                      transactions.filter(t => t.type === 'allocation')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatCurrency(
                      transactions.filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Charts Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Budget Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Category Distribution</h3>
            <div className="space-y-4">
              {budgetData.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {categories.find(c => c.value === item.category)?.label}
                    </span>
                    <span className="text-gray-600">{formatCurrency(item.allocated)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${(item.allocated / totalAllocated) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Utilization by Category</h3>
            <div className="space-y-4">
              {budgetData.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {categories.find(c => c.value === item.category)?.label}
                    </span>
                    <span className="text-gray-600">{item.percentage}% utilized</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.percentage > 90 ? 'bg-red-500' :
                        item.percentage > 70 ? 'bg-green-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Forms would go here */}
    </div>
  );
};

export default Budget;