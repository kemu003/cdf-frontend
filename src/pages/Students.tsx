import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  GraduationCap,
  Building,
  Award,
  Mail,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Loader,
  Shield,
  X,
  RefreshCw,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Layers,
  UserCheck,
  Badge,
  Target,
  Crown,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, studentsAPI } from '../services/api';

interface Student {
  id: number;
  name: string;
  admissionNumber: string;
  institution: string;
  course: string;
  ward: string;
  status: 'approved' | 'pending' | 'rejected' | 'disbursed';
  allocatedAmount: string;
  contact: string;
  registration_no: string;
  phone?: string | null;
  guardian_phone?: string | null;
  year: string;
  date_applied: string;
  education_level: string;
  sms_status: 'not_sent' | 'sent' | 'failed' | 'partial';
  amount: number;
  // Sponsorship fields
  sponsorship_source: 'cdf' | 'mp' | 'other';
  sponsor_name?: string;
  sponsorship_date?: string;
  sponsorship_amount?: number;
  sponsor_details?: string;
  // New fields from backend
  date_processed?: string;
  rejection_reason?: string;
  total_allocation?: number;
}

interface YearData {
  value: string;
  label: string;
  count: number;
  totalAmount: number;
  approvedCount: number;
  pendingCount: number;
  mpSponsoredCount: number;
  mpSponsoredAmount: number;
}

interface MPSponsorshipSummary {
  totalMpSponsored: number;
  totalMpAmount: number;
  mpStudentsByWard: Record<string, number>;
  mpStudentsByYear: Record<string, number>;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
  description?: string;
}> = ({ title, value, change, isPositive, icon, color, description }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
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

const YearFilterCard: React.FC<{
  yearData: YearData;
  isSelected: boolean;
  onClick: () => void;
  isCurrentYear: boolean;
}> = ({ yearData, isSelected, onClick, isCurrentYear }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
      isSelected
        ? 'bg-blue-50 border-blue-300 shadow-sm'
        : 'bg-white border-gray-200'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <Calendar size={18} className={isCurrentYear ? 'text-blue-600' : 'text-gray-500'} />
        <span className={`font-semibold ${isCurrentYear ? 'text-blue-700' : 'text-gray-700'}`}>
          {yearData.label}
        </span>
        {isCurrentYear && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Current
          </span>
        )}
      </div>
      <div className={`p-1 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
        {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div className="bg-gray-50 rounded-lg p-2">
        <p className="text-xs text-gray-600">Total Students</p>
        <p className="text-lg font-bold text-gray-900">{yearData.count}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-2">
        <p className="text-xs text-gray-600">Total Amount</p>
        <p className="text-lg font-bold text-gray-900">
          {new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
          }).format(yearData.totalAmount)}
        </p>
      </div>
    </div>
    
    {/* MP Sponsorship Summary */}
    {yearData.mpSponsoredCount > 0 && (
      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown size={14} className="text-yellow-600 mr-1" />
            <span className="text-xs font-medium text-yellow-700">MP Sponsored</span>
          </div>
          <span className="text-sm font-bold text-yellow-800">{yearData.mpSponsoredCount}</span>
        </div>
        <p className="text-xs text-yellow-600 mt-1">
          {new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
          }).format(yearData.mpSponsoredAmount)}
        </p>
      </div>
    )}
  </div>
);

const StudentCard: React.FC<{
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
  onView: (student: Student) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  userRole: string;
}> = ({ student, onEdit, onDelete, onView, onApprove, onReject, userRole }) => {
  const getApplicationYear = () => {
    if (student.date_applied) {
      const date = new Date(student.date_applied);
      return date.getFullYear().toString();
    }
    return 'N/A';
  };

  const isMPSponsored = student.sponsorship_source === 'mp';

  return (
    <div className={`bg-white rounded-xl border ${
      isMPSponsored ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-200'
    } p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`h-12 w-12 ${
            isMPSponsored ? 'bg-yellow-100' : 'bg-blue-100'
          } rounded-full flex items-center justify-center`}>
            {isMPSponsored ? (
              <Crown size={20} className="text-yellow-600" />
            ) : (
              <Users size={20} className="text-blue-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              {isMPSponsored && (
                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center">
                  <Crown size={10} className="mr-1" />
                  MP Sponsored
                </span>
              )}
              {student.sponsorship_source === 'other' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  Other Sponsor
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-500">{student.admissionNumber || student.registration_no}</p>
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {getApplicationYear()}
              </span>
            </div>
            {student.sponsor_name && (
              <p className={`text-xs mt-1 ${
                isMPSponsored ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                Sponsor: {student.sponsor_name}
              </p>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          student.status === 'approved' || student.status === 'disbursed' ? 'bg-green-100 text-green-800' :
          student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <GraduationCap size={16} className="mr-2 text-gray-400" />
          <span>{student.institution}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Award size={16} className="mr-2 text-gray-400" />
          <span>
            {student.education_level === 'high_school' ? 'High School' :
             student.education_level === 'college' ? 'College' :
             student.education_level === 'university' ? 'University' : ''}
            {student.course ? ` • ${student.course}` : ''}
            {student.year ? ` • ${student.year}` : ''}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building size={16} className="mr-2 text-gray-400" />
          <span>{student.ward} Ward</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail size={16} className="mr-2 text-gray-400" />
          <span>{student.contact || 'No contact'}</span>
        </div>
        {student.sponsorship_date && (
          <div className={`flex items-center text-sm ${
            isMPSponsored ? 'text-yellow-600' : 'text-gray-600'
          } bg-gray-50 p-2 rounded`}>
            <Calendar size={14} className="mr-2" />
            <span>
              {isMPSponsored ? 'MP ' : ''}Sponsorship Date: {new Date(student.sponsorship_date).toLocaleDateString()}
            </span>
          </div>
        )}
        {student.sponsorship_amount && student.sponsorship_amount > 0 && (
          <div className={`flex items-center text-sm ${
            isMPSponsored ? 'text-yellow-600' : 'text-gray-600'
          } bg-gray-50 p-2 rounded`}>
            <TrendingUp size={14} className="mr-2" />
            <span>
              {isMPSponsored ? 'MP ' : ''}Sponsorship Amount: {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0
              }).format(student.sponsorship_amount)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-600">Total Allocation</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0
              }).format(student.total_allocation || student.amount)}
            </p>
            {student.sponsorship_amount && student.sponsorship_amount > 0 && (
              <div className="flex flex-col text-xs">
                <span className="text-gray-600">
                  CDF: {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0
                  }).format(student.amount)}
                </span>
                <span className={isMPSponsored ? 'text-yellow-600' : 'text-purple-600'}>
                  {isMPSponsored ? 'MP' : 'Sponsor'}: {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                    minimumFractionDigits: 0
                  }).format(student.sponsorship_amount)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onView(student)}
            className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={() => onEdit(student)}
            className="p-2 hover:bg-gray-100 rounded-lg text-green-600"
          >
            <Edit size={18} />
          </button>
          {student.status === 'pending' && userRole === 'admin' && (
            <>
              <button 
                onClick={() => onApprove(student.id)}
                className="p-2 hover:bg-gray-100 rounded-lg text-green-600"
                title="Approve"
              >
                <CheckCircle size={18} />
              </button>
              <button 
                onClick={() => onReject(student.id)}
                className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                title="Reject"
              >
                <XCircle size={18} />
              </button>
            </>
          )}
          <button 
            onClick={() => onDelete(student.id)}
            className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Students() {
  const { user, isAdmin, isCommittee } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [filterEducationLevel, setFilterEducationLevel] = useState('all');
  const [selectedYear, setSelectedYear] = useState<string>('current');
  const [selectedSponsorshipSource, setSelectedSponsorshipSource] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [expandedYear, setExpandedYear] = useState<string | null>(null);
  const [yearSummaryData, setYearSummaryData] = useState<YearData[]>([]);
  const [mpSponsorshipSummary, setMpSponsorshipSummary] = useState<MPSponsorshipSummary>({
    totalMpSponsored: 0,
    totalMpAmount: 0,
    mpStudentsByWard: {},
    mpStudentsByYear: {}
  });

  const wards = ['Nyangores', 'Sigor', 'Chebunyo', 'Siongiroi', 'kongasis'];

  const educationLevels = [
    { value: 'high_school', label: 'High School' },
    { value: 'college', label: 'College' },
    { value: 'university', label: 'University' }
  ];

  const sponsorshipSources = [
    { value: 'cdf', label: 'CDF Fund', icon: <Building size={14} />, color: 'bg-blue-100 text-blue-800' },
    { value: 'mp', label: 'Member of Parliament', icon: <Crown size={14} />, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Other Sponsor', icon: <UserCheck size={14} />, color: 'bg-purple-100 text-purple-800' }
  ];

  const currentYear = new Date().getFullYear().toString();

  const getApplicationYear = (student: Student): string => {
    if (student.date_applied) {
      const date = new Date(student.date_applied);
      return date.getFullYear().toString();
    }
    return 'Unknown';
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `254${cleaned.substring(1)}`;
    }
    
    if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateMpSponsorshipSummary = (studentsData: Student[]) => {
    const mpStudents = studentsData.filter(s => s.sponsorship_source === 'mp');
    const totalMpSponsored = mpStudents.length;
    const totalMpAmount = mpStudents.reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0);
    
    const mpStudentsByWard: Record<string, number> = {};
    const mpStudentsByYear: Record<string, number> = {};
    
    wards.forEach(ward => {
      mpStudentsByWard[ward] = mpStudents.filter(s => s.ward === ward).length;
    });
    
    mpStudents.forEach(student => {
      const year = getApplicationYear(student);
      mpStudentsByYear[year] = (mpStudentsByYear[year] || 0) + 1;
    });
    
    setMpSponsorshipSummary({
      totalMpSponsored,
      totalMpAmount,
      mpStudentsByWard,
      mpStudentsByYear
    });
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await studentsAPI.getAll();
      
      let studentArray: any[] = [];
      
      if (Array.isArray(response.data)) {
        studentArray = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        studentArray = response.data.results;
      } else if (response.data && Array.isArray(response.data.students)) {
        studentArray = response.data.students;
      } else if (response.data && Array.isArray(response.data.data)) {
        studentArray = response.data.data;
      }
      
      const formattedStudents: Student[] = studentArray.map((s: any) => ({
        id: s.id,
        name: s.name,
        admissionNumber: s.registration_no,
        registration_no: s.registration_no,
        institution: s.institution,
        course: s.course || '',
        ward: s.ward,
        status: s.status === 'disbursed' ? 'approved' : s.status,
        allocatedAmount: formatCurrency(parseFloat(s.amount || 0)),
        contact: s.phone || s.guardian_phone || 'No contact',
        phone: s.phone,
        guardian_phone: s.guardian_phone,
        year: s.year,
        date_applied: s.date_applied,
        education_level: s.education_level || '',
        sms_status: s.sms_status || 'not_sent',
        amount: parseFloat(s.amount || 0),
        // Sponsorship fields
        sponsorship_source: s.sponsorship_source || 'cdf',
        sponsor_name: s.sponsor_name || null,
        sponsorship_date: s.sponsorship_date || null,
        sponsorship_amount: s.sponsorship_amount ? parseFloat(s.sponsorship_amount) : 0,
        sponsor_details: s.sponsor_details || null,
        date_processed: s.date_processed || null,
        rejection_reason: s.rejection_reason || null,
        total_allocation: s.total_allocation ? parseFloat(s.total_allocation) : parseFloat(s.amount || 0) + (s.sponsorship_amount ? parseFloat(s.sponsorship_amount) : 0)
      }));
      
      setStudents(formattedStudents);
      calculateMpSponsorshipSummary(formattedStudents);
      
      // Calculate year summary data
      const yearDataMap = new Map<string, YearData>();
      
      formattedStudents.forEach(student => {
        const year = getApplicationYear(student);
        if (!yearDataMap.has(year)) {
          yearDataMap.set(year, {
            value: year,
            label: year === 'Unknown' ? 'Unknown Year' : year,
            count: 0,
            totalAmount: 0,
            approvedCount: 0,
            pendingCount: 0,
            mpSponsoredCount: 0,
            mpSponsoredAmount: 0
          });
        }
        
        const data = yearDataMap.get(year)!;
        data.count += 1;
        data.totalAmount += student.amount;
        
        if (student.status === 'approved' || student.status === 'disbursed') {
          data.approvedCount += 1;
        } else if (student.status === 'pending') {
          data.pendingCount += 1;
        }
        
        if (student.sponsorship_source === 'mp') {
          data.mpSponsoredCount += 1;
          data.mpSponsoredAmount += student.sponsorship_amount || 0;
        }
      });
      
      // Convert to array and sort by year (most recent first)
      const yearDataArray = Array.from(yearDataMap.values());
      yearDataArray.sort((a, b) => {
        if (a.value === 'current') return -1;
        if (b.value === 'current') return 1;
        if (a.value === 'Unknown') return 1;
        if (b.value === 'Unknown') return -1;
        return parseInt(b.value) - parseInt(a.value);
      });
      
      // Add "all" option
      const allStudents = formattedStudents;
      const mpStudents = allStudents.filter(s => s.sponsorship_source === 'mp');
      const allData: YearData = {
        value: 'all',
        label: 'All Years',
        count: allStudents.length,
        totalAmount: allStudents.reduce((sum, s) => sum + s.amount, 0),
        approvedCount: allStudents.filter(s => s.status === 'approved' || s.status === 'disbursed').length,
        pendingCount: allStudents.filter(s => s.status === 'pending').length,
        mpSponsoredCount: mpStudents.length,
        mpSponsoredAmount: mpStudents.reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0)
      };
      
      // Add "current" year option
      const currentYearStudents = formattedStudents.filter(s => getApplicationYear(s) === currentYear);
      const currentMpStudents = currentYearStudents.filter(s => s.sponsorship_source === 'mp');
      const currentData: YearData = {
        value: 'current',
        label: `Current (${currentYear})`,
        count: currentYearStudents.length,
        totalAmount: currentYearStudents.reduce((sum, s) => sum + s.amount, 0),
        approvedCount: currentYearStudents.filter(s => s.status === 'approved' || s.status === 'disbursed').length,
        pendingCount: currentYearStudents.filter(s => s.status === 'pending').length,
        mpSponsoredCount: currentMpStudents.length,
        mpSponsoredAmount: currentMpStudents.reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0)
      };
      
      setYearSummaryData([currentData, allData, ...yearDataArray]);
      
    } catch (error: any) {
      console.error('Error fetching students:', error);
      alert(`Failed to load students: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    registration_no: '',
    phone: '',
    guardian_phone: '',
    institution: '',
    course: '',
    year: '',
    ward: '',
    amount: '',
    education_level: '',
    sponsorship_source: 'cdf',
    sponsor_name: '',
    sponsorship_date: '',
    sponsorship_amount: '',
    sponsor_details: ''
  });

  useEffect(() => {
    if (formData.education_level === 'high_school') {
      setFormData(prev => ({
        ...prev,
        course: ''
      }));
    }
  }, [formData.education_level]);

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      registration_no: student.registration_no,
      phone: student.phone || '',
      guardian_phone: student.guardian_phone || '',
      institution: student.institution,
      course: student.course || '',
      year: student.year,
      ward: student.ward,
      amount: student.amount.toString(),
      education_level: student.education_level || '',
      sponsorship_source: student.sponsorship_source || 'cdf',
      sponsor_name: student.sponsor_name || '',
      sponsorship_date: student.sponsorship_date || '',
      sponsorship_amount: student.sponsorship_amount?.toString() || '',
      sponsor_details: student.sponsor_details || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (studentId: number) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsAPI.delete(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
      alert('Student deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting student:', error);
      alert(error.response?.data?.detail || 'Failed to delete student.');
    }
  };

  const handleView = (student: Student) => {
    const year = getApplicationYear(student);
    const sponsorInfo = student.sponsorship_source === 'mp' 
      ? `\nMP Sponsored: Yes\nSponsor Name: ${student.sponsor_name || 'Not specified'}\nSponsorship Amount: ${formatCurrency(student.sponsorship_amount || 0)}`
      : `\nSponsor Type: ${student.sponsorship_source === 'cdf' ? 'CDF Fund' : 'Other Sponsor'}`;
    
    alert(`Viewing ${student.name}\nApplication Year: ${year}\nInstitution: ${student.institution}\nCourse: ${student.course}\nStatus: ${student.status}\nTotal Allocation: ${formatCurrency(student.total_allocation || student.amount)}${sponsorInfo}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone && !formData.guardian_phone) {
      alert("Please provide either a student phone number or a guardian phone number.");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert("Please enter a valid allocation amount.");
      return;
    }

    const courseValue = formData.education_level === 'high_school' ? '' : formData.course;

    const studentData: any = {
      name: formData.name.trim(),
      registration_no: formData.registration_no.trim(),
      phone: formData.phone ? formatPhoneNumber(formData.phone) : null,
      guardian_phone: formData.guardian_phone ? formatPhoneNumber(formData.guardian_phone) : null,
      institution: formData.institution.trim(),
      course: courseValue.trim(),
      year: formData.year,
      ward: formData.ward,
      amount: parseFloat(formData.amount),
      education_level: formData.education_level,
      sponsorship_source: formData.sponsorship_source,
      status: 'pending',
      sms_status: 'not_sent',
      date_applied: new Date().toISOString()
    };

    // Add sponsorship specific fields
    if (formData.sponsorship_source === 'mp' || formData.sponsorship_source === 'other') {
      if (formData.sponsor_name) studentData.sponsor_name = formData.sponsor_name.trim();
      if (formData.sponsorship_date) studentData.sponsorship_date = formData.sponsorship_date;
      if (formData.sponsorship_amount) {
        studentData.sponsorship_amount = parseFloat(formData.sponsorship_amount);
      }
      if (formData.sponsor_details) studentData.sponsor_details = formData.sponsor_details.trim();
    }

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const response = await studentsAPI.update(editingStudent.id, studentData);
        const updatedStudent: Student = {
          id: response.data.id,
          name: response.data.name,
          admissionNumber: response.data.registration_no,
          registration_no: response.data.registration_no,
          institution: response.data.institution,
          course: response.data.course || '',
          ward: response.data.ward,
          status: response.data.status,
          allocatedAmount: formatCurrency(parseFloat(response.data.amount || 0)),
          contact: response.data.phone || response.data.guardian_phone || 'No contact',
          phone: response.data.phone,
          guardian_phone: response.data.guardian_phone,
          year: response.data.year,
          date_applied: response.data.date_applied,
          education_level: response.data.education_level || '',
          sms_status: response.data.sms_status || 'not_sent',
          amount: parseFloat(response.data.amount || 0),
          sponsorship_source: response.data.sponsorship_source || 'cdf',
          sponsor_name: response.data.sponsor_name,
          sponsorship_date: response.data.sponsorship_date,
          sponsorship_amount: response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0,
          sponsor_details: response.data.sponsor_details,
          date_processed: response.data.date_processed,
          rejection_reason: response.data.rejection_reason,
          total_allocation: response.data.total_allocation || parseFloat(response.data.amount || 0) + (response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0)
        };
        
        setStudents(prev => prev.map(s => 
          s.id === editingStudent.id ? updatedStudent : s
        ));
        alert('Student updated successfully!');
      } else {
        const response = await studentsAPI.create(studentData);
        const newStudent: Student = {
          id: response.data.id,
          name: response.data.name,
          admissionNumber: response.data.registration_no,
          registration_no: response.data.registration_no,
          institution: response.data.institution,
          course: response.data.course || '',
          ward: response.data.ward,
          status: response.data.status,
          allocatedAmount: formatCurrency(parseFloat(response.data.amount || 0)),
          contact: response.data.phone || response.data.guardian_phone || 'No contact',
          phone: response.data.phone,
          guardian_phone: response.data.guardian_phone,
          year: response.data.year,
          date_applied: response.data.date_applied,
          education_level: response.data.education_level || '',
          sms_status: response.data.sms_status || 'not_sent',
          amount: parseFloat(response.data.amount || 0),
          sponsorship_source: response.data.sponsorship_source || 'cdf',
          sponsor_name: response.data.sponsor_name,
          sponsorship_date: response.data.sponsorship_date,
          sponsorship_amount: response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0,
          sponsor_details: response.data.sponsor_details,
          date_processed: response.data.date_processed,
          rejection_reason: response.data.rejection_reason,
          total_allocation: response.data.total_allocation || parseFloat(response.data.amount || 0) + (response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0)
        };
        setStudents(prev => [newStudent, ...prev]);
        alert('Student added successfully!');
      }
      
      setFormData({
        name: '', registration_no: '', phone: '', guardian_phone: '', institution: '',
        course: '', year: '', ward: '', amount: '', education_level: '',
        sponsorship_source: 'cdf', sponsor_name: '', sponsorship_date: '',
        sponsorship_amount: '', sponsor_details: ''
      });
      setShowForm(false);
      setEditingStudent(null);
      
    } catch (error: any) {
      console.error("Error saving student:", error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Failed to save student. ';
        
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessage += `${key}: ${errorData[key].join(', ')}. `;
            } else {
              errorMessage += `${key}: ${errorData[key]}. `;
            }
          });
        } else if (typeof errorData === 'string') {
          errorMessage += errorData;
        } else if (errorData.detail) {
          errorMessage += errorData.detail;
        }
        
        alert(errorMessage);
      } else {
        alert('Failed to save student. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = filteredStudents;
      const csvRows = [];
      
      // Headers
      const headers = ['Name', 'Registration No', 'Phone', 'Guardian Phone', 'Institution', 'Course', 
                      'Year of Study', 'Ward', 'CDF Amount', 'Sponsorship Source', 'Sponsor Name', 
                      'Sponsorship Date', 'Sponsorship Amount', 'Total Allocation', 'Education Level', 
                      'Status', 'Application Year', 'SMS Status'];
      csvRows.push(headers.join(','));
      
      // Data
      exportData.forEach(student => {
        const row = [
          student.name,
          student.registration_no,
          student.phone || '',
          student.guardian_phone || '',
          student.institution,
          student.course,
          student.year,
          student.ward,
          student.amount,
          student.sponsorship_source,
          student.sponsor_name || '',
          student.sponsorship_date || '',
          student.sponsorship_amount || '',
          student.total_allocation || student.amount,
          student.education_level,
          student.status,
          getApplicationYear(student),
          student.sms_status
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
        csvRows.push(row);
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const yearLabel = selectedYear === 'current' ? currentYear : selectedYear === 'all' ? 'all-years' : selectedYear;
      const sponsorLabel = selectedSponsorshipSource === 'all' ? 'all' : selectedSponsorshipSource;
      link.href = url;
      link.setAttribute('download', `chepalungu-students-${yearLabel}-${sponsorLabel}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert('Data exported successfully!');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      alert(error.response?.data?.detail || 'Failed to export data.');
    }
  };

  const handleApprove = async (studentId: number) => {
    if (!window.confirm('Are you sure you want to approve this student?')) return;
    
    try {
      const response = await api.put(`/students/${studentId}/approve/`);
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { 
          ...s, 
          status: 'approved',
          allocatedAmount: formatCurrency(parseFloat(response.data.amount || 0))
        } : s
      ));
      alert('Student approved successfully!');
    } catch (error: any) {
      console.error('Error approving student:', error);
      alert(error.response?.data?.detail || 'Failed to approve student.');
    }
  };

  const handleReject = async (studentId: number) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required.');
      return;
    }
    
    try {
      const response = await api.put(`/students/${studentId}/reject/`, { reason });
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { 
          ...s, 
          status: 'rejected',
          allocatedAmount: formatCurrency(parseFloat(response.data.amount || 0))
        } : s
      ));
      alert('Student rejected!');
    } catch (error: any) {
      console.error('Error rejecting student:', error);
      alert(error.response?.data?.detail || 'Failed to reject student.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedStudents.size === 0) return;
    if (!window.confirm(`Are you sure you want to approve all ${selectedStudents.size} selected students?`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const id of selectedStudents) {
      try {
        await api.put(`/students/${id}/approve/`);
        successCount++;
      } catch (error) {
        console.error(`Failed to approve student ${id}:`, error);
        failCount++;
      }
    }

    fetchStudents();
    setSelectedStudents(new Set());
    alert(`Bulk approval complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedStudents.size} selected students? This cannot be undone.`)) return;

    let successCount = 0;
    let failCount = 0;

    for (const id of selectedStudents) {
      try {
        await studentsAPI.delete(id);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete student ${id}:`, error);
        failCount++;
      }
    }

    fetchStudents();
    setSelectedStudents(new Set());
    alert(`Bulk deletion complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const handleRefresh = () => {
    fetchStudents();
  };

  // Filter students based on all criteria including year and sponsorship source
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.institution.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'approved' ? (student.status === 'approved' || student.status === 'disbursed') : student.status === selectedStatus);
      
      const matchesWard = selectedWard === 'all' || student.ward === selectedWard;
      
      const matchesEducationLevel = filterEducationLevel === 'all' || student.education_level === filterEducationLevel;
      
      // Year filtering
      const applicationYear = getApplicationYear(student);
      let matchesYear = true;
      if (selectedYear === 'current') {
        matchesYear = applicationYear === currentYear;
      } else if (selectedYear !== 'all') {
        matchesYear = applicationYear === selectedYear;
      }
      
      // Sponsorship source filtering
      const matchesSponsorshipSource = selectedSponsorshipSource === 'all' || student.sponsorship_source === selectedSponsorshipSource;
      
      return matchesSearch && matchesStatus && matchesWard && matchesEducationLevel && matchesYear && matchesSponsorshipSource;
    });
  }, [students, searchTerm, selectedStatus, selectedWard, filterEducationLevel, selectedYear, selectedSponsorshipSource, currentYear]);

  // Calculate statistics for the selected year/filter
  const totalStudents = filteredStudents.length;
  const approvedStudents = filteredStudents.filter(s => s.status === 'approved' || s.status === 'disbursed').length;
  const pendingStudents = filteredStudents.filter(s => s.status === 'pending').length;
  const totalAllocated = filteredStudents.reduce((sum, s) => sum + (s.total_allocation || s.amount), 0);
  
  // MP sponsored stats
  const mpSponsoredStudents = filteredStudents.filter(s => s.sponsorship_source === 'mp').length;
  const mpSponsoredAmount = filteredStudents
    .filter(s => s.sponsorship_source === 'mp')
    .reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0);

  // Calculate this month's applications
  const thisMonthStudents = filteredStudents.filter(s => {
    const appliedDate = new Date(s.date_applied);
    const now = new Date();
    return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
  }).length;

  const studentStats = [
    {
      title: selectedYear === 'current' ? 'Current Year Students' : 
             selectedYear === 'all' ? 'All Students' : 
             `${selectedYear} Students`,
      value: totalStudents.toString(),
      change: '+12.5%',
      isPositive: true,
      icon: <Users size={24} className="text-white" />,
      color: 'bg-blue-500',
      description: selectedYear === 'current' ? `Academic Year ${currentYear}` : ''
    },
    {
      title: 'MP Sponsored',
      value: mpSponsoredStudents.toString(),
      change: mpSponsoredStudents > 0 ? '+5.2%' : '0%',
      isPositive: mpSponsoredStudents > 0,
      icon: <Crown size={24} className="text-white" />,
      color: 'bg-yellow-500',
      description: formatCurrency(mpSponsoredAmount)
    },
    {
      title: 'Approved',
      value: approvedStudents.toString(),
      change: approvedStudents > 0 ? '+8.2%' : '0%',
      isPositive: approvedStudents > 0,
      icon: <CheckCircle size={24} className="text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Total Allocated',
      value: formatCurrency(totalAllocated),
      change: totalAllocated > 0 ? '+5.7%' : '0%',
      isPositive: totalAllocated > 0,
      icon: <TrendingUp size={24} className="text-white" />,
      color: 'bg-purple-500'
    }
  ];

  // Calculate ward distribution for filtered students
  const wardDistribution = wards.map(ward => {
    const count = filteredStudents.filter(s => s.ward === ward).length;
    const mpCount = filteredStudents.filter(s => s.ward === ward && s.sponsorship_source === 'mp').length;
    const totalAmount = filteredStudents.filter(s => s.ward === ward).reduce((sum, s) => sum + (s.total_allocation || s.amount), 0);
    return { ward, count, mpCount, totalAmount };
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all Chepalungu CDF and MP-sponsored student beneficiaries</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={handleExportData}
            disabled={loading || filteredStudents.length === 0}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export {selectedYear !== 'all' && `(${selectedYear === 'current' ? currentYear : selectedYear})`}
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedStudents.size > 0 && (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fadeIn sticky top-4 z-50">
          <div className="flex items-center space-x-4">
            <span className="font-bold">{selectedStudents.size} students selected</span>
            <div className="h-4 w-px bg-blue-400"></div>
            <button 
              onClick={handleBulkApprove}
              className="flex items-center hover:text-blue-200 transition-colors"
            >
              <CheckCircle size={18} className="mr-1" />
              Approve Selected
            </button>
            <button 
              onClick={handleBulkDelete}
              className="flex items-center hover:text-red-200 transition-colors"
            >
              <Trash2 size={18} className="mr-1" />
              Delete Selected
            </button>
          </div>
          <button 
            onClick={() => setSelectedStudents(new Set())}
            className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}

      {/* MP Sponsorship Summary Card */}
      {mpSponsorshipSummary.totalMpSponsored > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Crown size={24} className="text-yellow-600 mr-3" />
              <div>
                <h2 className="text-lg font-bold text-yellow-900">MP Sponsorship Summary</h2>
                <p className="text-sm text-yellow-700">Overview of Member of Parliament sponsored students</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedSponsorshipSource('mp')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
            >
              <Target size={16} className="mr-2" />
              View MP Sponsored
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total MP Sponsored</p>
                  <p className="text-2xl font-bold text-gray-900">{mpSponsorshipSummary.totalMpSponsored}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <UserCheck size={20} className="text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formatCurrency(mpSponsorshipSummary.totalMpAmount)} total sponsorship
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">Top Wards with MP Sponsored Students</p>
              <div className="space-y-2">
                {Object.entries(mpSponsorshipSummary.mpStudentsByWard)
                  .filter(([_, count]) => count > 0)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([ward, count]) => (
                    <div key={ward} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{ward}</span>
                      <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">
                        {count} students
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-2">MP Sponsorship by Year</p>
              <div className="space-y-2">
                {Object.entries(mpSponsorshipSummary.mpStudentsByYear)
                  .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                  .slice(0, 3)
                  .map(([year, count]) => (
                    <div key={year} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{year}</span>
                      <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-800 rounded">
                        {count} students
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year Overview Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Layers size={20} className="mr-2 text-blue-600" />
              Academic Year Overview
            </h2>
            <p className="text-sm text-gray-600 mt-1">Browse students by academic year</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 size={18} className="text-gray-500" />
            <span className="text-sm text-gray-600">{students.length} total students across all years</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {yearSummaryData.map((yearData) => (
            <YearFilterCard
              key={yearData.value}
              yearData={yearData}
              isSelected={selectedYear === yearData.value}
              onClick={() => {
                setSelectedYear(yearData.value);
                setExpandedYear(expandedYear === yearData.value ? null : yearData.value);
              }}
              isCurrentYear={yearData.value === 'current'}
            />
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search students by name, admission number, or institution..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
            >
              <option value="all">All Wards</option>
              {wards.map((ward) => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>

            <select
              value={filterEducationLevel}
              onChange={(e) => setFilterEducationLevel(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Education Levels</option>
              {educationLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>

            {/* Sponsorship Source Filter */}
            <select
              value={selectedSponsorshipSource}
              onChange={(e) => setSelectedSponsorshipSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sponsors</option>
              {sponsorshipSources.map(sponsor => (
                <option key={sponsor.value} value={sponsor.value}>
                  {sponsor.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
              <button
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Selected Year Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                {selectedYear === 'current' ? `Current Academic Year (${currentYear})` :
                 selectedYear === 'all' ? 'All Academic Years' :
                 `Academic Year ${selectedYear}`}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Showing {filteredStudents.length} students
                {selectedYear !== 'all' && ` from ${selectedYear === 'current' ? currentYear : selectedYear}`}
                {selectedSponsorshipSource !== 'all' && ` • ${sponsorshipSources.find(s => s.value === selectedSponsorshipSource)?.label}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedYear('current');
                  setSelectedSponsorshipSource('all');
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedYear === 'current' && selectedSponsorshipSource === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                }`}
              >
                Current Year
              </button>
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedSponsorshipSource('mp');
                }}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedSponsorshipSource === 'mp'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white text-yellow-600 border border-yellow-300 hover:bg-yellow-50'
                }`}
              >
                MP Sponsored
              </button>
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedSponsorshipSource('all');
                  setSelectedStatus('all');
                  setSelectedWard('all');
                  setFilterEducationLevel('all');
                  setSearchTerm('');
                }}
                className="px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Ward Distribution */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ward Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {wardDistribution.map(({ ward, count, mpCount, totalAmount }) => (
              <div key={ward} className="bg-gray-50 rounded-lg p-3 text-center hover:bg-gray-100 transition-colors">
                <p className="text-sm font-medium text-gray-900">{count}</p>
                <p className="text-xs text-gray-600 truncate">{ward}</p>
                {mpCount > 0 && (
                  <div className="mt-1 flex items-center justify-center">
                    <Crown size={10} className="text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-600 font-medium">{mpCount} MP</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{formatCurrency(totalAmount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Cards/Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleReject}
              userRole={user.role}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                        checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                        onChange={handleSelectAll}
                      />
                      Student
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution & Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className={`hover:bg-gray-50 ${student.sponsorship_source === 'mp' ? 'bg-yellow-50/50' : ''} ${selectedStudents.has(student.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                          checked={selectedStudents.has(student.id)}
                          onChange={() => handleSelect(student.id)}
                        />
                        <div className={`h-10 w-10 ${student.sponsorship_source === 'mp' ? 'bg-yellow-100' : student.sponsorship_source === 'other' ? 'bg-purple-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
                          {student.sponsorship_source === 'mp' ? (
                            <Crown size={16} className="text-yellow-600" />
                          ) : student.sponsorship_source === 'other' ? (
                            <UserCheck size={16} className="text-purple-600" />
                          ) : (
                            <Users size={16} className="text-blue-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            {student.sponsorship_source === 'mp' && (
                              <Crown size={12} className="text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{student.admissionNumber || student.registration_no}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.institution}</div>
                      <div className="text-sm text-gray-500">
                        {student.education_level === 'high_school' ? 'High School' :
                         student.education_level === 'college' ? 'College' :
                         student.education_level === 'university' ? 'University' : ''}
                        {student.course ? ` • ${student.course}` : ''}
                        {student.year ? ` • ${student.year}` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Building size={14} className="mr-1 text-gray-400" />
                        {student.ward}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getApplicationYear(student)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.sponsorship_source === 'mp' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : student.sponsorship_source === 'cdf'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {student.sponsorship_source === 'mp' ? 'MP' : 
                         student.sponsorship_source === 'cdf' ? 'CDF' : 'Other'}
                      </span>
                      {student.sponsor_name && (
                        <div className="text-xs text-gray-500 mt-1">{student.sponsor_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.status === 'approved' || student.status === 'disbursed' ? 'bg-green-100 text-green-800' :
                        student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>
                        <div className="font-bold">{formatCurrency(student.total_allocation || student.amount)}</div>
                        {student.sponsorship_amount && student.sponsorship_amount > 0 && (
                          <div className="text-xs text-gray-600">
                            CDF: {formatCurrency(student.amount)}
                            {student.sponsorship_source === 'mp' ? (
                              <span className="text-yellow-600 ml-2">MP: {formatCurrency(student.sponsorship_amount)}</span>
                            ) : (
                              <span className="text-purple-600 ml-2">Sponsor: {formatCurrency(student.sponsorship_amount)}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleView(student)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(student)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit size={18} />
                        </button>
                        {(isAdmin || isCommittee || user.role === 'admin' || user.role === 'committee') && student.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(student.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleReject(student.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No students found */}
      {!loading && filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedWard !== 'all' || filterEducationLevel !== 'all' || selectedYear !== 'all' || selectedSponsorshipSource !== 'all'
              ? `Try adjusting your search or filters. No students match the current criteria.`
              : 'Get started by adding your first student'}
          </p>
          <div className="space-x-3">
            {!searchTerm && selectedStatus === 'all' && selectedWard === 'all' && filterEducationLevel === 'all' && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus size={20} className="mr-2" />
                Add First Student
              </button>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedWard('all');
                setFilterEducationLevel('all');
                setSelectedYear('all');
                setSelectedSponsorshipSource('all');
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={20} className="mr-2" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingStudent(null);
                    setFormData({
                      name: '', registration_no: '', phone: '', guardian_phone: '', institution: '',
                      course: '', year: '', ward: '', amount: '', education_level: '',
                      sponsorship_source: 'cdf', sponsor_name: '', sponsorship_date: '',
                      sponsorship_amount: '', sponsor_details: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.registration_no}
                      onChange={(e) => setFormData({...formData, registration_no: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BU/2023/001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guardian Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.guardian_phone}
                      onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0723456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level *
                    </label>
                    <select
                      required
                      value={formData.education_level}
                      onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Level</option>
                      {educationLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="University/College/School name"
                    />
                  </div>

                  {formData.education_level !== 'high_school' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course *
                      </label>
                      <input
                        type="text"
                        required={formData.education_level !== 'high_school'}
                        value={formData.course}
                        onChange={(e) => setFormData({...formData, course: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Bachelor of Commerce"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Study *
                    </label>
                    <select
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Year</option>
                      <option value="Form 1">Form 1</option>
                      <option value="Form 2">Form 2</option>
                      <option value="Form 3">Form 3</option>
                      <option value="Form 4">Form 4</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward *
                    </label>
                    <select
                      required
                      value={formData.ward}
                      onChange={(e) => setFormData({...formData, ward: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>Select Ward</option>
                      {wards.map(ward => (
                        <option key={ward} value={ward}>
                          {ward}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CDF Amount (KES) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="1000"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50000"
                    />
                  </div>

                  {/* Sponsorship Source Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sponsorship Source *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {sponsorshipSources.map(sponsor => (
                        <div
                          key={sponsor.value}
                          onClick={() => setFormData({...formData, sponsorship_source: sponsor.value})}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.sponsorship_source === sponsor.value
                              ? sponsor.value === 'mp' 
                                ? 'border-yellow-300 bg-yellow-50' 
                                : sponsor.value === 'cdf'
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-purple-300 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full mr-3 ${
                              sponsor.value === 'mp' 
                                ? 'bg-yellow-100 text-yellow-600' 
                                : sponsor.value === 'cdf'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {sponsor.icon}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{sponsor.label}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {sponsor.value === 'mp' 
                                  ? 'Sponsored by Member of Parliament'
                                  : sponsor.value === 'cdf'
                                  ? 'Sponsored by CDF Fund'
                                  : 'Other sponsorship source'}
                              </p>
                            </div>
                            {formData.sponsorship_source === sponsor.value && (
                              <div className="ml-auto">
                                <CheckCircle size={20} className="text-green-500" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MP/Other Sponsorship Specific Fields */}
                  {formData.sponsorship_source !== 'cdf' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsor Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.sponsor_name}
                          onChange={(e) => setFormData({...formData, sponsor_name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={formData.sponsorship_source === 'mp' ? "e.g., Hon. MP Name" : "Company/Organization Name"}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsorship Date
                        </label>
                        <input
                          type="date"
                          value={formData.sponsorship_date}
                          onChange={(e) => setFormData({...formData, sponsorship_date: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsorship Amount (KES)
                        </label>
                        <input
                          type="number"
                          value={formData.sponsorship_amount}
                          onChange={(e) => setFormData({...formData, sponsorship_amount: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Amount sponsored"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsor Details (Optional)
                        </label>
                        <textarea
                          value={formData.sponsor_details}
                          onChange={(e) => setFormData({...formData, sponsor_details: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Additional details about the sponsorship..."
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingStudent(null);
                      setFormData({
                        name: '', registration_no: '', phone: '', guardian_phone: '', institution: '',
                        course: '', year: '', ward: '', amount: '', education_level: '',
                        sponsorship_source: 'cdf', sponsor_name: '', sponsorship_date: '',
                        sponsorship_amount: '', sponsor_details: ''
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin inline mr-2" />
                        {editingStudent ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      editingStudent ? 'Update Student' : 'Add Student'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}