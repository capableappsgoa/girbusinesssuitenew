import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import Projects from './components/projects/Projects';
import ProjectDetail from './components/projects/ProjectDetail';
import Team from './components/team/Team';
import Settings from './components/Settings';
import Companies from './components/companies/Companies';
import Revenue from './components/revenue/Revenue';
import Layout from './components/layout/Layout';
import './App.css';

// Error boundary for Electron
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">Please restart the application</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        checkAuth();
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }, 100); // Small delay to prevent conflicts with login

    return () => clearTimeout(timer);
  }, [checkAuth]);

  // Debug authentication state
  console.log('App.js - Auth state:', { user, isAuthenticated });

  // Listen for Electron menu events
  useEffect(() => {
    if (window.electronAPI) {
      try {
        window.electronAPI.onNewProject(() => {
          // Handle new project from menu
          console.log('New project requested from menu');
        });

        window.electronAPI.onOpenProject(() => {
          // Handle open project from menu
          console.log('Open project requested from menu');
        });

        return () => {
          try {
            window.electronAPI.removeAllListeners('new-project');
            window.electronAPI.removeAllListeners('open-project');
          } catch (error) {
            console.error('Error removing listeners:', error);
          }
        };
      } catch (error) {
        console.error('Error setting up Electron API:', error);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Router>
          <LoginPage />
          <Toaster position="top-right" />
        </Router>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              {user?.role === 'admin' && (
                <>
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/team" element={<Team />} />
                </>
              )}
              {['admin', 'manager', 'billing'].includes(user?.role) && (
                <Route path="/revenue" element={<Revenue />} />
              )}
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 