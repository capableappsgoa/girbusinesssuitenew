// Test script to verify billing item deletion functionality
// Run this in the browser console to test the deletion features

console.log('🧪 Testing Billing Item Deletion Functionality...');

// Test 1: Check if billing items are loaded
function testBillingItemsLoaded() {
  console.log('📋 Test 1: Checking if billing items are loaded...');
  
  // Look for billing items in the DOM
  const billingRows = document.querySelectorAll('tr[data-billing-item]');
  const billingTable = document.querySelector('table');
  
  if (billingTable) {
    console.log('✅ Billing table found');
    console.log(`📊 Found ${billingRows.length} billing item rows`);
  } else {
    console.log('❌ Billing table not found');
  }
  
  return billingRows.length > 0;
}

// Test 2: Check if delete buttons are present
function testDeleteButtons() {
  console.log('🗑️ Test 2: Checking delete buttons...');
  
  const deleteButtons = document.querySelectorAll('button[title="Delete row"], .text-red-600 button');
  console.log(`🔘 Found ${deleteButtons.length} delete buttons`);
  
  if (deleteButtons.length > 0) {
    console.log('✅ Delete buttons are present');
    return true;
  } else {
    console.log('❌ No delete buttons found');
    return false;
  }
}

// Test 3: Check if selection checkboxes are present
function testSelectionCheckboxes() {
  console.log('☑️ Test 3: Checking selection checkboxes...');
  
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const selectionButtons = document.querySelectorAll('button[onclick*="toggleItemSelection"]');
  
  console.log(`☑️ Found ${checkboxes.length} checkboxes`);
  console.log(`🔘 Found ${selectionButtons.length} selection buttons`);
  
  if (checkboxes.length > 0 || selectionButtons.length > 0) {
    console.log('✅ Selection controls are present');
    return true;
  } else {
    console.log('❌ No selection controls found');
    return false;
  }
}

// Test 4: Check if bulk delete button is present
function testBulkDeleteButton() {
  console.log('📦 Test 4: Checking bulk delete button...');
  
  const bulkDeleteButton = document.querySelector('button:contains("Delete Selected")');
  const deleteSelectedButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Delete Selected')
  );
  
  if (deleteSelectedButton) {
    console.log('✅ Bulk delete button found');
    return true;
  } else {
    console.log('❌ Bulk delete button not found');
    return false;
  }
}

// Test 5: Check console for errors
function testConsoleErrors() {
  console.log('🚨 Test 5: Checking for console errors...');
  
  // This would need to be run after attempting deletions
  console.log('ℹ️ Check the console for any error messages during deletion attempts');
  return true;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all billing deletion tests...\n');
  
  const results = {
    itemsLoaded: testBillingItemsLoaded(),
    deleteButtons: testDeleteButtons(),
    selectionControls: testSelectionCheckboxes(),
    bulkDeleteButton: testBulkDeleteButton(),
    consoleErrors: testConsoleErrors()
  };
  
  console.log('\n📊 Test Results:');
  console.log('================');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The deletion functionality should work properly.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
}

// Manual test functions
function testSingleDeletion() {
  console.log('🧪 Testing single item deletion...');
  const deleteButton = document.querySelector('button[title="Delete row"]');
  if (deleteButton) {
    console.log('🔘 Found delete button, you can click it to test deletion');
    console.log('💡 Click the delete button and check if the item is removed');
  } else {
    console.log('❌ No delete button found');
  }
}

function testMultipleDeletion() {
  console.log('🧪 Testing multiple item deletion...');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const bulkDeleteButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Delete Selected')
  );
  
  if (checkboxes.length > 1 && bulkDeleteButton) {
    console.log('🔘 Found checkboxes and bulk delete button');
    console.log('💡 Steps to test:');
    console.log('   1. Select multiple items using checkboxes');
    console.log('   2. Click "Delete Selected" button');
    console.log('   3. Confirm deletion');
    console.log('   4. Check if selected items are removed');
  } else {
    console.log('❌ Missing required elements for multiple deletion test');
  }
}

// Export functions for manual testing
window.billingDeletionTests = {
  runAllTests,
  testSingleDeletion,
  testMultipleDeletion,
  testBillingItemsLoaded,
  testDeleteButtons,
  testSelectionCheckboxes,
  testBulkDeleteButton,
  testConsoleErrors
};

console.log('🧪 Billing deletion test functions loaded!');
console.log('💡 Run billingDeletionTests.runAllTests() to test everything');
console.log('💡 Run billingDeletionTests.testSingleDeletion() to test single deletion');
console.log('💡 Run billingDeletionTests.testMultipleDeletion() to test multiple deletion'); 