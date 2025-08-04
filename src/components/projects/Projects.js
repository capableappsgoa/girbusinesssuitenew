import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  FolderOpen,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Building2
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import CreateProjectModal from './CreateProjectModal';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuthStore();
  const { projects, clearAndLoadProjects, deleteProject, isLoading, markProjectAsPaid, markProjectAsUnpaid, getProjectSpentTotal } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load projects on component mount and clear any old data
  useEffect(() => {
    // Clear any persisted mock data and load fresh from database
    const loadFreshProjects = async () => {
      try {
        await clearAndLoadProjects();
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast.error('Failed to load projects from database');
      }
    };
    
    loadFreshProjects();
  }, [clearAndLoadProjects]);

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      return differenceInDays(deadlineDate, new Date());
    } catch (error) {
      console.error('Invalid deadline date:', deadline);
      return null;
    }
  };

  const getDeadlineStatus = (deadline, status) => {
    if (status === 'completed') return 'completed';
    const days = getDaysUntilDeadline(deadline);
    if (days === null) return 'no-deadline';
    if (days < 0) return 'overdue';
    if (days <= 7) return 'urgent';
    return 'normal';
  };

  const formatDeadlineText = (deadline, status) => {
    const days = getDaysUntilDeadline(deadline);
    if (days === null) return 'No deadline set';
    if (status === 'completed') return 'Completed';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  const formatDeadlineDate = (deadline) => {
    if (!deadline) return 'No date';
    try {
      const date = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      return format(date, 'MMM dd');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleTogglePaidStatus = async (projectId, isPaid, projectName) => {
    try {
      if (isPaid) {
        await markProjectAsUnpaid(projectId);
        toast.success(`${projectName} marked as unpaid`);
      } else {
        await markProjectAsPaid(projectId);
        toast.success(`${projectName} marked as paid`);
      }
    } catch (error) {
      console.error('Failed to update paid status:', error);
      toast.error('Failed to update paid status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="3D">3D Projects</option>
              <option value="2D">2D Projects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading projects...</p>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const progress = project.tasks && project.tasks.length > 0 
              ? (project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100
              : 0;
            const deadlineStatus = getDeadlineStatus(project.deadline, project.status);
            const daysUntilDeadline = getDaysUntilDeadline(project.deadline);

            return (
              <div key={project.id} className="relative group">
                <Link
                  to={`/projects/${project.id}`}
                  className="card hover:shadow-lg transition-shadow duration-200 block"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        project.type === '3D' ? 'bg-purple-500' : 'bg-blue-500'
                      }`} />
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      {project.paid && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Paid</span>
                        </span>
                      )}
                    </div>
                    {deadlineStatus === 'overdue' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{project.client}</p>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          ₹{getProjectSpentTotal(project.id).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {project.team?.length || 0} members
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={`${
                          deadlineStatus === 'overdue' ? 'text-red-600' : 
                          deadlineStatus === 'urgent' ? 'text-yellow-600' : 
                          deadlineStatus === 'no-deadline' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatDeadlineText(project.deadline, project.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {formatDeadlineDate(project.deadline)}
                        </span>
                      </div>
                    </div>

                    {/* Company Name */}
                    {project.company && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{project.company.name}</span>
                      </div>
                    )}

                    {/* Tasks Summary */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Tasks: {project.tasks?.length || 0}</span>
                        <span>Completed: {project.tasks?.filter(t => t.status === 'completed').length || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Admin Controls - Fixed positioning to prevent overlapping */}
                {user?.role === 'admin' && (
                  <div className="absolute top-12 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleTogglePaidStatus(project.id, project.paid, project.name);
                        }}
                        className={`p-1 rounded hover:transition-colors ${
                          project.paid 
                            ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={project.paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                      >
                        {project.paid ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: Add edit functionality
                          toast.info('Edit functionality coming soon');
                        }}
                        className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProject(project.id, project.name);
                        }}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <FolderOpen className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first project'}
          </p>
          {(user?.role === 'admin' || user?.role === 'manager') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default Projects; 