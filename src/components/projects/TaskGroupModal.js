import React, { useState, useEffect } from 'react';
import { X, Palette, DollarSign } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import toast from 'react-hot-toast';

const TaskGroupModal = ({ isOpen, onClose, group = null, project }) => {
  const { addTaskGroup, updateTaskGroup } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    billingItemId: '',
    status: 'todo'
  });

  // Predefined colors for task groups
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  // Reset form when modal opens/closes or group changes
  useEffect(() => {
    if (isOpen) {
      if (group) {
        // Edit mode
        setFormData({
          name: group.name || '',
          description: group.description || '',
          color: group.color || '#3B82F6',
          billingItemId: group.billing_item_id || '',
          status: group.status || 'todo'
        });
      } else {
        // Create mode
        setFormData({
          name: '',
          description: '',
          color: '#3B82F6',
          billingItemId: '',
          status: 'todo'
        });
      }
    }
  }, [isOpen, group]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (group) {
        // Update existing group
        const result = await updateTaskGroup(project.id, group.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
          billing_item_id: formData.billingItemId || null,
          status: formData.status
        });

        if (result.success) {
          toast.success('Task group updated successfully');
          onClose();
        } else {
          toast.error(result.error || 'Failed to update task group');
        }
      } else {
        // Create new group
        const result = await addTaskGroup(project.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
          billingItemId: formData.billingItemId || null,
          status: formData.status
        });

        if (result.success) {
          toast.success('Task group created successfully');
          onClose();
        } else {
          toast.error(result.error || 'Failed to create task group');
        }
      }
    } catch (error) {
      console.error('Failed to save task group:', error);
      toast.error('Failed to save task group. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: formData.color }}
            />
            <h2 className="text-xl font-semibold text-gray-900">
              {group ? 'Edit Task Group' : 'Create Task Group'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Wedding Planning, Stationery Design"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe what this group is for..."
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="inline w-4 h-4 mr-1" />
              Group Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color 
                      ? 'border-gray-400 scale-110' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Color: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input-field"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">In Review</option>
              <option value="completed">Completed</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This determines which Kanban column the group appears in
            </p>
          </div>

          {/* Billing Item Association */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline w-4 h-4 mr-1" />
              Associated Billing Item (Optional)
            </label>
            <select
              value={formData.billingItemId}
              onChange={(e) => setFormData({ ...formData, billingItemId: e.target.value })}
              className="input-field"
            >
              <option value="">No billing item</option>
              {project?.billingItems?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - ₹{item.totalPrice}
                </option>
              )) || []}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Linking a billing item helps track costs for this group
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <div>
                <h5 className="font-medium text-gray-900">
                  {formData.name || 'Group Name'}
                </h5>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="btn-primary"
            >
              {isSubmitting 
                ? (group ? 'Updating...' : 'Creating...') 
                : (group ? 'Update Group' : 'Create Group')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskGroupModal; 