// Debug script for multiple deletion issues
// Run this in browser console to debug multiple deletion problems

console.log('🔍 Debugging Multiple Deletion Issues...');

// Function to check current state
function debugCurrentState() {
  console.log('📊 Current State Analysis:');
  
  // Check billing items
  const billingItems = document.querySelectorAll('tr[data-billing-item], tr.hover\\:bg-gray-50');
  console.log(`📋 Found ${billingItems.length} billing item rows`);
  
  // Check selected items
  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  console.log(`☑️ Found ${checkboxes.length} selected checkboxes`);
  
  // Check delete buttons
  const deleteButtons = document.querySelectorAll('button[title="Delete row"], .text-red-600 button');
  console.log(`🗑️ Found ${deleteButtons.length} delete buttons`);
  
  // Check bulk delete button
  const bulkDeleteButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Delete Selected')
  );
  console.log(`📦 Bulk delete button: ${bulkDeleteButton ? 'Found' : 'Not found'}`);
  
  return {
    billingItems: billingItems.length,
    selectedItems: checkboxes.length,
    deleteButtons: deleteButtons.length,
    bulkDeleteButton: !!bulkDeleteButton
  };
}

// Function to simulate multiple deletion
function testMultipleDeletion() {
  console.log('🧪 Testing Multiple Deletion...');
  
  // Get all checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const billingItems = document.querySelectorAll('tr[data-billing-item], tr.hover\\:bg-gray-50');
  
  if (checkboxes.length < 2) {
    console.log('❌ Need at least 2 items to test multiple deletion');
    return;
  }
  
  console.log('📝 Steps to test multiple deletion:');
  console.log('1. Select multiple items using checkboxes');
  console.log('2. Look for "Delete Selected" button to appear');
  console.log('3. Click "Delete Selected" button');
  console.log('4. Confirm deletion');
  console.log('5. Check console for any errors');
  
  // Check if bulk delete button appears when items are selected
  console.log('\n💡 To test bulk delete button visibility:');
  console.log('- Select 2 or more items');
  console.log('- Look for "Delete Selected" button in the bulk actions area');
}

// Function to check for errors
function checkForErrors() {
  console.log('🚨 Checking for errors...');
  
  // Look for error messages in the DOM
  const errorMessages = document.querySelectorAll('.text-red-600, .text-red-500, [class*="error"]');
  console.log(`❌ Found ${errorMessages.length} potential error elements`);
  
  // Check console for recent errors
  console.log('📋 Check the browser console for any recent error messages');
  
  // Check network tab for failed requests
  console.log('🌐 Check the Network tab in developer tools for failed API requests');
}

// Function to test single deletion
function testSingleDeletion() {
  console.log('🧪 Testing Single Deletion...');
  
  const deleteButtons = document.querySelectorAll('button[title="Delete row"], .text-red-600 button');
  
  if (deleteButtons.length === 0) {
    console.log('❌ No delete buttons found');
    return;
  }
  
  console.log(`🔘 Found ${deleteButtons.length} delete buttons`);
  console.log('💡 Click any delete button to test single deletion');
  console.log('📋 Watch the console for any error messages');
}

// Function to monitor state changes
function monitorStateChanges() {
  console.log('👀 Monitoring state changes...');
  
  // Create a mutation observer to watch for DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        console.log('🔄 DOM changed - checking state...');
        debugCurrentState();
      }
    });
  });
  
  // Start observing
  const table = document.querySelector('table');
  if (table) {
    observer.observe(table, { childList: true, subtree: true });
    console.log('✅ State monitoring started');
  } else {
    console.log('❌ No table found to monitor');
  }
  
  return observer;
}

// Export functions for manual testing
window.debugMultipleDeletion = {
  debugCurrentState,
  testMultipleDeletion,
  testSingleDeletion,
  checkForErrors,
  monitorStateChanges
};

console.log('🔍 Debug functions loaded!');
console.log('💡 Run debugMultipleDeletion.debugCurrentState() to check current state');
console.log('💡 Run debugMultipleDeletion.testMultipleDeletion() to test multiple deletion');
console.log('💡 Run debugMultipleDeletion.testSingleDeletion() to test single deletion');
console.log('💡 Run debugMultipleDeletion.checkForErrors() to look for errors');
console.log('💡 Run debugMultipleDeletion.monitorStateChanges() to monitor changes'); 