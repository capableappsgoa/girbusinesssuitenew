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
import EditProjectModal from './EditProjectModal';
import CompanyLogo from '../common/CompanyLogo';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuthStore();
  const { projects, clearAndLoadProjects, deleteProject, isLoading, markProjectAsPaid, markProjectAsUnpaid, getProjectSpentTotal } = useProjectStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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

  const getStatusText = (status, isPaid) => {
    if (isPaid) return 'Completed';
    return status;
  };

  const getStatusColorWithPaid = (status, isPaid) => {
    if (isPaid) return 'text-green-600 bg-green-100';
    return getStatusColor(status);
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
    
    if (!deadline) return 'no-deadline';
    
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      const daysUntilDeadline = differenceInDays(deadlineDate, new Date());
      
      if (daysUntilDeadline < 0) return 'overdue';
      if (daysUntilDeadline <= 3) return 'urgent';
      return 'normal';
    } catch (error) {
      return 'no-deadline';
    }
  };

  const formatDeadlineText = (deadline, status) => {
    if (status === 'completed') return 'Completed';
    if (!deadline) return 'No deadline';
    
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      const daysUntilDeadline = differenceInDays(deadlineDate, new Date());
      
      if (daysUntilDeadline < 0) return `${Math.abs(daysUntilDeadline)} days overdue`;
      if (daysUntilDeadline === 0) return 'Due today';
      if (daysUntilDeadline === 1) return 'Due tomorrow';
      return `${daysUntilDeadline} days left`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDeadlineDate = (deadline) => {
    if (!deadline) return 'No deadline';
    
    try {
      const deadlineDate = typeof deadline === 'string' ? parseISO(deadline) : new Date(deadline);
      return format(deadlineDate, 'MMM dd, yyyy');
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

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* User Switcher for Admins and Managers */}
          
          
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
              <option value="both">Both (3D & 2D)</option>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Projects ({filteredProjects.length})</h2>
          </div>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500">No projects match your current filters.</p>
            </div>
          ) : (
            <div className="p-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => {
                  const progress = project.tasks && project.tasks.length > 0 
                    ? (project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100
                    : 0;
                  const deadlineStatus = getDeadlineStatus(project.deadline, project.status);
                  const daysUntilDeadline = getDaysUntilDeadline(project.deadline);
                  
                  // Calculate project amount using raw billing total
                  const projectAmount = project.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0;

                  return (
                    <div key={project.id} className="relative group">
                      <Link
                        to={`/projects/${project.id}`}
                        className="card hover:shadow-lg transition-shadow duration-200 block"
                      >
                                                 {/* Project Header */}
                         <div className="flex items-start justify-between mb-3">
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center space-x-2 mb-2">
                               <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                 project.type === '3D' ? 'bg-purple-500' : 
                                 project.type === '2D' ? 'bg-blue-500' : 
                                 project.type === 'both' ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-500'
                               }`} />
                               <h3 className="text-lg font-semibold text-gray-900 truncate min-w-0">{project.name}</h3>
                             </div>
                             <div className="flex items-center space-x-2 flex-wrap">
                               <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColorWithPaid(project.status, project.paid)}`}>
                                 {getStatusText(project.status, project.paid)}
                               </span>
                               {project.paid && (
                                 <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center space-x-1 flex-shrink-0">
                                   <CheckCircle className="h-3 w-3" />
                                   <span>Paid</span>
                                 </span>
                               )}
                               {deadlineStatus === 'overdue' && (
                                 <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                               )}
                             </div>
                           </div>
                           
                                                       {/* Company Logo - Centered and properly positioned */}
                            {project.company && (
                              <div className="flex-shrink-0 ml-3 flex items-center justify-center">
                                <CompanyLogo 
                                  company={project.company} 
                                  size="lg"
                                  className="rounded-lg border-2 border-gray-200 shadow-sm"
                                />
                              </div>
                            )}
                         </div>

                        {/* Project Description */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                        {/* Project Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span className="truncate">{project.client}</span>
                          </div>
                          {project.company && (
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Building2 className="h-4 w-4" />
                              <span className="truncate">{project.company.name}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>{format(parseISO(project.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>

                        {/* Project Amount - Prominent display */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-4 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Project Amount</span>
                            <span className="text-lg font-bold text-blue-600">₹{projectAmount.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Project Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Team</div>
                              <div className="font-semibold text-gray-900">{project.team?.length || 0}</div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="text-center">
                              <div className="text-sm text-gray-600">Tasks</div>
                              <div className="font-semibold text-gray-900">{project.tasks?.length || 0}</div>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline Info */}
                        <div className="text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span className={`${
                              deadlineStatus === 'overdue' ? 'text-red-600' : 
                              deadlineStatus === 'urgent' ? 'text-yellow-600' : 
                              deadlineStatus === 'no-deadline' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {formatDeadlineText(project.deadline, project.status)}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Completed Overlay */}
                      {project.paid && (
                        <div className="absolute inset-0 flex items-center justify-center z-[999999] pointer-events-none">
                          <img 
                            src="/completed.png" 
                            alt="Completed" 
                            className="w-72 h-72 object-contain opacity-90"
                          />
                        </div>
                      )}

                                             {/* Admin Controls - Bottom right positioning */}
                       {user.role === 'admin' && (
                         <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                           <div className="flex space-x-1">
                             <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 setSelectedProject(project);
                                 setShowEditModal(true);
                               }}
                               className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                             >
                               <Edit className="h-4 w-4 text-gray-600" />
                             </button>
                             
                             <button
                               onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 if (window.confirm('Are you sure you want to delete this project?')) {
                                   deleteProject(project.id);
                                 }
                               }}
                               className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition-colors"
                             >
                               <Trash2 className="h-4 w-4 text-red-600" />
                             </button>
                           </div>
                         </div>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

      {/* Edit Project Modal */}
      {showEditModal && selectedProject && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default Projects; 