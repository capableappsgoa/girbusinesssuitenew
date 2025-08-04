# Connection Troubleshooting Guide

## Issue: `net::ERR_CONNECTION_CLOSED` when creating companies

This error indicates a network connectivity issue with your Supabase backend. Here's how to diagnose and fix it:

## Step 1: Test Connection
1. Go to the Companies page in your application
2. Click the "Test Connection" button (newly added)
3. Check the console for detailed error messages

## Step 2: Verify Database Setup
Run the `test-connection.sql` script in your Supabase SQL Editor to verify:
- Database connection is working
- Companies table exists
- RLS policies are properly configured
- Your user has admin privileges

## Step 3: Check Network Connectivity
1. **Internet Connection**: Ensure you have a stable internet connection
2. **Firewall/Proxy**: Check if your network blocks connections to Supabase
3. **DNS**: Try accessing https://bulsvhmmjtdiyjqgwgjo.supabase.co directly in your browser

## Step 4: Verify Supabase Configuration
Check that your Supabase URL and API key are correct in `src/lib/supabase.js`:
- URL: `https://bulsvhmmjtdiyjqgwgjo.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 5: Check Authentication
1. Ensure you're logged in as an admin user
2. Check if your session is still valid
3. Try logging out and logging back in

## Step 6: Browser Console Debugging
Open browser developer tools and check:
1. **Network tab**: Look for failed requests to Supabase
2. **Console tab**: Check for JavaScript errors
3. **Application tab**: Verify authentication tokens

## Common Solutions

### Solution 1: Clear Browser Cache
1. Open browser developer tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Solution 2: Check Supabase Status
1. Visit https://status.supabase.com
2. Check if there are any service disruptions

### Solution 3: Test with Different Network
1. Try connecting from a different network (mobile hotspot)
2. Check if the issue persists

### Solution 4: Verify Database Schema
Run this SQL in Supabase SQL Editor:
```sql
-- Check if companies table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'companies'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'companies';

-- Check your user role
SELECT role FROM users WHERE id = auth.uid();
```

## Recent Changes Made
1. **Fixed `testConnection` function**: Changed from `select('count')` to `select('id')`
2. **Improved error handling**: Added better error messages and connection testing
3. **Added timeout configuration**: Set 20-second timeout for realtime connections
4. **Enhanced company creation**: Added step-by-step connection and authentication checks
5. **Added diagnostic tools**: Test connection button and comprehensive SQL test script

## If Problem Persists
1. Check the browser console for specific error messages
2. Run the `test-connection.sql` script and share the results
3. Try creating a company using the Supabase dashboard directly
4. Contact support with the specific error messages and steps to reproduce

## Emergency Workaround
If you need to create companies immediately, you can:
1. Use the Supabase dashboard directly
2. Run SQL INSERT statements in the SQL Editor
3. Use the REST API directly with tools like Postman 