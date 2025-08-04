import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Calculator,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Percent,
  Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import InvoiceGenerator from '../invoice/InvoiceGenerator';

const ProjectInvoice = ({ project }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    addBillingItem, 
    updateBillingItem, 
    deleteBillingItem,
    getProjectBillingTotal,
    getProjectSpentTotal,
    getProjectRemainingTotal,
    loadProjects,
    setCurrentProject,
    setInvoiceDiscountPercentage,
    updateProjectDiscount,
    invoiceDiscountPercentage
  } = useProjectStore();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [discount, setDiscount] = useState(project?.discountPercentage || invoiceDiscountPercentage || 0);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [newBillingItem, setNewBillingItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0
  });

  const billingTotal = getProjectBillingTotal(project?.id);
  const completedTotal = getProjectSpentTotal(project?.id); // This gets completed items
  const remainingTotal = getProjectRemainingTotal(project?.id); // Remaining items (pending + in-progress)
  const discountAmount = (billingTotal * discount) / 100;
  const finalTotal = billingTotal - discountAmount;

  // Synchronize discount with store and project
  useEffect(() => {
    const projectDiscount = project?.discountPercentage || 0;
    const storeDiscount = invoiceDiscountPercentage || 0;
    const currentDiscount = Math.max(projectDiscount, storeDiscount);
    
    if (currentDiscount !== discount) {
      setDiscount(currentDiscount);
    }
  }, [invoiceDiscountPercentage, project?.discountPercentage, discount]);

  // Update store when local discount changes
  useEffect(() => {
    if (discount !== invoiceDiscountPercentage) {
      setInvoiceDiscountPercentage(discount);
    }
  }, [discount, invoiceDiscountPercentage, setInvoiceDiscountPercentage]);

  // Debug: Log project billing items
  console.log('Project billing items:', project?.billingItems);
  console.log('Billing total:', billingTotal);
  console.log('Project ID:', project?.id);

  const handleAddBillingItem = async () => {
    console.log('Adding billing item:', newBillingItem);
    
    if (!newBillingItem.name || !newBillingItem.description || newBillingItem.unitPrice <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    try {
      const result = await addBillingItem(project.id, newBillingItem);
      
      if (result.success) {
        setNewBillingItem({
          name: '',
          description: '',
          quantity: 1,
          unitPrice: 0
        });
        setIsAddModalOpen(false);
        toast.success('Billing item added successfully');
        // Refresh projects to get updated billing items
        await loadProjects();
      } else {
        toast.error(result.error || 'Failed to add billing item');
      }
    } catch (error) {
      console.error('Error adding billing item:', error);
      toast.error('Failed to add billing item');
    }
  };

  const handleEditBillingItem = async () => {
    if (!selectedItem.name || !selectedItem.description || selectedItem.unitPrice <= 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    try {
      const result = await updateBillingItem(project.id, selectedItem.id, selectedItem);
      
      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        toast.success('Billing item updated successfully');
        // Refresh projects to get updated billing items
        await loadProjects();
      } else {
        toast.error(result.error || 'Failed to update billing item');
      }
    } catch (error) {
      console.error('Error updating billing item:', error);
      toast.error('Failed to update billing item');
    }
  };

  const handleDeleteBillingItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this billing item?')) {
      try {
        const result = await deleteBillingItem(project.id, itemId);
        
        if (result.success) {
          toast.success('Billing item deleted successfully');
          // Refresh projects to get updated billing items
          await loadProjects();
        } else {
          toast.error(result.error || 'Failed to delete billing item');
        }
      } catch (error) {
        console.error('Error deleting billing item:', error);
        toast.error('Failed to delete billing item');
      }
    }
  };

  const handleGenerateInvoice = () => {
    // Set the current project and discount percentage, then navigate to the invoice page
    setCurrentProject(project);
    setInvoiceDiscountPercentage(discount);
    navigate('/invoice');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const BillingItemCard = ({ item }) => {
    return (
      <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            {user.role === 'admin' || user.role === 'manager' ? (
              <>
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDeleteBillingItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <span className="text-xs text-gray-500">Quantity</span>
            <p className="text-sm font-medium">{item.quantity}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Unit Price</span>
            <p className="text-sm font-medium">₹{item.unitPrice.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Total Price</span>
            <p className="text-lg font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status.replace('-', ' ')}
          </span>
        </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Billing & Invoice</h2>
          <p className="text-gray-600">Manage project billing items and generate invoices</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {(user.role === 'admin' || user.role === 'manager') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Billing Item</span>
            </button>
          )}
          <button
            onClick={handleGenerateInvoice}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Generate Invoice</span>
          </button>
          <button
            onClick={async () => {
              console.log('Manual refresh clicked');
              await loadProjects();
              toast.success('Projects refreshed');
            }}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bill Total</p>
              <p className="text-2xl font-bold text-blue-600">₹{billingTotal.toLocaleString()}</p>
            </div>
            <Calculator size={24} className="text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">₹{completedTotal.toLocaleString()}</p>
            </div>
            <CheckCircle size={24} className="text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">₹{remainingTotal.toLocaleString()}</p>
            </div>
            <Clock size={24} className="text-orange-400" />
          </div>
        </div>
      </div>

      {/* Company Information */}
      {project.company && (
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Billed To</p>
              <p className="text-lg font-semibold text-gray-900">{project.company.name}</p>
              {project.company.email && (
                <p className="text-sm text-gray-600">{project.company.email}</p>
              )}
            </div>
            <Building2 size={24} className="text-gray-400" />
          </div>
        </div>
      )}



      {/* Discount Section */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Percent size={20} className="text-gray-500" />
            <h3 className="font-semibold text-gray-900">Invoice Discount</h3>
          </div>
          <div className="flex items-center space-x-2">
                         <input
               type="number"
               min="0"
               max="100"
               value={discount}
               onChange={async (e) => {
                 const newValue = parseFloat(e.target.value) || 0;
                 setDiscount(newValue);
                 setInvoiceDiscountPercentage(newValue);
                 
                 // Save to database
                 if (project?.id) {
                   try {
                     await updateProjectDiscount(project.id, newValue);
                     console.log('Discount saved to database:', newValue);
                   } catch (error) {
                     console.error('Failed to save discount to database:', error);
                     toast.error('Failed to save discount. Please try again.');
                   }
                 }
               }}
               className="w-24 px-3 py-2 border rounded-lg text-sm font-medium"
               placeholder="0"
             />
            <span className="text-sm text-gray-500 font-medium">%</span>
          </div>
        </div>
        
        {discount > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Original Total:</span>
              <span className="font-bold text-gray-900">₹{billingTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">Discount ({discount}%):</span>
              <span className="font-bold text-red-600 text-lg">-₹{discountAmount.toLocaleString()}</span>
            </div>
            <div className="border-t border-yellow-200 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-900 font-bold text-lg">Final Total:</span>
                <span className="font-bold text-green-600 text-xl">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Billing Items */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Billing Items</h3>
          <p className="text-sm text-gray-600">Manage individual billing items for this project</p>
        </div>
        
        <div className="p-4">
          {(project.billingItems?.length || 0) === 0 ? (
            <div className="text-center py-8">
              <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No billing items</h3>
              <p className="text-gray-600">Add billing items to start tracking project costs</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {project.billingItems?.map(item => (
                <BillingItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl h-[95vh] overflow-hidden shadow-2xl">
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} className="text-yellow-400" />
                <h3 className="text-xl font-semibold">Invoice Generator</h3>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-white hover:text-yellow-400 transition-colors duration-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="h-full overflow-y-auto bg-gray-50">
              <div className="p-6">
                <InvoiceGenerator project={project} discount={discount} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Billing Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Billing Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                                 <input
                   type="text"
                   value={newBillingItem.name}
                   onChange={(e) => {
                     console.log('Name changed:', e.target.value);
                     setNewBillingItem({ ...newBillingItem, name: e.target.value });
                   }}
                   className="input-field"
                   placeholder="Enter item name"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                                 <textarea
                   value={newBillingItem.description}
                   onChange={(e) => {
                     console.log('Description changed:', e.target.value);
                     setNewBillingItem({ ...newBillingItem, description: e.target.value });
                   }}
                   className="input-field"
                   rows={3}
                   placeholder="Enter item description"
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                                     <input
                     type="number"
                     min="1"
                     value={newBillingItem.quantity}
                     onChange={(e) => {
                       console.log('Quantity changed:', e.target.value);
                       setNewBillingItem({ ...newBillingItem, quantity: parseInt(e.target.value) || 1 });
                     }}
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
                     onChange={(e) => {
                       console.log('Unit price changed:', e.target.value);
                       setNewBillingItem({ ...newBillingItem, unitPrice: parseFloat(e.target.value) || 0 });
                     }}
                     className="input-field"
                   />
                </div>
              </div>

              {newBillingItem.quantity > 0 && newBillingItem.unitPrice > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Price:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{(newBillingItem.quantity * newBillingItem.unitPrice).toLocaleString()}
                    </span>
                  </div>
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
                onClick={handleAddBillingItem}
                className="btn-primary"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Billing Item Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Billing Item</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={selectedItem.quantity}
                    onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) })}
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
                    value={selectedItem.unitPrice}
                    onChange={(e) => setSelectedItem({ ...selectedItem, unitPrice: parseFloat(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={selectedItem.status}
                  onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {selectedItem.quantity > 0 && selectedItem.unitPrice > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Price:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{(selectedItem.quantity * selectedItem.unitPrice).toLocaleString()}
                    </span>
                  </div>
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
                onClick={handleEditBillingItem}
                className="btn-primary"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectInvoice; 