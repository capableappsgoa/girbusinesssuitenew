import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { useProjectStore } from '../../stores/projectStore';
import toast from 'react-hot-toast';

const AdvancePaymentModal = ({ isOpen, onClose, project }) => {
  const { updateProjectAdvance } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    advanceAmount: 0,
    advancePaymentDate: '',
    advancePaymentMethod: 'cash',
    advanceNotes: ''
  });

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard },
    { value: 'cheque', label: 'Cheque', icon: FileText },
    { value: 'online', label: 'Online Payment', icon: CreditCard },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        advanceAmount: project.advanceAmount || 0,
        advancePaymentDate: project.advancePaymentDate ? new Date(project.advancePaymentDate).toISOString().split('T')[0] : '',
        advancePaymentMethod: project.advancePaymentMethod || 'cash',
        advanceNotes: project.advanceNotes || ''
      });
    }
  }, [isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.advanceAmount <= 0) {
      toast.error('Advance amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProjectAdvance(project.id, {
        advanceAmount: parseFloat(formData.advanceAmount),
        advancePaymentDate: formData.advancePaymentDate ? new Date(formData.advancePaymentDate).toISOString() : null,
        advancePaymentMethod: formData.advancePaymentMethod,
        advanceNotes: formData.advanceNotes.trim() || null
      });

      if (result.success) {
        toast.success('Advance payment updated successfully');
        onClose();
      } else {
        toast.error(result.error || 'Failed to update advance payment');
      }
    } catch (error) {
      console.error('Failed to update advance payment:', error);
      toast.error('Failed to update advance payment. Please try again.');
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
            <DollarSign className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Advance Payment
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
          {/* Advance Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advance Amount (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.advanceAmount}
              onChange={(e) => setFormData({ ...formData, advanceAmount: parseFloat(e.target.value) || 0 })}
              className="input-field"
              placeholder="Enter advance amount"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This amount will be deducted from the total billing
            </p>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={formData.advancePaymentDate}
                onChange={(e) => setFormData({ ...formData, advancePaymentDate: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={formData.advancePaymentMethod}
              onChange={(e) => setFormData({ ...formData, advancePaymentMethod: e.target.value })}
              className="input-field"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.advanceNotes}
              onChange={(e) => setFormData({ ...formData, advanceNotes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Additional notes about the advance payment..."
            />
          </div>

          {/* Current Advance Info */}
          {project?.advanceAmount > 0 && (
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-center space-x-2 text-blue-800 mb-2">
                <DollarSign size={16} />
                <span className="text-sm font-medium">Current Advance Payment</span>
              </div>
              <div className="space-y-1 text-sm text-blue-700">
                <div>Amount: ₹{project.advanceAmount.toLocaleString()}</div>
                {project.advancePaymentDate && (
                  <div>Date: {new Date(project.advancePaymentDate).toLocaleDateString()}</div>
                )}
                {project.advancePaymentMethod && (
                  <div>Method: {paymentMethods.find(m => m.value === project.advancePaymentMethod)?.label}</div>
                )}
                {project.advanceNotes && (
                  <div>Notes: {project.advanceNotes}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
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
              disabled={isSubmitting}
              className="btn-primary flex items-center space-x-2"
            >
              <DollarSign size={16} />
              <span>{isSubmitting ? 'Updating...' : 'Update Advance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancePaymentModal;
