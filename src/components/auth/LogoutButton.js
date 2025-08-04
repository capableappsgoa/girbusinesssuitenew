import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const LogoutButton = () => {
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Logout"
    >
      <LogOut size={16} />
      <span className="text-sm font-medium">Logout</span>
    </button>
  );
};

export default LogoutButton; 