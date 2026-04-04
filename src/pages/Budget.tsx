import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  ArrowUpRight, 
  Plus, 
  Edit2, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { bursariesAPI, api } from '../services/api';

const Budget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await bursariesAPI.getBudgetOverview();
      setOverview(res.data);
      setEditData(res.data);
    } catch (error) {
      console.error("Failed to fetch budget", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBudget = async () => {
    try {
      setLoading(true);
      // Use budget_id from the overview response
      await bursariesAPI.updateBudget(overview.budget_id, { total_budget: editData.total_budget });
      
      // Update each ward's total allocation (remaining is computed server-side)
      for (const ward of editData.wards) {
        await api.patch(`/bursaries/wards/${ward.id}/`, {
          total_allocated: ward.total_allocated,
        });
      }
      
      setIsEditing(false);
      fetchData();
      alert("Budget updated successfully!");
    } catch (error: any) {
      console.error("Failed to update budget", error);
      alert(error.message || "Failed to update budget. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWardBudgetChange = (id: number, field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setEditData({
      ...editData,
      wards: editData.wards.map((w: any) => 
        w.id === id ? { ...w, [field]: numericValue } : w
      )
    });
  };

  if (loading) return <div className="p-8 text-center">Loading budget management...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-500">Financial Year 2026 Constituency & Ward Allocations</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
            <span>Manage Budget</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            <button 
              onClick={handleUpdateBudget}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total CDF Budget</span>
          </div>
          {isEditing ? (
            <input 
              type="number" 
              className="text-2xl font-bold text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none bg-blue-50"
              value={editData?.total_budget}
              onChange={(e) => setEditData({...editData, total_budget: parseFloat(e.target.value)})}
            />
          ) : (
            <p className="text-2xl font-bold text-gray-900">KES {overview?.total_budget.toLocaleString()}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">Allocated for FY 2026</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <Wallet size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Remaining Balance</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">KES {overview?.remaining_budget.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Available for allocation</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <PieChart size={24} />
            </div>
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Utilization</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {(((overview?.total_budget - overview?.remaining_budget) / overview?.total_budget) * 100).toFixed(1)}%
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${((overview?.total_budget - overview?.remaining_budget) / overview?.total_budget) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Ward Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Ward-Specific Allocations</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 italic">
            <AlertCircle size={16} />
            <span>Student bursaries are automatically deducted from these balances.</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Ward Name</th>
                <th className="px-6 py-4">Students</th>
                <th className="px-6 py-4">Total Sub-Allocation</th>
                <th className="px-6 py-4">Remaining Balance</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(isEditing ? editData.wards : overview?.wards).map((ward: any) => (
                <tr key={ward.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{ward.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ward.student_count || 0} students
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {isEditing ? (
                      <input 
                        type="number"
                        className="border-b border-blue-300 focus:outline-none focus:border-blue-600 px-1 py-0.5 w-32 bg-blue-50/30"
                        value={ward.total_allocated}
                        onChange={(e) => handleWardBudgetChange(ward.id, 'total_allocated', e.target.value)}
                      />
                    ) : (
                      `KES ${ward.total_allocated.toLocaleString()}`
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${ward.remaining_balance < 100000 ? 'text-red-600' : 'text-green-600'}`}>
                      KES {Number(ward.remaining_balance).toLocaleString()}
                    </span>
                    {isEditing && (
                      <span className="block text-xs text-gray-400 mt-1">Auto-computed from allocations</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${(ward.remaining_balance / ward.total_allocated) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {((ward.remaining_balance / ward.total_allocated) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Budget;