import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Camera, 
  Save,
  Eye,
  EyeOff,
  Building,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [newAvatar, setNewAvatar] = useState('');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  // Mock password for display (in real app, this would come from the auth system)
  const userPassword = user?.email === 'admin@gir.com' ? 'admin123' :
                      user?.email === 'manager@gir.com' ? 'manager123' :
                      user?.email === 'designer@gir.com' ? 'designer123' :
                      user?.email === 'billing@gir.com' ? 'billing123' : '********';

  const handleAvatarChange = async () => {
    if (!newAvatar.trim()) {
      toast.error('Please enter a valid avatar URL');
      return;
    }

    setIsUpdatingAvatar(true);
    try {
      // Update the user's avatar in the store
      updateProfile({ avatar: newAvatar });
      setNewAvatar('');
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrator', color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'manager':
        return { label: 'Project Manager', color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'designer':
        return { label: '3D Designer', color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'billing':
        return { label: 'Billing Team', color: 'text-purple-600', bgColor: 'bg-purple-100' };
      default:
        return { label: 'User', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user?.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>User Information</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Full Name</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.name || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.email || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Role</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${roleInfo.bgColor} ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Password</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 flex items-center justify-between">
                <span className="text-gray-900">
                  {showPassword ? userPassword : '••••••••'}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password is read-only for security reasons
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Department</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.department || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Phone Number</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.phone || 'Not provided'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.location || 'Not specified'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Member Since</span>
              </label>
              <div className="bg-gray-50 rounded-md px-3 py-2 text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Avatar Settings</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user?.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  placeholder="Enter avatar image URL"
                  className="flex-1 input-field"
                />
                <button
                  onClick={handleAvatarChange}
                  disabled={isUpdatingAvatar || !newAvatar.trim()}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdatingAvatar ? 'Updating...' : 'Update'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid image URL to update your avatar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Account Security</h3>
            <p className="text-sm text-blue-700 mt-1">
              For security reasons, password changes are not available through this interface. 
              Please contact your system administrator if you need to change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 