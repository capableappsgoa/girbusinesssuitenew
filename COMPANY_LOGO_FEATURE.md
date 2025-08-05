# Company Logo Feature

## Overview
Added comprehensive logo functionality for companies, allowing users to upload images or paste logo URLs. The logos are displayed throughout the application in company cards, project details, and invoices.

## Features Added

### 1. Database Schema
- Added `logo_url` and `logo_alt_text` columns to the `companies` table
- SQL script: `add-company-logo.sql`

### 2. Company Management
- **Logo Upload**: Users can upload image files (max 5MB)
- **Logo URL**: Users can paste direct URLs to logo images
- **Preview**: Real-time preview of selected logos
- **Validation**: File size and type validation
- **Fallback**: Graceful fallback to default icon if logo fails to load

### 3. Display Locations
- **Company Cards**: Shows logo in company grid view
- **Project Details**: Company logo displayed in project header
- **Invoice Section**: Company logo shown in billing information
- **Project Information**: Company name and logo in project overview

### 4. Reusable Component
- Created `CompanyLogo` component for consistent display
- Supports multiple sizes (sm, md, lg, xl)
- Optional company name display
- Error handling with fallback icons

## How to Use

### Adding Company Logo
1. Go to **Companies** section
2. Click **Add Company** or **Edit** existing company
3. In the form, you'll see **Company Logo** section
4. Choose between:
   - **URL**: Paste a direct link to the logo image
   - **Upload**: Select an image file from your computer
5. Preview will show the logo immediately
6. Save the company

### Logo Requirements
- **File Types**: JPG, PNG, GIF, WebP
- **File Size**: Maximum 5MB
- **URL Format**: Direct links to image files
- **Recommended**: Square or rectangular logos work best

### Display Features
- **Responsive**: Logos scale properly on all devices
- **Fallback**: Shows default building icon if logo fails to load
- **Accessibility**: Proper alt text for screen readers
- **Consistent**: Same logo appears across all company references

## Technical Implementation

### Database Changes
```sql
ALTER TABLE companies 
ADD COLUMN logo_url TEXT,
ADD COLUMN logo_alt_text TEXT;
```

### Component Structure
```
src/components/
├── companies/Companies.js (Updated with logo functionality)
├── common/CompanyLogo.js (New reusable component)
├── projects/ProjectDetail.js (Updated to show company logo)
└── projects/ProjectInvoice.js (Updated to show company logo)
```

### Service Updates
- Updated `projectService.js` to handle logo fields
- Added logo mapping in company fetch/create/update functions
- Integrated logo display in project data

## Benefits
- ✅ **Professional Appearance**: Companies look more professional with logos
- ✅ **Brand Recognition**: Easy to identify companies at a glance
- ✅ **Consistent Display**: Logos appear everywhere company info is shown
- ✅ **User-Friendly**: Simple upload or URL paste options
- ✅ **Error Handling**: Graceful fallbacks if logos fail to load
- ✅ **Responsive**: Works on all screen sizes

## Future Enhancements
- Cloud storage integration for uploaded files
- Logo cropping and resizing tools
- Multiple logo formats support
- Logo optimization for better performance
- Bulk logo import functionality

The company logo feature is now fully integrated and ready to use! 