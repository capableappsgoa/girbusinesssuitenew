import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle,
  PlayCircle,
  DollarSign,
  Users
} from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const TaskGroupCard = ({ group, project, onEdit, onDelete, onAddTask }) => {
  const { user } = useAuthStore();
  const { deleteTaskGroup } = useProjectStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get tasks for this group
  const groupTasks = project?.tasks?.filter(task => task.groupId === group.id) || [];
  
  // Calculate task status counts
  const taskCounts = {
    todo: groupTasks.filter(task => task.status === 'todo').length,
    'in-progress': groupTasks.filter(task => task.status === 'in-progress').length,
    review: groupTasks.filter(task => task.status === 'review').length,
    completed: groupTasks.filter(task => task.status === 'completed').length
  };

  const totalTasks = groupTasks.length;
  const completedTasks = taskCounts.completed;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete the group "${group.name}"? This will also remove all tasks in this group.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteTaskGroup(project.id, group.id);
      if (result.success) {
        toast.success('Task group deleted successfully');
        onDelete && onDelete(group.id);
      } else {
        toast.error(result.error || 'Failed to delete task group');
      }
    } catch (error) {
      console.error('Failed to delete task group:', error);
      toast.error('Failed to delete task group');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Clock size={12} className="text-gray-500" />;
      case 'in-progress': return <PlayCircle size={12} className="text-blue-500" />;
      case 'review': return <AlertCircle size={12} className="text-yellow-500" />;
      case 'completed': return <CheckCircle size={12} className="text-green-500" />;
      default: return <Clock size={12} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-600';
      case 'in-progress': return 'bg-blue-100 text-blue-600';
      case 'review': return 'bg-yellow-100 text-yellow-600';
      case 'completed': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Group Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: group.color || '#3B82F6' }}
            />
            
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
              {group.description && (
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Indicators */}
            <div className="flex items-center space-x-1">
              {taskCounts.todo > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                  {getStatusIcon('todo')}
                  <span>{taskCounts.todo}</span>
                </div>
              )}
              {taskCounts['in-progress'] > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs">
                  {getStatusIcon('in-progress')}
                  <span>{taskCounts['in-progress']}</span>
                </div>
              )}
              {taskCounts.review > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-600 text-xs">
                  {getStatusIcon('review')}
                  <span>{taskCounts.review}</span>
                </div>
              )}
              {taskCounts.completed > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-green-100 text-green-600 text-xs">
                  {getStatusIcon('completed')}
                  <span>{taskCounts.completed}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onAddTask && onAddTask(group.id)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add task to group"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => onEdit && onEdit(group)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit group"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete group"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}% ({completedTasks}/{totalTasks})</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-blue-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Group Info */}
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            {group.billing_items && (
              <div className="flex items-center space-x-1">
                <DollarSign size={12} />
                <span>{group.billing_items.name}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Users size={12} />
              <span>{totalTasks} tasks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Tasks List */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="p-4">
            {groupTasks.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No tasks in this group</p>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <button
                    onClick={() => onAddTask && onAddTask(group.id)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Add first task
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {groupTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <span className="text-sm font-medium text-gray-900">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status === 'todo' ? 'To Do' : task.status.replace('-', ' ')}
                      </span>
                      {task.assignedTo && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                          {task.assignedTo.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskGroupCard; 