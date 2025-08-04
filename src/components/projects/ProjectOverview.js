import React from 'react';
import { format } from 'date-fns';
import { Calendar, DollarSign, Users, Clock, AlertTriangle, Building2 } from 'lucide-react';

// Safe date formatting function
const safeFormat = (dateValue, formatString) => {
  if (!dateValue) return 'Not set';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

const ProjectOverview = ({ project }) => {
  const daysUntilDeadline = project.deadline 
    ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;
  const isOverdue = daysUntilDeadline < 0 && project.status !== 'completed';

  return (
    <div className="space-y-6">
      {/* Project Description */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Project Description</h3>
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Project Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Deadline</p>
                <p className="text-sm text-gray-600">
                  {safeFormat(project.deadline, 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget</p>
                <p className="text-sm text-gray-600">₹{(project.budget || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Team Size</p>
                <p className="text-sm text-gray-600">{project.team?.length || 0} members</p>
              </div>
            </div>

            {project.company && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Company</p>
                  <p className="text-sm text-gray-600">{project.company.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Time Remaining</p>
                <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                  {isOverdue 
                    ? `${Math.abs(daysUntilDeadline)} days overdue`
                    : `${daysUntilDeadline} days left`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Stats</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{project.tasks?.length || 0}</p>
              <p className="text-sm text-blue-600">Total Tasks</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {project.tasks?.filter(t => t.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {project.tasks?.filter(t => t.status === 'in-progress').length || 0}
              </p>
              <p className="text-sm text-yellow-600">In Progress</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {project.issues?.filter(i => i.status === 'open').length || 0}
              </p>
              <p className="text-sm text-red-600">Open Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {project.chat?.slice(-3).map((message) => (
            <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{message.text}</p>
                <p className="text-xs text-gray-500">
                  {safeFormat(message.timestamp, 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {isOverdue && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h4 className="text-sm font-medium text-red-800">Project Overdue</h4>
          </div>
          <p className="text-sm text-red-700 mt-1">
            This project is {Math.abs(daysUntilDeadline)} days past its deadline.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview; 