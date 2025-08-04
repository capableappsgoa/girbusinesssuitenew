import { createClient } from '@supabase/supabase-js';

// Check if environment variables are properly set
const supabaseUrl = "https://bulsvhmmjtdiyjqgwgjo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bHN2aG1tanRkaXlqcWd3Z2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjc2MDMsImV4cCI6MjA2OTcwMzYwM30.VFv2B0Ln3z8yrI49ulMieSq0QDa36_u9mKrjhxEl--0";

// If environment variables are not set, use a fallback configuration
const fallbackUrl = 'https://bulsvhmmjtdiyjqgwgjo.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bHN2aG1tanRkaXlqcWd3Z2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjc2MDMsImV4cCI6MjA2OTcwMzYwM30.VFv2B0Ln3z8yrI49ulMieSq0QDa36_u9mKrjhxEl--0';

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'gir-business-suite'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      timeout: 20000
    }
  }
);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'YOUR_SUPABASE_URL' && 
         supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';
};

// Database table names
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  ISSUES: 'issues',
  BILLING_ITEMS: 'billing_items',
  TEAM_MEMBERS: 'team_members'
};

// Enhanced error handling
export const handleSupabaseError = (error) => {
  console.error('Supabase error details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
  
  // Handle specific error types
  if (error.code === 'ECONNRESET' || error.message?.includes('ECONNRESET')) {
    console.error('Connection reset error detected. This might be due to:');
    console.error('1. Network connectivity issues');
    console.error('2. Supabase service temporarily unavailable');
    console.error('3. Authentication issues');
    console.error('4. RLS policy restrictions');
    throw new Error('Connection to database failed. Please check your internet connection and try again.');
  }
  
  if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
    console.error('Authentication error detected');
    throw new Error('Authentication failed. Please log in again.');
  }
  
  if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
    console.error('Row Level Security policy violation');
    throw new Error('Access denied. You may not have permission to perform this action.');
  }
  
  throw new Error(error.message || 'Database operation failed');
};

export const formatSupabaseResponse = (data, error) => {
  if (error) {
    handleSupabaseError(error);
  }
  return data;
};

// Test connection function
export const testConnection = async () => {
  try {
    // First try a simple auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth connection test failed:', authError);
      // If auth fails, try a simple table query
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Table connection test failed:', error);
        return false;
      }
    }
    
    console.log('Connection test successful');
    return true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}; 