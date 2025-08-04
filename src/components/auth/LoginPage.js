import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Loader2,
  Building,
  Crown,
  Users,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      redirectToDashboard(user.role);
    }
  }, [user]);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'manager':
        navigate('/projects');
        break;
      case 'designer':
        navigate('/dashboard');
        break;
      case 'billing':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account before logging in.');
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        // Get user profile from our users table
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast.error('Failed to load user profile. Please contact your administrator.');
          return;
        }

        // Login with user data including role
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: profileData.name,
          role: profileData.role,
          avatar: profileData.avatar,
          phone: profileData.phone,
          department: profileData.department,
          position: profileData.position
        };

        const loginResult = await login(userData);
        
        if (loginResult.success) {
          toast.success(`Welcome back, ${userData.name}!`);
          // Add a small delay to ensure state is updated
          setTimeout(() => {
            redirectToDashboard(userData.role);
          }, 100);
        } else {
          toast.error(loginResult.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getRoleInfo = (role) => {
    const roles = {
      admin: { label: 'Admin', icon: Crown, color: 'text-red-600', bg: 'bg-red-50' },
      manager: { label: 'Project Manager', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
      designer: { label: '3D Designer', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
      billing: { label: 'Billing Team', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' }
    };
    return roles[role] || roles.designer;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 mb-4">
            <img 
              src="https://i.ibb.co/0RLKgHD6/GIR-2.png"
              alt="GET IT RENDERED Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your GET IT RENDERED Project Manager account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-12 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => toast.info('Contact your administrator to reset your password')}
              className="text-sm text-yellow-600 hover:text-yellow-500 font-medium"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Role Information */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Roles</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: 'admin', label: 'Admin', icon: Crown },
              { role: 'manager', label: 'Manager', icon: Building },
              { role: 'designer', label: 'Designer', icon: Users },
              { role: 'billing', label: 'Billing', icon: Shield }
            ].map(({ role, label, icon: Icon }) => {
              const roleInfo = getRoleInfo(role);
              return (
                <div key={role} className={`flex items-center p-3 rounded-lg ${roleInfo.bg}`}>
                  <Icon className={`h-5 w-5 ${roleInfo.color} mr-2`} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © 2024 GET IT RENDERED. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 