// src/pages/Reports.tsx
import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  RefreshCw,
  X,
  Plus,
  Search,
  HardDrive,
  FileSpreadsheet,
  FileJson,
  Shield,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// Type definitions
interface Report {
  id: number;
  title: string;
  report_type: 'student_allocation' | 'financial_summary' | 'ward_distribution' | 'mp_sponsorship' | 'performance' | 'compliance' | 'custom';
  description: string;
  format: 'csv' | 'json' | 'pdf' | 'excel' | 'text';
  status: 'completed' | 'processing' | 'pending' | 'failed';
  created_at: string;
  updated_at: string;
  total_students?: number;
  total_amount?: number;
  approved_count?: number;
  mp_sponsored_count?: number;
  file_size_display?: string;
  file?: string;
  file_size?: number;
  filters?: any;
  generated_by?: {
    id: number;
    username: string;
    email: string;
  };
}

interface ReportType {
  value: string;
  label: string;
}

interface ReportFilters {
  years: string[];
  wards: string[];
  education_levels: string[];
  statuses: string[];
  sponsorship_sources: string[];
}

interface Statistics {
  total_reports: number;
  this_month: number;
  pending_reports: number;
  success_rate: number;
  total_storage: number;
  storage_usage: {
    used_gb: number;
    available_gb: number;
    percentage: number;
  };
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    years: [],
    wards: [],
    education_levels: [],
    statuses: [],
    sponsorship_sources: []
  });
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    report_type: 'student_allocation' as const,
    description: '',
    format: 'csv' as 'csv' | 'json' | 'pdf' | 'excel',
    filters: {
      year: new Date().getFullYear().toString(),
      status: 'all',
      ward: 'all',
      education_level: 'all',
      sponsorship_source: 'all'
    }
  });

  const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} /> },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> },
    { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800', icon: <AlertCircle size={14} /> }
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', icon: <FileSpreadsheet size={14} /> },
    { value: 'json', label: 'JSON', icon: <FileJson size={14} /> },
    { value: 'pdf', label: 'PDF', icon: <FileText size={14} /> },
    { value: 'excel', label: 'Excel', icon: <FileSpreadsheet size={14} /> }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  // Fetch functions
  const fetchReports = async () => {
    setLoading(true);
    try {
      // In a real app, you might have a reports endpoint
      // For now, we'll derive some data from students
      const response = await api.get('/students/');
      const students = response.data.results || response.data;
      
      // Create some "virtual" reports based on real student data
      const realStatsReport: Report = {
        id: 1,
        title: 'Current Student Allocation Summary',
        report_type: 'student_allocation',
        description: `Summary of ${students.length} students currently in the system.`,
        format: 'csv',
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_students: students.length,
        total_amount: students.reduce((sum: number, s: any) => sum + parseFloat(s.amount || 0), 0),
        approved_count: students.filter((s: any) => s.status === 'approved' || s.status === 'disbursed').length,
      };

      setReports([realStatsReport]);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportTypes = async () => {
    try {
      const response = await api.get('/reports/report-types/');
      if (response.data && Array.isArray(response.data)) {
        setReportTypes(response.data);
      } else {
        setReportTypes([
          { value: 'student_allocation', label: 'Student Allocation' },
          { value: 'financial_summary', label: 'Financial Summary' },
          { value: 'ward_distribution', label: 'Ward Distribution' },
          { value: 'mp_sponsorship', label: 'MP Sponsorship' },
          { value: 'performance', label: 'Performance Analytics' },
          { value: 'compliance', label: 'Compliance Reports' },
          { value: 'custom', label: 'Custom Report' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching report types:', error);
      setReportTypes([
        { value: 'student_allocation', label: 'Student Allocation' },
        { value: 'financial_summary', label: 'Financial Summary' },
        { value: 'ward_distribution', label: 'Ward Distribution' },
        { value: 'mp_sponsorship', label: 'MP Sponsorship' },
        { value: 'performance', label: 'Performance Analytics' },
        { value: 'compliance', label: 'Compliance Reports' },
        { value: 'custom', label: 'Custom Report' }
      ]);
    }
  };

  const fetchReportFilters = async () => {
    try {
      const response = await api.get('/reports/report-filters/');
      if (response.data) {
        setFilters(response.data);
      } else {
        setFilters({
          years: ['2024', '2023', '2022', '2021'],
          wards: ['Nyangores', 'Sigor', 'Chebunyo', 'Siongiroi', 'kongasis'],
          education_levels: ['Secondary', 'University', 'College', 'TVET'],
          statuses: ['approved', 'pending', 'rejected'],
          sponsorship_sources: ['cdf', 'mp', 'other']
        });
      }
    } catch (error) {
      console.error('Error fetching report filters:', error);
      setFilters({
        years: ['2024', '2023', '2022', '2021'],
        wards: ['Nyangores', 'Sigor', 'Chebunyo', 'Siongiroi', 'kongasis'],
        education_levels: ['Secondary', 'University', 'College', 'TVET'],
        statuses: ['approved', 'pending', 'rejected'],
        sponsorship_sources: ['cdf', 'mp', 'other']
      });
    }
  };

  useEffect(() => {
    fetchReports();
    fetchReportTypes();
    fetchReportFilters();
  }, []);

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesType = selectedType === 'all' || report.report_type === selectedType;
    const matchesFormat = selectedFormat === 'all' || report.format === selectedFormat;

    return matchesSearch && matchesStatus && matchesType && matchesFormat;
  });

  // Calculate statistics
  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    processing: reports.filter(r => r.status === 'processing').length,
    pending: reports.filter(r => r.status === 'pending').length,
    failed: reports.filter(r => r.status === 'failed').length,
    totalStudents: reports.reduce((sum, r) => sum + (r.total_students || 0), 0),
    totalAmount: reports.reduce((sum, r) => sum + (r.total_amount || 0), 0)
  };

  // Action handlers
  const handleGenerateReport = async () => {
    if (!newReport.title.trim()) {
      alert('Please enter a report title');
      return;
    }

    setGeneratingReport(true);
    try {
      const response = await api.post('/reports/', newReport);
      setShowGenerateModal(false);
      setNewReport({
        title: '',
        report_type: 'student_allocation',
        description: '',
        format: 'csv',
        filters: {
          year: new Date().getFullYear().toString(),
          status: 'all',
          ward: 'all',
          education_level: 'all',
          sponsorship_source: 'all'
        }
      });
      alert('Report generation started!');
      fetchReports();
    } catch (error: any) {
      console.error('Error generating report:', error);
      alert(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (report: Report) => {
    try {
      const response = await api.get(`/reports/${report.id}/download/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${report.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      alert(error.response?.data?.error || 'Failed to download report. The report may still be processing.');
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await api.delete(`/reports/${reportId}/`);
      setReports(reports.filter(r => r.id !== reportId));
      alert('Report deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting report:', error);
      alert(error.response?.data?.error || 'Failed to delete report');
    }
  };

  const handleRegenerateReport = async (reportId: number) => {
    try {
      await api.post(`/reports/${reportId}/regenerate/`);
      alert('Report regeneration started!');
      fetchReports();
    } catch (error) {
      console.error('Error regenerating report:', error);
      alert('Failed to regenerate report');
    }
  };

  const handleQuickReport = async (reportType: string) => {
    try {
      await api.post('/reports/quick-report/', {
        report_type: reportType,
        format: 'csv',
        filters: {
          year: new Date().getFullYear().toString(),
          status: 'all'
        }
      });
      alert('Quick report generation started!');
      fetchReports();
    } catch (error: any) {
      console.error('Error generating quick report:', error);
      alert(error.response?.data?.error || 'Failed to generate quick report');
    }
  };

  const handleExportAll = () => {
    if (filteredReports.length === 0) {
      alert('No reports to export');
      return;
    }
    
    try {
      const csvData = filteredReports.map(report => ({
        Title: report.title,
        Type: report.report_type.replace('_', ' '),
        Status: report.status,
        Format: report.format.toUpperCase(),
        Created: formatDate(report.created_at),
        Students: report.total_students || 0,
        Amount: report.total_amount || 0,
        FileSize: report.file_size_display || 'N/A'
      }));
      
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chepalungu-reports-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
          <p className="text-gray-500 mt-2">Please login to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate, view and manage all Chepalungu CDF reports</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            Generate Report
          </button>
          <button 
            onClick={handleExportAll}
            disabled={loading || filteredReports.length === 0}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download size={18} className="mr-2" />
            Export All
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Reports</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Processing</p>
          <p className="text-xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-lg font-bold text-gray-900">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Current Year Students', type: 'student_allocation', icon: <Users size={16} /> },
            { label: 'Financial Overview', type: 'financial_summary', icon: <DollarSign size={16} /> },
            { label: 'Ward Breakdown', type: 'ward_distribution', icon: <BarChart3 size={16} /> },
            { label: 'MP Sponsorships', type: 'mp_sponsorship', icon: <TrendingUp size={16} /> }
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => handleQuickReport(item.type)}
              className="bg-white rounded-lg border border-blue-200 p-4 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100 mr-3">
                  <div className="text-blue-600">{item.icon}</div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">Generate now</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search reports by title or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statusOptions.map(status => (
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
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="all">All Formats</option>
              {formatOptions.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))
        ) : filteredReports.length > 0 ? (
          filteredReports.map((report) => {
            const statusConfig = statusOptions.find(s => s.value === report.status);
            const formatConfig = formatOptions.find(f => f.value === report.format);
            
            return (
              <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig?.color} flex items-center`}>
                        {statusConfig?.icon}
                        <span className="ml-1">{statusConfig?.label}</span>
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        {formatConfig?.icon}
                        <span className="ml-1 uppercase">{report.format}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedReport(report)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={18} />
                    </button>
                    {report.status === 'completed' && (
                      <button 
                        onClick={() => handleDownloadReport(report)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Download size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleRegenerateReport(report.id)}
                      disabled={report.status === 'processing'}
                      className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                    >
                      <RefreshCw size={18} className={report.status === 'processing' ? 'animate-spin' : ''} />
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText size={16} className="mr-2 text-gray-400" />
                    <span>{report.report_type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span>{formatDate(report.created_at)}</span>
                  </div>
                  {(report.file_size_display || report.file_size) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <HardDrive size={16} className="mr-2 text-gray-400" />
                      <span>{report.file_size_display || formatFileSize(report.file_size)}</span>
                    </div>
                  )}
                </div>

                {(report.total_students !== undefined || report.total_amount !== undefined) && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {report.total_students !== undefined && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600">Students</p>
                        <p className="font-bold text-gray-900">{report.total_students}</p>
                      </div>
                    )}
                    {report.total_amount !== undefined && (
                      <div className="bg-gray-50 rounded p-2">
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="font-bold text-gray-900">{formatCurrency(report.total_amount)}</p>
                      </div>
                    )}
                  </div>
                )}

                {report.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedFormat !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by generating your first report'}
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Generate First Report
            </button>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Title *
                  </label>
                  <input
                    type="text"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Student Allocation Report 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type *
                  </label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) => setNewReport({ ...newReport, report_type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format *
                  </label>
                  <select
                    value={newReport.format}
                    onChange={(e) => setNewReport({ ...newReport, format: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {formatOptions.map(format => (
                      <option key={format.value} value={format.value}>{format.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Description (Optional)
                  </label>
                  <textarea
                    value={newReport.description}
                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe what this report contains..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4">Filters</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Year</label>
                      <select
                        value={newReport.filters.year}
                        onChange={(e) => setNewReport({
                          ...newReport,
                          filters: { ...newReport.filters, year: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Years</option>
                        {filters.years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Status</label>
                      <select
                        value={newReport.filters.status}
                        onChange={(e) => setNewReport({
                          ...newReport,
                          filters: { ...newReport.filters, status: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Status</option>
                        {filters.statuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Ward</label>
                      <select
                        value={newReport.filters.ward}
                        onChange={(e) => setNewReport({
                          ...newReport,
                          filters: { ...newReport.filters, ward: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Wards</option>
                        {filters.wards.map(ward => (
                          <option key={ward} value={ward}>{ward}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Education Level</label>
                      <select
                        value={newReport.filters.education_level}
                        onChange={(e) => setNewReport({
                          ...newReport,
                          filters: { ...newReport.filters, education_level: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Levels</option>
                        {filters.education_levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Sponsorship Source</label>
                      <select
                        value={newReport.filters.sponsorship_source}
                        onChange={(e) => setNewReport({
                          ...newReport,
                          filters: { ...newReport.filters, sponsorship_source: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All Sources</option>
                        {filters.sponsorship_sources?.map(source => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport || !newReport.title.trim()}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                      (generatingReport || !newReport.title.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {generatingReport ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin inline mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Report'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedReport.title}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    {(() => {
                      const statusConfig = statusOptions.find(s => s.value === selectedReport.status);
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusConfig?.color}`}>
                          {statusConfig?.icon}
                          <span className="ml-1">{statusConfig?.label}</span>
                        </span>
                      );
                    })()}
                    <span className="text-sm text-gray-500">Format: {selectedReport.format.toUpperCase()}</span>
                    <span className="text-sm text-gray-500">Created: {formatDate(selectedReport.created_at)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="font-medium">{selectedReport.report_type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Created:</span>
                          <span className="font-medium">{formatDate(selectedReport.created_at)}</span>
                        </div>
                        {(selectedReport.file_size_display || selectedReport.file_size) && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">File Size:</span>
                            <span className="font-medium">{selectedReport.file_size_display || formatFileSize(selectedReport.file_size)}</span>
                          </div>
                        )}
                        {selectedReport.generated_by && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Generated By:</span>
                            <span className="font-medium">{selectedReport.generated_by.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedReport.total_students !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Total Students</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.total_students}</p>
                          </div>
                        )}
                        {selectedReport.total_amount !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedReport.total_amount)}</p>
                          </div>
                        )}
                        {selectedReport.approved_count !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.approved_count}</p>
                          </div>
                        )}
                        {selectedReport.mp_sponsored_count !== undefined && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600">MP Sponsored</p>
                            <p className="text-lg font-bold text-gray-900">{selectedReport.mp_sponsored_count}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedReport.description && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                {selectedReport.filters && Object.keys(selectedReport.filters).length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Applied Filters</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(selectedReport.filters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedReport.status === 'completed' && (
                    <button
                      onClick={() => handleDownloadReport(selectedReport)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download Report
                    </button>
                  )}
                  <button
                    onClick={() => handleRegenerateReport(selectedReport.id)}
                    disabled={selectedReport.status === 'processing'}
                    className={`px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 ${
                      selectedReport.status === 'processing' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Regenerate Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;