import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { fetchUsers } from '../../services/projectService';
import { User, ChevronDown, LogOut } from 'lucide-react';

const UserSwitcher = ({ allowedUsers = null }) => {
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await fetchUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleUserSwitch = async (targetUser) => {
    if (!user || !canSwitchUsers()) return;
    
    setIsLoading(true);
    try {
      // Store the original user for switching back
      if (!selectedUser) {
        setSelectedUser(user);
      }
      
      // Update the auth store with the target user
      useAuthStore.getState().updateProfile(targetUser);
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchBack = () => {
    if (selectedUser) {
      useAuthStore.getState().updateProfile(selectedUser);
      setSelectedUser(null);
    }
  };

  const handleLogout = () => {
    // If we're in a switched state, switch back first
    if (selectedUser) {
      handleSwitchBack();
    }
    logout();
  };

  // Check if current user can switch users
  const canSwitchUsers = () => {
    if (!user) return false;
    
    // If allowedUsers is specified, check if current user is in the list
    if (allowedUsers && Array.isArray(allowedUsers)) {
      return allowedUsers.includes(user.id) || allowedUsers.includes(user.email);
    }
    
    // Default behavior: only admins and managers can switch
    return user.role === 'admin' || user.role === 'manager';
  };

  // Only show if user can switch
  if (!canSwitchUsers()) {
    return null;
  }

  const currentDisplayUser = selectedUser || user;

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* Current User Display */}
        
        

        {/* User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <User size={16} />
            <span className="text-sm font-medium">Switch User</span>
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg border shadow-lg z-50">
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-900">Switch to User Dashboard</h3>
                <p className="text-xs text-gray-500 mt-1">
                  View the dashboard as another user
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {users.map((userOption) => (
                  <button
                    key={userOption.id}
                    onClick={() => handleUserSwitch(userOption)}
                    disabled={userOption.id === currentDisplayUser?.id}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-50 border-b last:border-b-0"
                  >
                    {userOption.avatar ? (
                      <img 
                        src={userOption.avatar} 
                        alt={userOption.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {userOption.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {userOption.role}
                      </p>
                    </div>
                    {userOption.id === currentDisplayUser?.id && (
                      <span className="text-xs text-blue-600 font-medium">Current</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Switch Back Option */}
              {selectedUser && (
                <div className="p-3 border-t bg-gray-50">
                  <button
                    onClick={handleSwitchBack}
                    className="w-full flex items-center justify-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <LogOut size={16} />
                    <span>Switch Back to {selectedUser?.role === 'admin' ? 'Admin' : 'Manager'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserSwitcher;
