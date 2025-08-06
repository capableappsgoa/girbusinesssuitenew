import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { X, Calendar, DollarSign, Users, FileText } from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';

const EditProjectModal = ({ isOpen, onClose, project }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const { updateProject, companies, loadCompanies, getCompanyById } = useProjectStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load companies when modal opens
  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      loadCompanies();
    }
  }, [isOpen, user, loadCompanies]);

  // Populate form when project changes
  useEffect(() => {
    if (project && isOpen) {
      setValue('name', project.name || '');
      setValue('type', project.type || '');
      setValue('client', project.client || '');
      setValue('company_id', project.company_id || '');
      setValue('description', project.description || '');
      setValue('deadline', project.deadline ? project.deadline.split('T')[0] : '');
    }
  }, [project, isOpen, setValue]);

  const selectedCompanyId = watch('company_id');
  const selectedCompany = selectedCompanyId ? getCompanyById(selectedCompanyId) : null;

  const onSubmit = async (data) => {
    if (!project) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Updating project with data:', data);
      
      const projectData = {
        name: data.name,
        type: data.type || null,
        client: selectedCompany ? selectedCompany.name : data.client,
        company_id: data.company_id || null,
        description: data.description || null,
        deadline: data.deadline || null,
      };

      console.log('Final project data:', projectData);
      
      const result = await updateProject(project.id, projectData);
      
      if (result.success) {
        toast.success('Project updated successfully!');
        onClose();
      } else {
        toast.error(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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
                 <option value="both">Both (3D & 2D)</option>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal; 