import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase, TABLES, isSupabaseConfigured } from '../../lib/supabase';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  Building,
  Crown,
  Users,
  Shield,
  Key
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState({ show: false, user: null, password: '' });
  const [showPasswordModal, setShowPasswordModal] = useState({ show: false, user: null, newPassword: '' });
  const [showPasswordDisplay, setShowPasswordDisplay] = useState({ show: false, user: null });
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'designer',
    phone: '',
    department: '',
    position: '',
    password: ''
  });

  const roles = [
    { value: 'admin', label: 'Admin', icon: Crown, color: 'text-red-600' },
    { value: 'manager', label: 'Project Manager', icon: Building, color: 'text-blue-600' },
    { value: 'designer', label: '3D Designer', icon: Users, color: 'text-green-600' },
    { value: 'billing', label: 'Billing Team', icon: Shield, color: 'text-purple-600' }
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to fetch users from database');
        // Fallback to empty array
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      let authData;
      
      // Use custom password or generate one if not provided
      const userPassword = newUser.password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
      
      // First create the user in Supabase Auth with auto-confirmation
      const { data: adminAuthData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: userPassword,
        email_confirm: true,
        email_confirm_redirect_to: null, // Prevent email confirmation redirect
        user_metadata: {
          name: newUser.name,
          role: newUser.role
        }
      });

                   if (authError) {
        console.error('Auth error:', authError);
        
        // Try to manually confirm the user if it already exists
        try {
          const { data: existingUser } = await supabase.auth.admin.getUserByEmail(newUser.email);
          if (existingUser.user && !existingUser.user.email_confirmed_at) {
            // Manually confirm the user
            const { data: confirmData, error: confirmError } = await supabase.auth.admin.updateUserById(
              existingUser.user.id,
              { 
                email_confirm: true,
                email_confirmed_at: new Date().toISOString()
              }
            );
            
            if (!confirmError) {
              authData = { user: confirmData.user };
            } else {
              throw confirmError;
            }
          } else {
            throw authError;
          }
        } catch (confirmError) {
          console.error('Confirmation error:', confirmError);
          // If all else fails, try regular signup
          const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: newUser.email,
            password: userPassword,
            options: {
              data: {
                name: newUser.name,
                role: newUser.role
              }
            }
          });

          if (signupError) throw signupError;
          authData = signupData;
        }
      } else {
        authData = adminAuthData;
      }

             // Then create the user profile with better error handling
       const userProfileData = {
         id: authData.user.id,
         email: newUser.email,
         name: newUser.name,
         role: newUser.role,
         phone: newUser.phone,
         department: newUser.department,
         position: newUser.position,
         created_at: new Date().toISOString()
       };

       // Try to include password if the column exists
       try {
         const { error: profileError } = await supabase
           .from(TABLES.USERS)
           .insert({
             ...userProfileData,
             password: userPassword // Store password for admin reference
           });

         if (profileError) {
           console.error('Profile error with password:', profileError);
           
           // If password column doesn't exist, try without it
           if (profileError.message.includes('password')) {
             console.log('Password column not found, creating user without password storage');
             const { error: profileErrorWithoutPassword } = await supabase
               .from(TABLES.USERS)
               .insert(userProfileData);

             if (profileErrorWithoutPassword) {
               console.error('Profile error without password:', profileErrorWithoutPassword);
               
               // If it's an RLS error, provide helpful message
               if (profileErrorWithoutPassword.message.includes('row-level security')) {
                 toast.error('Permission denied. Please check your database RLS policies or contact your administrator.');
               } else {
                 toast.error(`Failed to create user profile: ${profileErrorWithoutPassword.message}`);
               }
               return;
             }
           } else {
             // If it's an RLS error, provide helpful message
             if (profileError.message.includes('row-level security')) {
               toast.error('Permission denied. Please check your database RLS policies or contact your administrator.');
             } else {
               toast.error(`Failed to create user profile: ${profileError.message}`);
             }
             return;
           }
                  }
       } catch (error) {
         console.error('Error creating user profile:', error);
         toast.error(`Failed to create user profile: ${error.message}`);
         return;
       }

      // Show success message with password
      toast.success(`User created successfully! Password: ${userPassword}`);
      
      // Show detailed success modal
      setShowSuccessModal({
        show: true,
        user: newUser,
        password: userPassword
      });
      
      setShowAddModal(false);
      setNewUser({
        email: '',
        name: '',
        role: 'designer',
        phone: '',
        department: '',
        position: '',
        password: ''
      });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          name: selectedUser.name,
          role: selectedUser.role,
          phone: selectedUser.phone,
          department: selectedUser.department,
          position: selectedUser.position,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      // Delete from auth.users (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        // If we can't delete from auth, just delete from our users table
        const { error } = await supabase
          .from(TABLES.USERS)
          .delete()
          .eq('id', userId);

        if (error) throw error;
      }

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      console.log('Updating password for user:', showPasswordModal.user.id);
      console.log('New password:', showPasswordModal.newPassword);
      
      // Try using the admin API to update the password
      const { data, error } = await supabase.auth.admin.updateUserById(
        showPasswordModal.user.id,
        { 
          password: showPasswordModal.newPassword,
          email_confirm: true
        }
      );

      if (error) {
        console.error('Admin API error:', error);
        
        // If admin API fails, try alternative approach
        toast.error(`Password update failed: ${error.message}`);
        return;
      }

      console.log('Password update successful:', data);
      toast.success('Password updated successfully');
      setShowPasswordModal({ show: false, user: null, newPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(`Failed to update password: ${error.message}`);
    }
  };

  const generateRandomPassword = () => {
    const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    setShowPasswordModal(prev => ({ ...prev, newPassword: password }));
  };

  const resetUserPassword = async () => {
    try {
      console.log('Resetting password for user:', showPasswordModal.user.email);
      
      // Try to reset password via email
      const { error } = await supabase.auth.resetPasswordForEmail(
        showPasswordModal.user.email,
        {
          redirectTo: window.location.origin
        }
      );

      if (error) {
        console.error('Reset password error:', error);
        toast.error(`Password reset failed: ${error.message}`);
        return;
      }

      toast.success('Password reset email sent to user');
      setShowPasswordModal({ show: false, user: null, newPassword: '' });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(`Failed to reset password: ${error.message}`);
    }
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[2];
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Shield size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only administrators can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage your team members and their roles</p>
          
        </div>
        
                 <button
           onClick={() => setShowAddModal(true)}
           className="btn-primary flex items-center space-x-2"
         >
          <UserPlus size={16} />
          <span>Add User</span>
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Team Members ({users.length})</h3>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Add your first team member to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map(user => {
                const roleInfo = getRoleInfo(user.role);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <div key={user.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full bg-blue-100 flex items-center justify-center" style={{ display: user.avatar ? 'none' : 'flex' }}>
                          <span className="text-blue-600 font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{user.name}</h4>
                          <div className={`flex items-center space-x-1 ${roleInfo.color}`}>
                            <RoleIcon size={14} />
                            <span className="text-xs font-medium">{roleInfo.label}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.position && (
                          <p className="text-xs text-gray-500">{user.position}</p>
                        )}
                      </div>
                    </div>
                    
                                         <div className="flex items-center space-x-2">
                       <button
                         onClick={() => {
                           setSelectedUser(user);
                           setShowEditModal(true);
                         }}
                         className="p-2 text-gray-400 hover:text-blue-600"
                         title="Edit User"
                       >
                         <Edit size={16} />
                       </button>
                       <button
                         onClick={() => {
                           setShowPasswordDisplay({
                             show: true,
                             user: user
                           });
                         }}
                         className="p-2 text-gray-400 hover:text-green-600"
                         title="View Password"
                       >
                         <Eye size={16} />
                       </button>
                       <button
                         onClick={() => {
                           setShowPasswordModal({
                             show: true,
                             user: user,
                             newPassword: ''
                           });
                         }}
                         className="p-2 text-gray-400 hover:text-yellow-600"
                         title="Manage Password"
                       >
                         <Key size={16} />
                       </button>
                       <button
                         onClick={() => handleDeleteUser(user.id)}
                         className="p-2 text-gray-400 hover:text-red-600"
                         title="Delete User"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-field"
                  placeholder="user@getitrendered.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input-field"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={newUser.position}
                  onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                  className="input-field"
                  placeholder="Senior 3D Designer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="input-field"
                  placeholder="3D Design"
                />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Phone
                 </label>
                 <input
                   type="tel"
                   value={newUser.phone}
                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                   className="input-field"
                   placeholder="+91 98765 43210"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Password
                 </label>
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     value={newUser.password}
                     onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                     className="input-field flex-1"
                     placeholder="Leave empty for auto-generated password"
                   />
                   <button
                     type="button"
                     onClick={() => {
                       const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
                       setNewUser({ ...newUser, password: randomPassword });
                     }}
                     className="px-3 py-2 bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 text-sm"
                     title="Generate Random Password"
                   >
                     Generate
                   </button>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">
                   Leave empty to auto-generate, or set a custom password
                 </p>
               </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="btn-primary"
                disabled={!newUser.email || !newUser.name}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="input-field"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={selectedUser.position || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, position: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={selectedUser.department || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="btn-primary"
                disabled={!selectedUser.name}
              >
                Update User
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* Success Modal */}
       {showSuccessModal.show && showSuccessModal.user && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-2">User Created Successfully!</h3>
               <p className="text-gray-600 mb-4">The user has been created and can now log in.</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-4 mb-4">
               <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
               <div className="space-y-2 text-sm">
                 <div><span className="font-medium">Name:</span> {showSuccessModal.user.name}</div>
                 <div><span className="font-medium">Email:</span> {showSuccessModal.user.email}</div>
                 <div><span className="font-medium">Role:</span> {showSuccessModal.user.role}</div>
                 <div><span className="font-medium">Temporary Password:</span> 
                   <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2 font-mono">
                     {showSuccessModal.password}
                   </span>
                 </div>
               </div>
             </div>
             
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
               <h4 className="font-medium text-blue-900 mb-2">Important:</h4>
               <ul className="text-sm text-blue-800 space-y-1">
                 <li>• Share the temporary password with the user</li>
                 <li>• User should change password on first login</li>
                 <li>• User is already confirmed and can log in immediately</li>
               </ul>
             </div>
             
             <div className="flex justify-end">
               <button
                 onClick={() => setShowSuccessModal({ show: false, user: null, password: '' })}
                 className="btn-primary"
               >
                 Got it!
               </button>
             </div>
           </div>
         </div>
                )}

       {/* Password Management Modal */}
       {showPasswordModal.show && showPasswordModal.user && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="text-center mb-4">
               <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Key className="w-6 h-6 text-yellow-600" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">Manage Password</h3>
               <p className="text-gray-600">Update password for {showPasswordModal.user.name}</p>
             </div>
             
                           <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={showPasswordModal.newPassword}
                      onChange={(e) => setShowPasswordModal(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="input-field flex-1"
                      placeholder="Enter new password"
                    />
                    <button
                      onClick={generateRandomPassword}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 text-sm"
                      title="Generate Random Password"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-900 mb-2 text-sm">Password Requirements:</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Minimum 6 characters</li>
                    <li>• Should be easy to remember</li>
                    <li>• Share securely with the user</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-medium text-yellow-900 mb-2 text-sm">Alternative Options:</h4>
                  <p className="text-xs text-yellow-800 mb-2">
                    If direct password update fails, you can send a password reset email to the user.
                  </p>
                  <button
                    onClick={resetUserPassword}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded border hover:bg-yellow-200 text-xs"
                  >
                    Send Reset Email
                  </button>
                </div>
              </div>
             
             <div className="flex items-center justify-end space-x-3 mt-6">
               <button
                 onClick={() => setShowPasswordModal({ show: false, user: null, newPassword: '' })}
                 className="btn-secondary"
               >
                 Cancel
               </button>
               <button
                 onClick={handleUpdatePassword}
                 className="btn-primary"
                 disabled={!showPasswordModal.newPassword || showPasswordModal.newPassword.length < 6}
               >
                 Update Password
               </button>
             </div>
           </div>
         </div>
                )}

       {/* Password Display Modal */}
       {showPasswordDisplay.show && showPasswordDisplay.user && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-6 w-full max-w-md">
             <div className="text-center mb-4">
               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Eye className="w-6 h-6 text-green-600" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">View Password</h3>
               <p className="text-gray-600">Password for {showPasswordDisplay.user.name}</p>
             </div>
             
             <div className="bg-gray-50 rounded-lg p-4 mb-4">
               <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
               <div className="space-y-2 text-sm">
                 <div><span className="font-medium">Name:</span> {showPasswordDisplay.user.name}</div>
                 <div><span className="font-medium">Email:</span> {showPasswordDisplay.user.email}</div>
                 <div><span className="font-medium">Role:</span> {showPasswordDisplay.user.role}</div>
                 <div><span className="font-medium">Stored Password:</span> 
                   <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2 font-mono">
                     {showPasswordDisplay.user.password || 'Not available'}
                   </span>
                 </div>
               </div>
             </div>
             
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
               <h4 className="font-medium text-blue-900 mb-2 text-sm">Note:</h4>
               <ul className="text-xs text-blue-800 space-y-1">
                 <li>• This is the password stored when user was created</li>
                 <li>• User may have changed their password since then</li>
                 <li>• Use "Manage Password" to update if needed</li>
               </ul>
             </div>
             
             <div className="flex justify-end">
               <button
                 onClick={() => setShowPasswordDisplay({ show: false, user: null })}
                 className="btn-primary"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default UserManagement; 