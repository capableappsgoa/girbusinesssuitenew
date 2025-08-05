import React, { useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import OnlineStatus from './OnlineStatus';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Eye,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

// Safe date formatting function
const safeFormat = (dateValue, formatString) => {
  if (!dateValue) return 'N/A';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

const Dashboard = () => {
  const { user } = useAuthStore();
  const { 
    projects, 
    getProjectsByStatus, 
    getProjectsByType, 
    getTasksByUser,
    getIssuesByUser,
    getProjectBillingTotal
  } = useProjectStore();

  const ongoingProjects = getProjectsByStatus('ongoing');
  const completedProjects = getProjectsByStatus('completed');
  const totalRevenue = projects.reduce((sum, project) => sum + getProjectBillingTotal(project.id), 0);
  const overdueProjects = projects.filter(project => {
    if (!project.deadline) return false;
    try {
      const deadline = new Date(project.deadline);
      if (isNaN(deadline.getTime())) return false;
      const today = new Date();
      return deadline < today && project.status !== 'completed';
    } catch (error) {
      console.error('Date calculation error:', error);
      return false;
    }
  });

  // Get user-specific data for designers
  const userTasks = getTasksByUser(user.id);
  const userIssues = getIssuesByUser(user.id);
  const assignedProjects = projects.filter(project => project.team?.includes(user.id));

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      change: '+12%',
      changeType: 'positive',
      icon: FileText
    },
    {
      name: 'Ongoing Projects',
      value: ongoingProjects.length,
      change: '+5%',
      changeType: 'positive',
      icon: Clock
    },
    {
      name: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      change: '+8%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      name: 'Team Members',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: Users
    }
  ];

  const recentProjects = projects
    .sort((a, b) => {
      try {
        const dateA = new Date(b.created_at || b.createdAt);
        const dateB = new Date(a.created_at || a.createdAt);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateA - dateB;
      } catch (error) {
        console.error('Date sorting error:', error);
        return 0;
      }
    })
    .slice(0, 5);

  const upcomingDeadlines = projects
    .filter(project => project.status !== 'completed' && project.deadline)
    .sort((a, b) => {
      try {
        const dateA = new Date(a.deadline);
        const dateB = new Date(b.deadline);
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateA - dateB;
      } catch (error) {
        console.error('Date sorting error:', error);
        return 0;
      }
    })
    .slice(0, 3);

  const getProjectTypeDistribution = () => {
    const threeDProjects = getProjectsByType('3D').length;
    const twoDProjects = getProjectsByType('2D').length;
    return { threeD: threeDProjects, twoD: twoDProjects };
  };

  const projectDistribution = getProjectTypeDistribution();

  // Designer-specific dashboard
  if (user.role === 'designer') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600" style={{ display: user?.avatar ? 'none' : 'flex' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your assigned projects</p>
          </div>
        </div>

        {/* Designer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assigned Projects</p>
                <p className="text-2xl font-bold text-gray-900">{assignedProjects.length}</p>
              </div>
              <FileText size={24} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">My Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{userTasks.length}</p>
              </div>
              <CheckCircle size={24} className="text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Issues</p>
                <p className="text-2xl font-bold text-orange-600">{userIssues.filter(i => i.status !== 'resolved').length}</p>
              </div>
              <AlertTriangle size={24} className="text-orange-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-2xl font-bold text-green-600">{userTasks.filter(t => t.status === 'completed').length}</p>
              </div>
              <CheckCircle size={24} className="text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">My Tasks</h3>
              <p className="text-sm text-gray-600">Tasks assigned to you</p>
            </div>
            <div className="p-4">
              {userTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                  <p className="text-gray-600">You don't have any tasks assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.projectName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">{task.progress}% complete</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{safeFormat(task.deadline, 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* My Issues */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">My Issues</h3>
              <p className="text-sm text-gray-600">Issues assigned to you</p>
            </div>
            <div className="p-4">
              {userIssues.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No issues assigned</h3>
                  <p className="text-gray-600">You don't have any issues assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userIssues.slice(0, 5).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600">{issue.projectName}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            issue.status === 'pending-approval' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                            issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{safeFormat(issue.createdAt, 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assigned Projects */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">My Projects</h3>
            <p className="text-sm text-gray-600">Projects you're working on</p>
          </div>
          <div className="p-4">
            {assignedProjects.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
                <p className="text-gray-600">You haven't been assigned to any projects yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignedProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.client}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-gray-500">Deadline: {safeFormat(project.deadline, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                                         <div className="text-right">
                       <p className="text-sm font-medium text-gray-900">{project.type} Project</p>
                       <p className="text-xs text-gray-500">{project.status}</p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Online Status for Designers */}
        <div className="bg-white rounded-lg border">
          <OnlineStatus />
        </div>
      </div>
    );
  }

  // Admin/Manager Dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your project management system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon size={24} className="text-blue-400" />
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp size={16} className="text-green-500 mr-1" />
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Recent Projects</h3>
            <p className="text-sm text-gray-600">Latest project updates</p>
          </div>
          <div className="p-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600">Create your first project to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.client}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                        <span className="text-xs text-gray-500">{project.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                                             <p className="text-sm font-medium text-gray-900">{project.type}</p>
                      <p className="text-xs text-gray-500">{safeFormat(project.createdAt, 'MMM dd')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Upcoming Deadlines</h3>
            <p className="text-sm text-gray-600">Projects due soon</p>
          </div>
          <div className="p-4">
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
                <p className="text-gray-600">All projects are on schedule.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map(project => {
                  let daysUntilDeadline = 0;
                  let isOverdue = false;
                  
                  try {
                    if (project.deadline) {
                      const deadline = new Date(project.deadline);
                      if (!isNaN(deadline.getTime())) {
                        daysUntilDeadline = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                        isOverdue = daysUntilDeadline < 0;
                      }
                    }
                  } catch (error) {
                    console.error('Date calculation error:', error);
                  }
                  
                  return (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-600">{project.client}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {isOverdue ? 'Overdue' : `${daysUntilDeadline} days left`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{safeFormat(project.deadline, 'MMM dd')}</p>
                        {isOverdue && (
                          <p className="text-xs text-red-600">Overdue</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Distribution and Online Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Project Distribution</h3>
            <p className="text-sm text-gray-600">By project type</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium">3D Projects</span>
                </div>
                <span className="text-sm text-gray-600">{projectDistribution.threeD}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium">2D Projects</span>
                </div>
                <span className="text-sm text-gray-600">{projectDistribution.twoD}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Project Status</h3>
            <p className="text-sm text-gray-600">Current project status</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Projects</span>
                <span className="text-sm text-gray-600">{ongoingProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completed Projects</span>
                <span className="text-sm text-gray-600">{completedProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Projects</span>
                <span className="text-sm text-gray-600">{projects.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Online Status Component */}
        <div className="lg:col-span-1">
          <OnlineStatus />
        </div>
      </div>

      {/* Alerts */}
      {overdueProjects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Overdue Projects</h3>
          </div>
          <p className="text-red-700 mt-1">
            You have {overdueProjects.length} project(s) that are overdue. Please review and update their status.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 