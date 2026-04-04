import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, User, Lock, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(identifier, password);
      if (result.success) {
        // Show success toast
        setSuccessToast(true);
        
        // Navigate after a brief delay to show the toast
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide success toast after 2 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => {
        setSuccessToast(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/40">
        {/* Branding Section (Mobile: Top, Desktop: Left) */}
        <div className="w-full lg:w-[45%] h-48 lg:h-auto relative">
          <img 
            src="/cdf1.jpg" 
            alt="Chepalungu CDF" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-blue-900/10 flex flex-col justify-end p-6 lg:p-10">
            <div className="space-y-2 lg:space-y-3">
              <div className="h-1 w-10 lg:w-12 bg-blue-400 rounded-full"></div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                Empowering <br className="hidden lg:block" />
                Chepalungu
              </h2>
              <p className="text-blue-100/90 text-xs lg:text-sm font-medium leading-relaxed max-w-xs">
                Streamlining Constituency Development Funds for a better and brighter future.
              </p>
            </div>
          </div>
        </div>

        {/* Login Form Section (Mobile: Bottom, Desktop: Right) */}
        <div className="w-full lg:w-[55%] p-8 sm:p-10 lg:p-14 flex flex-col justify-center bg-white/50">
          <div className="max-w-sm mx-auto w-full">
          {/* Header Section */}
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-1 leading-tight">
              Chepalungu CDF: Streamlining Constituency Development Funds for a better and brighter future
            </h1>
            <div className="h-1 w-10 bg-blue-600 rounded-full mb-6 mx-auto lg:mx-0"></div>
            <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account to continue</p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-2xl flex items-center space-x-3 animate-shake">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}

              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label htmlFor="identifier" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Account Identifier
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="identifier"
                    type="text"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all font-medium"
                    placeholder="Account Identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Security Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 focus:bg-white transition-all font-medium"
                    placeholder="Security Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-blue-500/20 transform transition-all active:scale-[0.98] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base mt-6 uppercase tracking-widest"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Access Dashboard</span>
                )}
              </button>
            </form>

            {/* Footer Copyright */}
            <div className="mt-14 text-center lg:text-left">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} Chepalungu Constituency
                <span className="mx-2 opacity-30">|</span>
                Secure System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern CSS animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default Login;