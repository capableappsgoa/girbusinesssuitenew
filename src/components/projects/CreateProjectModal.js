import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { createBillingItems } from '../../services/projectService';
import { toast } from 'react-hot-toast';
import { X, Calendar, DollarSign, Users, FileText, Plus, Trash2 } from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const { createProject, companies, loadCompanies, getCompanyById } = useProjectStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billingItems, setBillingItems] = useState([]);
  const [newBillingItem, setNewBillingItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  // Load companies when modal opens
  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      loadCompanies();
    }
  }, [isOpen, user, loadCompanies]);

  const projectType = watch('type');
  const selectedCompanyId = watch('company_id');
  const selectedCompany = selectedCompanyId ? getCompanyById(selectedCompanyId) : null;

  const handleAddBillingItem = () => {
    if (!newBillingItem.name || !newBillingItem.description || newBillingItem.unitPrice <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    const item = {
      ...newBillingItem,
      id: `temp-${Date.now()}`,
      totalPrice: newBillingItem.quantity * newBillingItem.unitPrice,
      status: 'pending'
    };

    setBillingItems([...billingItems, item]);
    setNewBillingItem({
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const handleRemoveBillingItem = (index) => {
    setBillingItems(billingItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating project with data:', data);
      console.log('Billing items:', billingItems);
      
      const projectData = {
        name: data.name,
        type: data.type,
        client: selectedCompany ? selectedCompany.name : data.client,
        company_id: data.company_id || null,
        description: data.description,
        deadline: data.deadline,
        status: 'pending'
        // Remove team and billingItems - they should be stored separately
      };

      console.log('Final project data:', projectData);
      
      const newProject = await createProject(projectData);
      console.log('Project created successfully:', newProject);
      
      // If there are billing items, create them separately
      if (billingItems.length > 0) {
        console.log('Creating billing items for project:', newProject.id);
        try {
          await createBillingItems(newProject.id, billingItems);
          console.log('Billing items created successfully');
        } catch (error) {
          console.error('Failed to create billing items:', error);
          toast.error('Project created but billing items failed to save');
        }
      }
      
      toast.success('Project created successfully!');
      reset();
      setBillingItems([]);
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error(`Failed to create project: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setBillingItems([]);
    onClose();
  };

  const getSuggestedTasks = () => {
    if (projectType === '3D') {
      return [
        'Stage Modeling',
        'Lighting Design',
        'Rendering',
        'Post Production',
        'Animation',
        'Texturing'
      ];
    } else if (projectType === '2D') {
      return [
        'Initial Concepts',
        'Design Development',
        'Client Feedback Integration',
        'Final Artwork',
        'Print Preparation',
        'Digital Assets'
      ];
    }
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Create New Project</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Project Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Project name is required' })}
                    className="input-field"
                    placeholder="Enter project name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Type
                  </label>
                  <select
                    {...register('type')}
                    className="input-field"
                  >
                    <option value="">Select project type (optional)</option>
                    <option value="3D">3D Project</option>
                    <option value="2D">2D Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Selection (for admins) */}
                {user?.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <select
                      {...register('company_id')}
                      className="input-field"
                    >
                      <option value="">Select a company (optional)</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    {selectedCompany && (
                      <div className="mt-2 flex items-center space-x-2">
                        <CompanyLogo company={selectedCompany} size="sm" />
                        <span className="text-sm text-gray-600">{selectedCompany.name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Client (fallback for non-admins or when no company selected) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  <input
                    type="text"
                    {...register('client')}
                    className="input-field"
                    placeholder="Enter client name (optional)"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  className="input-field"
                  rows={3}
                  placeholder="Enter project description (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    {...register('deadline')}
                    className="input-field"
                    placeholder="Select deadline (optional)"
                  />
                </div>
              </div>

              {/* Billing Items Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Billing Items</h4>
                  <button
                    type="button"
                    onClick={handleAddBillingItem}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Add Billing Item Form */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        value={newBillingItem.name}
                        onChange={(e) => setNewBillingItem({ ...newBillingItem, name: e.target.value })}
                        className="input-field"
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={newBillingItem.description}
                        onChange={(e) => setNewBillingItem({ ...newBillingItem, description: e.target.value })}
                        className="input-field"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newBillingItem.quantity}
                        onChange={(e) => setNewBillingItem({ ...newBillingItem, quantity: parseInt(e.target.value) })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newBillingItem.unitPrice}
                        onChange={(e) => setNewBillingItem({ ...newBillingItem, unitPrice: parseFloat(e.target.value) })}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {newBillingItem.quantity > 0 && newBillingItem.unitPrice > 0 && (
                    <div className="mt-3 bg-white p-3 rounded-md border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <span className="font-bold text-lg text-gray-900">
                          ₹{(newBillingItem.quantity * newBillingItem.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Items List */}
                {billingItems.length > 0 && (
                  <div className="space-y-2">
                    {billingItems.map((item, index) => (
                      <div key={item.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">{item.name}</h5>
                            <span className="font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit: ₹{item.unitPrice.toLocaleString()}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBillingItem(index)}
                          className="ml-3 p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Billing Summary */}
                {billingItems.length > 0 && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Total Billing:</span>
                      <span className="text-lg font-bold text-blue-900">
                        ₹{billingItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggested Tasks */}
              {projectType && (
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Suggested Tasks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getSuggestedTasks().map((task, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded text-sm text-gray-600">
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal; 