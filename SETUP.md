# 🚀 GIR Project Manager - Setup Guide

## 📋 **Step-by-Step Setup**

### **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up/Login with GitHub**
4. **Create new project:**
   - Name: `gir-project-manager`
   - Database Password: `your-secure-password`
   - Region: Choose closest to you
5. **Wait for project to be created (2-3 minutes)**

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

### **Step 5: Test the Setup**

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Test login with these credentials:**
   - Email: `admin@gir.com`
   - Password: `admin123`

3. **If login works, your setup is successful!**

### **Step 6: Build for Production**

1. **Build the React app:**
   ```bash
   npm run build
   ```

2. **Build the Electron EXE:**
   ```bash
   npm run dist
   ```

3. **Find your EXE in the `dist/` folder**

---

## 🔧 **Environment Variables Explained**

### **Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### **Optional Variables:**

| Variable | Description | When to use |
|----------|-------------|-------------|
| `REACT_APP_ENV` | Environment (development/production) | Always set to `development` for now |
| `REACT_APP_API_URL` | Custom API endpoint | If you have a custom domain |
| `REACT_APP_SENTRY_DSN` | Error tracking | If you want error monitoring |
| `REACT_APP_GA_TRACKING_ID` | Google Analytics | If you want analytics |

---

## 🎯 **Quick Setup Commands**

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (copy from env-template.txt)
# Edit .env with your Supabase credentials

# 3. Test development
npm start

# 4. Build for production
npm run build

# 5. Build Electron EXE
npm run dist
```

---

## 🛠 **Troubleshooting**

### **Common Issues:**

1. **"Invalid Supabase URL"**
   - Check your `REACT_APP_SUPABASE_URL` format
   - Should be: `https://project-id.supabase.co`

2. **"Invalid anon key"**
   - Copy the exact anon key from Supabase dashboard
   - Make sure there are no extra spaces

3. **"Database connection failed"**
   - Check if you ran the SQL schema
   - Verify your Supabase project is active

4. **"Login not working"**
   - The app falls back to mock users if Supabase fails
   - Try: `admin@gir.com` / `admin123`

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Verify your Supabase project is active**
3. **Make sure you ran the SQL schema**
4. **Test with the development build first**

---

## 🎉 **Success Checklist**

Your setup is complete when:

- ✅ **Supabase project created**
- ✅ **Database schema applied**
- ✅ **Environment variables configured**
- ✅ **Development server starts**
- ✅ **Login works**
- ✅ **EXE builds successfully**

---

## 🚀 **Next Steps**

After setup:

1. **Test all features** in development
2. **Build the EXE** for distribution
3. **Share with your team**
4. **Set up real users** in Supabase
5. **Configure backups** (optional)

---

## 💰 **Costs**

- ✅ **Supabase**: Free tier (50MB database)
- ✅ **Development**: $0
- ✅ **Distribution**: $0 (just share the EXE)

**Total cost: $0/month** for small teams! 🎉 