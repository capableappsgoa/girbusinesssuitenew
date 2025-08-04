import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, TABLES, isSupabaseConfigured } from '../lib/supabase';
import { fetchUsers } from '../services/projectService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (userData) => {
        set({ isLoading: true });
        
        try {
          console.log('Login attempt with userData:', userData);
          console.log('isSupabaseConfigured():', isSupabaseConfigured());
          
          // Check if Supabase is properly configured
          if (!isSupabaseConfigured()) {
            // Supabase not configured, use mock users
            const mockUsers = [
              {
                id: '1',
                email: 'admin@gir.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
              },
              {
                id: '2',
                email: 'manager@gir.com',
                password: 'manager123',
                name: 'Project Manager',
                role: 'manager',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
              },
              {
                id: '3',
                email: 'designer@gir.com',
                password: 'designer123',
                name: '3D Designer',
                role: 'designer',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
              },
              {
                id: '4',
                email: 'billing@gir.com',
                password: 'billing123',
                name: 'Billing Team',
                role: 'billing',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
              }
            ];

            const user = mockUsers.find(u => u.email === userData.email && u.password === userData.password);
            
            if (user) {
              const { password, ...userWithoutPassword } = user;
              set({
                user: userWithoutPassword,
                isAuthenticated: true,
                isLoading: false
              });
              return { success: true };
            } else {
              set({ isLoading: false });
              return { success: false, error: 'Invalid credentials' };
            }
          }

          // For Supabase, userData should already contain the authenticated user info
          console.log('Setting auth state with userData:', userData);
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          });
          
          console.log('Auth state updated successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Login failed' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password
          });
          
          if (error) throw error;
          
          // Create user profile
          const { error: profileError } = await supabase
            .from(TABLES.USERS)
            .insert({
              id: data.user.id,
              email: userData.email,
              name: userData.name,
              role: userData.role || 'designer',
              created_at: new Date().toISOString()
            });
          
          if (profileError) throw profileError;
          
          set({
            user: { ...data.user, ...userData },
            isAuthenticated: true,
            isLoading: false
          });
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      // Get all users for team assignment
      getAllUsers: async () => {
        try {
          const users = await fetchUsers();
          return users;
        } catch (error) {
          console.error('Error fetching users:', error);
          return [];
        }
      },

      checkAuth: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Get user profile
            const { data: profile } = await supabase
              .from(TABLES.USERS)
              .select('*')
              .eq('id', user.id)
              .single();
            
            console.log('checkAuth - Setting user from session:', { user, profile });
            set({
              user: { ...user, ...profile },
              isAuthenticated: true
            });
          } else {
            console.log('checkAuth - No user found in session');
          }
        } catch (error) {
          console.error('Auth check error:', error);
        }
      },

      updateProfile: (updates) => {
        set((state) => ({
          user: { ...state.user, ...updates }
        }));
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated })
    }
  )
);

export { useAuthStore }; 