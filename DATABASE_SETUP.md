# 🗄️ Database Setup Guide

## 🚨 **IMPORTANT: Database Tables Missing**

The errors you're seeing indicate that the database tables haven't been created yet. Follow these steps to set up your database:

## 📋 **Step-by-Step Database Setup**

### **Step 1: Access Your Supabase Dashboard**

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project (or create a new one if needed)

### **Step 2: Open SQL Editor**

1. In your Supabase dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** to create a new SQL query

### **Step 3: Run the Database Schema**

1. **Copy the entire content** from the file `supabase-schema.sql` in your project
2. **Paste it** into the SQL Editor
3. **Click "Run"** to execute the SQL and create all tables

### **Step 4: Verify Tables Are Created**

1. In the Supabase dashboard, go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `users`
   - ✅ `projects`
   - ✅ `tasks`
   - ✅ `billing_items`
   - ✅ `issues`
   - ✅ `team_members`

### **Step 5: Test the Application**

1. **Refresh your application** in the browser
2. **Click the "Check DB" button** in the Tasks section
3. You should see: "Database check passed! All required tables exist."

## 🔧 **Alternative: Use the Create Projects Table Script**

If the main schema doesn't work, try using the `create-projects-table.sql` file instead:

1. Copy the content from `create-projects-table.sql`
2. Paste it in the SQL Editor
3. Click "Run"

## 🚨 **Common Issues**

### **Issue: "relation does not exist"**
- **Solution**: The tables haven't been created. Follow the steps above.

### **Issue: "permission denied"**
- **Solution**: Make sure you're using the correct Supabase credentials in your `.env` file.

### **Issue: "connection failed"**
- **Solution**: Check your internet connection and Supabase project status.

## 📞 **Need Help?**

1. **Check the console** for detailed error messages
2. **Use the "Check DB" button** to diagnose issues
3. **Verify your `.env` file** has the correct Supabase credentials
4. **Make sure your Supabase project is active** (not paused)

## ✅ **Success Indicators**

When everything is working correctly, you should see:
- ✅ "Database check passed!" message
- ✅ Ability to create and update tasks
- ✅ No more "column does not exist" errors
- ✅ All test buttons working properly 