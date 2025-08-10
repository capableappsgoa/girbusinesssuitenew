import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';

import { testConnection } from '../../lib/supabase';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  User,
  Briefcase,
  Calendar,
  DollarSign,
  FolderOpen,
  Eye,
  Wifi,
  X,
  CheckCircle,
  Clock,
  ExternalLink,
  Upload,
  Image,
  Link
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Companies = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { companies, loadCompanies, addCompany, updateCompany, deleteCompany, getProjectsByCompany, getProjectBillingTotal, getProjectSpentTotal, getCompanyRevenue, getCompanyCompletedRevenue } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [logoInputType, setLogoInputType] = useState('url'); // 'url' or 'upload'
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    website: '',
    industry: '',
    notes: '',
    logo_url: '',
    logo_alt_text: ''
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadCompanies();
    }
  }, [user, loadCompanies]);

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setFormData({...formData, logo_url: url});
    
    // Create preview from URL
    if (url) {
      setLogoPreview(url);
    } else {
      setLogoPreview('');
    }
  };

  const uploadLogoToStorage = async (file) => {
    try {
      // For now, we'll use a simple approach - in production you'd upload to cloud storage
      // This is a placeholder for actual file upload implementation
      const fileName = `company-logos/${Date.now()}-${file.name}`;
      
      // In a real implementation, you'd upload to Supabase Storage or another service
      // For now, we'll return a placeholder URL
      return `https://via.placeholder.com/150x150/667eea/ffffff?text=${encodeURIComponent('LOGO')}`;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw new Error('Failed to upload logo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let finalLogoUrl = formData.logo_url;
      let finalLogoAltText = formData.logo_alt_text || formData.name;

      // Handle file upload if logo file is selected
      if (logoInputType === 'upload' && logoFile) {
        finalLogoUrl = await uploadLogoToStorage(logoFile);
      }

      const companyData = {
        ...formData,
        logo_url: finalLogoUrl,
        logo_alt_text: finalLogoAltText
      };

      if (selectedCompany) {
        await updateCompany(selectedCompany.id, companyData);
        toast.success('Company updated successfully');
      } else {
        await addCompany(companyData);
        toast.success('Company created successfully');
      }
      
      setIsModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedCompany(null);
      resetForm();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      contact_person: company.contact_person || '',
      website: company.website || '',
      industry: company.industry || '',
      notes: company.notes || '',
      logo_url: company.logoUrl || '',
      logo_alt_text: company.logoAltText || ''
    });
    
    // Set logo preview
    if (company.logoUrl) {
      setLogoPreview(company.logoUrl);
      setLogoInputType('url');
    } else {
      setLogoPreview('');
    }
    
    setIsEditModalOpen(true);
  };

  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await deleteCompany(companyId);
        toast.success('Company deleted successfully');
      } catch (error) {
        console.error('Error deleting company:', error);
        toast.error('Failed to delete company. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      contact_person: '',
      website: '',
      industry: '',
      notes: '',
      logo_url: '',
      logo_alt_text: ''
    });
    setLogoFile(null);
    setLogoPreview('');
    setLogoInputType('url');
  };

  const openAddModal = () => {
    setSelectedCompany(null);
    resetForm();
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setIsProjectsModalOpen(false);
    setSelectedCompany(null);
    resetForm();
  };

  const handleViewProjects = (company) => {
    setSelectedCompany(company);
    setIsProjectsModalOpen(true);
  };

  const handleTestConnection = async () => {
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection test failed. Please check your internet connection.');
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Connection test failed: ' + error.message);
    }
  };

  const handleViewProjectInvoice = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && company.is_active) ||
                         (filterStatus === 'inactive' && !company.is_active);
    
    return matchesSearch && matchesFilter;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">Only administrators can manage companies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your client companies and organizations</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* User Switcher for Admins and Managers */}
  
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleTestConnection}
              className="btn-secondary flex items-center space-x-2"
              title="Test database connection"
            >
              <Wifi className="h-4 w-4" />
              <span>Test Connection</span>
            </button>
            <button
              onClick={openAddModal}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Company</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-full sm:w-48"
        >
          <option value="all">All Companies</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {company.logoUrl ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white">
                    <img 
                      src={company.logoUrl} 
                      alt={company.logoAltText || company.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center" style={{display: 'none'}}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.industry || 'No industry specified'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(company)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit company"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete company"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {company.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{company.email}</span>
                </div>
              )}
              {company.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{company.phone}</span>
                </div>
              )}
              {company.contact_person && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{company.contact_person}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {company.website}
                  </a>
                </div>
              )}
              {company.address && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                  <span className="line-clamp-2">{company.address}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FolderOpen className="h-4 w-4 mr-1" />
                  <span>{getProjectsByCompany(company.id).length} projects</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>₹{getCompanyRevenue(company.id).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewProjects(company)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  title="View projects"
                >
                  Projects
                </button>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  company.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {company.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first company.'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={openAddModal}
              className="btn-primary"
            >
              Add Company
            </button>
          )}
        </div>
      )}

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Add New Company</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="input-field w-full"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="logo-url"
                    name="logo-input-type"
                    value="url"
                    checked={logoInputType === 'url'}
                    onChange={() => setLogoInputType('url')}
                    className="mr-2"
                  />
                  <label htmlFor="logo-url">URL</label>
                  <input
                    type="radio"
                    id="logo-upload"
                    name="logo-input-type"
                    value="upload"
                    checked={logoInputType === 'upload'}
                    onChange={() => setLogoInputType('upload')}
                    className="mr-2"
                  />
                  <label htmlFor="logo-upload">Upload</label>
                </div>
                {logoInputType === 'url' && (
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={handleLogoUrlChange}
                    className="input-field w-full mt-2"
                    placeholder="https://example.com/logo.png"
                  />
                )}
                {logoInputType === 'upload' && (
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="input-field w-full"
                    />
                    {logoFile && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Image className="h-4 w-4 mr-2" />
                        <span>Selected file: {logoFile.name}</span>
                      </div>
                    )}
                    {logoPreview && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Preview:</span>
                        <img src={logoPreview} alt="Company Logo Preview" className="ml-2 h-10 w-10 object-contain rounded-md" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {isEditModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Company</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field w-full"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="input-field w-full"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input-field w-full"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="logo-url-edit"
                    name="logo-input-type-edit"
                    value="url"
                    checked={logoInputType === 'url'}
                    onChange={() => setLogoInputType('url')}
                    className="mr-2"
                  />
                  <label htmlFor="logo-url-edit">URL</label>
                  <input
                    type="radio"
                    id="logo-upload-edit"
                    name="logo-input-type-edit"
                    value="upload"
                    checked={logoInputType === 'upload'}
                    onChange={() => setLogoInputType('upload')}
                    className="mr-2"
                  />
                  <label htmlFor="logo-upload-edit">Upload</label>
                </div>
                {logoInputType === 'url' && (
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={handleLogoUrlChange}
                    className="input-field w-full mt-2"
                    placeholder="https://example.com/logo.png"
                  />
                )}
                {logoInputType === 'upload' && (
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="input-field w-full"
                    />
                    {logoFile && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Image className="h-4 w-4 mr-2" />
                        <span>Selected file: {logoFile.name}</span>
                      </div>
                    )}
                    {logoPreview && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Preview:</span>
                        <img src={logoPreview} alt="Company Logo Preview" className="ml-2 h-10 w-10 object-contain rounded-md" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Update Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {isProjectsModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCompany.name} - Projects</h2>
                  <p className="text-sm text-gray-600">View all projects and billing for this company</p>
                </div>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Company Revenue Statistics */}
              {(() => {
                const totalRevenue = getCompanyRevenue(selectedCompany.id);
                const completedRevenue = getCompanyCompletedRevenue(selectedCompany.id);
                const pendingRevenue = totalRevenue - completedRevenue;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                          <p className="text-xl font-bold text-blue-700">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <DollarSign size={20} className="text-blue-400" />
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 font-medium">Completed Revenue</p>
                          <p className="text-xl font-bold text-green-700">₹{completedRevenue.toLocaleString()}</p>
                        </div>
                        <CheckCircle size={20} className="text-green-400" />
                      </div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 font-medium">Pending Revenue</p>
                          <p className="text-xl font-bold text-orange-700">₹{pendingRevenue.toLocaleString()}</p>
                        </div>
                        <Clock size={20} className="text-orange-400" />
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 font-medium">Total Projects</p>
                          <p className="text-xl font-bold text-purple-700">{getProjectsByCompany(selectedCompany.id).length}</p>
                        </div>
                        <FolderOpen size={20} className="text-purple-400" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Projects List */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Projects</h3>
                {(() => {
                  const companyProjects = getProjectsByCompany(selectedCompany.id);
                  
                  if (companyProjects.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-500">This company doesn't have any projects yet.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {companyProjects.map((project) => {
                        const projectTotal = getProjectBillingTotal(project.id);
                        const projectCompleted = getProjectSpentTotal(project.id);
                        const projectPending = projectTotal - projectCompleted;

                        return (
                          <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                  {project.paid && (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 flex items-center space-x-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Paid</span>
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{project.description}</p>
                              </div>
                              <button
                                onClick={() => handleViewProjectInvoice(project.id)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <ExternalLink className="h-4 w-4" />
                                <span>View Invoice</span>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Billing:</span>
                                <span className="font-semibold text-gray-900">₹{projectTotal.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Completed:</span>
                                <span className="font-semibold text-green-600">₹{projectCompleted.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Pending:</span>
                                <span className="font-semibold text-orange-600">₹{projectPending.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies; 