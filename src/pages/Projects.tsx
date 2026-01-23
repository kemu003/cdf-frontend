import React, { useState, useEffect } from 'react';
import {
  Home,
  Building,
  Hammer,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface Project {
  id: number;
  name: string;
  project_code: string;
  type: 'construction' | 'renovation' | 'equipment' | 'training' | 'other';
  ward: string;
  budget: number;
  spent: number;
  status: 'planning' | 'ongoing' | 'completed' | 'delayed' | 'cancelled';
  start_date: string;
  end_date: string;
  contractor?: string;
  contact_person: string;
  contact_phone: string;
  description: string;
  progress: number;
  last_updated: string;
  milestones: Array<{
    id: number;
    name: string;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    completion_date?: string;
  }>;
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const statuses = [
    { value: 'planning', label: 'Planning', color: 'bg-blue-100 text-blue-800', icon: <Clock size={14} /> },
    { value: 'ongoing', label: 'Ongoing', color: 'bg-yellow-100 text-yellow-800', icon: <Hammer size={14} /> },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} /> },
    { value: 'delayed', label: 'Delayed', color: 'bg-orange-100 text-orange-800', icon: <AlertCircle size={14} /> },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <AlertCircle size={14} /> }
  ];

  const types = [
    { value: 'construction', label: 'Construction' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'training', label: 'Training' },
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

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Mock data
      setProjects([
        {
          id: 1,
          name: 'Nyangores Health Center Construction',
          project_code: 'PROJ-2024-001',
          type: 'construction',
          ward: 'Nyangores',
          budget: 10000000,
          spent: 6500000,
          status: 'ongoing',
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          contractor: 'BuildRight Construction',
          contact_person: 'Dr. Jane Mwangi',
          contact_phone: '0712345678',
          description: 'Construction of a new health center with maternity wing',
          progress: 65,
          last_updated: '2024-01-15',
          milestones: [
            { id: 1, name: 'Foundation Complete', due_date: '2024-01-31', status: 'completed', completion_date: '2024-01-28' },
            { id: 2, name: 'Structure Complete', due_date: '2024-03-31', status: 'in_progress' },
            { id: 3, name: 'Roofing Complete', due_date: '2024-04-30', status: 'pending' },
            { id: 4, name: 'Interior Works', due_date: '2024-05-31', status: 'pending' }
          ]
        },
        {
          id: 2,
          name: 'Sigor Secondary School Renovation',
          project_code: 'PROJ-2024-002',
          type: 'renovation',
          ward: 'Sigor',
          budget: 5000000,
          spent: 4500000,
          status: 'completed',
          start_date: '2023-11-01',
          end_date: '2024-01-15',
          contractor: 'EduBuild Ltd',
          contact_person: 'Mr. Samuel Kiptoo',
          contact_phone: '0723456789',
          description: 'Renovation of classroom blocks and administration block',
          progress: 100,
          last_updated: '2024-01-15',
          milestones: [
            { id: 1, name: 'Classroom Renovation', due_date: '2023-12-15', status: 'completed', completion_date: '2023-12-10' },
            { id: 2, name: 'Admin Block', due_date: '2024-01-15', status: 'completed', completion_date: '2024-01-12' }
          ]
        },
        {
          id: 3,
          name: 'Youth Entrepreneurship Training',
          project_code: 'PROJ-2024-003',
          type: 'training',
          ward: 'Chebunyo',
          budget: 2000000,
          spent: 1200000,
          status: 'ongoing',
          start_date: '2024-01-10',
          end_date: '2024-03-31',
          contractor: 'Youth Empowerment Agency',
          contact_person: 'Ms. Grace Akinyi',
          contact_phone: '0734567890',
          description: 'Entrepreneurship skills training for youth groups',
          progress: 60,
          last_updated: '2024-01-15',
          milestones: [
            { id: 1, name: 'Training Phase 1', due_date: '2024-01-31', status: 'completed', completion_date: '2024-01-25' },
            { id: 2, name: 'Training Phase 2', due_date: '2024-02-29', status: 'in_progress' },
            { id: 3, name: 'Business Plan Competition', due_date: '2024-03-15', status: 'pending' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesWard = selectedWard === 'all' || project.ward === selectedWard;
    const matchesType = selectedType === 'all' || project.type === selectedType;

    return matchesSearch && matchesStatus && matchesWard && matchesType;
  });

  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    delayed: projects.filter(p => p.status === 'delayed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
    avgProgress: projects.length > 0 ? 
      Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0
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
          <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
          <p className="text-gray-600 mt-2">Track and manage Chepalungu CDF development projects</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
          <button 
            onClick={() => {/* Navigate to new project form */}}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            New Project
          </button>
          <button 
            onClick={() => {/* Export functionality */}}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Projects</p>
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Ongoing</p>
          <p className="text-xl font-bold text-yellow-600">{stats.ongoing}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Delayed</p>
          <p className="text-xl font-bold text-orange-600">{stats.delayed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Total Budget</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalBudget)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Avg. Progress</p>
          <p className="text-xl font-bold text-blue-600">{stats.avgProgress}%</p>
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
              placeholder="Search projects by name, code, or description..."
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

      {/* Projects Grid */}
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
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => {
            const statusConfig = statuses.find(s => s.value === project.status);
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{project.project_code}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig?.color} flex items-center`}>
                        {statusConfig?.icon}
                        <span className="ml-1">{statusConfig?.label}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span>{project.ward} Ward</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building size={16} className="mr-2 text-gray-400" />
                    <span>{types.find(t => t.value === project.type)?.label}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span>
                      {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Budget */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Spent: {formatCurrency(project.spent)}</span>
                    <span>Remaining: {formatCurrency(project.budget - project.spent)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        project.progress >= 80 ? 'bg-green-500' :
                        project.progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones && project.milestones.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</p>
                    <div className="space-y-2">
                      {project.milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate">{milestone.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {milestone.status === 'completed' ? '✓' : milestone.status === 'in_progress' ? '⌛' : '◯'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedStatus !== 'all' || selectedWard !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first project'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedWard === 'all' && selectedType === 'all' && (
              <button
                onClick={() => {/* Navigate to new project form */}}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                Add First Project
              </button>
            )}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Project Header */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedProject.name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">{selectedProject.project_code}</span>
                    {(() => {
                      const statusConfig = statuses.find(s => s.value === selectedProject.status);
                      return (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${statusConfig?.color}`}>
                          {statusConfig?.icon}
                          <span className="ml-1">{statusConfig?.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Project Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span className="font-medium">
                            {types.find(t => t.value === selectedProject.type)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Ward:</span>
                          <span className="font-medium">{selectedProject.ward}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="font-medium">
                            {new Date(selectedProject.start_date).toLocaleDateString()} -{' '}
                            {new Date(selectedProject.end_date).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedProject.contractor && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Contractor:</span>
                            <span className="font-medium">{selectedProject.contractor}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Contact Person:</span>
                          <span className="font-medium">{selectedProject.contact_person}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="font-medium">{selectedProject.contact_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Financial Overview</h4>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Total Budget</span>
                            <span className="font-bold text-gray-900">{formatCurrency(selectedProject.budget)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Spent</span>
                            <span className="font-medium text-green-600">{formatCurrency(selectedProject.spent)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Remaining</span>
                            <span className="font-medium text-blue-600">
                              {formatCurrency(selectedProject.budget - selectedProject.spent)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Overall Progress</span>
                          <span className="font-bold text-gray-900">{selectedProject.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              selectedProject.progress >= 80 ? 'bg-green-500' :
                              selectedProject.progress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${selectedProject.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Project Description</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Milestones */}
                {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Project Milestones</h4>
                    <div className="space-y-4">
                      {selectedProject.milestones.map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              milestone.status === 'completed' ? 'bg-green-100 text-green-600' :
                              milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {milestone.status === 'completed' ? '✓' : 
                               milestone.status === 'in_progress' ? '⌛' : '◯'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{milestone.name}</p>
                              <p className="text-sm text-gray-500">
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                                {milestone.completion_date && (
                                  <span className="ml-2">
                                    • Completed: {new Date(milestone.completion_date).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                            milestone.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {milestone.status === 'completed' ? 'Completed' :
                             milestone.status === 'in_progress' ? 'In Progress' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {user.role === 'admin' && (
                    <>
                      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Update Progress
                      </button>
                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        Edit Project
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;