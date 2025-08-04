# Discount Persistence Setup Guide

## Overview
The discount percentage is now stored in the database and persists across sessions. This ensures that discount values don't reset when navigating between pages or refreshing the application.

## Database Changes Required

### 1. Add discount_percentage column to projects table
Run the following SQL in your Supabase dashboard:

```sql
-- Add discount_percentage column to projects table
ALTER TABLE projects ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0;

-- Update existing projects to have 0 discount
UPDATE projects SET discount_percentage = 0 WHERE discount_percentage IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN projects.discount_percentage IS 'Discount percentage for invoice generation (0-100)';
```

## Code Changes Made

### 1. Project Service (`src/services/projectService.js`)
- Added `updateProjectDiscount` function to save discount to database
- Updated `fetchProjects` to include `discount_percentage` field in project mapping
- Maps `discount_percentage` to `discountPercentage` for frontend compatibility

### 2. Project Store (`src/stores/projectStore.js`)
- Added `updateProjectDiscount` function to the store
- Imports the new service function
- Updates both local state and database when discount changes

### 3. ProjectInvoice Component (`src/components/projects/ProjectInvoice.js`)
- Updated to initialize discount from project's stored discount percentage
- Added database save functionality to discount input onChange handler
- Enhanced useEffect to synchronize with both store and project discount values

### 4. InvoicePage Component (`src/components/invoice/InvoicePage.js`)
- Updated to initialize discount from project's stored discount percentage
- Added database save functionality to discount input onChange handler
- Enhanced useEffect to synchronize with both store and project discount values

## How It Works

1. **Initialization**: When a project is loaded, the discount percentage is read from the database (`discount_percentage` field) and stored in the project object as `discountPercentage`.

2. **Synchronization**: The discount value is synchronized between:
   - The project's stored discount in the database
   - The global store's `invoiceDiscountPercentage`
   - The local component state

3. **Persistence**: When the user changes the discount percentage in either the ProjectInvoice sidebar or the InvoicePage, the new value is immediately saved to the database.

4. **Fallback**: If no discount is stored in the database, it defaults to 0%.

## Testing

### Manual Testing
1. Open a project's invoice section
2. Change the discount percentage
3. Navigate to the main invoice page
4. Verify the discount persists
5. Navigate back to the project invoice
6. Verify the discount still shows the same value
7. Refresh the page and verify the discount is still there

### Database Testing
Run the test script to verify database functionality:
```bash
node test-discount-persistence.js
```

## Troubleshooting

### "invoiceDiscountPercentage is not defined" Error
This error typically occurs when the development server hasn't picked up the latest code changes. Solution:
1. Stop the development server (Ctrl+C)
2. Restart the development server: `npm run dev`

### Discount Not Persisting
1. Check that the `discount_percentage` column exists in the projects table
2. Verify the RLS policies allow updating the projects table
3. Check the browser console for any database errors
4. Ensure the user is authenticated

### Discount Resetting to 0
1. Check that the project's `discountPercentage` field is being loaded correctly
2. Verify the useEffect dependencies are correct
3. Check that the database update is successful

## Benefits

- **Persistence**: Discount values survive page refreshes and navigation
- **Consistency**: Same discount value across all invoice-related components
- **User Experience**: No need to re-enter discount values
- **Data Integrity**: Discount values are stored in the database with proper validation 