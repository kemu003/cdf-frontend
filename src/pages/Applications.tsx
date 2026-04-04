import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Building,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Application {
  id: number;
  applicant_name: string;
  applicant_id: string;
  type: 'bursary' | 'project' | 'emergency' | 'other';
  category: string;
  amount_requested: number;
  amount_approved: number;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'disbursed';
  date_submitted: string;
  ward: string;
  contact: string;
  email: string;
  description: string;
  documents: string[];
  reviewer_notes?: string;
  reviewed_by?: string;
  reviewed_date?: string;
}

const Applications: React.FC = () => {
  const { user, isAdmin, isCommittee } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
    { value: 'reviewing', label: 'Reviewing', color: 'bg-blue-100 text-blue-800', icon: <Eye size={14} /> },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle size={14} /> },
    { value: 'disbursed', label: 'Disbursed', color: 'bg-purple-100 text-purple-800', icon: <CheckCircle size={14} /> }
  ];

  const types = [
    { value: 'bursary', label: 'Bursary Application' },
    { value: 'project', label: 'Project Funding' },
    { value: 'emergency', label: 'Emergency Aid' },
    { value: 'other', label: 'Other' }
  ];

  const wards = ['Nyangores', 'Sigor', 'Chebunyo', 'Siongiroi', 'kongasis'];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/students/');
      const results = response.data.results || response.data;
      const formattedApps: Application[] = results.map((s: any) => ({
        id: s.id,
        applicant_name: s.name,
        applicant_id: s.registration_no,
        type: 'bursary',
        category: s.education_level || 'General',
        amount_requested: parseFloat(s.amount || 0),
        amount_approved: s.status === 'approved' ? parseFloat(s.amount || 0) : 0,
        status: s.status || 'pending',
        date_submitted: s.date_applied || new Date().toISOString(),
        ward: s.ward,
        contact: s.phone || s.guardian_phone || 'N/A',
        email: s.email || 'N/A',
        description: `Bursary application for ${s.institution}`,
        documents: []
      }));
      setApplications(formattedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || app.status === selectedStatus;
    const matchesType = selectedType === 'all' || app.type === selectedType;
    const matchesWard = selectedWard === 'all' || app.ward === selectedWard;

    return matchesSearch && matchesStatus && matchesType && matchesWard;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved' || a.status === 'disbursed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    totalRequested: applications.reduce((sum, a) => sum + a.amount_requested, 0),
    totalApproved: applications.reduce((sum, a) => sum + (a.amount_approved || 0), 0)
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      if (newStatus === 'approved') {
        await api.put(`/students/${id}/approve/`);
      } else if (newStatus === 'rejected') {
        const reason = window.prompt('Enter rejection reason:');
        if (!reason) return;
        await api.put(`/students/${id}/reject/`, { reason });
      }
      fetchApplications();
      alert(`Application status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  if (!user || (!isAdmin && !isCommittee && user.role !== 'admin' && user.role !== 'committee')) {
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
          <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
          <p className="text-gray-600 mt-2">Review and process Chepalungu CDF applications</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => {/* Navigate to new application form */}}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            New Application
          </button>
          <button 
            onClick={() => {/* Export functionality */}}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Reviewing</p>
          <p className="text-xl font-bold text-blue-600">{stats.reviewing}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Requested</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRequested)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search applications by name, ID, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="all">All Wards</option>
              {wards.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map((application) => {
                  const statusConfig = statuses.find(s => s.value === application.status);
                  return (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{application.applicant_name}</div>
                          <div className="text-sm text-gray-500">{application.applicant_id}</div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Phone size={12} className="mr-1" />
                            {application.contact}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {types.find(t => t.value === application.type)?.label}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{application.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{application.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(application.amount_requested)}
                        </div>
                        {application.amount_approved > 0 && (
                          <div className="text-sm text-green-600">
                            Approved: {formatCurrency(application.amount_approved)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {application.ward}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusConfig?.color}`}>
                          {statusConfig?.icon}
                          <span className="ml-1">{statusConfig?.label}</span>
                        </span>
                        {application.reviewed_by && (
                          <div className="text-xs text-gray-500 mt-1">By: {application.reviewed_by}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.date_submitted).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedApplication(application)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {(user.role === 'admin' || user.role === 'committee') && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => {
                                  const notes = prompt('Enter rejection reason:');
                                  if (notes) handleStatusUpdate(application.id, 'rejected', notes);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-gray-500">No applications found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Applicant Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="font-medium">{selectedApplication.applicant_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Application ID:</span>
                        <span className="font-medium">{selectedApplication.applicant_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Contact:</span>
                        <span className="font-medium">{selectedApplication.contact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="font-medium">{selectedApplication.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Application Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span className="font-medium">
                          {types.find(t => t.value === selectedApplication.type)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Category:</span>
                        <span className="font-medium">{selectedApplication.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ward:</span>
                        <span className="font-medium">{selectedApplication.ward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date Submitted:</span>
                        <span className="font-medium">
                          {new Date(selectedApplication.date_submitted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">Financial Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Amount Requested</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(selectedApplication.amount_requested)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Amount Approved</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(selectedApplication.amount_approved || 0)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="mt-1">
                        {(() => {
                          const statusConfig = statuses.find(s => s.value === selectedApplication.status);
                          return (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusConfig?.color}`}>
                              {statusConfig?.icon}
                              <span className="ml-1">{statusConfig?.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedApplication.description}
                  </p>
                </div>

                {/* Review Notes */}
                {selectedApplication.reviewer_notes && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Reviewer Notes</h3>
                    <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">
                      {selectedApplication.reviewer_notes}
                    </p>
                    {selectedApplication.reviewed_by && (
                      <p className="text-sm text-gray-500 mt-2">
                        Reviewed by: {selectedApplication.reviewed_by} on{' '}
                        {selectedApplication.reviewed_date ? 
                          new Date(selectedApplication.reviewed_date).toLocaleDateString() : 'N/A'}
                      </p>
                    )}
                  </div>
                )}

                {/* Documents */}
                {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Attached Documents</h3>
                    <div className="space-y-2">
                      {selectedApplication.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <FileText size={16} className="text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{doc}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {user.role === 'admin' && selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'reviewing')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Mark as Reviewing
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve Application
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;