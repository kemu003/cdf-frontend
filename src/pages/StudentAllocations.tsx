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
  BarChart3,
  Layers,
  UserCheck,
  Target,
  Crown,
  AlertCircle,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Send,
  Phone,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, studentsAPI, bursariesAPI } from '../services/api';

interface Student {
  id: number;
  name: string;
  admissionNumber: string;
  institution: string;
  course: string;
  ward: string | number;
  ward_name?: string;
  status: 'approved' | 'pending' | 'rejected' | 'disbursed';
  allocatedAmount: string;
  contact: string;
  registration_no: string;
  phone?: string | null;
  guardian_phone?: string | null;
  year: string;
  date_applied: string;
  date_processed?: string;
  education_level: string;
  sms_status: 'not_sent' | 'sent' | 'failed' | 'partial';
  amount: number;
  // Sponsorship fields
  sponsorship_source: 'cdf' | 'mp' | 'other';
  sponsor_name?: string;
  sponsorship_date?: string;
  sponsorship_amount?: number;
  sponsor_details?: string;
  rejection_reason?: string;
  total_allocation?: number;
}

interface MPSponsorshipSummary {
  totalMpSponsored: number;
  totalMpAmount: number;
  mpStudentsByWard: Record<string, number>;
}

interface SMSResponse {
  success: boolean;
  success_count: number;
  failure_count: number;
  sms_status: 'sent' | 'partial' | 'failed';
  student_status: string;
  sms_message?: string;
  error?: string;
}

interface SMSBalanceResponse {
  success: boolean;
  balance?: {
    balance: string;
    status?: string;
  };
  error?: string;
}

const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}> = ({ title, value, subtitle, icon, color, iconBg }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg ${iconBg}`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color}` })}
      </div>
    </div>
  </div>
);

const SMSCard: React.FC<{
  balance: string;
  provider: string;
}> = ({ balance, provider }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center">
          <Send className="w-5 h-5 text-gray-500 mr-2" />
          <p className="text-sm font-medium text-gray-600">SMS Balance</p>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">{balance}</p>
        <p className="text-sm text-gray-500 mt-1">
          Provider: <span className="font-medium">{provider}</span>
        </p>
      </div>
      <div className="p-3 rounded-lg bg-blue-100">
        <Phone className="w-6 h-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const StudentRow: React.FC<{
  student: Student;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: (student: Student) => void;
  onDelete: (id: number) => void;
  onView: (student: Student) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onSendSMS: (id: number) => void;
  userRole: string;
}> = ({ student, isSelected, onSelect, onEdit, onDelete, onView, onApprove, onReject, onSendSMS, userRole }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getSMSStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'partial': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSMSStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'sent';
      case 'failed': return 'failed';
      case 'partial': return 'partial';
      default: return 'not sent';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disbursed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disbursed': return 'Disbursed';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const isMPSponsored = student.sponsorship_source === 'mp';
  const totalAllocation = student.total_allocation || student.amount + (student.sponsorship_amount || 0);

  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isMPSponsored ? 'bg-yellow-50/30' : ''}`}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <button
            onClick={() => onSelect(student.id)}
            className="mr-3"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-2 ${
                isMPSponsored ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                {isMPSponsored ? (
                  <Crown className="w-4 h-4 text-yellow-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                <p className="text-xs text-gray-500 truncate">{student.registration_no}</p>
              </div>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <Phone className="w-3 h-3 mr-1" />
                <span>
                  {student.phone ? `S: ${student.phone}` : ''}
                  {student.phone && student.guardian_phone ? ' | ' : ''}
                  {student.guardian_phone ? `G: ${student.guardian_phone}` : ''}
                  {!student.phone && !student.guardian_phone ? 'No contact' : ''}
                </span>
              </div>
              <div className="flex items-center text-xs">
                <Building className="w-3 h-3 text-gray-400 mr-1" />
                <span className="text-gray-600">{student.ward_name || student.ward}</span>
                {student.sponsor_name && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="text-gray-500">Sponsor: {student.sponsor_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 font-medium">{student.institution}</div>
        <div className="text-sm text-gray-600 mt-1">
          {student.education_level === 'high_school' ? 'High School' :
           student.education_level === 'college' ? 'College' :
           student.education_level === 'university' ? 'University' : 'N/A'}
          {student.year && ` • ${student.year}`}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-gray-900">
          {new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0
          }).format(totalAllocation)}
        </div>
        {(student.amount > 0 || student.sponsorship_amount) && (
          <div className="mt-1 space-y-1">
            {student.amount > 0 && (
              <div className="text-xs text-gray-600">
                CDF: {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  minimumFractionDigits: 0
                }).format(student.amount)}
              </div>
            )}
            {student.sponsorship_amount && student.sponsorship_amount > 0 && (
              <div className={`text-xs ${isMPSponsored ? 'text-yellow-600' : 'text-purple-600'}`}>
                {isMPSponsored ? 'MP' : 'Sponsor'}: {new Intl.NumberFormat('en-KE', {
                  style: 'currency',
                  currency: 'KES',
                  minimumFractionDigits: 0
                }).format(student.sponsorship_amount)}
              </div>
            )}
          </div>
        )}
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          <div>Applied: {formatDate(student.date_applied)}</div>
          {student.date_processed && (
            <div>Processed: {formatDate(student.date_processed)}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
          {getStatusText(student.status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getSMSStatusColor(student.sms_status)}`}>
          {getSMSStatusText(student.sms_status)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(student)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(student)}
            className="text-green-600 hover:text-green-900 p-1"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          {student.status === 'pending' && userRole === 'admin' && (
            <>
              <button
                onClick={() => onApprove(student.id)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(student.id)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onSendSMS(student.id)}
            className="text-purple-600 hover:text-purple-900 p-1"
            title="Send SMS"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(student.id)}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function Students() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [filterEducationLevel, setFilterEducationLevel] = useState('all');
  const [selectedSponsorshipSource, setSelectedSponsorshipSource] = useState<string>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(new Set());
  const [smsBalance, setSmsBalance] = useState<string>('Loading...');
  const [smsProvider, setSmsProvider] = useState<string>('Checking...');
  const [wardsList, setWardsList] = useState<any[]>([]);
  const [mpSponsorshipSummary, setMpSponsorshipSummary] = useState<MPSponsorshipSummary>({
    totalMpSponsored: 0,
    totalMpAmount: 0,
    mpStudentsByWard: {}
  });

  const wards = ['Nyangores', 'Sigor', 'Chebunyo', 'Siongiroi', 'kongasis'];
  const currentYear = new Date().getFullYear().toString();

  const educationLevels = [
    { value: 'high_school', label: 'High School' },
    { value: 'college', label: 'College' },
    { value: 'university', label: 'University' }
  ];

  const sponsorshipSources = [
    { value: 'cdf', label: 'CDF Fund' },
    { value: 'mp', label: 'Member of Parliament (Mheshimiwa)' },
    { value: 'other', label: 'Other Sponsor' }
  ];

  const fetchWards = async () => {
    try {
      const response = await api.get('/bursaries/wards/');
      setWardsList(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to fetch wards:', error);
    }
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

  const calculateMpSponsorshipSummary = (studentsData: Student[]) => {
    const mpStudents = studentsData.filter(s => s.sponsorship_source === 'mp');
    const totalMpSponsored = mpStudents.length;
    const totalMpAmount = mpStudents.reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0);
    
    const mpStudentsByWard: Record<string, number> = {};
    
    wards.forEach(ward => {
      mpStudentsByWard[ward] = mpStudents.filter(s => s.ward === ward).length;
    });
    
    setMpSponsorshipSummary({
      totalMpSponsored,
      totalMpAmount,
      mpStudentsByWard
    });
  };

  const fetchSmsBalance = async () => {
    try {
      const response = await studentsAPI.getSMSBalance();
      const data: SMSBalanceResponse = response.data;
      
      if (data.success && data.balance) {
        if (data.balance.status === 'log_mode') {
          setSmsBalance(`${data.balance.balance} credits (Log Mode)`);
          setSmsProvider('Local Development');
        } else if (data.balance.balance !== undefined) {
          setSmsBalance(`${data.balance.balance} credits`);
          setSmsProvider('Blessed Texts');
        }
      } else {
        setSmsBalance('Error loading');
        setSmsProvider(data.error || 'Unknown');
      }
    } catch (error: any) {
      console.error('Failed to fetch SMS balance:', error);
      setSmsBalance('Error');
      setSmsProvider('Check connection');
    }
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
        status: s.status === 'disbursed' ? 'disbursed' : s.status,
        allocatedAmount: `Ksh ${parseFloat(s.amount || 0).toLocaleString()}`,
        contact: s.phone || s.guardian_phone || '',
        phone: s.phone,
        guardian_phone: s.guardian_phone,
        year: s.year,
        date_applied: s.date_applied,
        date_processed: s.date_processed,
        education_level: s.education_level || 'high_school',
        sms_status: s.sms_status || 'not_sent',
        amount: parseFloat(s.amount || 0),
        sponsorship_source: s.sponsorship_source || 'cdf',
        sponsor_name: s.sponsor_name,
        sponsorship_date: s.sponsorship_date,
        sponsorship_amount: s.sponsorship_amount ? parseFloat(s.sponsorship_amount) : 0,
        sponsor_details: s.sponsor_details,
        rejection_reason: s.rejection_reason,
        total_allocation: s.total_allocation ? parseFloat(s.total_allocation) : 
          parseFloat(s.amount || 0) + (s.sponsorship_amount ? parseFloat(s.sponsorship_amount) : 0)
      }));
      
      // Filter to only current year students
      const currentYearStudents = formattedStudents.filter(student => {
        if (!student.date_applied) return false;
        const date = new Date(student.date_applied);
        const year = date.getFullYear().toString();
        return year === currentYear;
      });
      
      setStudents(currentYearStudents);
      calculateMpSponsorshipSummary(currentYearStudents);
      
    } catch (error: any) {
      console.error('Error fetching students:', error);
      alert(`Failed to load students: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSmsBalance();
    fetchWards();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    registration_no: '',
    national_id: '',
    phone: '',
    guardian_phone: '',
    institution: '',
    course: '',
    year: '',
    ward: '',
    amount: '',
    education_level: 'high_school',
    sponsorship_source: 'cdf',
    sponsor_name: '',
    sponsorship_date: '',
    sponsorship_amount: '',
    sponsor_details: ''
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      registration_no: student.registration_no,
      national_id: (student as any).national_id || '',
      phone: student.phone || '',
      guardian_phone: student.guardian_phone || '',
      institution: student.institution,
      course: student.course || '',
      year: student.year,
      ward: student.ward,
      amount: student.amount.toString(),
      education_level: student.education_level || 'high_school',
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
    const details = `
Student Details:
Name: ${student.name}
Registration: ${student.registration_no}
Phone: ${student.phone || 'N/A'}
Guardian Phone: ${student.guardian_phone || 'N/A'}
Institution: ${student.institution}
Course: ${student.course || 'N/A'}
Year: ${student.year}
Ward: ${student.ward}
Status: ${student.status}
Amount: ${student.allocatedAmount}
Sponsor: ${student.sponsor_name || 'N/A'}
Applied: ${new Date(student.date_applied).toLocaleDateString()}
Processed: ${student.date_processed ? new Date(student.date_processed).toLocaleDateString() : 'N/A'}
    `;
    alert(details);
  };

  const handleSendSMS = async (studentId: number) => {
    if (!window.confirm('Send SMS notification to this student?')) return;
    
    try {
      // First, check if we have a token
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('You are not logged in. Please login again.');
        return;
      }
      
      // Find the student to check if approved
      const student = students.find(s => s.id === studentId);
      if (!student) {
        alert('Student not found!');
        return;
      }
      
      // Check if student is approved
      if (student.status !== 'approved' && student.status !== 'disbursed') {
        alert(`Student must be approved to send SMS. Current status: ${student.status}`);
        return;
      }
      
      // Check if student has phone numbers
      if (!student.phone && !student.guardian_phone) {
        alert('Student has no phone numbers');
        return;
      }
      
      // Call the actual API using the shared instance
      const response = await studentsAPI.sendSMS(studentId);
      const data: SMSResponse = response.data;
      
      // Update local state with actual response data
      setStudents(prev => prev.map(s =>
        s.id === studentId ? { 
          ...s, 
          sms_status: data.sms_status || 'sent',
          status: data.student_status || s.status
        } : s
      ));
      
      // Show success message with details
      if (data.success) {
        alert(`✅ SMS sent successfully!\n\nSuccess: ${data.success_count} phone(s)\nFailed: ${data.failure_count} phone(s)\nMessage: ${data.sms_message?.substring(0, 100)}...`);
      } else {
        alert(`❌ SMS failed: ${data.error || 'Unknown error'}`);
      }
      
      // Refresh SMS balance after sending
      fetchSmsBalance();
      
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      
      let errorMessage = 'Failed to send SMS. ';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to send SMS.';
        } else if (error.response.status === 400) {
          errorMessage = 'Bad request. Check student phone numbers.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage += `HTTP ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone && !formData.guardian_phone) {
      alert("Please provide either a student phone number or a guardian phone number.");
      return;
    }

    const courseValue = formData.education_level === 'high_school' ? '' : formData.course;
    
    // Find the ward ID from the name
    const wardObj = wardsList.find(w => w.name === formData.ward);
    if (!wardObj) {
      alert(`Invalid ward: ${formData.ward}. Please select a ward from the list.`);
      return;
    }

    const studentData: any = {
      name: formData.name.trim(),
      registration_no: formData.registration_no.trim(),
      national_id: formData.national_id.trim() || null,
      phone: formData.phone ? formatPhoneNumber(formData.phone) : null,
      guardian_phone: formData.guardian_phone ? formatPhoneNumber(formData.guardian_phone) : null,
      institution: formData.institution.trim(),
      course: courseValue.trim(),
      year: formData.year,
      ward: wardObj.id, // Use the ID here!
      amount: parseFloat(formData.amount) || 0,
      education_level: formData.education_level,
      sponsorship_source: formData.sponsorship_source,
      status: 'pending',
      sms_status: 'not_sent',
      date_applied: new Date().toISOString()
    };

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
        // Map response back to the local Student interface
        const updatedStudent: Student = {
          ...editingStudent,
          ...response.data,
          admissionNumber: response.data.registration_no,
          allocatedAmount: `Ksh ${parseFloat(response.data.amount || 0).toLocaleString()}`,
          contact: response.data.phone || response.data.guardian_phone || '',
          amount: parseFloat(response.data.amount || 0),
          sponsorship_amount: response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0,
          total_allocation: response.data.total_allocation || 
            parseFloat(response.data.amount || 0) + (response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0),
          ward: wardObj.name // Store name in local state for display
        };
        
        setStudents(prev => prev.map(s => 
          s.id === editingStudent.id ? updatedStudent : s
        ));
        alert('Student updated successfully!');
      } else {
        const response = await studentsAPI.create(studentData);
        const newStudent: Student = {
          ...response.data,
          id: response.data.id,
          name: response.data.name,
          admissionNumber: response.data.registration_no,
          registration_no: response.data.registration_no,
          institution: response.data.institution,
          course: response.data.course || '',
          ward: wardObj.name, // Store name in local state for display
          status: response.data.status,
          allocatedAmount: `Ksh ${parseFloat(response.data.amount || 0).toLocaleString()}`,
          contact: response.data.phone || response.data.guardian_phone || '',
          phone: response.data.phone,
          guardian_phone: response.data.guardian_phone,
          year: response.data.year,
          date_applied: response.data.date_applied,
          date_processed: response.data.date_processed,
          education_level: response.data.education_level || 'high_school',
          sms_status: response.data.sms_status || 'not_sent',
          amount: parseFloat(response.data.amount || 0),
          sponsorship_source: response.data.sponsorship_source || 'cdf',
          sponsor_name: response.data.sponsor_name,
          sponsorship_date: response.data.sponsorship_date,
          sponsorship_amount: response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0,
          sponsor_details: response.data.sponsor_details,
          rejection_reason: response.data.rejection_reason,
          total_allocation: response.data.total_allocation || 
            parseFloat(response.data.amount || 0) + (response.data.sponsorship_amount ? parseFloat(response.data.sponsorship_amount) : 0)
        };
        setStudents(prev => [newStudent, ...prev]);
        alert('Student added successfully!');
      }
      
      setFormData({
        name: '', registration_no: '', national_id: '', phone: '', guardian_phone: '', institution: '',
        course: '', year: '', ward: '', amount: '', education_level: 'high_school',
        sponsorship_source: 'cdf', sponsor_name: '', sponsorship_date: '',
        sponsorship_amount: '', sponsor_details: ''
      });
      setShowForm(false);
      setEditingStudent(null);
      
    } catch (error: any) {
      console.error("Error saving student:", error);
      alert(`Error saving student: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = filteredStudents;
      const csvRows = [];
      
      const headers = ['Name', 'Registration No', 'Phone', 'Guardian Phone', 'Institution', 'Course', 
                      'Year of Study', 'Ward', 'CDF Amount', 'Sponsorship Source', 'Sponsor Name', 
                      'Sponsorship Date', 'Sponsorship Amount', 'Total Allocation', 'Education Level', 
                      'Status', 'SMS Status'];
      csvRows.push(headers.join(','));
      
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
          student.sms_status
        ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(',');
        csvRows.push(row);
      });
      
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chepalungu-students-${currentYear}-${new Date().toISOString().split('T')[0]}.csv`);
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
          date_processed: new Date().toISOString()
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
          date_processed: new Date().toISOString()
        } : s
      ));
      alert('Student rejected!');
    } catch (error: any) {
      console.error('Error rejecting student:', error);
      alert(error.response?.data?.detail || 'Failed to reject student.');
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(filteredStudents.map(s => s.id));
      setSelectedStudents(allIds);
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

  const handleBulkApprove = async (ids?: number[]) => {
    const studentIds = ids || Array.from(selectedStudents);
    if (studentIds.length === 0) {
      alert('No students selected.');
      return;
    }
    if (!window.confirm(`Approve ${studentIds.length} student(s)?`)) return;
    try {
      const response = await studentsAPI.bulkApprove(studentIds);
      const data = response.data;
      alert(`✅ ${data.message}`);
      setSelectedStudents(new Set());
      fetchStudents();
    } catch (error: any) {
      console.error('Bulk approve error:', error);
      alert(`Failed to bulk approve: ${error.message || 'Unknown error'}`);
    }
  };

  const handleApproveAllPending = () => {
    const pendingIds = filteredStudents
      .filter(s => s.status === 'pending')
      .map(s => s.id);
    if (pendingIds.length === 0) {
      alert('No pending students to approve.');
      return;
    }
    handleBulkApprove(pendingIds);
  };

  const handleBulkSendSMS = async (ids?: number[]) => {
    const studentIds = ids || Array.from(selectedStudents);
    if (studentIds.length === 0) {
      alert('No students selected.');
      return;
    }
    if (!window.confirm(`Send SMS to ${studentIds.length} student(s)?`)) return;
    try {
      const response = await studentsAPI.bulkSendSMS(studentIds);
      const data = response.data;
      alert(`✅ ${data.message}`);
      setSelectedStudents(new Set());
      fetchStudents();
      fetchSmsBalance();
    } catch (error: any) {
      console.error('Bulk SMS error:', error);
      alert(`Failed to send SMS: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSendAllSMS = () => {
    const approvedIds = filteredStudents
      .filter(s => (s.status === 'approved' || s.status === 'disbursed') && s.sms_status !== 'sent')
      .map(s => s.id);
    if (approvedIds.length === 0) {
      alert('No approved students with unsent SMS.');
      return;
    }
    handleBulkSendSMS(approvedIds);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.registration_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.institution.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'approved' ? (student.status === 'approved' || student.status === 'disbursed') : student.status === selectedStatus);
      
      const matchesWard = selectedWard === 'all' || student.ward === selectedWard;
      
      const matchesEducationLevel = filterEducationLevel === 'all' || student.education_level === filterEducationLevel;
      
      const matchesSponsorshipSource = selectedSponsorshipSource === 'all' || student.sponsorship_source === selectedSponsorshipSource;
      
      return matchesSearch && matchesStatus && matchesWard && matchesEducationLevel && matchesSponsorshipSource;
    });
  }, [students, searchTerm, selectedStatus, selectedWard, filterEducationLevel, selectedSponsorshipSource]);

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const approvedStudents = filteredStudents.filter(s => s.status === 'approved' || s.status === 'disbursed').length;
  const pendingStudents = filteredStudents.filter(s => s.status === 'pending').length;
  const totalAllocated = filteredStudents.reduce((sum, s) => sum + (s.total_allocation || s.amount), 0);
  const averageAllocation = totalStudents > 0 ? totalAllocated / totalStudents : 0;
  
  // MP sponsored stats
  const mpSponsoredStudents = filteredStudents.filter(s => s.sponsorship_source === 'mp').length;
  const mpSponsoredAmount = filteredStudents
    .filter(s => s.sponsorship_source === 'mp')
    .reduce((sum, s) => sum + (s.sponsorship_amount || 0), 0);

  // SMS stats
  const smsSent = filteredStudents.filter(s => s.sms_status === 'sent').length;
  const smsFailed = filteredStudents.filter(s => s.sms_status === 'failed').length;
  const smsPending = filteredStudents.filter(s => s.sms_status === 'not_sent').length;

  const { isAdmin, isCommittee } = useAuth();

  const studentStats = [
    {
      title: 'Total Students',
      value: totalStudents.toString(),
      subtitle: `${pendingStudents} pending, ${approvedStudents} approved`,
      icon: <Users />,
      color: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Total Allocated',
      value: `Ksh ${totalAllocated.toLocaleString()}`,
      subtitle: `Average: Ksh ${averageAllocation.toLocaleString(undefined, { maximumFractionDigits: 0 })}${mpSponsoredAmount > 0 ? ` | MP: Ksh ${mpSponsoredAmount.toLocaleString()}` : ''}`,
      icon: <TrendingUp />,
      color: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'SMS Sent',
      value: smsSent.toString(),
      subtitle: `${smsFailed} failed, ${smsPending} pending`,
      icon: <Send />,
      color: 'text-purple-600',
      iconBg: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Student Allocations</h1>
          <p className="text-gray-600 mt-2">Manage and track Chepalungu CDF and MP-sponsored student bursary allocations</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => {
              fetchStudents();
              fetchSmsBalance();
            }}
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
            <Download size={18} className="mr-2" />
            Export
          </button>
          <button
            onClick={handleApproveAllPending}
            disabled={loading || filteredStudents.filter(s => s.status === 'pending').length === 0}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle size={18} className="mr-2" />
            Approve All Pending
          </button>
          <button
            onClick={handleSendAllSMS}
            disabled={loading || filteredStudents.filter(s => (s.status === 'approved' || s.status === 'disbursed') && s.sms_status !== 'sent').length === 0}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Send size={18} className="mr-2" />
            Send All SMS
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <UserPlus size={18} className="mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {studentStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
        <SMSCard balance={smsBalance} provider={smsProvider} />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search students..."
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
                <option value="approved">Approved/Disbursed</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

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

            <select
              value={selectedSponsorshipSource}
              onChange={(e) => setSelectedSponsorshipSource(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sponsors</option>
              {sponsorshipSources.map(sponsor => (
                <option key={sponsor.value} value={sponsor.value}>{sponsor.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection info */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleSelectAll}
              className="mr-3 flex items-center"
            >
              {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="ml-2 text-sm font-medium text-gray-700">
                Select All Filtered
              </span>
            </button>
            <span className="text-sm text-gray-500">
              {selectedStudents.size} student(s) selected
            </span>
          </div>
          {selectedStudents.size > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkApprove()}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => handleBulkSendSMS()}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Send SMS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Student Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Education</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SMS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <StudentRow
                    key={student.id}
                    student={student}
                    isSelected={selectedStudents.has(student.id)}
                    onSelect={handleSelect}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSendSMS={handleSendSMS}
                    userRole={user.role}
                  />
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found for {currentYear}</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedStatus !== 'all' || filterEducationLevel !== 'all' || selectedSponsorshipSource !== 'all'
              ? 'Try adjusting your search or filters.'
              : `No students have been added for ${currentYear} yet.`}
          </p>
          <div className="space-x-3">
            {!searchTerm && selectedStatus === 'all' && filterEducationLevel === 'all' && selectedSponsorshipSource === 'all' && (
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
                      course: '', year: '', ward: '', amount: '', education_level: 'high_school',
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
                      placeholder="SC/COM/0074"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID or Parent ID or Guardian ID
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter ID number"
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
                      placeholder="254712345678"
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
                      placeholder="254712345678"
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
                      <option value="high_school">High School</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
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
                        <option key={ward} value={ward}>{ward}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CDF Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      placeholder="0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave as 0 if fully sponsored by MP</p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    formData.sponsorship_source === 'mp' ? 'bg-yellow-50 border-yellow-200 shadow-sm' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <Crown size={16} className={`mr-2 ${formData.sponsorship_source === 'mp' ? 'text-yellow-600' : 'text-gray-400'}`} />
                      Sponsorship Type
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <select
                        value={formData.sponsorship_source}
                        onChange={(e) => setFormData({...formData, sponsorship_source: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      >
                        {sponsorshipSources.map(sponsor => (
                          <option key={sponsor.value} value={sponsor.value}>{sponsor.label}</option>
                        ))}
                      </select>
                      
                      {formData.sponsorship_source === 'mp' && (
                        <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded-lg border border-yellow-200 animate-pulse">
                          <CheckCircle size={16} className="text-yellow-700" />
                          <span className="text-xs font-bold text-yellow-800 uppercase">Fully Sponsored by Mheshimiwa</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.sponsorship_source !== 'cdf' && (
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.sponsorship_source === 'mp' ? 'Mheshimiwa Name (Optional)' : 'Sponsor Name'}
                        </label>
                        <input
                          type="text"
                          value={formData.sponsor_name}
                          onChange={(e) => setFormData({...formData, sponsor_name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder={formData.sponsorship_source === 'mp' ? 'Hon. MP Name' : 'Company/Person name'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sponsorship Amount (KES) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.sponsorship_amount}
                          onChange={(e) => setFormData({...formData, sponsorship_amount: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="e.g., 50000"
                        />
                      </div>
                    </div>
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
                        course: '', year: '', ward: '', amount: '', education_level: 'high_school',
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