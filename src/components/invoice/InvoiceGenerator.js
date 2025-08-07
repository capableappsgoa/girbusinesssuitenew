import React, { useRef } from 'react';
import { FileText, DollarSign, Calendar, User, MapPin, Phone, Mail, Globe, Briefcase } from 'lucide-react';
import Logo from './Logo';

const InvoiceGenerator = ({ project, discount = 0 }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const invoiceRef = useRef(null);

  const captureFullScreenshot = async () => {
    if (!invoiceRef.current) return;

    setIsGenerating(true);
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Temporarily modify the element for capture
      const originalOverflow = invoiceRef.current.style.overflow;
      const originalHeight = invoiceRef.current.style.height;
      const originalMaxHeight = invoiceRef.current.style.maxHeight;
      const originalScrollTop = invoiceRef.current.scrollTop;
      
      // Set proper dimensions for capture
      invoiceRef.current.style.overflow = 'scroll';
      invoiceRef.current.style.height = 'auto';
      invoiceRef.current.style.maxHeight = 'none';
      invoiceRef.current.scrollTop = 0; // Ensure we start from the top
      
      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the actual content dimensions
      const rect = invoiceRef.current.getBoundingClientRect();
      const scrollHeight = invoiceRef.current.scrollHeight;
      const scrollWidth = invoiceRef.current.scrollWidth;
      
      console.log('Capture dimensions:', {
        rect,
        scrollHeight,
        scrollWidth,
        offsetHeight: invoiceRef.current.offsetHeight,
        clientHeight: invoiceRef.current.clientHeight
      });
      
      // Configure html2canvas for full capture
      const canvas = await html2canvas(invoiceRef.current, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // Higher resolution
        width: scrollWidth,
        height: scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: scrollWidth,
        windowHeight: scrollHeight,
        foreignObjectRendering: true,
        removeContainer: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        onclone: (clonedDoc) => {
          // Ensure the cloned element has proper dimensions
          const clonedElement = clonedDoc.querySelector('[data-invoice-content]');
          if (clonedElement) {
            clonedElement.style.width = '100%';
            clonedElement.style.height = 'auto';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.position = 'relative';
            clonedElement.style.maxHeight = 'none';
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.display = 'block';
            clonedElement.style.transform = 'none';
          }
        }
      });

      // Restore original styles
      invoiceRef.current.style.overflow = originalOverflow;
      invoiceRef.current.style.height = originalHeight;
      invoiceRef.current.style.maxHeight = originalMaxHeight;
      invoiceRef.current.scrollTop = originalScrollTop;

      // Convert to image and download
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `invoice-${project?.name || 'project'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Screenshot generation failed:', error);
      alert('Failed to generate screenshot. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInvoice = () => {
    setIsGenerating(true);
    try {
      // Create a new window for the invoice print page
      const printWindow = window.open('', '_blank');
      const invoiceElement = invoiceRef.current;
      
      // Calculate the total height needed for all content
      const billingItemsCount = project?.billingItems?.length || 0;
      const baseHeight = 800; // Base height for header, footer, etc.
      const itemHeight = 80; // Height per billing item
      const totalHeight = baseHeight + (billingItemsCount * itemHeight);
      
      // Get the HTML content with full CSS and dynamic height
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${project?.name || 'Project'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0; 
                height: auto !important;
                min-height: 100vh !important;
              }
              .invoice-container { 
                max-width: 100%; 
                margin: 0; 
                padding: 20px;
                background: white;
                height: auto !important;
                min-height: 100vh !important;
              }
              .no-print { display: none !important; }
              .print-page {
                height: auto !important;
                min-height: 100vh !important;
                page-break-inside: avoid;
              }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #f5f5f5;
              height: auto;
              min-height: 100vh;
            }
            .print-page {
              min-height: 100vh;
              height: auto;
              padding: 20px;
              box-sizing: border-box;
            }
            .print-header {
              padding: 20px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .print-button {
              background: #f59e0b;
              color: black;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 16px;
              transition: background-color 0.2s;
            }
            .print-button:hover {
              background: #d97706;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              height: auto;
              min-height: 100vh;
              box-sizing: border-box;
            }
            
            /* Ensure all TailwindCSS classes work */
            .bg-white { background-color: white !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-900 { background-color: #111827 !important; }
            .bg-black { background-color: black !important; }
            .bg-yellow-500 { background-color: #eab308 !important; }
            .bg-yellow-400 { background-color: #facc15 !important; }
            .bg-yellow-600 { background-color: #ca8a04 !important; }
            .bg-yellow-50 { background-color: #fefce8 !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
            .bg-red-600 { background-color: #dc2626 !important; }
            
            .text-white { color: white !important; }
            .text-black { color: black !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-yellow-400 { color: #facc15 !important; }
            .text-yellow-600 { color: #ca8a04 !important; }
            .text-red-600 { color: #dc2626 !important; }
            
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-yellow-200 { border-color: #fef3c7 !important; }
            .border-yellow-400 { border-color: #facc15 !important; }
            
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
            
            .p-8 { padding: 2rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-3 { padding: 0.75rem !important; }
            .p-10 { padding: 2.5rem !important; }
            
            .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
            .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
            .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
            
            .mb-10 { margin-bottom: 2.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-1 { margin-bottom: 0.25rem !important; }
            
            .mt-12 { margin-top: 3rem !important; }
            .pt-8 { padding-top: 2rem !important; }
            .pt-4 { padding-top: 1rem !important; }
            .pt-2 { padding-top: 0.5rem !important; }
            
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
            
            .gap-12 { gap: 3rem !important; }
            .gap-8 { gap: 2rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-3 { gap: 0.75rem !important; }
            
            .col-span-2 { grid-column: span 2 / span 2 !important; }
            .col-span-4 { grid-column: span 4 / span 4 !important; }
            
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            
            .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            .border-2 { border-width: 2px !important; }
            .border-t-4 { border-top-width: 4px !important; }
            .border-t-2 { border-top-width: 2px !important; }
            
            
            
            .divide-y > * + * { border-top-width: 1px !important; border-top-color: #e5e7eb !important; }
            
            .w-96 { width: 24rem !important; }
            
            .leading-relaxed { line-height: 1.625 !important; }
            
            .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; }
            .duration-200 { transition-duration: 200ms !important; }
            
            .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
            .hover\\:bg-yellow-600:hover { background-color: #ca8a04 !important; }
            .hover\\:bg-blue-600:hover { background-color: #2563eb !important; }
            .hover\\:bg-gray-600:hover { background-color: #4b5563 !important; }
          </style>
        </head>
        <body>
          <div class="print-page">
              <button class="print-button no-print" onclick="window.print()">
                🖨️ Print PDF
              </button>
            <div class="invoice-container">
              ${invoiceElement.outerHTML}
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Focus the new window
      printWindow.focus();
      
    } catch (error) {
      console.error('Invoice generation failed:', error);
      alert('Invoice generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const invoiceElement = invoiceRef.current;
      
      // Create a new window for PDF generation
      const pdfWindow = window.open('', '_blank');
      
      // Calculate content height
      const billingItemsCount = project?.billingItems?.length || 0;
      const baseHeight = 1000; // Base height for header, footer, etc.
      const itemHeight = 100; // Height per billing item
      const totalHeight = baseHeight + (billingItemsCount * itemHeight);
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice PDF - ${project?.name || 'Project'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              height: auto;
              min-height: 100vh;
            }
            .pdf-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              height: auto;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .pdf-header {
              padding: 20px;
              margin-bottom: 20px;
            }
            .pdf-button {
              background: #f59e0b;
              color: black;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 16px;
              margin-right: 10px;
              transition: background-color 0.2s;
            }
            .pdf-button:hover {
              background: #d97706;
            }
            .pdf-button.download {
              background: #10b981;
            }
            .pdf-button.download:hover {
              background: #059669;
            }
            
            /* Ensure all TailwindCSS classes work */
            .bg-white { background-color: white !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-900 { background-color: #111827 !important; }
            .bg-black { background-color: black !important; }
            .bg-yellow-500 { background-color: #eab308 !important; }
            .bg-yellow-400 { background-color: #facc15 !important; }
            .bg-yellow-600 { background-color: #ca8a04 !important; }
            .bg-yellow-50 { background-color: #fefce8 !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
            .bg-red-600 { background-color: #dc2626 !important; }
            
            .text-white { color: white !important; }
            .text-black { color: black !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-yellow-400 { color: #facc15 !important; }
            .text-yellow-600 { color: #ca8a04 !important; }
            .text-red-600 { color: #dc2626 !important; }
            
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-yellow-200 { border-color: #fef3c7 !important; }
            .border-yellow-400 { border-color: #facc15 !important; }
            
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
            
            .p-8 { padding: 2rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-3 { padding: 0.75rem !important; }
            .p-10 { padding: 2.5rem !important; }
            
            .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
            .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
            .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
            
            .mb-10 { margin-bottom: 2.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-1 { margin-bottom: 0.25rem !important; }
            
            .mt-12 { margin-top: 3rem !important; }
            .pt-8 { padding-top: 2rem !important; }
            .pt-4 { padding-top: 1rem !important; }
            .pt-2 { padding-top: 0.5rem !important; }
            
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
            
            .gap-12 { gap: 3rem !important; }
            .gap-8 { gap: 2rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-3 { gap: 0.75rem !important; }
            
            .col-span-2 { grid-column: span 2 / span 2 !important; }
            .col-span-4 { grid-column: span 4 / span 4 !important; }
            
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            
            .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            .border-2 { border-width: 2px !important; }
            .border-t-4 { border-top-width: 4px !important; }
            .border-t-2 { border-top-width: 2px !important; }
            
            .overflow-hidden { overflow: hidden !important; }
            
            .divide-y > * + * { border-top-width: 1px !important; border-top-color: #e5e7eb !important; }
            
            .w-96 { width: 24rem !important; }
            
            .leading-relaxed { line-height: 1.625 !important; }
            
            .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; }
            .duration-200 { transition-duration: 200ms !important; }
            
            .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
            .hover\\:bg-yellow-600:hover { background-color: #ca8a04 !important; }
            .hover\\:bg-blue-600:hover { background-color: #2563eb !important; }
            .hover\\:bg-gray-600:hover { background-color: #4b5563 !important; }
            
            /* PDF specific styles */
            .pdf-content {
              height: auto !important;
              min-height: 100vh !important;
              box-sizing: border-box;
            }
            
            .billing-items-container {
              height: auto !important;
              min-height: fit-content !important;
            }
            
            .billing-item-row {
              min-height: 80px !important;
              height: auto !important;
            }
          </style>
        </head>
        <body>
          <div class="pdf-header">
            <button class="pdf-button" onclick="generatePDF()">
              📄 Generate PDF
            </button>
            <button class="pdf-button download" onclick="downloadPDF()">
              💾 Download PDF
            </button>
            <button class="pdf-button" onclick="window.close()" style="background: #dc2626;">
              ❌ Close
            </button>
          </div>
          <div class="pdf-container pdf-content">
            ${invoiceElement.outerHTML}
          </div>
          
          <script>
            function generatePDF() {
              const element = document.querySelector('.pdf-container');
              const opt = {
                margin: 1,
                filename: 'invoice-${project?.name || 'project'}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  scrollY: 0,
                  scrollX: 0,
                  width: element.scrollWidth,
                  height: element.scrollHeight
                },
                jsPDF: { 
                  unit: 'in', 
                  format: 'a4', 
                  orientation: 'portrait',
                  compress: true
                }
              };
              
              html2pdf().set(opt).from(element).save();
            }
            
            function downloadPDF() {
              const element = document.querySelector('.pdf-container');
              const opt = {
                margin: 1,
                filename: 'invoice-${project?.name || 'project'}.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                  scale: 2,
                  useCORS: true,
                  allowTaint: true,
                  scrollY: 0,
                  scrollX: 0,
                  width: element.scrollWidth,
                  height: element.scrollHeight
                },
                jsPDF: { 
                  unit: 'in', 
                  format: 'a4', 
                  orientation: 'portrait',
                  compress: true
                }
              };
              
              html2pdf().set(opt).from(element).save();
            }
            
            // Auto-generate PDF when page loads
            window.onload = function() {
              const container = document.querySelector('.pdf-container');
              if (container) {
                const height = container.scrollHeight;
                console.log('PDF invoice height:', height);
                
                // Set minimum height to ensure all content is visible
                container.style.minHeight = height + 'px';
              }
            };
          </script>
        </body>
        </html>
      `;
      
      pdfWindow.document.write(htmlContent);
      pdfWindow.document.close();
      pdfWindow.focus();
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const captureAsImage = (format = 'png') => {
    setIsGenerating(true);
    try {
      // Handle viewer option
      if (format === 'viewer') {
        // Calculate total amount with discount
        const totalAmount = (project?.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0) * (1 - (discount || 0) / 100);
        const formattedTotal = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
        }).format(totalAmount);
        
        const viewerWindow = window.open('', '_blank');
        const viewerContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Bill Viewer - ${project?.name || 'Project'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
              }
              .viewer-container {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              }
              .viewer-header {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 12px 12px 0 0;
              }
              .format-button {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-right: 8px;
                transition: background-color 0.2s;
              }
              .format-button:hover {
                background: #2563eb;
              }
              .format-button.png { background: #10b981; }
              .format-button.png:hover { background: #059669; }
              .format-button.jpg { background: #3b82f6; }
              .format-button.jpg:hover { background: #2563eb; }
              .format-button.webp { background: #8b5cf6; }
              .format-button.webp:hover { background: #7c3aed; }
              .viewer-content {
                padding: 20px;
              }
              .bill-preview {
                border: 2px dashed #e5e7eb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                background: #f9fafb;
                margin: 20px 0;
              }
              .bill-info {
                background: #fefce8;
                border: 1px solid #fef3c7;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="viewer-container">
              <div class="viewer-header">
                <h1 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: bold;">
                  📄 Bill Viewer - ${project?.name || 'Project'}
                </h1>
                <p style="margin: 0 0 16px 0; color: #6b7280;">
                  View and download your bill in multiple formats
                </p>
                <div>
                  <button class="format-button png" onclick="downloadFormat('png')">
                    📷 Download PNG
                  </button>
                  <button class="format-button jpg" onclick="downloadFormat('jpg')">
                    📷 Download JPG
                  </button>
                  <button class="format-button webp" onclick="downloadFormat('webp')">
                    📷 Download WebP
                  </button>
                  <button class="format-button" onclick="printBill()">
                    🖨️ Print Bill
                  </button>
                  <button class="format-button" onclick="window.close()" style="background: #dc2626;">
                    ❌ Close
                  </button>
                </div>
              </div>
              <div class="viewer-content">
                <div class="bill-info">
                  <h3 style="margin: 0 0 8px 0; color: #111827;">📋 Bill Information</h3>
                  <p style="margin: 0; color: #6b7280;">
                    <strong>Project:</strong> ${project?.name || 'Project Name'}<br>
                    <strong>Invoice #:</strong> ${project?.id?.slice(0, 8) || '001'}<br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
                    <strong>Items:</strong> ${project?.billingItems?.length || 0} billing items<br>
                    <strong>Total:</strong> ${formattedTotal}
                  </p>
                </div>
                <div class="bill-preview">
                  <h3 style="margin: 0 0 16px 0; color: #111827;">📄 Bill Preview</h3>
                  <p style="margin: 0; color: #6b7280;">
                    Your bill is ready for download in multiple formats.<br>
                    Choose PNG for high quality, JPG for smaller size, or WebP for web optimization.
                  </p>
                </div>
              </div>
            </div>
            
            <script>
              function downloadFormat(format) {
                // Open the capture window and trigger download
                const captureWindow = window.open('', '_blank');
                captureWindow.document.write(\`
                  <html>
                    <head><title>Downloading...</title></head>
                    <body>
                      <script>
                        // Trigger download from parent window
                        window.opener.postMessage({ action: 'download', format: '\${format}' }, '*');
                        window.close();
                      <\/script>
                    </body>
                  </html>
                \`);
              }
              
              function printBill() {
                window.print();
              }
              
              // Listen for download messages
              window.addEventListener('message', function(event) {
                if (event.data.action === 'download') {
                  // Trigger the capture function in the parent window
                  window.opener.postMessage({ action: 'capture', format: event.data.format }, '*');
                }
              });
            </script>
          </body>
          </html>
        `;
        viewerWindow.document.write(viewerContent);
        viewerWindow.document.close();
        setIsGenerating(false);
        return;
      }
      
      const invoiceElement = invoiceRef.current;
      
      // Create a new window for image capture
      const captureWindow = window.open('', '_blank');
      
      // Calculate content height based on billing items
      const billingItemsCount = project?.billingItems?.length || 0;
      const baseHeight = 1200; // Base height for header, footer, etc.
      const itemHeight = 120; // Height per billing item (increased for better spacing)
      const totalHeight = baseHeight + (billingItemsCount * itemHeight);
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice Capture - ${project?.name || 'Project'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              overflow: hidden; /* Prevent scrollbars */
            }
            .capture-container {
              width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-sizing: border-box;
              position: relative;
            }
            .capture-header {
              padding: 20px;
              margin-bottom: 20px;
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              background: white;
              z-index: 1000;
            }
            .capture-button {
              background: #f59e0b;
              color: black;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: bold;
              font-size: 16px;
              margin-right: 10px;
              transition: background-color 0.2s;
            }
            .capture-button:hover {
              background: #d97706;
            }
            .capture-button.png {
              background: #10b981;
            }
            .capture-button.png:hover {
              background: #059669;
            }
            .capture-button.jpg {
              background: #3b82f6;
            }
            .capture-button.jpg:hover {
              background: #2563eb;
            }
            .capture-button.webp {
              background: #8b5cf6;
            }
            .capture-button.webp:hover {
              background: #7c3aed;
            }
            
            /* Ensure all TailwindCSS classes work */
            .bg-white { background-color: white !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            .bg-gray-900 { background-color: #111827 !important; }
            .bg-black { background-color: black !important; }
            .bg-yellow-500 { background-color: #eab308 !important; }
            .bg-yellow-400 { background-color: #facc15 !important; }
            .bg-yellow-600 { background-color: #ca8a04 !important; }
            .bg-yellow-50 { background-color: #fefce8 !important; }
            .bg-orange-50 { background-color: #fff7ed !important; }
            .bg-red-600 { background-color: #dc2626 !important; }
            
            .text-white { color: white !important; }
            .text-black { color: black !important; }
            .text-gray-900 { color: #111827 !important; }
            .text-gray-700 { color: #374151 !important; }
            .text-gray-600 { color: #4b5563 !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .text-yellow-400 { color: #facc15 !important; }
            .text-yellow-600 { color: #ca8a04 !important; }
            .text-red-600 { color: #dc2626 !important; }
            
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-yellow-200 { border-color: #fef3c7 !important; }
            .border-yellow-400 { border-color: #facc15 !important; }
            
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-lg { border-radius: 0.5rem !important; }
            .rounded-full { border-radius: 9999px !important; }
            
            .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important; }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important; }
            
            .p-8 { padding: 2rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .p-3 { padding: 0.75rem !important; }
            .p-10 { padding: 2.5rem !important; }
            
            .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
            .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
            .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
            
            .mb-10 { margin-bottom: 2.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-1 { margin-bottom: 0.25rem !important; }
            
            .mt-12 { margin-top: 3rem !important; }
            .pt-8 { padding-top: 2rem !important; }
            .pt-4 { padding-top: 1rem !important; }
            .pt-2 { padding-top: 0.5rem !important; }
            
            .space-y-6 > * + * { margin-top: 1.5rem !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .space-y-3 > * + * { margin-top: 0.75rem !important; }
            
            .grid { display: grid !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)) !important; }
            
            .gap-12 { gap: 3rem !important; }
            .gap-8 { gap: 2rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-3 { gap: 0.75rem !important; }
            
            .col-span-2 { grid-column: span 2 / span 2 !important; }
            .col-span-4 { grid-column: span 4 / span 4 !important; }
            
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            
            .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            .border-2 { border-width: 2px !important; }
            .border-t-4 { border-top-width: 4px !important; }
            .border-t-2 { border-top-width: 2px !important; }
            
            .overflow-hidden { overflow: hidden !important; }
            
            .divide-y > * + * { border-top-width: 1px !important; border-top-color: #e5e7eb !important; }
            
            .w-96 { width: 24rem !important; }
            
            .leading-relaxed { line-height: 1.625 !important; }
            
            .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important; }
            .duration-200 { transition-duration: 200ms !important; }
            
            .hover\\:bg-gray-50:hover { background-color: #f9fafb !important; }
            .hover\\:bg-yellow-600:hover { background-color: #ca8a04 !important; }
            .hover\\:bg-blue-600:hover { background-color: #2563eb !important; }
            .hover\\:bg-gray-600:hover { background-color: #4b5563 !important; }
            
            /* Image capture specific styles */
            .capture-content {
              height: auto !important;
              box-sizing: border-box;
            }
            
            .billing-items-container {
              height: auto !important;
              min-height: fit-content !important;
            }
            
            .billing-item-row {
              min-height: 80px !important;
              height: auto !important;
            }
          </style>
        </head>
        <body>
          <div class="capture-header">
            <button class="capture-button png" onclick="captureAsPNG()">
              📷 PNG
            </button>
            <button class="capture-button jpg" onclick="captureAsJPG()">
              📷 JPG
            </button>
            <button class="capture-button webp" onclick="captureAsWebP()">
              📷 WebP
            </button>
            <button class="capture-button" onclick="openBillViewer()">
              👁️ View Bill
            </button>
            <button class="capture-button" onclick="window.close()" style="background: #dc2626;">
              ❌ Close
            </button>
          </div>
          <div class="capture-container capture-content" style="margin-top: 80px;">
            ${invoiceElement.outerHTML}
          </div>
          
          <script>
            function captureAsPNG() {
              captureImage('png');
            }
            
            function captureAsJPG() {
              captureImage('jpg');
            }
            
            function captureAsWebP() {
              captureImage('webp');
            }
            
            function openBillViewer() {
              // Calculate total amount with discount
              const totalAmount = (project?.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0) * (1 - (discount || 0) / 100);
              const formattedTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalAmount);
              
              const viewerWindow = window.open('', '_blank');
              const viewerContent = \`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Bill Viewer - ${project?.name || 'Project'}</title>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      margin: 0;
                      padding: 20px;
                      background: #f5f5f5;
                    }
                    .viewer-container {
                      max-width: 1000px;
                      margin: 0 auto;
                      background: white;
                      border-radius: 12px;
                      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    }
                    .viewer-header {
                      padding: 20px;
                      border-bottom: 1px solid #e5e7eb;
                      background: #f9fafb;
                      border-radius: 12px 12px 0 0;
                    }
                    .format-button {
                      background: #3b82f6;
                      color: white;
                      border: none;
                      padding: 8px 16px;
                      border-radius: 6px;
                      cursor: pointer;
                      font-size: 14px;
                      margin-right: 8px;
                      transition: background-color 0.2s;
                    }
                    .format-button:hover {
                      background: #2563eb;
                    }
                    .format-button.png { background: #10b981; }
                    .format-button.png:hover { background: #059669; }
                    .format-button.jpg { background: #3b82f6; }
                    .format-button.jpg:hover { background: #2563eb; }
                    .format-button.webp { background: #8b5cf6; }
                    .format-button.webp:hover { background: #7c3aed; }
                    .viewer-content {
                      padding: 20px;
                    }
                    .bill-preview {
                      border: 2px dashed #e5e7eb;
                      border-radius: 8px;
                      padding: 20px;
                      text-align: center;
                      background: #f9fafb;
                      margin: 20px 0;
                    }
                    .bill-info {
                      background: #fefce8;
                      border: 1px solid #fef3c7;
                      border-radius: 8px;
                      padding: 16px;
                      margin: 20px 0;
                    }
                  </style>
                </head>
                <body>
                  <div class="viewer-container">
                    <div class="viewer-header">
                      <h1 style="margin: 0 0 16px 0; color: #111827; font-size: 24px; font-weight: bold;">
                        📄 Bill Viewer - ${project?.name || 'Project'}
                      </h1>
                      <p style="margin: 0 0 16px 0; color: #6b7280;">
                        View and download your bill in multiple formats
                      </p>
                      <div>
                        <button class="format-button png" onclick="downloadFormat('png')">
                          📷 Download PNG
                        </button>
                        <button class="format-button jpg" onclick="downloadFormat('jpg')">
                          📷 Download JPG
                        </button>
                        <button class="format-button webp" onclick="downloadFormat('webp')">
                          📷 Download WebP
                        </button>
                        <button class="format-button" onclick="printBill()">
                          🖨️ Print Bill
                        </button>
                        <button class="format-button" onclick="window.close()" style="background: #dc2626;">
                          ❌ Close
                        </button>
                      </div>
                    </div>
                    <div class="viewer-content">
                      <div class="bill-info">
                        <h3 style="margin: 0 0 8px 0; color: #111827;">📋 Bill Information</h3>
                        <p style="margin: 0; color: #6b7280;">
                          <strong>Project:</strong> ${project?.name || 'Project Name'}<br>
                          <strong>Invoice #:</strong> ${project?.id?.slice(0, 8) || '001'}<br>
                          <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br>
                          <strong>Items:</strong> ${project?.billingItems?.length || 0} billing items<br>
                          <strong>Total:</strong> ${formattedTotal}
                        </p>
                      </div>
                      <div class="bill-preview">
                        <h3 style="margin: 0 0 16px 0; color: #111827;">📄 Bill Preview</h3>
                        <p style="margin: 0; color: #6b7280;">
                          Your bill is ready for download in multiple formats.<br>
                          Choose PNG for high quality, JPG for smaller size, or WebP for web optimization.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <script>
                    function downloadFormat(format) {
                      // Open the capture window and trigger download
                      const captureWindow = window.open('', '_blank');
                      captureWindow.document.write(\`
                        <html>
                          <head><title>Downloading...</title></head>
                          <body>
                            <script>
                              // Trigger download from parent window
                              window.opener.postMessage({ action: 'download', format: '\${format}' }, '*');
                              window.close();
                            <\/script>
                          </body>
                        </html>
                      \`);
                    }
                    
                    function printBill() {
                      window.print();
                    }
                    
                    // Listen for download messages
                    window.addEventListener('message', function(event) {
                      if (event.data.action === 'download') {
                        // Trigger the capture function in the parent window
                        window.opener.postMessage({ action: 'capture', format: event.data.format }, '*');
                      }
                    });
                  </script>
                </body>
                </html>
              \`;
              viewerWindow.document.write(viewerContent);
              viewerWindow.document.close();
            }
            
            function captureImage(format) {
              const element = document.querySelector('.capture-container');
              
              // Wait for content to be fully rendered
              setTimeout(() => {
                // Get the actual dimensions of the content
                const rect = element.getBoundingClientRect();
                const height = element.scrollHeight;
                const width = element.scrollWidth;
                
                console.log('Capturing image with dimensions:', width + 'x' + height);
                console.log('Element rect:', rect);
                
                // Set the element dimensions to match content
                element.style.width = width + 'px';
                element.style.height = height + 'px';
                element.style.position = 'relative';
                element.style.overflow = 'visible';
                
                html2canvas(element, {
                  scale: 2, // High quality
                  useCORS: true,
                  allowTaint: true,
                  backgroundColor: '#ffffff',
                  width: width,
                  height: height,
                  scrollY: 0,
                  scrollX: 0,
                  windowWidth: width + 100, // Extra width to avoid scrollbars
                  windowHeight: height + 100, // Extra height to avoid scrollbars
                  foreignObjectRendering: true,
                  removeContainer: true,
                  onclone: function(clonedDoc) {
                    // Ensure the cloned element has the same dimensions
                    const clonedElement = clonedDoc.querySelector('.capture-container');
                    if (clonedElement) {
                      clonedElement.style.width = width + 'px';
                      clonedElement.style.height = height + 'px';
                      clonedElement.style.position = 'relative';
                      clonedElement.style.overflow = 'visible';
                      clonedElement.style.margin = '0';
                      clonedElement.style.padding = '0';
                    }
                  }
                }).then(canvas => {
                  console.log('Canvas dimensions:', canvas.width + 'x' + canvas.height);
                  
                  // Convert to blob and download
                  canvas.toBlob(function(blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'invoice-${project?.name || 'project'}.${format}';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    console.log('Image captured and downloaded successfully');
                  }, 'image/' + format, 0.95);
                }).catch(error => {
                  console.error('Error capturing image:', error);
                  alert('Failed to capture image. Please try again.');
                });
              }, 1500); // Wait 1.5 seconds for content to render
            }
            
            // Auto-capture when page loads
            window.onload = function() {
              const container = document.querySelector('.capture-container');
              if (container) {
                const height = container.scrollHeight;
                const width = container.scrollWidth;
                console.log('Invoice dimensions:', width + 'x' + height);
                
                // Set dimensions to ensure full content is visible
                container.style.width = width + 'px';
                container.style.height = height + 'px';
                container.style.overflow = 'visible';
              }
            };
          </script>
        </body>
        </html>
      `;
      
      captureWindow.document.write(htmlContent);
      captureWindow.document.close();
      captureWindow.focus();
      
    } catch (error) {
      console.error('Image capture failed:', error);
      alert('Image capture failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
          <p className="text-gray-600">Preview and download professional invoices</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={captureFullScreenshot}
            disabled={isGenerating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Capturing...' : 'Screenshot Invoice'}</span>
          </button>
          
          <button
            onClick={generateInvoice}
            disabled={isGenerating}
            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-black font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Opening Print...' : 'Print Invoice'}</span>
          </button>
          
          <button
            onClick={() => captureAsImage('png')}
            disabled={isGenerating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Capturing...' : 'Capture PNG'}</span>
          </button>
          
          <button
            onClick={() => captureAsImage('jpg')}
            disabled={isGenerating}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Capturing...' : 'Capture JPG'}</span>
          </button>
          
          <button
            onClick={() => captureAsImage('webp')}
            disabled={isGenerating}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Capturing...' : 'Capture WebP'}</span>
          </button>
          
          <button
            onClick={() => captureAsImage('viewer')}
            disabled={isGenerating}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-medium px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 cursor-pointer"
          >
            <FileText size={16} />
            <span>{isGenerating ? 'Opening...' : 'View Bill'}</span>
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div ref={invoiceRef} data-invoice-content className="bg-white rounded-xl shadow-2xl overflow-y-auto scrollbar-hide" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-yellow-500 p-3 rounded-full">
                <Logo size={48} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black mb-1">GET IT RENDERED</h1>
                <p className="text-yellow-400 text-lg font-medium">Designing & 3D Visuals Company</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-lg font-semibold mb-2">INVOICE</div>
              <div className="text-4xl font-bold text-black">#{project?.id?.slice(0, 8) || '001'}</div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-white">
          {/* Company and Client Info */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User size={20} className="mr-2 text-yellow-600" />
                From:
              </h3>
              <div className="space-y-3">
                <div className="font-bold text-xl text-gray-900">GET IT RENDERED</div>
                <div className="text-gray-700 font-medium">Designing & 3D Visuals Company</div>
                <div className="text-gray-600">123 Business Street</div>
                <div className="text-gray-600">Mumbai, Maharashtra 400001</div>
                <div className="text-gray-600">India</div>
                <div className="flex items-center space-x-3 text-gray-600 pt-2">
                  <Phone size={16} className="text-yellow-600" />
                  <span className="font-medium">+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail size={16} className="text-yellow-600" />
                  <span className="font-medium">info@getitrendered.com</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-yellow-600" />
                Bill To:
              </h3>
              <div className="space-y-3">
                <div className="font-bold text-xl text-gray-900">
                  {project?.company?.name || project?.client || 'Client Name'}
                </div>
                {project?.company?.contactPerson && (
                  <div className="text-gray-700 font-medium">Contact: {project.company.contactPerson}</div>
                )}
                {project?.company?.email && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Mail size={16} className="text-yellow-600" />
                    <span className="font-medium">{project.company.email}</span>
                  </div>
                )}
                {project?.company?.phone && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Phone size={16} className="text-yellow-600" />
                    <span className="font-medium">{project.company.phone}</span>
                  </div>
                )}
                {project?.company?.address && (
                  <div className="text-gray-600">{project.company.address}</div>
                )}
                {project?.company?.website && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Globe size={16} className="text-yellow-600" />
                    <span className="font-medium">{project.company.website}</span>
              </div>
                )}
                {project?.company?.industry && (
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Briefcase size={16} className="text-yellow-600" />
                    <span className="font-medium">{project.company.industry}</span>
                  </div>
                )}
                {project?.company?.notes && (
                  <div className="text-gray-600 text-sm italic">
                    <span className="font-medium">Notes:</span> {project.company.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200 mb-8">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-sm text-gray-600 font-medium mb-2 flex items-center justify-center">
                  <Calendar size={16} className="mr-2 text-yellow-600" />
                  Invoice Date
            </div>
                <div className="font-bold text-lg text-gray-900">{new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
            </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 font-medium mb-2 flex items-center justify-center">
                  <Calendar size={16} className="mr-2 text-yellow-600" />
                  Due Date
                </div>
                <div className="font-bold text-lg text-gray-900">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 font-medium mb-2 flex items-center justify-center">
                  <FileText size={16} className="mr-2 text-yellow-600" />
                  Project
                </div>
                <div className="font-bold text-lg text-gray-900">{project?.name || 'Project Name'}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-gray-900 to-black text-white px-8 py-6">
                <div className="grid grid-cols-12 gap-6 font-bold text-lg">
                  <div className="col-span-4 flex items-center">
                    <DollarSign size={20} className="mr-2 text-yellow-400" />
                    Item
                  </div>
                  <div className="col-span-4 flex items-center">
                    <FileText size={20} className="mr-2 text-yellow-400" />
                    Description
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center">
                    <Calendar size={20} className="mr-2 text-yellow-400" />
                    Qty
                  </div>
                  <div className="col-span-2 text-right flex items-center justify-end">
                    <DollarSign size={20} className="mr-2 text-yellow-400" />
                    Amount
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {project?.billingItems?.map((item, index) => (
                  <div key={item.id || index} className="px-8 py-6 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-4 font-bold text-lg text-gray-900">{item.name}</div>
                      <div className="col-span-4 text-gray-700">{item.description}</div>
                      <div className="col-span-2 text-center text-lg font-semibold text-gray-900">{item.quantity}</div>
                      <div className="col-span-2 text-right font-bold text-lg text-gray-900">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-96 bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-xl border-2 border-yellow-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold text-lg">Subtotal:</span>
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(project?.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0)}
                  </span>
              </div>
              
              {discount > 0 && (
                <>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-semibold text-lg">Discount ({discount}%):</span>
                      <span className="text-red-600 font-bold text-lg">
                        -{new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format((project?.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0) * discount / 100)}
                      </span>
                  </div>
                </>
              )}
              
              {project?.advanceAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold text-lg">Advance Payment:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    -{new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(project.advanceAmount)}
                  </span>
                </div>
              )}
              
                <div className="border-t-4 border-yellow-400 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                  <span>Total Due:</span>
                    <span className="text-yellow-600">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format((project?.billingItems?.reduce((total, item) => total + (item.totalPrice || 0), 0) || 0) * (1 - discount / 100) - (project?.advanceAmount || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t-4 border-yellow-200">
            <div className="grid grid-cols-2 gap-12">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-bold text-xl text-gray-900 mb-3 flex items-center">
                  <DollarSign size={20} className="mr-2 text-yellow-600" />
                  Payment Terms
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  Payment is due within 30 days of invoice date. Please include invoice number with your payment.
                  We accept bank transfers and digital payments.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-bold text-xl text-gray-900 mb-3 flex items-center">
                  <User size={20} className="mr-2 text-yellow-600" />
                  Thank You
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  Thank you for choosing GET IT RENDERED for your 3D design and visualization needs.
                  We look forward to working with you on future projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator; 