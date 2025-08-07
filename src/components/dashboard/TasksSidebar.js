import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { format, isToday, isTomorrow, isYesterday, differenceInDays, parseISO } from 'date-fns';

const TasksSidebar = () => {
  const { user } = useAuthStore();
  const { projects, getTasksByUser } = useProjectStore();
  const navigate = useNavigate();
  const [userTasks, setUserTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, overdue, today, upcoming

  useEffect(() => {
    if (user?.id) {
      const tasks = getTasksByUser(user.id);
      setUserTasks(tasks);
    }
  }, [user?.id, projects, getTasksByUser]);

  // Format deadline for display
  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    
    try {
      const deadlineDate = parseISO(deadline);
      const today = new Date();
      
      if (isToday(deadlineDate)) {
        return 'Today';
      } else if (isTomorrow(deadlineDate)) {
        return 'Tomorrow';
      } else if (isYesterday(deadlineDate)) {
        return 'Yesterday';
      } else {
        const daysDiff = differenceInDays(deadlineDate, today);
        if (daysDiff < 0) {
          return `${Math.abs(daysDiff)} days passed`;
        } else {
          return `${daysDiff} days left`;
        }
      }
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid date';
    }
  };

  // Get deadline status for styling
  const getDeadlineStatus = (deadline) => {
    if (!deadline) return 'neutral';
    
    try {
      const deadlineDate = parseISO(deadline);
      const today = new Date();
      const daysDiff = differenceInDays(deadlineDate, today);
      
      if (daysDiff < 0) return 'overdue';
      if (daysDiff <= 1) return 'urgent';
      if (daysDiff <= 3) return 'warning';
      return 'normal';
    } catch (error) {
      return 'neutral';
    }
  };

  // Filter tasks based on current filter
  const filteredTasks = userTasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'overdue') {
      if (!task.deadline) return false;
      try {
        const deadlineDate = parseISO(task.deadline);
        const today = new Date();
        return differenceInDays(deadlineDate, today) < 0;
      } catch (error) {
        return false;
      }
    }
    if (filter === 'today') {
      if (!task.deadline) return false;
      try {
        const deadlineDate = parseISO(task.deadline);
        return isToday(deadlineDate);
      } catch (error) {
        return false;
      }
    }
    if (filter === 'upcoming') {
      if (!task.deadline) return false;
      try {
        const deadlineDate = parseISO(task.deadline);
        const today = new Date();
        const daysDiff = differenceInDays(deadlineDate, today);
        return daysDiff > 0 && daysDiff <= 7;
      } catch (error) {
        return false;
      }
    }
    return true;
  });

  // Navigate to specific task
  const handleViewTask = (task) => {
    navigate(`/projects/${task.projectId}?tab=tasks&taskId=${task.id}`);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'in-progress':
        return { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'review':
        return { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Get deadline status styling
  const getDeadlineStyle = (status) => {
    switch (status) {
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">My Tasks</h3>
          <span className="text-sm text-gray-500">{userTasks.length} total</span>
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-1 mt-3">
          {[
            { key: 'all', label: 'All', count: userTasks.length },
            { key: 'overdue', label: 'Overdue', count: userTasks.filter(t => getDeadlineStatus(t.deadline) === 'overdue').length },
            { key: 'today', label: 'Today', count: userTasks.filter(t => getDeadlineStatus(t.deadline) === 'urgent').length },
            { key: 'upcoming', label: 'Upcoming', count: userTasks.filter(t => getDeadlineStatus(t.deadline) === 'warning' || getDeadlineStatus(t.deadline) === 'normal').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === key
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No tasks assigned' : `No ${filter} tasks`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any tasks assigned yet."
                : `You don't have any ${filter} tasks.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const statusInfo = getStatusInfo(task.status);
              const deadlineStatus = getDeadlineStatus(task.deadline);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div 
                  key={task.id} 
                  className="p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewTask(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                      <p className="text-sm text-gray-600 truncate">{task.projectName}</p>
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDeadlineStyle(deadlineStatus)}`}>
                          <div className="flex items-center space-x-1">
                            <CalendarDays size={12} />
                            <span>{formatDeadline(task.deadline)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show creation and deadline dates */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>Created: {format(parseISO(task.createdAt || task.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        {task.deadline && (
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>Due: {format(parseISO(task.deadline), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      <StatusIcon size={16} className={statusInfo.color} />
                      <Eye size={16} className="text-gray-400" />
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

export default TasksSidebar; 