import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Trash2, 
  CheckSquare, 
  Square,
  DollarSign,
  Calendar,
  Edit3,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  Paste,
  Download,
  Upload
} from 'lucide-react';
import toast from 'react-hot-toast';

const BillingExcelInterface = ({ project, onUpdate }) => {
  const [billingItems, setBillingItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRows, setNewRows] = useState([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    if (project?.billingItems) {
      console.log('📋 Billing items loaded:', project.billingItems);
      console.log('🔍 First item structure:', project.billingItems[0]);
      setBillingItems(project.billingItems || []);
    } else {
      setBillingItems([]);
    }
  }, [project?.billingItems]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleCellEdit = (itemId, field, value) => {
    setEditingCell({ itemId, field });
    setEditingValue(value);
  };

  const handleCellSave = async (itemId, field, value) => {
    try {
      const updatedItems = billingItems.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate total price if quantity or unit price changed
          if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? parseInt(value) || 1 : item.quantity;
            const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
            updatedItem.totalPrice = quantity * unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      });

      setBillingItems(updatedItems);
      setEditingCell(null);
      setEditingValue('');

      // Auto-save if enabled
      if (autoSaveEnabled) {
        await onUpdate(itemId, { [field]: value });
        toast.success('Auto-saved');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to update');
      return;
    }

    try {
      const updatedItems = billingItems.map(item => {
        if (selectedItems.has(item.id)) {
          return { ...item, status: newStatus };
        }
        return item;
      });

      setBillingItems(updatedItems);
      setSelectedItems(new Set());

      // Update all selected items in database
      const updatePromises = Array.from(selectedItems).map(itemId =>
        onUpdate(itemId, { status: newStatus })
      );
      await Promise.all(updatePromises);

      toast.success(`${selectedItems.size} items marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating items:', error);
      toast.error('Failed to update items');
    }
  };

  const createNewRow = () => ({
    id: `temp-${Date.now()}-${Math.random()}`,
    name: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    status: 'in-progress',
    totalPrice: 0,
    isNew: true
  });

  const handleAddMultipleRows = (count = 5) => {
    const newRowsArray = Array.from({ length: count }, createNewRow);
    setNewRows([...newRows, ...newRowsArray]);
    setIsAddingRow(true);
    toast.success(`Added ${count} new rows`);
  };

  const handleSaveNewRow = async (row) => {
    if ((!row.name || row.name.trim() === '') && (!row.description || row.description.trim() === '')) {
      toast.error('Please enter at least a name or description');
      return;
    }

    try {
      console.log('Saving row:', row);
      const totalPrice = row.quantity * row.unitPrice;
      const itemToAdd = {
        ...row,
        totalPrice,
        projectId: project.id
      };

      console.log('Item to add:', itemToAdd);

      // Save to database
      const savedItem = await onUpdate(null, itemToAdd, true);
      console.log('Saved item response:', savedItem);
      
      if (!savedItem || !savedItem.id) {
        throw new Error('Failed to save item - no ID returned');
      }
      
      // Add to local state
      const newItem = {
        ...savedItem,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Adding to local state:', newItem);
      setBillingItems([...billingItems, newItem]);
      
      // Remove from new rows
      setNewRows(prev => prev.filter(r => r.id !== row.id));
      
      toast.success('Row saved successfully');
    } catch (error) {
      console.error('Error saving row:', error);
      toast.error('Failed to save row: ' + error.message);
    }
  };

  const handleSaveAllNewRows = async () => {
    if (newRows.length === 0) {
      toast.error('No new rows to save');
      return;
    }

    try {
      const savePromises = newRows.map(row => handleSaveNewRow(row));
      await Promise.all(savePromises);
      setIsAddingRow(false);
      toast.success(`Saved ${newRows.length} rows`);
    } catch (error) {
      console.error('Error saving rows:', error);
      toast.error('Failed to save some rows');
    }
  };

  const handleDeleteSelected = async (itemId = null) => {
    console.log('🔍 handleDeleteSelected called with itemId:', itemId, 'type:', typeof itemId);
    
    // Handle case where event object is passed instead of itemId
    if (itemId && typeof itemId === 'object' && itemId.nativeEvent) {
      console.log('⚠️ Event object passed instead of itemId, treating as bulk deletion');
      itemId = null; // Treat as bulk deletion
    }
    
    // Ensure itemId is a string if provided
    if (itemId && typeof itemId !== 'string') {
      console.error('❌ itemId is not a string:', itemId, 'type:', typeof itemId);
      toast.error('Invalid item ID format');
      return;
    }
    
    if (itemId) {
      console.log('🗑️ Single item deletion for itemId:', itemId);
      
      if (!window.confirm('Are you sure you want to delete this item?')) {
        return;
      }

      try {
        const updatedItems = billingItems.filter(item => item.id !== itemId);
        setBillingItems(updatedItems);
        console.log('📞 Calling onUpdate with itemId:', itemId, 'type:', typeof itemId);
        const result = await onUpdate(itemId, null, false, true);
        
        if (result && result.success === false) {
          // If deletion failed, revert the local state change
          setBillingItems(billingItems);
          toast.error(result.error || 'Failed to delete item');
        } else {
          toast.success('Item deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        // Revert the local state change on error
        setBillingItems(billingItems);
        toast.error('Failed to delete item: ' + (error.message || 'Unknown error'));
      }
      return;
    }

    console.log('📦 Multiple item deletion for selectedItems:', selectedItems);
    
    if (selectedItems.size === 0) {
      toast.error('Please select items to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      return;
    }

    // Store original state before making changes
    const originalBillingItems = [...billingItems];
    const originalSelectedItems = new Set(selectedItems);

    try {
      // Optimistically update UI
      const updatedItems = billingItems.filter(item => !selectedItems.has(String(item.id)));
      setBillingItems(updatedItems);
      setSelectedItems(new Set());

      // Perform all deletions with better error handling
      const deletePromises = Array.from(selectedItems).map(async (selectedItemId) => {
        console.log('🔄 Processing deletion for selectedItemId:', selectedItemId, 'type:', typeof selectedItemId);
        
        // Ensure selectedItemId is a string
        if (typeof selectedItemId !== 'string') {
          console.error('❌ selectedItemId is not a string:', selectedItemId, 'type:', typeof selectedItemId);
          return { success: false, itemId: selectedItemId, error: 'Invalid item ID format' };
        }
        
        try {
          const result = await onUpdate(selectedItemId, null, false, true);
          return { success: true, itemId: selectedItemId, result };
        } catch (error) {
          console.error(`Failed to delete item ${selectedItemId}:`, error);
          return { success: false, itemId: selectedItemId, error: error.message };
        }
      });
      
      const results = await Promise.all(deletePromises);
      
      // Check if any deletions failed
      const failedDeletions = results.filter(result => !result.success);
      if (failedDeletions.length > 0) {
        // Revert to original state if any deletions failed
        setBillingItems(originalBillingItems);
        setSelectedItems(originalSelectedItems);
        console.error('Failed deletions:', failedDeletions);
        toast.error(`${failedDeletions.length} items failed to delete. Please check your permissions.`);
      } else {
        toast.success(`${selectedItems.size} items deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      // Revert to original state on error
      setBillingItems(originalBillingItems);
      setSelectedItems(originalSelectedItems);
      toast.error('Failed to delete items: ' + (error.message || 'Unknown error'));
    }
  };

  const toggleItemSelection = (itemId) => {
    // Ensure itemId is a string
    const stringItemId = String(itemId);
    console.log('☑️ Toggling selection for itemId:', stringItemId, 'type:', typeof stringItemId);
    
    const newSelected = new Set(selectedItems);
    if (newSelected.has(stringItemId)) {
      newSelected.delete(stringItemId);
    } else {
      newSelected.add(stringItemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === billingItems.length) {
      setSelectedItems(new Set());
    } else {
      // Ensure all IDs are strings
      const stringIds = billingItems.map(item => String(item.id));
      setSelectedItems(new Set(stringIds));
    }
  };

  const calculateTotals = () => {
    const totals = {
      inProgress: 0,
      submitted: 0,
      paid: 0,
      total: 0
    };

    billingItems.forEach(item => {
      const itemTotal = item.totalPrice || 0;
      totals.total += itemTotal;
      switch (item.status) {
        case 'in-progress':
          totals.inProgress += itemTotal;
          break;
        case 'submitted':
          totals.submitted += itemTotal;
          break;
        case 'paid':
          totals.paid += itemTotal;
          break;
      }
    });

    return totals;
  };

  const handlePasteData = (event) => {
    event.preventDefault();
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedData = clipboardData.getData('text');
    
    if (pastedData) {
      const rows = pastedData.split('\n').filter(row => row.trim());
      const newRowsArray = rows.map((row, index) => {
        const columns = row.split('\t');
        return {
          id: `temp-${Date.now()}-${index}`,
          name: columns[0] || '',
          description: columns[1] || '',
          quantity: parseInt(columns[2]) || 1,
          unitPrice: parseFloat(columns[3]) || 0,
          status: 'in-progress',
          totalPrice: (parseInt(columns[2]) || 1) * (parseFloat(columns[3]) || 0),
          isNew: true
        };
      });
      
      setNewRows([...newRows, ...newRowsArray]);
      setIsAddingRow(true);
      toast.success(`Pasted ${newRowsArray.length} rows`);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header with bulk actions */}
      <div className="space-y-4">
        {/* Main header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">Billing Items</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleAddMultipleRows(1)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Row</span>
              </button>
              <button
                onClick={() => handleAddMultipleRows(5)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add 5 Rows</span>
              </button>
              <button
                onClick={() => setBulkMode(!bulkMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                  bulkMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Copy className="h-4 w-4" />
                <span>Bulk Mode</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-save</span>
            </label>
          </div>
        </div>

        {/* Bulk actions row - only show when items are selected */}
        {selectedItems.size > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size} items selected
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleBulkStatusUpdate('in-progress')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Mark In Progress</span>
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('submitted')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span>Mark Submitted</span>
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate('paid')}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark Paid</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => handleDeleteSelected()}
                className="btn-danger flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">₹{totals.inProgress.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Submitted</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">₹{totals.submitted.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Paid</span>
          </div>
          <p className="text-2xl font-bold text-green-900">₹{totals.paid.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{totals.total.toLocaleString()}</p>
        </div>
      </div>

      {/* Google Sheets-like Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" onPaste={handlePasteData}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={toggleAllSelection}
                    className="flex items-center space-x-2"
                  >
                    {selectedItems.size === billingItems.length ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* New Rows */}
              {newRows.map((row) => (
                <tr key={row.id} className="bg-blue-50">
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => {
                        const updatedRows = newRows.map(r => 
                          r.id === row.id ? { ...r, name: e.target.value } : r
                        );
                        setNewRows(updatedRows);
                      }}
                      className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                      placeholder="Item name"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => {
                        const updatedRows = newRows.map(r => 
                          r.id === row.id ? { ...r, description: e.target.value } : r
                        );
                        setNewRows(updatedRows);
                      }}
                      className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                      placeholder="Description"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 1;
                        const updatedRows = newRows.map(r => 
                          r.id === row.id ? { 
                            ...r, 
                            quantity,
                            totalPrice: quantity * r.unitPrice
                          } : r
                        );
                        setNewRows(updatedRows);
                      }}
                      className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                      min="1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value) || 0;
                        const updatedRows = newRows.map(r => 
                          r.id === row.id ? { 
                            ...r, 
                            unitPrice,
                            totalPrice: r.quantity * unitPrice
                          } : r
                        );
                        setNewRows(updatedRows);
                      }}
                      className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ₹{(row.totalPrice || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      onChange={(e) => {
                        const updatedRows = newRows.map(r => 
                          r.id === row.id ? { ...r, status: e.target.value } : r
                        );
                        setNewRows(updatedRows);
                      }}
                      className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                    >
                      <option value="in-progress">In Progress</option>
                      <option value="submitted">Submitted</option>
                      <option value="paid">Paid</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveNewRow(row)}
                        className="text-green-600 hover:text-green-800"
                        title="Save row"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setNewRows(prev => prev.filter(r => r.id !== row.id));
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Cancel"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Save All Button */}
              {newRows.length > 0 && (
                <tr className="bg-green-50">
                  <td colSpan="8" className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">
                        {newRows.length} new rows ready to save
                      </span>
                      <button
                        onClick={handleSaveAllNewRows}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save All ({newRows.length})</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing Rows */}
              {billingItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleItemSelection(String(item.id))}
                      className="flex items-center space-x-2"
                    >
                      {selectedItems.has(String(item.id)) ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.itemId === item.id && editingCell?.field === 'name' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleCellSave(item.id, 'name', editingValue)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCellSave(item.id, 'name', editingValue)}
                        className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(item.id, 'name', item.name)}
                        className="cursor-pointer hover:bg-blue-50 px-1 py-1 rounded text-sm"
                      >
                        {item.name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.itemId === item.id && editingCell?.field === 'description' ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleCellSave(item.id, 'description', editingValue)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCellSave(item.id, 'description', editingValue)}
                        className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(item.id, 'description', item.description)}
                        className="cursor-pointer hover:bg-blue-50 px-1 py-1 rounded text-sm"
                      >
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.itemId === item.id && editingCell?.field === 'quantity' ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleCellSave(item.id, 'quantity', editingValue)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCellSave(item.id, 'quantity', editingValue)}
                        className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                        min="1"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(item.id, 'quantity', item.quantity || 1)}
                        className="cursor-pointer hover:bg-blue-50 px-1 py-1 rounded text-sm"
                      >
                        {item.quantity || 1}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCell?.itemId === item.id && editingCell?.field === 'unitPrice' ? (
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleCellSave(item.id, 'unitPrice', editingValue)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCellSave(item.id, 'unitPrice', editingValue)}
                        className="w-full border-0 bg-transparent focus:ring-0 text-sm"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    ) : (
                      <div
                        onClick={() => handleCellEdit(item.id, 'unitPrice', item.unitPrice || 0)}
                        className="cursor-pointer hover:bg-blue-50 px-1 py-1 rounded text-sm"
                      >
                        ₹{(item.unitPrice || 0).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    ₹{(item.totalPrice || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <select
                        value={item.status}
                        onChange={(e) => handleCellSave(item.id, 'status', e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}
                      >
                        <option value="in-progress">In Progress</option>
                        <option value="submitted">Submitted</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        console.log('🔘 Delete button clicked for item:', item);
                        console.log('🔍 item.id:', item.id, 'type:', typeof item.id);
                        console.log('🔍 item:', item);
                        // Ensure item.id is converted to string
                        const itemId = String(item.id);
                        console.log('🔧 Converted itemId:', itemId, 'type:', typeof itemId);
                        handleDeleteSelected(itemId);
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Google Sheets-like Features:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Auto-save:</strong> Changes save automatically when enabled</li>
          <li>• <strong>Bulk add:</strong> Add multiple rows at once</li>
          <li>• <strong>Paste data:</strong> Copy from Excel/Sheets and paste directly</li>
          <li>• <strong>Inline editing:</strong> Click any cell to edit</li>
          <li>• <strong>Bulk actions:</strong> Select multiple rows for batch operations</li>
          <li>• <strong>Save All:</strong> Save all new rows at once</li>
        </ul>
      </div>
    </div>
  );
};

export default BillingExcelInterface; 