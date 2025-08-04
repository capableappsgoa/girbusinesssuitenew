# GIR Project Manager

A comprehensive desktop application for managing 3D and 2D design projects, built with Electron and React.

## 🚀 Features

### Core Functionality
- **Project Management**: Create and manage 3D/2D projects with budgets, deadlines, and team assignments
- **Task Management**: Track subtasks with progress, deadlines, and assignments
- **Issue Tracking**: Report and resolve project issues with status tracking
- **Team Communication**: In-app chat per project for team collaboration
- **File Management**: Upload and manage project references and deliverables
- **Invoice Generation**: Generate invoices from completed projects
- **Budget Tracking**: Live budget monitoring with alerts

### User Roles
- **Admin**: Full access to all features, user management, financials
- **Manager**: Create/manage projects, assign tasks, resolve issues
- **Designer**: View assigned tasks, upload deliverables, raise issues
- **Billing Team**: Generate and manage invoices

## 🛠️ Technology Stack

- **Frontend**: React 18 with Hooks
- **Desktop**: Electron 28
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gir-project-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run Electron app**
   ```bash
   npm run electron-dev
   ```

## 🏗️ Build Commands

- **Development**: `npm start` - Start React development server
- **Electron Dev**: `npm run electron-dev` - Run Electron with hot reload
- **Build**: `npm run build` - Build React app for production
- **Package**: `npm run dist` - Build and package Electron app
- **Lint**: `npm run lint` - Run ESLint

## 🔐 Demo Accounts

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gir.com | admin123 |
| Manager | manager@gir.com | manager123 |
| Designer | designer@gir.com | designer123 |
| Billing | billing@gir.com | billing123 |

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout and navigation
│   ├── projects/       # Project management
│   └── team/          # Team management
├── stores/            # Zustand state stores
├── App.js             # Main app component
└── index.js           # React entry point
```

## 🎯 Key Features

### Dashboard
- Project overview with statistics
- Budget tracking and alerts
- Recent activity feed
- Upcoming deadlines

### Project Management
- Create new 3D/2D projects
- Set budgets and deadlines
- Assign team members
- Track progress with visual indicators

### Task Management
- Create subtasks with deadlines
- Assign to specific team members
- Track progress with percentage bars
- Add comments and attachments

### Issue Tracking
- Report issues with descriptions
- Assign to team members for resolution
- Track status: Open, In Progress, Blocked, Resolved
- Add comments and screenshots

### Team Communication
- Project-specific chat rooms
- Tag team members
- Attach files and reference links
- Real-time messaging

### File Management
- Upload project references (PDF, images, 3D models)
- Organize files by project
- Preview and download capabilities
- Version control for deliverables

### Invoice Generation
- Auto-fill project data
- Calculate total hours and costs
- Export as PDF
- Professional invoice templates

## 🔧 Development

### Adding New Features
1. Create components in appropriate directories
2. Add state management in stores
3. Update routing in App.js
4. Add role-based access control

### Styling Guidelines
- Use Tailwind CSS classes
- Follow component-based styling
- Maintain consistent spacing and colors
- Use Lucide React icons

### State Management
- Use Zustand for global state
- Keep stores focused and modular
- Implement persistence for critical data
- Use React Query for server state (future)

## 🚀 Deployment

### Building for Production
```bash
npm run build
npm run dist
```

### Platform-Specific Builds
- Windows: NSIS installer
- macOS: DMG package
- Linux: AppImage

## 📋 Roadmap

### Phase 1 (Current)
- ✅ Basic project management
- ✅ User authentication
- ✅ Dashboard and overview
- ✅ Project creation and listing

### Phase 2 (Next)
- 🔄 Task management with drag-and-drop
- 🔄 Issue tracking system
- 🔄 File upload and management
- 🔄 Team chat functionality

### Phase 3 (Future)
- 📅 Invoice generation
- 📅 Time tracking
- 📅 Advanced reporting
- 📅 Mobile companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for GIR Business Suite.

## 🆘 Support

For support and questions, contact the development team.

---

**GIR Project Manager v1.0.0** - Internal project management system
