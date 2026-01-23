import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  MapPin,
  Edit,
  Save,
  X,
  Lock,
  Bell,
  Globe,
  Key,
  LogOut,
  CheckCircle,
  AlertCircle,
  Camera,
  UserCheck,
  Award,
  Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  ward?: string;
  avatar?: string;
  last_login: string;
  created_at: string;
  notification_preferences: {
    email_notifications: boolean;
    sms_notifications: boolean;
    application_updates: boolean;
    budget_alerts: boolean;
    deadline_reminders: boolean;
  };
  security_settings: {
    two_factor_auth: boolean;
    session_timeout: number;
    login_alerts: boolean;
  };
}

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ip_address?: string;
  device?: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    ward: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    sms_notifications: true,
    application_updates: true,
    budget_alerts: true,
    deadline_reminders: true
  });
  const [security, setSecurity] = useState({
    two_factor_auth: false,
    session_timeout: 30,
    login_alerts: true
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/profile/');
      setProfile(response.data);
      setEditForm({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        department: response.data.department,
        ward: response.data.ward || ''
      });
      setNotifications(response.data.notification_preferences);
      setSecurity(response.data.security_settings);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Mock data
      setProfile({
        id: 1,
        name: user?.name || 'Administrator',
        email: user?.email || 'admin@chepalungucdf.go.ke',
        phone: '0712345678',
        role: user?.role || 'admin',
        department: 'CDF Administration',
        ward: 'Nyangores',
        avatar: null,
        last_login: new Date().toISOString(),
        created_at: '2023-01-01T00:00:00Z',
        notification_preferences: {
          email_notifications: true,
          sms_notifications: true,
          application_updates: true,
          budget_alerts: true,
          deadline_reminders: true
        },
        security_settings: {
          two_factor_auth: false,
          session_timeout: 30,
          login_alerts: true
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await api.get('/profile/activity-logs/');
      setActivityLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      // Mock data
      setActivityLogs([
        {
          id: 1,
          action: 'LOGIN',
          description: 'Successfully logged in',
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.1',
          device: 'Chrome on Windows'
        },
        {
          id: 2,
          action: 'PROFILE_UPDATE',
          description: 'Updated profile information',
          timestamp: '2024-01-14T10:30:00Z',
          ip_address: '192.168.1.1',
          device: 'Chrome on Windows'
        },
        {
          id: 3,
          action: 'STUDENT_APPROVAL',
          description: 'Approved student application for John Kamau',
          timestamp: '2024-01-13T14:20:00Z',
          ip_address: '192.168.1.1',
          device: 'Chrome on Windows'
        },
        {
          id: 4,
          action: 'REPORT_GENERATION',
          description: 'Generated monthly report',
          timestamp: '2024-01-12T11:15:00Z',
          ip_address: '192.168.1.100',
          device: 'Firefox on macOS'
        },
        {
          id: 5,
          action: 'PASSWORD_CHANGE',
          description: 'Changed account password',
          timestamp: '2024-01-10T09:45:00Z',
          ip_address: '192.168.1.1',
          device: 'Chrome on Windows'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchActivityLogs();
  }, []);

  const handleSaveProfile = async () => {
    try {
      await api.put('/profile/', editForm);
      setProfile(prev => prev ? { ...prev, ...editForm } : null);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      await api.put('/profile/change-password/', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setShowPasswordForm(false);
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const handleNotificationToggle = async (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await api.put('/profile/notifications/', updated);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handleSecurityToggle = async (key: keyof typeof security, value?: any) => {
    const updated = { ...security, [key]: value !== undefined ? value : !security[key] };
    setSecurity(updated);
    try {
      await api.put('/profile/security/', updated);
    } catch (error) {
      console.error('Error updating security settings:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      committee: 'bg-blue-100 text-blue-800',
      finance: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    
    const labels: Record<string, string> = {
      admin: 'Administrator',
      committee: 'Committee Member',
      finance: 'Finance Officer',
      viewer: 'Viewer'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
      </span>
    );
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editing ? (
              <>
                <X size={18} className="mr-2" />
                Cancel Edit
              </>
            ) : (
              <>
                <Edit size={18} className="mr-2" />
                Edit Profile
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="flex items-center justify-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
          >
            <LogOut size={18} className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-50">
                    <Camera size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(profile.role)}
                      <span className="text-sm text-gray-500">{profile.department}</span>
                    </div>
                  </div>
                  {!editing && (
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Key size={16} className="mr-1" />
                      Change Password
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({...editForm, department: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      {profile.role === 'committee' && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ward Representation
                          </label>
                          <select
                            value={editForm.ward}
                            onChange={(e) => setEditForm({...editForm, ward: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Ward</option>
                            <option value="Nyangores">Nyangores</option>
                            <option value="Sigor">Sigor</option>
                            <option value="Chebunyo">Chebunyo</option>
                            <option value="Siongiroi">Siongiroi</option>
                            <option value="kongasis">kongasis</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">{profile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Building size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Department</p>
                          <p className="font-medium text-gray-900">{profile.department}</p>
                        </div>
                      </div>
                      {profile.ward && (
                        <div className="flex items-center space-x-3">
                          <MapPin size={18} className="text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Ward</p>
                            <p className="font-medium text-gray-900">{profile.ward}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <Calendar size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="font-medium text-gray-900">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <UserCheck size={18} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Last Login</p>
                          <p className="font-medium text-gray-900">
                            {new Date(profile.last_login).toLocaleDateString()} at{' '}
                            {new Date(profile.last_login).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          {showPasswordForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowPasswordForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    log.action.includes('LOGIN') ? 'bg-green-100 text-green-600' :
                    log.action.includes('APPROVAL') ? 'bg-blue-100 text-blue-600' :
                    log.action.includes('UPDATE') ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {log.action.includes('LOGIN') ? <UserCheck size={18} /> :
                     log.action.includes('APPROVAL') ? <CheckCircle size={18} /> :
                     log.action.includes('UPDATE') ? <Edit size={18} /> : <AlertCircle size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      {log.device && <span>{log.device}</span>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    log.action.includes('SUCCESS') ? 'bg-green-100 text-green-800' :
                    log.action.includes('FAIL') ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('email_notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.email_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via SMS</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('sms_notifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications.sms_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Application Updates</p>
                  <p className="text-sm text-gray-600">Get notified about new applications</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('application_updates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications.application_updates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.application_updates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Budget Alerts</p>
                  <p className="text-sm text-gray-600">Notifications about budget changes</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('budget_alerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications.budget_alerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.budget_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Deadline Reminders</p>
                  <p className="text-sm text-gray-600">Reminders for upcoming deadlines</p>
                </div>
                <button
                  onClick={() => handleNotificationToggle('deadline_reminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    notifications.deadline_reminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.deadline_reminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <button
                  onClick={() => handleSecurityToggle('two_factor_auth')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    security.two_factor_auth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      security.two_factor_auth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">Session Timeout</p>
                  <span className="text-sm text-gray-600">{security.session_timeout} minutes</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={security.session_timeout}
                  onChange={(e) => handleSecurityToggle('session_timeout', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>2 hours</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Login Alerts</p>
                  <p className="text-sm text-gray-600">Get notified of new logins</p>
                </div>
                <button
                  onClick={() => handleSecurityToggle('login_alerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    security.login_alerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      security.login_alerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className="font-medium">{profile.role.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Storage Used</span>
                <span className="font-medium">1.2 GB / 10 GB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Access</span>
                <span className="font-medium">
                  {profile.role === 'admin' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                Request Account Deletion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;