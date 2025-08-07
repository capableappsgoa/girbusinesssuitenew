# Advance Payment Feature

## Overview
Added comprehensive advance payment functionality to the invoice system, allowing clients to make advance payments that are automatically deducted from the total billing amount.

## Features

### 1. Database Schema
- **File**: `add-advance-payment.sql`
- **Columns Added**:
  - `advance_amount` - Decimal field for advance payment amount
  - `advance_payment_date` - Timestamp for when advance was received
  - `advance_payment_method` - Text field for payment method (cash, bank_transfer, cheque, online, other)
  - `advance_notes` - Text field for additional notes

### 2. Backend Services
- **File**: `src/services/projectService.js`
- **Functions Added**:
  - `updateProjectAdvance()` - Update advance payment information
  - `getProjectAdvance()` - Get advance payment details
  - Updated `fetchProjects()` and `fetchProjectById()` to include advance payment fields

### 3. Frontend Components

#### AdvancePaymentModal Component
- **File**: `src/components/projects/AdvancePaymentModal.js`
- **Features**:
  - Form to add/edit advance payment details
  - Payment method selection (Cash, Bank Transfer, Cheque, Online, Other)
  - Date picker for payment date
  - Notes field for additional information
  - Current advance payment display
  - Validation and error handling

#### ProjectInvoice Component Updates
- **File**: `src/components/projects/ProjectInvoice.js`
- **Features**:
  - Advance payment section with current amount display
  - "Manage Advance" button to open modal
  - Automatic calculation of final amount due
  - Visual indicators for advance payments

#### InvoicePage Component Updates
- **File**: `src/components/invoice/InvoicePage.js`
- **Features**:
  - Advance payment line item in invoice totals
  - Updated calculations to include advance deduction
  - Proper display of "Total Due" vs "Total"

#### InvoiceGenerator Component Updates
- **File**: `src/components/invoice/InvoiceGenerator.js`
- **Features**:
  - Advance payment display in generated invoices
  - Updated total calculations
  - Professional invoice formatting

### 4. Store Management
- **File**: `src/stores/projectStore.js`
- **Functions Added**:
  - `updateProjectAdvance()` - Update advance payment in store
  - `getProjectAdvance()` - Get advance payment from store
  - Proper state management and error handling

## User Interface Features

### Advance Payment Management
1. **Access**: Click "Manage Advance" button in Project Invoice section
2. **Form Fields**:
   - Advance Amount (required)
   - Payment Date (optional)
   - Payment Method (dropdown)
   - Notes (optional)
3. **Current Advance Display**: Shows existing advance payment details
4. **Validation**: Ensures advance amount is greater than 0

### Invoice Calculations
1. **Subtotal**: Sum of all billing items
2. **Discount**: Percentage discount applied
3. **Subtotal After Discount**: Subtotal minus discount
4. **Advance Payment**: Amount already paid
5. **Final Total Due**: Subtotal after discount minus advance

### Visual Indicators
- **Blue gradient background** for advance payment sections
- **Clear labeling** of "Advance Payment" vs "Total Due"
- **Payment method icons** and formatting
- **Date formatting** for payment dates

## Data Flow

1. **User clicks "Manage Advance"** → Modal opens with current data
2. **User enters advance details** → Form validation occurs
3. **User submits form** → Data saved to database
4. **Store updates** → UI reflects new advance amount
5. **Invoice calculations update** → Final amount due recalculated
6. **Invoice generation** → Advance payment included in totals

## Payment Methods Supported

- **Cash**: Physical cash payment
- **Bank Transfer**: Electronic bank transfer
- **Cheque**: Physical cheque payment
- **Online**: Online payment platforms
- **Other**: Any other payment method

## Benefits

- **Better Cash Flow**: Track advance payments separately
- **Accurate Billing**: Automatic deduction from total amount
- **Professional Invoicing**: Clear separation of advance and remaining amounts
- **Payment Tracking**: Record payment methods and dates
- **Flexible Notes**: Add context for advance payments

## Usage Instructions

### For Users
1. Navigate to Project → Invoice section
2. Click "Manage Advance" button
3. Enter advance amount and details
4. Click "Update Advance"
5. View updated calculations in invoice

### For Developers
1. Run the SQL migration: `add-advance-payment.sql`
2. The functionality is automatically available in the UI
3. Test by adding advance payments to projects

## Testing
- **File**: `test-advance-payment.js`
- **Purpose**: Verify all components work correctly
- **Usage**: Run in browser console or Node.js environment

## Files Modified
- `src/components/projects/AdvancePaymentModal.js` - New modal component
- `src/components/projects/ProjectInvoice.js` - Updated with advance functionality
- `src/components/invoice/InvoicePage.js` - Updated invoice display
- `src/components/invoice/InvoiceGenerator.js` - Updated invoice generation
- `src/services/projectService.js` - Backend services
- `src/stores/projectStore.js` - Store management
- `add-advance-payment.sql` - Database migration
- `test-advance-payment.js` - Test script
- `ADVANCE_PAYMENT_FEATURE.md` - This documentation

## Example Calculations

### Scenario 1: Basic Advance Payment
- **Subtotal**: ₹300,000
- **Discount**: 10% (-₹30,000)
- **Subtotal After Discount**: ₹270,000
- **Advance Payment**: ₹50,000
- **Final Total Due**: ₹220,000

### Scenario 2: No Advance Payment
- **Subtotal**: ₹200,000
- **Discount**: 5% (-₹10,000)
- **Subtotal After Discount**: ₹190,000
- **Advance Payment**: ₹0
- **Final Total Due**: ₹190,000

### Scenario 3: Large Advance Payment
- **Subtotal**: ₹100,000
- **Discount**: 0%
- **Subtotal After Discount**: ₹100,000
- **Advance Payment**: ₹80,000
- **Final Total Due**: ₹20,000

## Next Steps
1. Run the database migration in Supabase SQL Editor
2. Test the functionality by adding advance payments
3. Verify invoice calculations are correct
4. Consider adding advance payment reports
5. Consider adding advance payment history tracking
