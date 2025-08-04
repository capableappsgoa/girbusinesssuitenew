# 🚀 GIR Project Manager - Team Setup Guide

## 👥 **For Your 12-Person Team (2 Founders + 10 Employees)**

### **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login with GitHub**
3. **Create new project:**
   - Name: `gir-project-manager`
   - Database Password: `your-secure-password`
   - Region: Choose closest to India
4. **Wait for project to be created (2-3 minutes)**

### **Step 2: Get Your Supabase Credentials**

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   - **Project URL** (looks like: `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### **Step 3: Set Up Database**

1. **In Supabase dashboard, go to SQL Editor**
2. **Copy the entire content from `supabase-schema.sql`**
3. **Paste it in the SQL Editor**
4. **Click "Run" to create all tables and policies**

### **Step 4: Create Environment File**

1. **Create a new file called `.env` in your project root**
2. **Copy the content below and replace with your values:**

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Application Environment
REACT_APP_ENV=development
```

**Replace:**
- `your-project-id` with your actual project ID
- `your-anon-key-here` with your actual anon key

### **Step 5: Add Your Team Members**

#### **Option A: Through the App (Recommended)**

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Login as admin:**
   - Email: `admin@gir.com`
   - Password: `admin123`

3. **Go to Team Management**
4. **Click "Add User" for each team member**

#### **Option B: Direct Database Insert**

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert your team members
INSERT INTO users (id, email, name, role, phone, department, position) VALUES 
  (gen_random_uuid(), 'founder1@getitrendered.com', 'Founder 1 Name', 'admin', '+91 98765 43210', 'Management', 'Co-Founder'),
  (gen_random_uuid(), 'founder2@getitrendered.com', 'Founder 2 Name', 'admin', '+91 98765 43211', 'Management', 'Co-Founder'),
  (gen_random_uuid(), 'manager1@getitrendered.com', 'Project Manager 1', 'manager', '+91 98765 43212', 'Project Management', 'Senior Project Manager'),
  (gen_random_uuid(), 'manager2@getitrendered.com', 'Project Manager 2', 'manager', '+91 98765 43213', 'Project Management', 'Project Manager'),
  (gen_random_uuid(), 'designer1@getitrendered.com', '3D Designer 1', 'designer', '+91 98765 43214', '3D Design', 'Senior 3D Designer'),
  (gen_random_uuid(), 'designer2@getitrendered.com', '3D Designer 2', 'designer', '+91 98765 43215', '3D Design', '3D Designer'),
  (gen_random_uuid(), 'designer3@getitrendered.com', '3D Designer 3', 'designer', '+91 98765 43216', '3D Design', '3D Designer'),
  (gen_random_uuid(), 'designer4@getitrendered.com', '3D Designer 4', 'designer', '+91 98765 43217', '3D Design', 'Junior 3D Designer'),
  (gen_random_uuid(), 'designer5@getitrendered.com', '2D Designer 1', 'designer', '+91 98765 43218', '2D Design', 'Senior 2D Designer'),
  (gen_random_uuid(), 'designer6@getitrendered.com', '2D Designer 2', 'designer', '+91 98765 43219', '2D Design', '2D Designer'),
  (gen_random_uuid(), 'billing1@getitrendered.com', 'Billing Team 1', 'billing', '+91 98765 43220', 'Finance', 'Senior Billing Executive'),
  (gen_random_uuid(), 'billing2@getitrendered.com', 'Billing Team 2', 'billing', '+91 98765 43221', 'Finance', 'Billing Executive');
```

### **Step 6: Set Up User Authentication**

For each team member, you need to create their Supabase Auth account:

1. **Go to Supabase Dashboard → Authentication → Users**
2. **Click "Add User"**
3. **Enter their email and set a temporary password**
4. **Send them the login credentials**

### **Step 7: Team Member Onboarding**

**Send this to each team member:**

```
Welcome to GIR Project Manager!

Your login credentials:
Email: [their-email]
Password: [temporary-password]

Please:
1. Login at: http://localhost:3000
2. Change your password on first login
3. Update your profile information

Roles and Permissions:
- Admin: Full access (Founders)
- Manager: Create projects, assign tasks
- Designer: View assigned tasks, upload work
- Billing: Generate invoices, manage billing
```

### **Step 8: Test the Setup**

1. **Login with each role to test permissions**
2. **Create a test project**
3. **Assign tasks to team members**
4. **Test the drag-and-drop functionality**
5. **Generate a test invoice**

---

## 🎯 **Team Structure Example**

### **Leadership (2)**
- **Founder 1**: `founder1@getitrendered.com` (Admin)
- **Founder 2**: `founder2@getitrendered.com` (Admin)

### **Project Management (2)**
- **Senior PM**: `manager1@getitrendered.com` (Manager)
- **Project Manager**: `manager2@getitrendered.com` (Manager)

### **3D Design Team (4)**
- **Senior 3D Designer**: `designer1@getitrendered.com` (Designer)
- **3D Designer 1**: `designer2@getitrendered.com` (Designer)
- **3D Designer 2**: `designer3@getitrendered.com` (Designer)
- **Junior 3D Designer**: `designer4@getitrendered.com` (Designer)

### **2D Design Team (2)**
- **Senior 2D Designer**: `designer5@getitrendered.com` (Designer)
- **2D Designer**: `designer6@getitrendered.com` (Designer)

### **Finance Team (2)**
- **Senior Billing**: `billing1@getitrendered.com` (Billing)
- **Billing Executive**: `billing2@getitrendered.com` (Billing)

---

## 🔧 **Quick Commands**

```bash
# Start development
npm start

# Build for production
npm run build

# Build Electron EXE
npm run dist
```

---

## 📊 **Features for Your Team**

### **For Founders (Admin)**
- ✅ **User Management**: Add/edit/delete team members
- ✅ **Financial Reports**: View all project budgets and invoices
- ✅ **System Settings**: Configure company settings
- ✅ **Full Access**: Everything in the system

### **For Project Managers**
- ✅ **Create Projects**: Set budgets, deadlines, assign teams
- ✅ **Task Management**: Assign tasks, track progress
- ✅ **Issue Resolution**: Handle designer issues and client feedback
- ✅ **Team Progress**: Monitor team productivity

### **For Designers**
- ✅ **View Assigned Tasks**: See tasks assigned to them
- ✅ **Upload Deliverables**: Submit completed work
- ✅ **Raise Issues**: Report problems or request changes
- ✅ **Time Tracking**: Log hours spent on tasks

### **For Billing Team**
- ✅ **Generate Invoices**: Create professional invoices
- ✅ **Manage Billing**: Track project costs and payments
- ✅ **Financial Data**: View revenue and expense reports
- ✅ **Export Reports**: Download financial summaries

---

## 🚀 **Deployment Options**

### **Option 1: Standalone EXE (Recommended)**
- Build the EXE file
- Share with your team
- No web hosting needed
- Works offline with local data

### **Option 2: Web + Electron**
- Deploy to Vercel/Netlify
- Team accesses via browser
- Real-time collaboration
- Requires web hosting

---

## 💰 **Costs**

- ✅ **Supabase**: Free tier (50MB database) - sufficient for your team
- ✅ **Development**: $0
- ✅ **Distribution**: $0 (just share the EXE)
- ✅ **Hosting**: $0 (if using EXE only)

**Total cost: $0/month** 🎉

---

## 🎉 **Success Checklist**

Your setup is complete when:

- ✅ **Supabase project created**
- ✅ **Database schema applied**
- ✅ **Environment variables configured**
- ✅ **All 12 team members added**
- ✅ **Each team member can login**
- ✅ **Test project created and assigned**
- ✅ **EXE builds successfully**

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the troubleshooting section in SETUP.md**
2. **Verify your Supabase project is active**
3. **Make sure you ran the SQL schema**
4. **Test with the development build first**
5. **Contact support if needed**

---

## 🚀 **Next Steps**

After setup:

1. **Train your team** on the system
2. **Create your first real project**
3. **Set up regular backups** (optional)
4. **Configure email notifications** (optional)
5. **Customize branding** (optional)

---

**Your team is ready to use GIR Project Manager! 🎉** 