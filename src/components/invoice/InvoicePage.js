import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useProjectStore } from '../../stores/projectStore';

import html2canvas from 'html2canvas';
import './InvoicePage.css';

const InvoicePage = () => {
  const { user } = useAuthStore();
  const { selectedProject, projects, loadProjects, invoiceDiscountPercentage, setInvoiceDiscountPercentage, updateProjectDiscount } = useProjectStore();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(selectedProject?.id || '');
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [discountPercentage, setDiscountPercentage] = useState(selectedProject?.discountPercentage || invoiceDiscountPercentage || 0);
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Load projects if not already loaded
    if (projects.length === 0) {
      loadProjects();
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadInvoiceData();
    } else {
      setLoading(false);
    }
  }, [selectedProjectId, projects, discountPercentage]);

  useEffect(() => {
    if (selectedProject?.id) {
      setSelectedProjectId(selectedProject.id);
    }
  }, [selectedProject]);

  // Synchronize discount percentage with store and project
  useEffect(() => {
    const projectDiscount = selectedProject?.discountPercentage || 0;
    const storeDiscount = invoiceDiscountPercentage || 0;
    const currentDiscount = Math.max(projectDiscount, storeDiscount);
    
    if (currentDiscount !== discountPercentage) {
      setDiscountPercentage(currentDiscount);
    }
  }, [invoiceDiscountPercentage, selectedProject?.discountPercentage, discountPercentage]);

    const formatDate = (date) => {
    try {
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Date formatting error:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      
      // Get project data from the store (which has transformed camelCase data)
      const project = projects.find(p => p.id === selectedProjectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Calculate totals using camelCase field names
      const billingItems = project.billingItems || [];
      const subtotal = billingItems.reduce((sum, item) => {
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        return sum + (unitPrice * quantity);
      }, 0);
      const discountAmount = (subtotal * discountPercentage) / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const advanceAmount = project.advanceAmount || 0;
      const total = subtotalAfterDiscount - advanceAmount;

      // Generate dates safely
      const now = new Date();
      const dueDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

      setInvoiceData({
        project: project,
        billingItems,
        subtotal,
        discountAmount,
        discountPercentage,
        advanceAmount,
        total,
        invoiceNumber: `INV-${Date.now()}`,
        invoiceDate: formatDate(now),
        dueDate: formatDate(dueDate)
      });
    } catch (error) {
      console.error('Error loading invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

    const printInvoice = () => {
    // Ensure only the invoice area is printed
    const printWindow = window.open('', '_blank');
    const invoiceElement = document.querySelector('.a4-container');
    
    if (printWindow && invoiceElement) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .a4-container {
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 20mm;
              box-sizing: border-box;
              background: white;
            }
                         * {
               box-shadow: none !important;
               text-shadow: none !important;
             }
            
                         /* Tailwind-like utility classes for print */
             .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
             .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
             .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
             .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
             .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
             .text-xs { font-size: 0.75rem; line-height: 1rem; }
             
             .font-bold { font-weight: 700; }
             .font-semibold { font-weight: 600; }
             .font-medium { font-weight: 500; }
             
             .text-gray-900 { color: #111827 !important; }
             .text-gray-700 { color: #374151 !important; }
             .text-gray-600 { color: #4B5563 !important; }
             .text-gray-500 { color: #6B7280 !important; }
             
             /* GIR Theme Colors */
             .bg-yellow-500 { background-color: #EAB308 !important; }
             .border-yellow-500 { border-color: #EAB308 !important; }
             .border-yellow-400 { border-color: #FACC15 !important; }
             .border-yellow-300 { border-color: #FDE047 !important; }
             
             /* GIR Theme Styles for Print */
             .gir-header {
               background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%) !important;
               color: #FFD700 !important;
               padding: 2rem !important;
               border-radius: 8px 8px 0 0 !important;
             }
             
             .gir-logo {
               width: 60px !important;
               height: 60px !important;
               object-fit: contain !important;
             }
             
             .gir-accent {
               background: #FFD700 !important;
               color: #000000 !important;
               padding: 0.5rem 1rem !important;
               border-radius: 4px !important;
               font-weight: bold !important;
             }
             
             .gir-table-header {
               background: #000000 !important;
               color: #FFD700 !important;
             }
             
             .gir-table-row:nth-child(even) {
               background: #f8f8f8 !important;
             }
             
             .gir-total-section {
               background: #000000 !important;
               color: #FFD700 !important;
               padding: 1rem !important;
               border-radius: 4px !important;
             }
             
             .gir-footer {
               background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%) !important;
               color: #000000 !important;
               padding: 1rem !important;
               border-radius: 0 0 8px 8px !important;
             }
             
             /* Override print colors for GIR theme */
             .gir-header * { color: #FFD700 !important; }
             .gir-accent * { color: #000000 !important; }
             .gir-table-header * { color: #FFD700 !important; }
             .gir-total-section * { color: #FFD700 !important; }
             .gir-footer * { color: #000000 !important; }
             
            .mb-8 { margin-bottom: 2rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            
            .mt-4 { margin-top: 1rem; }
            .mt-auto { margin-top: auto; }
            
            .pt-8 { padding-top: 2rem; }
            .pt-4 { padding-top: 1rem; }
            
            .pb-4 { padding-bottom: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-1 { flex: 1 1 0%; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            
                         .w-full { width: 100%; }
             .w-80 { width: 20rem; }
             .w-64 { width: 16rem; }
             
             .text-left { text-align: left; }
             .text-right { text-align: right; }
             .text-center { text-align: center; }
             
             .border-b { border-bottom-width: 1px; }
             .border-b-2 { border-bottom-width: 2px; }
             .border-t { border-top-width: 1px; }
             .border-t-2 { border-top-width: 2px; }
             .border-l-4 { border-left-width: 4px; }
             .border-gray-200 { border-color: #E5E7EB; }
             .border-gray-300 { border-color: #D1D5DB; }
             
             .rounded-lg { border-radius: 0.5rem; }
             .rounded-full { border-radius: 9999px; }
             
             .bg-gray-50 { background-color: #F9FAFB; }
             
             .grid { display: grid; }
             .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
             .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
             .gap-6 { gap: 1.5rem; }
             
             .overflow-hidden { overflow: hidden; }
            
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f8f9fa !important;
              font-weight: bold;
            }
            
            /* Ensure proper spacing */
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
          </style>
        </head>
        <body>
          ${invoiceElement.outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      // Fallback to regular print
      window.print();
    }
  };

  const captureInvoiceAsImage = async (format = 'png', preview = false) => {
    if (!invoiceRef.current) {
      console.error('Invoice ref not found');
      return;
    }
    
    try {
      setCapturing(true);
      
      // Wait for any images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the actual content dimensions
      const rect = invoiceRef.current.getBoundingClientRect();
      const scrollHeight = invoiceRef.current.scrollHeight;
      const scrollWidth = invoiceRef.current.scrollWidth;
      
      console.log('InvoicePage capture dimensions:', {
        rect,
        scrollHeight,
        scrollWidth,
        offsetHeight: invoiceRef.current.offsetHeight,
        clientHeight: invoiceRef.current.clientHeight,
        element: invoiceRef.current,
        elementClasses: invoiceRef.current.className
      });
      
      // Ensure the element is visible and has content
      if (scrollHeight === 0 || scrollWidth === 0) {
        console.error('Element has no content dimensions');
        alert('Invoice content not found. Please try again.');
        return;
      }
      
             // Add a delay to ensure all styles are loaded
       await new Promise(resolve => setTimeout(resolve, 1000));
       
       // Debug: Log the element we're trying to capture
       console.log('Element to capture:', invoiceRef.current);
       console.log('Element HTML:', invoiceRef.current.outerHTML);
       console.log('Element dimensions:', {
         offsetWidth: invoiceRef.current.offsetWidth,
         offsetHeight: invoiceRef.current.offsetHeight,
         scrollWidth: invoiceRef.current.scrollWidth,
         scrollHeight: invoiceRef.current.scrollHeight,
         clientWidth: invoiceRef.current.clientWidth,
         clientHeight: invoiceRef.current.clientHeight
       });
       
               // Try a simpler capture approach
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 2, // Higher quality for better text rendering
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          ignoreElements: (element) => {
            return element.classList.contains('print-hidden');
          },
                    onclone: (clonedDoc) => {
            console.log('Starting onclone process...');
            
            // The cloned element IS the data-invoice-content element
            const clonedElement = clonedDoc.querySelector('.a4-container');
            if (clonedElement) {
              console.log('Found cloned element:', clonedElement);
              
              // Set basic styles to ensure visibility
              clonedElement.style.backgroundColor = '#ffffff';
              clonedElement.style.display = 'block';
              clonedElement.style.visibility = 'visible';
              
              // CRITICAL: Force table layout to be preserved
              const tables = clonedElement.querySelectorAll('table');
              tables.forEach(table => {
                table.style.display = 'table';
                table.style.borderCollapse = 'collapse';
                table.style.width = '100%';
                table.style.tableLayout = 'fixed';
                table.style.border = '1px solid #e5e7eb';
              });
              
              // CRITICAL: Force table rows to be horizontal
              const tableRows = clonedElement.querySelectorAll('tr');
              tableRows.forEach((row, index) => {
                row.style.display = 'table-row';
                row.style.width = '100%';
                
                if (index > 0) { // Skip header row
                  row.style.background = index % 2 === 0 ? '#ffffff' : '#f8f8f8';
                }
              });
              
              // CRITICAL: Force table cells to be horizontal
              const tableCells = clonedElement.querySelectorAll('td, th');
              tableCells.forEach(cell => {
                cell.style.display = 'table-cell';
                cell.style.padding = '0.75rem 1rem';
                cell.style.border = '1px solid #e5e7eb';
                cell.style.textAlign = cell.classList.contains('text-right') ? 'right' : 'left';
                cell.style.verticalAlign = 'top';
                cell.style.width = cell.classList.contains('text-left') ? '40%' : '20%';
              });
              
              // Apply GIR theme styles
              const girHeaders = clonedElement.querySelectorAll('.gir-header');
              girHeaders.forEach(header => {
                header.style.background = 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)';
                header.style.color = '#FFD700';
                header.style.padding = '2rem';
                header.style.borderRadius = '8px 8px 0 0';
              });
              
              const girLogos = clonedElement.querySelectorAll('.gir-logo');
              girLogos.forEach(logo => {
                logo.style.width = '60px';
                logo.style.height = '60px';
                logo.style.objectFit = 'contain';
                logo.style.marginRight = '1rem';
              });
              
              const girAccents = clonedElement.querySelectorAll('.gir-accent');
              girAccents.forEach(accent => {
                accent.style.background = '#FFD700';
                accent.style.color = '#000000';
                accent.style.padding = '0.5rem 1rem';
                accent.style.borderRadius = '4px';
                accent.style.fontWeight = 'bold';
              });
              
              const girTableHeaders = clonedElement.querySelectorAll('.gir-table-header');
              girTableHeaders.forEach(header => {
                header.style.background = '#000000';
                header.style.color = '#FFD700';
              });
              
              const girTotalSections = clonedElement.querySelectorAll('.gir-total-section');
              girTotalSections.forEach(section => {
                section.style.background = '#000000';
                section.style.color = '#FFD700';
                section.style.padding = '1rem';
                section.style.borderRadius = '4px';
              });
              
              const girFooters = clonedElement.querySelectorAll('.gir-footer');
              girFooters.forEach(footer => {
                footer.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
                footer.style.color = '#000000';
                footer.style.padding = '1rem';
                footer.style.borderRadius = '0 0 8px 8px';
              });
              
              // Fix footer grid layout
              const footerGrids = clonedElement.querySelectorAll('.gir-footer .grid');
              footerGrids.forEach(grid => {
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                grid.style.gap = '1.5rem';
              });
              
              console.log('All styles applied to cloned element');
            } else {
              console.error('Cloned element not found');
            }
          }
        });
      
             if (preview) {
         // Show preview
         const dataUrl = canvas.toDataURL(`image/${format}`, format === 'png' ? 1.0 : 0.9);
         setCapturedImage(dataUrl);
         setShowPreview(true);
       } else {
         // Download directly and store
         canvas.toBlob((blob) => {
           if (blob) {
             // Create download link
             const url = URL.createObjectURL(blob);
             const link = document.createElement('a');
             link.href = url;
             link.download = `GIR-Invoice-${invoiceData.invoiceNumber}.${format}`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             URL.revokeObjectURL(url);
             
             // Store the captured image
             const imageData = {
               id: Date.now(),
               dataUrl: canvas.toDataURL(`image/${format}`, format === 'png' ? 1.0 : 0.9),
               filename: `GIR-Invoice-${invoiceData.invoiceNumber}.${format}`,
               format: format,
               timestamp: new Date().toISOString()
             };
             setCapturedImages(prev => [...prev, imageData]);
           }
         }, `image/${format}`, format === 'png' ? 1.0 : 0.9);
       }
      
    } catch (error) {
      console.error('Error capturing invoice:', error);
      alert('Failed to capture invoice. Please try again.');
    } finally {
      setCapturing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Invoice</h2>
            
            <div className="mb-6">
              <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                id="project-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.company?.name || 'No Company'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Select a project from the dropdown above to generate an invoice.</p>
              <p className="mt-2">The invoice will include all billing items associated with the selected project.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Invoice Data...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-4 print-hidden">
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <select
              id="project-select-invoice"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.company?.name || 'No Company'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">

            
            <div className="flex space-x-2">
              <button
                onClick={() => captureInvoiceAsImage('png')}
                disabled={capturing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {capturing ? 'Capturing...' : 'Save PNG'}
              </button>
              <button
                onClick={() => captureInvoiceAsImage('jpeg')}
                disabled={capturing}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {capturing ? 'Capturing...' : 'Save JPEG'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Captured Images Section */}
       {capturedImages.length > 0 && (
         <div className="max-w-4xl mx-auto mb-4 print-hidden">
           <div className="bg-white rounded-lg border p-4">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Captured Images</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {capturedImages.map((image) => (
                 <div key={image.id} className="border rounded-lg p-3 bg-gray-50">
                   <div className="flex items-center justify-between mb-2">
                     <span className="text-sm font-medium text-gray-700">{image.filename}</span>
                     <span className="text-xs text-gray-500">{image.format.toUpperCase()}</span>
                   </div>
                   <img 
                     src={image.dataUrl} 
                     alt={image.filename}
                     className="w-full h-32 object-cover rounded border mb-2"
                   />
                   <div className="flex space-x-2">
                     <button
                       onClick={() => {
                         const link = document.createElement('a');
                         link.href = image.dataUrl;
                         link.download = image.filename;
                         link.click();
                       }}
                       className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                     >
                       Download
                     </button>
                     <button
                       onClick={() => {
                         setCapturedImages(prev => prev.filter(img => img.id !== image.id));
                       }}
                       className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                     >
                       Remove
                     </button>
                   </div>
                   <div className="text-xs text-gray-500 mt-1">
                     {new Date(image.timestamp).toLocaleString()}
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}

                                                                                   {/* A4 Invoice Container */}
          <div className="a4-container" ref={invoiceRef} data-invoice-content>
           <div className="p-8 print:p-0">
                       {/* GIR Header */}
            <div className="gir-header mb-8" style={{
              background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
              color: '#FFD700',
              padding: '2rem',
              borderRadius: '8px 8px 0 0'
            }}>
              <div className="flex justify-between items-start">
                                 <div className="flex items-center space-x-6">
                   <img 
                     src="https://i.ibb.co/0RLKgHD6/GIR-2.png" 
                     alt="GIR Logo" 
                     className="gir-logo"
                     style={{ width: '60px', height: '60px', objectFit: 'contain', marginRight: '1rem' }}
                   />
                   <div style={{ marginLeft: '1rem' }}>
                     <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>GET IT RENDERED</h1>
                     <p className="text-lg opacity-90" style={{ color: '#FFD700' }}>Professional Project Management</p>
                   </div>
                 </div>
                <div className="text-right">
                  <div className="gir-accent mb-2" style={{
                    background: '#FFD700',
                    color: '#000000',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontWeight: 'bold'
                  }}>
                    INVOICE
                  </div>
                  <div className="text-sm opacity-90" style={{ color: '#FFD700' }}>
                    <p><strong>Invoice #:</strong> {invoiceData.invoiceNumber}</p>
                    <p><strong>Date:</strong> {invoiceData.invoiceDate}</p>
                    <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>

                     {/* Bill To Section */}
           <div className="mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
               <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
               Bill To:
             </h3>
             <div className="text-sm text-gray-700">
               <p className="font-semibold text-lg mb-2">{invoiceData.project.name}</p>
               <p className="mb-1">{invoiceData.project.description || 'Project Description'}</p>
               <p className="text-xs text-gray-500">Project ID: {invoiceData.project.id}</p>
             </div>
           </div>

                     {/* Billing Items Table */}
           <div className="mb-8">
             <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
               <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
               Services & Items
             </h3>
             <div className="overflow-hidden rounded-lg border border-gray-200">
                               <table className="w-full border-collapse" style={{ 
                  tableLayout: 'fixed',
                  borderCollapse: 'collapse',
                  width: '100%',
                  border: '1px solid #e5e7eb'
                }}>
                                    <thead>
                     <tr className="gir-table-header" style={{
                       background: '#000000',
                       color: '#FFD700'
                     }}>
                                                                       <th className="text-left py-4 px-6 font-semibold" style={{ color: '#FFD700', background: '#000000', width: '40%', border: '1px solid #e5e7eb' }}>Description</th>
                         <th className="text-right py-4 px-6 font-semibold" style={{ color: '#FFD700', background: '#000000', width: '20%', border: '1px solid #e5e7eb' }}>Quantity</th>
                         <th className="text-right py-4 px-6 font-semibold" style={{ color: '#FFD700', background: '#000000', width: '20%', border: '1px solid #e5e7eb' }}>Unit Price</th>
                         <th className="text-right py-4 px-6 font-semibold" style={{ color: '#FFD700', background: '#000000', width: '20%', border: '1px solid #e5e7eb' }}>Amount</th>
                     </tr>
                   </thead>
                 <tbody>
                   {invoiceData.billingItems.map((item, index) => {
                     const unitPrice = parseFloat(item.unitPrice) || 0;
                     const quantity = parseFloat(item.quantity) || 0;
                     const amount = unitPrice * quantity;
                     
                     return (
                                               <tr key={item.id || index} className="gir-table-row border-b border-gray-200" style={{ 
                          background: index % 2 === 0 ? '#ffffff' : '#f8f8f8',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                                                                                <td className="py-4 px-6 text-sm text-gray-700" style={{ width: '40%', border: '1px solid #e5e7eb' }}>{item.name || 'Unnamed Item'}</td>
                            <td className="py-4 px-6 text-sm text-gray-700 text-right" style={{ width: '20%', border: '1px solid #e5e7eb' }}>{quantity}</td>
                            <td className="py-4 px-6 text-sm text-gray-700 text-right" style={{ width: '20%', border: '1px solid #e5e7eb' }}>${unitPrice.toFixed(2)}</td>
                            <td className="py-4 px-6 text-sm text-gray-700 text-right font-semibold" style={{ width: '20%', border: '1px solid #e5e7eb' }}>${amount.toFixed(2)}</td>
                        </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           </div>

                     {/* Totals */}
           <div className="flex justify-end mb-8">
                           <div className="w-80">
                <div className="gir-total-section rounded-lg" style={{
                  background: '#000000',
                  color: '#FFD700',
                  padding: '1rem',
                  borderRadius: '4px'
                }}>
                                    <div className="flex justify-between py-3 border-b border-yellow-400">
                     <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Subtotal:</span>
                     <span className="text-sm font-medium" style={{ color: '#FFD700' }}>${invoiceData.subtotal.toFixed(2)}</span>
                   </div>
                   {invoiceData.discountPercentage > 0 && (
                     <div className="flex justify-between py-3 border-b border-yellow-400">
                       <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Discount ({invoiceData.discountPercentage}%):</span>
                       <span className="text-sm font-medium" style={{ color: '#FFD700' }}>-${invoiceData.discountAmount.toFixed(2)}</span>
                     </div>
                   )}
                   {invoiceData.advanceAmount > 0 && (
                     <div className="flex justify-between py-3 border-b border-yellow-400">
                       <span className="text-sm font-medium" style={{ color: '#FFD700' }}>Advance Payment:</span>
                       <span className="text-sm font-medium" style={{ color: '#FFD700' }}>-${invoiceData.advanceAmount.toFixed(2)}</span>
                     </div>
                   )}
                   <div className="flex justify-between py-4">
                     <span className="text-xl font-bold" style={{ color: '#FFD700' }}>Total Due:</span>
                     <span className="text-xl font-bold" style={{ color: '#FFD700' }}>${invoiceData.total.toFixed(2)}</span>
                   </div>
                </div>
              </div>
           </div>

                                 {/* Footer */}
            <div className="gir-footer" style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#000000',
              padding: '1rem',
              borderRadius: '0 0 8px 8px'
            }}>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                <div>
                  <h4 className="font-bold mb-2" style={{ color: '#000000' }}>Payment Information</h4>
                  <div className="text-sm" style={{ color: '#000000' }}>
                    <p><strong>Payment Terms:</strong> Net 30 days</p>
                    <p><strong>Payment Method:</strong> Bank Transfer / Check</p>
                    <p><strong>Due Date:</strong> {invoiceData.dueDate}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-2" style={{ color: '#000000' }}>Contact Information</h4>
                  <div className="text-sm" style={{ color: '#000000' }}>
                    <p><strong>GET IT RENDERED</strong></p>
                    <p>Professional Project Management</p>
                    <p>Email: info@gir.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-yellow-300">
                <p className="text-sm text-center" style={{ color: '#000000' }}>
                  <strong>Thank you for choosing GET IT RENDERED!</strong><br/>
                  Please include the invoice number ({invoiceData.invoiceNumber}) with your payment.
                </p>
              </div>
            </div>
                 </div>
       </div>
       
       {/* Image Preview Modal */}
       {showPreview && capturedImage && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
             <div className="flex justify-between items-center p-4 border-b">
               <h3 className="text-lg font-semibold">Invoice Preview</h3>
               <div className="flex space-x-2">
                 <button
                   onClick={() => {
                     const link = document.createElement('a');
                     link.href = capturedImage;
                     link.download = `GIR-Invoice-${invoiceData.invoiceNumber}.png`;
                     link.click();
                   }}
                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                 >
                   Download PNG
                 </button>
                 <button
                   onClick={() => setShowPreview(false)}
                   className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                 >
                   Close
                 </button>
               </div>
             </div>
             <div className="p-4">
               <img 
                 src={capturedImage} 
                 alt="Invoice Preview" 
                 className="w-full h-auto border rounded-lg"
               />
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default InvoicePage; 