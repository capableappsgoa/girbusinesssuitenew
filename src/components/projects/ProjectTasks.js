import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { testTaskCreation, testTaskUpdate, checkDatabaseTables } from '../../services/projectService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  PlayCircle,
  PauseCircle,
  Calendar,
  DollarSign,
  MessageSquare,
  Paperclip,
  Eye,
  EyeOff,
  GripVertical,
  FolderOpen,
  Grid3X3,
  List,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import TaskGroupCard from './TaskGroupCard';
import TaskGroupModal from './TaskGroupModal';

const ProjectTasks = ({ project, taskId }) => {
  const { user, getAllUsers } = useAuthStore();
  const { 
    updateTask, 
    addTask, 
    assignTask,
    deleteTask,
    getProjectBillingTotal,
    loadTaskGroups,
    addTaskGroup,
    updateTaskGroup,
    deleteTaskGroup
  } = useProjectStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [currentGroup, setCurrentGroup] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: '',
    billingItemId: '',
    groupId: ''
  });

  // Load users and task groups on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const users = await getAllUsers();
        setAllUsers(users);
        
        // Load task groups
        if (project?.id) {
          await loadTaskGroups(project.id);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setAllUsers([]);
      }
    };
    
    loadData();
  }, [getAllUsers, project?.id, loadTaskGroups]);

  // Initialize drag and drop properly
  const [isDragReady, setIsDragReady] = useState(false);

  useEffect(() => {
    // Ensure DOM is ready and force re-render
    const timer = setTimeout(() => {
      setIsDragReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Force re-initialization when project changes
  useEffect(() => {
    if (project?.id) {
      setIsDragReady(false);
      const timer = setTimeout(() => {
        setIsDragReady(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [project?.id]);

  // Update group statuses when tasks change
  useEffect(() => {
    if (project?.taskGroups && project?.tasks) {
      // Only update group statuses on initial load, not on every task change
      // This prevents conflicts with manual group status updates from drag and drop
      const updateAllGroupStatuses = async () => {
        for (const group of project.taskGroups) {
          await updateGroupStatus(group.id);
        }
      };
      updateAllGroupStatuses();
    }
  }, [project?.id]); // Only run when project ID changes, not on every task/group change

  // Scroll to specific task if taskId is provided
  useEffect(() => {
    if (taskId && project?.tasks) {
      const task = project.tasks.find(t => t.id === taskId);
      if (task) {
        // Find which column the task is in
        const taskColumn = task.status;
        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        
        if (taskElement) {
          // Scroll to the task element
          taskElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          
          // Add a highlight effect
          taskElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
          setTimeout(() => {
            taskElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
          }, 3000);
        }
      }
    }
  }, [taskId, project?.tasks]);

  // Filter tasks based on user role
  const filterTasksByRole = (tasks) => {
    if (!tasks) return [];
    
    // If user is a 3D designer, only show tasks assigned to them
    if (user.role === '3d-designer') {
      return tasks.filter(task => task.assignedTo === user.id);
    }
    
    // For admin, manager, and other roles, show all tasks
    return tasks;
  };

  // Filter groups based on user role - 3D designers can only see groups that contain their assigned tasks
  const filterGroupsByRole = (groups) => {
    if (user.role === '3d-designer') {
      return groups.filter(group => {
        // Check if this group has any tasks assigned to the 3D designer
        const groupTasks = project?.tasks?.filter(task => task.groupId === group.id) || [];
        return groupTasks.some(task => task.assignedTo === user.id);
      });
    }
    // For admin, manager, and other roles, show all groups
    return groups;
  };

  const columns = useMemo(() => {
    console.log('Columns useMemo triggered with:', {
      projectTasks: project?.tasks?.length,
      projectTaskGroups: project?.taskGroups?.length,
      currentGroup: currentGroup?.id,
      userRole: user.role
    });
    
    const result = {
      todo: {
        title: 'To Do',
        tasks: filterTasksByRole(
          currentGroup 
            ? project?.tasks?.filter(task => task.status === 'todo' && task.groupId === currentGroup.id)
            : project?.tasks?.filter(task => task.status === 'todo' && !task.groupId)
        ) || [],
        groups: currentGroup ? [] : filterGroupsByRole(project?.taskGroups?.filter(group => group.status === 'todo')) || []
      },
      'in-progress': {
        title: 'In Progress',
        tasks: filterTasksByRole(
          currentGroup 
            ? project?.tasks?.filter(task => task.status === 'in-progress' && task.groupId === currentGroup.id)
            : project?.tasks?.filter(task => task.status === 'in-progress' && !task.groupId)
        ) || [],
        groups: currentGroup ? [] : filterGroupsByRole(project?.taskGroups?.filter(group => group.status === 'in-progress')) || []
      },
      'review': {
        title: 'Review',
        tasks: filterTasksByRole(
          currentGroup 
            ? project?.tasks?.filter(task => task.status === 'review' && task.groupId === currentGroup.id)
            : project?.tasks?.filter(task => task.status === 'review' && !task.groupId)
        ) || [],
        groups: currentGroup ? [] : filterGroupsByRole(project?.taskGroups?.filter(group => group.status === 'review')) || []
      },
      completed: {
        title: 'Completed',
        tasks: filterTasksByRole(
          currentGroup 
            ? project?.tasks?.filter(task => task.status === 'completed' && task.groupId === currentGroup.id)
            : project?.tasks?.filter(task => task.status === 'completed' && !task.groupId)
        ) || [],
        groups: currentGroup ? [] : filterGroupsByRole(project?.taskGroups?.filter(group => group.status === 'completed')) || []
      }
    };
    
    console.log('Columns result:', {
      todoTasks: result.todo.tasks.length,
      todoGroups: result.todo.groups.length,
      inProgressTasks: result['in-progress'].tasks.length,
      inProgressGroups: result['in-progress'].groups.length,
      reviewTasks: result.review.tasks.length,
      reviewGroups: result.review.groups.length,
      completedTasks: result.completed.tasks.length,
      completedGroups: result.completed.groups.length
    });
    
    return result;
  }, [project?.tasks, project?.taskGroups, currentGroup, user.role]);

  // Function to check and update group status based on its tasks
  const updateGroupStatus = async (groupId) => {
    const groupTasks = project?.tasks?.filter(task => task.groupId === groupId) || [];
    
    if (groupTasks.length === 0) return; // No tasks in group
    
    const completedTasks = groupTasks.filter(task => task.status === 'completed').length;
    const totalTasks = groupTasks.length;
    
    let newGroupStatus = 'todo';
    
    if (completedTasks === totalTasks) {
      // All tasks completed
      newGroupStatus = 'completed';
    } else if (completedTasks > 0) {
      // Some tasks completed
      newGroupStatus = 'in-progress';
    }
    
    // Only update if status changed
    const currentGroup = project?.taskGroups?.find(g => g.id === groupId);
    if (currentGroup && currentGroup.status !== newGroupStatus) {
      try {
        await updateTaskGroup(project.id, groupId, { status: newGroupStatus });
        console.log(`Group ${groupId} status updated to ${newGroupStatus}`);
      } catch (error) {
        console.error('Failed to update group status:', error);
      }
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // Check if this is a task or group drag
    if (draggableId.startsWith('task-')) {
      // Handle task drag
      const taskId = draggableId.replace('task-', '');
      
      // Find the task to check permissions
      const task = project?.tasks?.find(t => t.id === taskId);
      
      // For 3D designers, only allow updates on tasks assigned to them
      if (user.role === '3d-designer' && task && task.assignedTo !== user.id) {
        toast.error('You can only update tasks assigned to you');
        return;
      }
      
      if (source.droppableId === destination.droppableId) {
        // Reorder within same column
        const column = columns[source.droppableId];
        const newTasks = Array.from(column.tasks);
        const [removed] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, removed);
        
        toast.success('Task order updated');
      } else {
        // Move to different column
        const newStatus = destination.droppableId;
        
        // Update progress based on new status
        let newProgress = 0;
        switch (newStatus) {
          case 'todo':
            newProgress = 0;
            break;
          case 'in-progress':
            newProgress = 50;
            break;
          case 'review':
            newProgress = 80;
            break;
          case 'completed':
            newProgress = 100;
            break;
          default:
            newProgress = 0;
        }
        
        try {
          // Update the task in the database
          const result = await updateTask(project.id, taskId, { 
            status: newStatus, 
            progress: newProgress
          });
          
          if (result.success) {
            // Show success message with status change
            const statusMessages = {
              'todo': 'Task moved to To Do',
              'in-progress': 'Task moved to In Progress',
              'review': 'Task moved to Review',
              'completed': 'Task marked as Completed'
            };
            
            toast.success(statusMessages[newStatus] || 'Task status updated');
            
            // Update group status if task belongs to a group
            if (task.groupId) {
              await updateGroupStatus(task.groupId);
            }
          } else {
            // Handle error from the store
            toast.error(result.error || 'Failed to update task status. Please try again.');
          }
        } catch (error) {
          console.error('Failed to update task status:', error);
          toast.error(error.message || 'Failed to update task status. Please try again.');
        }
      }
    } else if (draggableId.startsWith('group-')) {
      // Handle group drag
      const groupId = draggableId.replace('group-', '');
      
      console.log('Group drag detected:', { groupId, source: source.droppableId, destination: destination.droppableId });
      
      if (source.droppableId === destination.droppableId) {
        // Reorder within same column
        toast.success('Group order updated');
      } else {
        // Move group to different column
        const newStatus = destination.droppableId;
        
        console.log('Updating group status:', { groupId, newStatus });
        
        try {
          // Update the group status in the database
          const result = await updateTaskGroup(project.id, groupId, { 
            status: newStatus
          });
          
          console.log('Group status update result:', result);
          
          if (result.success) {
            // Show success message with status change
            const statusMessages = {
              'todo': 'Group moved to To Do',
              'in-progress': 'Group moved to In Progress',
              'review': 'Group moved to Review',
              'completed': 'Group marked as Completed'
            };
            
            toast.success(statusMessages[newStatus] || 'Group status updated');
            
            // Force a re-render by updating the project data
            console.log('Group status updated successfully, current project taskGroups:', project?.taskGroups);
          } else {
            // Handle error from the store
            toast.error(result.error || 'Failed to update group status. Please try again.');
          }
        } catch (error) {
          console.error('Failed to update group status:', error);
          toast.error(error.message || 'Failed to update group status. Please try again.');
        }
      }
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title) {
      toast.error('Task title is required');
      return;
    }

    try {
      // Create a new task with proper structure
      const taskToAdd = {
        ...newTask,
        id: Date.now().toString(), // Ensure unique ID
        status: 'todo',
        progress: 0,
        timeSpent: 0,
        deadline: newTask.deadline || null,
        billingItemId: newTask.billingItemId || null,
        // Ensure the task is assigned to the current group if we're inside one
        groupId: currentGroup ? currentGroup.id : (newTask.groupId || null)
      };

      console.log('handleAddTask - currentGroup:', currentGroup);
      console.log('handleAddTask - newTask.groupId:', newTask.groupId);
      console.log('handleAddTask - taskToAdd.groupId:', taskToAdd.groupId);
      console.log('Adding task:', taskToAdd);
      const result = await addTask(project.id, taskToAdd);

      if (result.success) {
        console.log('Task added successfully - result:', result);
        console.log('Task added successfully - result.data:', result.data);
        console.log('Task added successfully - result.data.groupId:', result.data?.groupId);
        console.log('Task added successfully - result.task:', result.task);
        console.log('Task added successfully - result.task.groupId:', result.task?.groupId);
        
        // Reset form
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'medium',
          deadline: '',
          billingItemId: '',
          groupId: currentGroup ? currentGroup.id : ''
        });
        setIsAddModalOpen(false);
        toast.success('Task added successfully');
        
        // Update group status if task was added to a group
        if (taskToAdd.groupId) {
          await updateGroupStatus(taskToAdd.groupId);
        }
      } else {
        // Handle error from the store
        toast.error(result.error || 'Failed to add task. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      toast.error(error.message || 'Failed to add task. Please try again.');
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask.title) {
      toast.error('Task title is required');
      return;
    }

    // For 3D designers, only allow editing tasks assigned to them
    if (user.role === '3d-designer' && selectedTask.assignedTo !== user.id) {
      toast.error('You can only edit tasks assigned to you');
      return;
    }

    try {
      // Clean and validate the form data before sending to database
      const cleanedTaskData = {
        title: selectedTask.title,
        description: selectedTask.description,
        // Ensure priority is lowercase
        priority: selectedTask.priority?.toLowerCase() || 'medium',
        // Ensure status is correct format
        status: selectedTask.status || 'todo',
        // Time spent is already in minutes from the form conversion
        timeSpent: selectedTask.timeSpent || 0,
        // Ensure progress is a number
        progress: parseInt(selectedTask.progress) || 0,
        // For 3D designers, don't allow changing assignment
        assignedTo: user.role === '3d-designer' ? user.id : (selectedTask.assignedTo || null),
        // Only include deadline if it exists
        ...(selectedTask.deadline && { deadline: selectedTask.deadline })
      };

      console.log('Original task data:', selectedTask);
      console.log('Cleaned task data:', cleanedTaskData);

      const result = await updateTask(project.id, selectedTask.id, cleanedTaskData);
      
      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedTask(null);
        toast.success('Task updated successfully');
        
        // Update group status if task belongs to a group
        if (selectedTask.groupId) {
          await updateGroupStatus(selectedTask.groupId);
        }
      } else {
        // Handle error from the store
        toast.error(result.error || 'Failed to update task. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error(error.message || 'Failed to update task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Get the task before deleting to check if it belongs to a group
        const taskToDelete = project.tasks?.find(task => task.id === taskId);
        const groupId = taskToDelete?.groupId;
        
        // Remove task from project using local update (for immediate UI feedback)
        const updatedTasks = project.tasks?.filter(task => task.id !== taskId) || [];
        useProjectStore.getState().updateProjectLocal(project.id, { tasks: updatedTasks });
        
        // Call the database delete function
        await deleteTask(taskId);
        toast.success('Task deleted successfully');
        
        // Update group status if task belonged to a group
        if (groupId) {
          await updateGroupStatus(groupId);
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        toast.error('Failed to delete task. Please try again.');
      }
    }
  };

  const handleAssignTask = (taskId, userId) => {
    assignTask(project.id, taskId, userId);
    toast.success('Task assigned successfully');
  };

  const handleTestConnection = async () => {
    try {
      console.log('Testing connection and permissions...');
      const result = await testTaskCreation(project.id);
      console.log('Test result:', result);
      
      if (result.success) {
        toast.success('Connection test passed! Task creation should work.');
      } else {
        toast.error(`Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error(`Test error: ${error.message}`);
    }
  };

  const handleTestTaskUpdate = async (taskId) => {
    try {
      console.log('Testing task update permissions...');
      const result = await testTaskUpdate(project.id, taskId);
      console.log('Task update test result:', result);
      
      if (result.success) {
        toast.success(`Task update test passed! ${result.message}`);
        console.log('Test details:', result.details);
      } else {
        toast.error(`Task update test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Task update test error:', error);
      toast.error(`Test error: ${error.message}`);
    }
  };

  const handleCheckDatabase = async () => {
    try {
      console.log('Checking database tables...');
      const result = await checkDatabaseTables();
      console.log('Database check result:', result);
      
      if (result.success) {
        toast.success('Database check passed! All required tables exist.');
        console.log('Test details:', result.details);
      } else {
        toast.error(`Database check failed: ${result.error}`);
        if (result.details?.instructions) {
          console.log('Setup instructions:', result.details.instructions);
          toast.error('Please follow the setup instructions in the console.');
        }
      }
    } catch (error) {
      console.error('Database check error:', error);
      toast.error(`Database check error: ${error.message}`);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBillingItemName = (billingItemId) => {
    const billingItem = project?.billingItems.find(item => item.id === billingItemId);
    return billingItem?.name || 'No billing item';
  };

  const getUserAvatar = (userId) => {
    const user = allUsers.find(member => member.id === userId);
    return user?.avatar || null;
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const TaskCard = ({ task, index }) => {
    const assignedUser = allUsers.find(member => member.id === task.assignedTo);
    const billingItem = project?.billingItems.find(item => item.id === task.billingItemId);
    const taskGroup = project?.taskGroups?.find(group => group.id === task.groupId);

    return (
      <Draggable draggableId={`task-${task.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            data-task-id={task.id}
            className={`bg-white rounded-lg border p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing ${
              snapshot.isDragging ? 'shadow-xl transform rotate-1 scale-105 opacity-75' : ''
            } ${task.status === 'completed' ? 'border-green-200 bg-green-50' : ''}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <GripVertical size={16} className="text-gray-400 cursor-grab hover:text-gray-600 transition-colors duration-150" />
                <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
              </div>
              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                {/* Show edit button for 3D designers if task is assigned to them */}
                {(user.role === 'admin' || user.role === 'manager' || 
                  (user.role === '3d-designer' && task.assignedTo === user.id)) ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setIsEditModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors duration-150"
                      title="Edit task"
                    >
                      <Edit size={14} />
                    </button>
                    {/* Only show delete and test buttons for admin/manager */}
                    {(user.role === 'admin' || user.role === 'manager') && (
                      <>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 cursor-pointer transition-colors duration-150"
                          title="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => handleTestTaskUpdate(task.id)}
                          className="p-1 text-gray-400 hover:text-orange-600 cursor-pointer transition-colors duration-150"
                          title="Test task update permissions"
                        >
                          <AlertCircle size={14} />
                        </button>
                      </>
                    )}
                  </>
                ) : null}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{task.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    task.progress >= 100 ? 'bg-green-500' :
                    task.progress >= 80 ? 'bg-purple-500' :
                    task.progress >= 50 ? 'bg-blue-500' :
                    'bg-gray-400'
                  }`}
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status === 'todo' ? 'To Do' : task.status.replace('-', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {task.deadline && (
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  {new Date(task.deadline).toLocaleDateString()}
                </div>
              )}
              
              {task.timeSpent > 0 && (
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={12} className="mr-1" />
                  {task.timeSpent}h spent
                </div>
              )}

              {billingItem && (
                <div className="flex items-center text-xs text-gray-500">
                  <DollarSign size={12} className="mr-1" />
                  {billingItem.name} - ₹{billingItem.totalPrice}
                </div>
              )}
              
              {/* Show group information for 3D designers */}
              {user.role === '3d-designer' && taskGroup && (
                <div className="flex items-center text-xs text-gray-500">
                  <FolderOpen size={12} className="mr-1" />
                  <span>From Group: {taskGroup.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {assignedUser ? (
                  <div className="flex items-center text-xs text-gray-500">
                    <User size={12} className="mr-1" />
                    <div className="flex items-center space-x-2">
                      {getUserAvatar(task.assignedTo) ? (
                        <img 
                          src={getUserAvatar(task.assignedTo)} 
                          alt={assignedUser.name}
                          className="w-4 h-4 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600" style={{ display: getUserAvatar(task.assignedTo) ? 'none' : 'flex' }}>
                        {assignedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{assignedUser.name}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Unassigned</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {task.attachments && task.attachments?.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Paperclip size={12} className="mr-1" />
                    {task.attachments?.length || 0}
                  </div>
                )}
                
                {task.comments && task.comments?.length > 0 && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageSquare size={12} className="mr-1" />
                    {task.comments?.length || 0}
                  </div>
                )}
              </div>
            </div>

            {/* Drag Handle Indicator */}
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-400">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                </div>
                <span className="ml-2">Drag to move</span>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const GroupCard = ({ group, index }) => {
    const groupTasks = project?.tasks?.filter(task => task.groupId === group.id) || [];
    
    const taskCounts = {
      todo: groupTasks.filter(task => task.status === 'todo').length,
      'in-progress': groupTasks.filter(task => task.status === 'in-progress').length,
      review: groupTasks.filter(task => task.status === 'review').length,
      completed: groupTasks.filter(task => task.status === 'completed').length
    };

    return (
      <Draggable draggableId={`group-${group.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white rounded-lg border-2 border-dashed p-4 mb-4 shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${
              snapshot.isDragging ? 'shadow-lg transform rotate-2' : ''
            }`}
            style={{ 
              borderColor: group.color, 
              backgroundColor: `${group.color}10`,
              ...provided.draggableProps.style
            }}
            onClick={() => {
              // Navigate into the group
              setCurrentGroup(group);
            }}
          >
            {/* Group Name */}
            <div className="flex items-center space-x-3 mb-2">
              <FolderOpen size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">{group.name}</h3>
            </div>
            
            {/* Group Description */}
            {group.description && (
              <p className="text-sm text-gray-600 mb-3">{group.description}</p>
            )}
            
            {/* Task Count Icons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-600">{taskCounts.todo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <PlayCircle size={12} className="text-blue-500" />
                  <span className="text-xs text-blue-600">{taskCounts['in-progress']}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertCircle size={12} className="text-yellow-500" />
                  <span className="text-xs text-yellow-600">{taskCounts.review}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle size={12} className="text-green-500" />
                  <span className="text-xs text-green-600">{taskCounts.completed}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGroup(group);
                    setIsGroupModalOpen(true);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTaskGroup(project.id, group.id);
                  }}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  const Column = ({ columnId, column }) => {
    const filteredTasks = showCompleted 
      ? column.tasks 
      : column.tasks?.filter(task => task.status !== 'completed') || [];
    
    const filteredGroups = currentGroup ? [] : column.groups || [];

    const getColumnColor = (columnId) => {
      switch (columnId) {
        case 'todo': return 'border-gray-200 bg-gray-50';
        case 'in-progress': return 'border-blue-200 bg-blue-50';
        case 'review': return 'border-purple-200 bg-purple-50';
        case 'completed': return 'border-green-200 bg-green-50';
        default: return 'border-gray-200 bg-gray-50';
      }
    };

    const getColumnIcon = (columnId) => {
      switch (columnId) {
        case 'todo': return '📋';
        case 'in-progress': return '⚡';
        case 'review': return '👁️';
        case 'completed': return '✅';
        default: return '📋';
      }
    };

    return (
      <div className={`rounded-lg p-4 min-h-[600px] border-2 ${getColumnColor(columnId)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getColumnIcon(columnId)}</span>
            <h3 className="font-semibold text-gray-900">{column.title}</h3>
          </div>
          <span className="bg-white text-gray-700 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            {currentGroup ? filteredTasks.length : filteredTasks.length + filteredGroups.length}
          </span>
        </div>
        
        <Droppable droppableId={columnId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[500px] transition-all duration-150 rounded-lg p-2 ${
                snapshot.isDraggingOver 
                  ? 'bg-white shadow-lg border-2 border-dashed border-blue-400' 
                  : 'bg-transparent'
              }`}
            >
              {/* Render Groups First (only when not inside a group) */}
              {filteredGroups.map((group, index) => (
                <GroupCard key={group.id} group={group} index={index} />
              ))}
              
              {/* Render Tasks After Groups */}
              {filteredTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={filteredGroups.length + index} />
              ))}
              
              {filteredTasks.length === 0 && filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">
                    {currentGroup ? 'No tasks in this group' : 'No tasks or groups here'}
                  </p>
                  <p className="text-xs">
                    {currentGroup 
                      ? 'Add tasks to this group using the "Add Task" button'
                      : 'Drag tasks or groups from other columns'
                    }
                  </p>
                </div>
              ) : null}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  if (!project) {
    return <div className="text-center py-8">Project not found</div>;
  }

  return (
    <div className={`space-y-6 ${currentGroup ? 'bg-blue-50 p-4 rounded-lg border-2 border-blue-200' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3">
            {currentGroup && (
              <button
                onClick={() => setCurrentGroup(null)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="text-sm">Back to Groups</span>
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {currentGroup ? `Tasks in ${currentGroup.name}` : 'Tasks'}
            </h2>
          </div>
          <p className="text-gray-600">
            {currentGroup 
              ? `Manage tasks within the "${currentGroup.name}" group`
              : user.role === '3d-designer' 
                ? 'View and update your assigned tasks' 
                : 'Manage and track project tasks'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-150"
          >
            {showCompleted ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showCompleted ? 'Hide' : 'Show'} completed</span>
          </button>
          
          {(user.role === 'admin' || user.role === 'manager') && (
            <>
              {!currentGroup && (
                <button
                  onClick={() => {
                    setSelectedGroup(null);
                    setIsGroupModalOpen(true);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Add Group</span>
                </button>
              )}
              <button
                onClick={() => {
                  console.log('Add Task button clicked - currentGroup:', currentGroup);
                  console.log('Add Task button clicked - currentGroup?.id:', currentGroup?.id);
                  const updatedNewTask = { 
                    ...newTask, 
                    groupId: currentGroup?.id || '' 
                  };
                  console.log('Add Task button clicked - updatedNewTask:', updatedNewTask);
                  setNewTask(updatedNewTask);
                  setIsAddModalOpen(true);
                }}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add Task</span>
              </button>
              <button
                onClick={handleTestConnection}
                className="btn-secondary flex items-center space-x-2"
                title="Test connection and permissions"
              >
                <AlertCircle size={16} />
                <span>Test Connection</span>
              </button>
              <button
                onClick={handleCheckDatabase}
                className="btn-secondary flex items-center space-x-2"
                title="Check database tables"
              >
                <CheckCircle size={16} />
                <span>Check DB</span>
              </button>
            </>
          )}
        </div>
      </div>



      {/* Drag & Drop Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600">💡</div>
          <div>
            <h4 className="font-medium text-blue-900">Quick Tip</h4>
            <p className="text-sm text-blue-700">
              {currentGroup
                ? 'Drag and drop tasks between columns to update their status. Tasks created here will be part of this group.'
                : user.role === '3d-designer' 
                  ? 'Drag and drop your assigned tasks between columns to update their status. You can also edit tasks to update progress and time spent.'
                  : 'Drag and drop tasks and groups between columns to update their status automatically. Progress will be updated based on the column: To Do (0%) → In Progress (50%) → Review (80%) → Completed (100%)'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <Column key={`${columnId}-${isDragReady}`} columnId={columnId} column={column} />
          ))}
        </div>
      </DragDropContext>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
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
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Item
                  </label>
                  <select
                    value={newTask.billingItemId}
                    onChange={(e) => {
                      const selectedBillingItem = project.billingItems?.find(item => item.id === e.target.value);
                      setNewTask({ 
                        ...newTask, 
                        billingItemId: e.target.value,
                        title: selectedBillingItem ? selectedBillingItem.name : newTask.title
                      });
                    }}
                    className="input-field"
                  >
                    <option value="">Select billing item</option>
                    {project.billingItems?.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ₹{item.totalPrice}
                      </option>
                    )) || []}
                  </select>
                </div>
              </div>

              {newTask.groupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Group
                  </label>
                  <select
                    value={newTask.groupId}
                    onChange={(e) => setNewTask({ ...newTask, groupId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">No group (ungrouped)</option>
                    {project.taskGroups?.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    )) || []}
                  </select>
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
                onClick={handleAddTask}
                className="btn-primary"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedTask.priority || 'medium'}
                    onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hide Assign To field for 3D designers */}
                {user.role !== '3d-designer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <select
                      value={selectedTask.assignedTo}
                      onChange={(e) => setSelectedTask({ ...selectedTask, assignedTo: e.target.value })}
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
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedTask.progress}
                    onChange={(e) => setSelectedTask({ ...selectedTask, progress: parseInt(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hide Billing Item field for 3D designers */}
                {user.role !== '3d-designer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Item
                    </label>
                    <select
                      value={selectedTask.billingItemId || ''}
                      onChange={(e) => {
                        const selectedBillingItem = project.billingItems?.find(item => item.id === e.target.value);
                        setSelectedTask({ 
                          ...selectedTask, 
                          billingItemId: e.target.value,
                          title: selectedBillingItem ? selectedBillingItem.name : selectedTask.title
                        });
                      }}
                      className="input-field"
                    >
                      <option value="">Select billing item</option>
                      {project.billingItems?.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} - ₹{item.totalPrice}
                        </option>
                      )) || []}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={selectedTask.deadline}
                    onChange={(e) => setSelectedTask({ ...selectedTask, deadline: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={selectedTask.deadline}
                    onChange={(e) => setSelectedTask({ ...selectedTask, deadline: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Spent (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={selectedTask.timeSpent ? (selectedTask.timeSpent / 60).toFixed(1) : 0}
                    onChange={(e) => setSelectedTask({ ...selectedTask, timeSpent: Math.round(parseFloat(e.target.value) * 60) })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTask}
                className="btn-primary"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Group Modal */}
      <TaskGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        project={project}
      />
    </div>
  );
};

export default ProjectTasks; 