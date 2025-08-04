import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Building2,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Revenue = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    projects, 
    loadProjects, 
    getProjectBillingTotal, 
    getProjectSpentTotal, 
    getProjectRemainingTotal 
  } = useProjectStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Calculate overall statistics
  const totalRevenue = projects.reduce((sum, project) => sum + getProjectBillingTotal(project.id), 0);
  const totalCompleted = projects.reduce((sum, project) => sum + getProjectSpentTotal(project.id), 0);
  const totalPending = projects.reduce((sum, project) => sum + getProjectRemainingTotal(project.id), 0);
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const paidProjects = projects.filter(p => p.paid).length;

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return getProjectBillingTotal(b.id) - getProjectBillingTotal(a.id);
        case 'completed':
          return getProjectSpentTotal(b.id) - getProjectSpentTotal(a.id);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!['admin', 'manager', 'billing'].includes(user?.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">Only administrators, managers, and billing staff can view revenue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Revenue Overview</h1>
        <p className="text-gray-600">Track project revenue, completed work, and pending payments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Revenue</p>
              <p className="text-2xl font-bold text-green-600">₹{totalCompleted.toLocaleString()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Revenue</p>
              <p className="text-2xl font-bold text-orange-600">₹{totalPending.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-blue-600">{totalProjects}</p>
              <p className="text-xs text-gray-500">{completedProjects} completed, {paidProjects} paid</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="revenue">Sort by Revenue</option>
          <option value="completed">Sort by Completed</option>
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Project Revenue Details</h2>
        </div>
        
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500">No projects match your current filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredProjects.map((project) => {
              const projectTotal = getProjectBillingTotal(project.id);
              const projectCompleted = getProjectSpentTotal(project.id);
              const projectPending = getProjectRemainingTotal(project.id);
              const completionRate = projectTotal > 0 ? (projectCompleted / projectTotal) * 100 : 0;

              return (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        {project.paid && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Paid</span>
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{project.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{project.client}</span>
                        </div>
                        {project.company && (
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{project.company.name}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(parseISO(project.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>

                      {/* Revenue Breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Revenue</span>
                            <span className="font-semibold text-gray-900">₹{projectTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600">Completed</span>
                            <span className="font-semibold text-green-700">₹{projectCompleted.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-orange-600">Pending</span>
                            <span className="font-semibold text-orange-700">₹{projectPending.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Completion Rate</span>
                          <span>{Math.round(completionRate)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewProject(project.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Revenue; 