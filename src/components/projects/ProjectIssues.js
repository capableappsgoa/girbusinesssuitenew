import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  User,
  MessageSquare,
  Paperclip,
  Eye,
  Filter,
  Search,
  Tag,
  Calendar,
  DollarSign,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectIssues = ({ project }) => {
  const { user, getAllUsers } = useAuthStore();
  const { 
    addIssue, 
    updateIssue, 
    approveIssue, 
    rejectIssue,
    loadTaskGroups
  } = useProjectStore();
  
  // Load users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
        setAllUsers([]);
      }
    };
    
    loadUsers();
  }, [getAllUsers]);

  // Load task groups when component mounts
  useEffect(() => {
    const loadTaskGroups = async () => {
      if (project?.id) {
        try {
          await loadTaskGroups(project.id);
        } catch (error) {
          console.error('Failed to load task groups:', error);
        }
      }
    };
    
    loadTaskGroups();
  }, [project?.id, loadTaskGroups]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [allUsers, setAllUsers] = useState([]);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'general',
    priority: 'medium',
    assignedTo: '',
    taskId: '',
    groupId: '' // Add groupId to track selected group
  });

  const issueTypes = [
    { value: 'general', label: 'General Issue', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' },
    { value: 'blocker', label: 'Blocker', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
    { value: 'change-request', label: 'Change Request', icon: Edit, color: 'bg-blue-100 text-blue-800' },
    { value: 'bug', label: 'Bug Report', icon: XCircle, color: 'bg-orange-100 text-orange-800' },
    { value: 'feature', label: 'Feature Request', icon: Plus, color: 'bg-green-100 text-green-800' },
    { value: 'client-feedback', label: 'Client Feedback', icon: MessageSquare, color: 'bg-purple-100 text-purple-800' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-gray-100 text-gray-800' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'pending-approval', label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' }
  ];

  const filteredIssues = project?.issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTaskFilter = taskFilter === 'all' || issue.taskId === taskFilter;
    return matchesFilter && matchesSearch && matchesTaskFilter;
  }) || [];

  const handleAddIssue = async () => {
    if (!newIssue.title || !newIssue.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await addIssue(project.id, {
        ...newIssue,
        reportedBy: user.id,
        status: newIssue.type === 'change-request' ? 'pending-approval' : 'open'
      });

      if (result.success) {
        setNewIssue({
          title: '',
          description: '',
          type: 'general',
          priority: 'medium',
          assignedTo: '',
          taskId: '',
          groupId: '' // Reset groupId as well
        });
        setIsAddModalOpen(false);
        toast.success('Issue created successfully');
      } else {
        toast.error(result.error || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue. Please try again.');
    }
  };

  const handleEditIssue = async () => {
    if (!selectedIssue.title || !selectedIssue.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateIssue(project.id, selectedIssue.id, selectedIssue);
      setIsEditModalOpen(false);
      setSelectedIssue(null);
      toast.success('Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue. Please try again.');
    }
  };

  const handleDeleteIssue = (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      const updatedIssues = project.issues?.filter(issue => issue.id !== issueId) || [];
      useProjectStore.getState().updateProject(project.id, { issues: updatedIssues });
      toast.success('Issue deleted successfully');
    }
  };

  const handleApproveIssue = (issueId) => {
    approveIssue(project.id, issueId);
    toast.success('Issue approved successfully');
  };

  const handleRejectIssue = (issueId, reason) => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection:');
    if (rejectionReason) {
      rejectIssue(project.id, issueId, rejectionReason);
      toast.success('Issue rejected');
    }
  };

  const getIssueTypeInfo = (type) => {
    return issueTypes.find(t => t.value === type) || issueTypes[0];
  };

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  const getPriorityInfo = (priority) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1];
  };

  const getTaskName = (taskId) => {
    const task = project?.tasks.find(t => t.id === taskId);
    return task?.title || 'No task linked';
  };

  const getUserName = (userId) => {
    const teamMember = project?.team.find(member => member.id === userId);
    return teamMember?.name || 'Unknown User';
  };

  const getUserAvatar = (userId) => {
    const teamMember = project?.team.find(member => member.id === userId);
    return teamMember?.avatar || null;
  };

  // Get filtered tasks based on selected group
  const getFilteredTasks = () => {
    if (!newIssue.groupId) {
      return project?.tasks || [];
    }
    return project?.tasks?.filter(task => task.groupId === newIssue.groupId) || [];
  };

  // Get group name by ID
  const getGroupName = (groupId) => {
    if (!groupId) return '';
    const group = project?.taskGroups?.find(g => g.id === groupId);
    return group?.name || '';
  };

  // Get filtered tasks for edit modal based on selected group
  const getFilteredTasksForEdit = () => {
    if (!selectedIssue?.groupId) {
      return project?.tasks || [];
    }
    return project?.tasks?.filter(task => task.groupId === selectedIssue.groupId) || [];
  };

  const IssueCard = ({ issue }) => {
    const typeInfo = getIssueTypeInfo(issue.type);
    const statusInfo = getStatusInfo(issue.status);
    const priorityInfo = getPriorityInfo(issue.priority);
    const TypeIcon = typeInfo.icon;

    return (
      <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <TypeIcon size={16} className="text-gray-500" />
            <h4 className="font-medium text-gray-900 line-clamp-1">{issue.title}</h4>
          </div>
          
          <div className="flex items-center space-x-2">
            {user.role === 'admin' || user.role === 'manager' ? (
              <>
                <button
                  onClick={() => {
                    setSelectedIssue(issue);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteIssue(issue.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{issue.description}</p>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
            {priorityInfo.label}
          </span>
        </div>

        <div className="space-y-2 mb-3 text-xs text-gray-500">
          {issue.taskId && (
            <div className="flex items-center bg-blue-50 p-2 rounded-md border border-blue-200">
              <Tag size={12} className="mr-1 text-blue-600" />
              <span className="text-blue-800 font-medium">Linked Task:</span>
              <span className="text-blue-700 ml-1">{getTaskName(issue.taskId)}</span>
              {issue.groupId && (
                <span className="text-blue-600 ml-2">
                  (Group: {getGroupName(issue.groupId)})
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <User size={12} className="mr-1" />
              <span className="mr-2">Reported by:</span>
              <div className="flex items-center space-x-2">
                {getUserAvatar(issue.reportedBy) ? (
                  <img 
                    src={getUserAvatar(issue.reportedBy)} 
                    alt={getUserName(issue.reportedBy)}
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600" style={{ display: getUserAvatar(issue.reportedBy) ? 'none' : 'flex' }}>
                  {getUserName(issue.reportedBy).charAt(0).toUpperCase()}
                </div>
                <span>{getUserName(issue.reportedBy)}</span>
              </div>
            </div>
            
            {issue.assignedTo && (
              <div className="flex items-center">
                <User size={12} className="mr-1" />
                <span className="mr-2">Assigned to:</span>
                <div className="flex items-center space-x-2">
                  {getUserAvatar(issue.assignedTo) ? (
                    <img 
                      src={getUserAvatar(issue.assignedTo)} 
                      alt={getUserName(issue.assignedTo)}
                      className="w-5 h-5 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600" style={{ display: getUserAvatar(issue.assignedTo) ? 'none' : 'flex' }}>
                    {getUserName(issue.assignedTo).charAt(0).toUpperCase()}
                  </div>
                  <span>{getUserName(issue.assignedTo)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <Calendar size={12} className="mr-1" />
            Created: {new Date(issue.createdAt).toLocaleDateString()}
          </div>

          {issue.comments?.length > 0 && (
            <div className="flex items-center">
              <MessageSquare size={12} className="mr-1" />
              {issue.comments.length} comments
            </div>
          )}
        </div>

        {/* Approval Actions */}
        {issue.status === 'pending-approval' && (user.role === 'admin' || user.role === 'manager') && (
          <div className="flex items-center space-x-2 pt-3 border-t">
            <button
              onClick={() => handleApproveIssue(issue.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-md text-xs hover:bg-green-200"
            >
              <CheckCircle size={12} />
              <span>Approve</span>
            </button>
            <button
              onClick={() => handleRejectIssue(issue.id)}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-md text-xs hover:bg-red-200"
            >
              <XCircle size={12} />
              <span>Reject</span>
            </button>
          </div>
        )}

        {/* Status Updates */}
        {issue.status === 'approved' && (
          <div className="flex items-center space-x-1 pt-3 border-t text-xs text-green-600">
            <CheckCircle size={12} />
            <span>Approved on {new Date(issue.approvedAt).toLocaleDateString()}</span>
          </div>
        )}

        {issue.status === 'rejected' && (
          <div className="pt-3 border-t">
            <div className="flex items-center space-x-1 text-xs text-red-600 mb-1">
              <XCircle size={12} />
              <span>Rejected on {new Date(issue.rejectedAt).toLocaleDateString()}</span>
            </div>
            {issue.rejectionReason && (
              <p className="text-xs text-gray-600 bg-red-50 p-2 rounded">
                Reason: {issue.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!project) {
    return <div className="text-center py-8">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Issues</h2>
          <p className="text-gray-600">Track and manage project issues and change requests</p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Issue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{project?.issues?.length || 0}</p>
            </div>
            <AlertCircle size={24} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Linked to Tasks</p>
              <p className="text-2xl font-bold text-blue-600">
                {project?.issues?.filter(issue => issue.taskId).length || 0}
              </p>
            </div>
            <Tag size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-600">
                {project?.issues?.filter(issue => issue.status === 'pending-approval').length || 0}
              </p>
            </div>
            <Clock size={24} className="text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Issues</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Tag size={16} className="text-gray-500" />
          <select
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Tasks</option>
            {project.tasks?.map(task => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            )) || []}
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="grid gap-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No issues found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No issues have been reported for this project yet.'
              }
            </p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        )}
      </div>

      {/* Add Issue Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Report New Issue</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter issue title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                  className="input-field"
                  rows={4}
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type
                  </label>
                  <select
                    value={newIssue.type}
                    onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                    className="input-field"
                  >
                    {issueTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    className="input-field"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={newIssue.assignedTo}
                    onChange={(e) => setNewIssue({ ...newIssue, assignedTo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select team member</option>
                    {allUsers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Group
                  </label>
                  <select
                    value={newIssue.groupId}
                    onChange={(e) => {
                      setNewIssue({ 
                        ...newIssue, 
                        groupId: e.target.value,
                        taskId: '' // Reset task selection when group changes
                      });
                    }}
                    className="input-field"
                  >
                    <option value="">All Groups</option>
                    {project?.taskGroups?.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a group to filter tasks (optional)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Task *
                </label>
                <select
                  value={newIssue.taskId}
                  onChange={(e) => setNewIssue({ ...newIssue, taskId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select task to link issue</option>
                  {getFilteredTasks().map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title} ({task.status.replace('-', ' ')}) - {task.progress || 0}%
                      {task.groupId && ` - ${getGroupName(task.groupId)}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newIssue.groupId 
                    ? `Showing tasks from group: ${getGroupName(newIssue.groupId)}`
                    : 'Showing all tasks. Select a group above to filter.'
                  }
                </p>
              </div>

              {newIssue.taskId && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Tag size={16} />
                    <span className="text-sm font-medium">Linked Task</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Issue will be linked to: <strong>{getTaskName(newIssue.taskId)}</strong>
                    {newIssue.groupId && (
                      <span className="block text-xs text-blue-600">
                        Group: {getGroupName(newIssue.groupId)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {newIssue.type === 'change-request' && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Info size={16} />
                    <span className="text-sm font-medium">Change Request Notice</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Change requests will be marked as "Pending Approval" and require admin/manager approval.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIssue}
                className="btn-primary"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Issue Modal */}
      {isEditModalOpen && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Issue</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={selectedIssue.title}
                  onChange={(e) => setSelectedIssue({ ...selectedIssue, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={selectedIssue.description}
                  onChange={(e) => setSelectedIssue({ ...selectedIssue, description: e.target.value })}
                  className="input-field"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Type
                  </label>
                  <select
                    value={selectedIssue.type}
                    onChange={(e) => setSelectedIssue({ ...selectedIssue, type: e.target.value })}
                    className="input-field"
                  >
                    {issueTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => setSelectedIssue({ ...selectedIssue, status: e.target.value })}
                    className="input-field"
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedIssue.priority}
                    onChange={(e) => setSelectedIssue({ ...selectedIssue, priority: e.target.value })}
                    className="input-field"
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={selectedIssue.assignedTo}
                    onChange={(e) => setSelectedIssue({ ...selectedIssue, assignedTo: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select team member</option>
                    {allUsers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Group
                  </label>
                  <select
                    value={selectedIssue.groupId || ''}
                    onChange={(e) => {
                      setSelectedIssue({ 
                        ...selectedIssue, 
                        groupId: e.target.value,
                        taskId: '' // Reset task selection when group changes
                      });
                    }}
                    className="input-field"
                  >
                    <option value="">All Groups</option>
                    {project?.taskGroups?.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a group to filter tasks (optional)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Task
                  </label>
                  <select
                    value={selectedIssue.taskId || ''}
                    onChange={(e) => setSelectedIssue({ ...selectedIssue, taskId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select task to link issue</option>
                    {getFilteredTasksForEdit().map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.status.replace('-', ' ')}) - {task.progress || 0}%
                        {task.groupId && ` - ${getGroupName(task.groupId)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedIssue?.groupId 
                      ? `Showing tasks from group: ${getGroupName(selectedIssue.groupId)}`
                      : 'Showing all tasks. Select a group above to filter.'
                    }
                  </p>
                </div>
              </div>

              {selectedIssue?.taskId && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <Tag size={16} />
                    <span className="text-sm font-medium">Linked Task</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Issue will be linked to: <strong>{getTaskName(selectedIssue.taskId)}</strong>
                    {selectedIssue?.groupId && (
                      <span className="block text-xs text-blue-600">
                        Group: {getGroupName(selectedIssue.groupId)}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditIssue}
                className="btn-primary"
              >
                Update Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectIssues; 