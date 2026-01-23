import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Clipboard, 
  Users, 
  CheckCircle,
  Award,
  Building,
  GraduationCap,
  Shield,
  TrendingUp,
  BarChart3,
  DollarSign,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <GraduationCap className="w-12 h-12 text-blue-600" />,
      title: 'Student Bursary Management',
      description: 'Efficiently manage student applications, approvals, and disbursements for educational support.',
      color: 'bg-blue-50'
    },
    {
      icon: <Building className="w-12 h-12 text-green-600" />,
      title: 'Project Tracking',
      description: 'Monitor CDF projects from initiation to completion with real-time progress updates.',
      color: 'bg-green-50'
    },
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: 'Committee Oversight',
      description: 'Track committee activities and ensure transparent fund allocation across all wards.',
      color: 'bg-purple-50'
    },
    {
      icon: <DollarSign className="w-12 h-12 text-yellow-600" />,
      title: 'Budget Management',
      description: 'Comprehensive financial tracking and reporting for all CDF allocations.',
      color: 'bg-yellow-50'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-red-600" />,
      title: 'Real-time Analytics',
      description: 'Data-driven insights and reports for informed decision making.',
      color: 'bg-red-50'
    },
    {
      icon: <Shield className="w-12 h-12 text-indigo-600" />,
      title: 'Secure & Transparent',
      description: 'Bank-level security with complete transparency in all transactions.',
      color: 'bg-indigo-50'
    }
  ];

  const stats = [
    { label: 'Students Supported', value: '5,000+', icon: <GraduationCap className="w-6 h-6" /> },
    { label: 'Projects Completed', value: '250+', icon: <CheckCircle className="w-6 h-6" /> },
    { label: 'Wards Covered', value: '12', icon: <MapPin className="w-6 h-6" /> },
    { label: 'Total Allocation', value: 'KSh 250M+', icon: <DollarSign className="w-6 h-6" /> }
  ];

  const wards = [
    'Chebwai', 'Cheborge', 'Chemosot', 'Kapkatet',
    'Kibugat', 'Kimulot', 'Kipsonoi', 'Kisiara',
    'Litein', 'Mogogosiek', 'Sotik'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Chepalungu Constituency</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Chepalungu CDF Management System
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Empowering communities through transparent and efficient management of Constituency Development Funds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                    <GraduationCap className="w-12 h-12 mb-4" />
                    <h3 className="font-bold text-lg">Student Portal</h3>
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                    <Building className="w-12 h-12 mb-4" />
                    <h3 className="font-bold text-lg">Projects</h3>
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                    <Users className="w-12 h-12 mb-4" />
                    <h3 className="font-bold text-lg">Committee</h3>
                  </div>
                  <div className="bg-white/20 p-6 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-12 h-12 mb-4" />
                    <h3 className="font-bold text-lg">Reports</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <div className="text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive CDF Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage Constituency Development Funds efficiently and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${feature.color} p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-blue-200`}
              >
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wards Coverage */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serving All Chepalungu Wards
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive CDF management across all 12 wards of Chepalungu Constituency.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {wards.map((ward, index) => (
              <div
                key={index}
                className="bg-gray-50 hover:bg-blue-50 p-4 rounded-lg text-center transition-colors group cursor-pointer"
              >
                <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-900 group-hover:text-blue-700">
                  {ward}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform CDF Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join us in creating a more transparent and efficient CDF system for Chepalungu Constituency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Login to Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Contact Support
              <Phone className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Chepalungu CDF</h3>
                  <p className="text-sm text-gray-400">Management System</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering communities through transparent and efficient management of Constituency Development Funds.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition">Dashboard</Link></li>
                <li><Link to="/students" className="text-gray-400 hover:text-white transition">Students</Link></li>
                <li><Link to="/projects" className="text-gray-400 hover:text-white transition">Projects</Link></li>
                <li><Link to="/reports" className="text-gray-400 hover:text-white transition">Reports</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/docs" className="text-gray-400 hover:text-white transition">Documentation</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Contact Info</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="w-5 h-5" />
                  <span>Chepalungu Constituency Office</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <Phone className="w-5 h-5" />
                  <span>+254 700 000 000</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>info@Chepalungucdf.go.ke</span>
                </li>
                <li className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-5 h-5" />
                  <span>Mon - Fri, 8AM - 5PM</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Chepalungu Constituency Development Fund. All rights reserved.</p>
            <p className="mt-2">Designed for transparent and efficient CDF management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}