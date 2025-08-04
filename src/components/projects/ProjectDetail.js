import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Upload,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import ProjectOverview from './ProjectOverview';
import ProjectTasks from './ProjectTasks';
import ProjectIssues from './ProjectIssues';
import ProjectChat from './ProjectChat';
import ProjectFiles from './ProjectFiles';
import ProjectInvoice from './ProjectInvoice';

const ProjectDetail = () => {
  const { id } = useParams();
  const { getProjectById, loadProject } = useProjectStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const project = getProjectById(id);

  // Debug: Log project data
  React.useEffect(() => {
    console.log('ProjectDetail - Project data:', {
      id,
      projectId: project?.id,
      teamLength: project?.team?.length,
      team: project?.team,
      hasTeam: !!project?.team
    });
  }, [project, id]);

  // Load project with full data if it doesn't have team members
  React.useEffect(() => {
    if (project && (!project.team || project.team.length === 0)) {
      console.log('ProjectDetail - Loading project with full data');
      setIsLoading(true);
      loadProject(id).finally(() => setIsLoading(false));
    }
  }, [project?.id, project?.team?.length]); // Only depend on project ID and team length to prevent infinite loop

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading project...</h2>
        <p className="text-gray-600">Please wait while we load the project data.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-4">The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'tasks', name: 'Tasks', icon: CheckCircle },
    { id: 'issues', name: 'Issues', icon: AlertTriangle },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'files', name: 'Files', icon: Upload },
    { id: 'invoice', name: 'Invoice', icon: Download }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'ongoing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const progress = (project.tasks?.length || 0) > 0 
    ? ((project.tasks?.filter(t => t.status === 'completed')?.length || 0) / (project.tasks?.length || 1)) * 100
    : 0;

  const daysUntilDeadline = project.deadline 
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  const isOverdue = daysUntilDeadline < 0 && project.status !== 'completed';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProjectOverview project={project} />;
      case 'tasks':
        return <ProjectTasks project={project} />;
      case 'issues':
        return <ProjectIssues project={project} />;
      case 'chat':
        return <ProjectChat project={project} />;
      case 'files':
        return <ProjectFiles project={project} />;
      case 'invoice':
        return <ProjectInvoice project={project} />;
      default:
        return <ProjectOverview project={project} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/projects"
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.client}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {isOverdue && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Deadline</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.deadline ? format(new Date(project.deadline), 'MMM dd, yyyy') : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="text-lg font-semibold text-gray-900">
                <span className="text-gray-600">₹{(project.budget || 0).toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Team</p>
              <p className="text-lg font-semibold text-gray-900">
                {project.team?.length || 0} members
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {Math.round(progress)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Project Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${getProgressColor(progress)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{(project.tasks?.filter(t => t.status === 'completed')?.length || 0)} completed</span>
          <span>{project.tasks?.length || 0} total tasks</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail; 