// Test script to verify focus management
console.log('Testing focus management...');

// Test if focus management script is loaded
setTimeout(() => {
  const inputs = document.querySelectorAll('input, textarea, select');
  console.log('Found form elements:', inputs.length);
  
  inputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`, input.tagName, input.type || '', input.id || '');
    
    // Test focus
    input.addEventListener('focus', () => {
      console.log('✅ Focus working on:', input.tagName, input.type || '');
    });
    
    input.addEventListener('blur', () => {
      console.log('✅ Blur working on:', input.tagName, input.type || '');
    });
  });
  
  // Test click on first input
  if (inputs.length > 0) {
    console.log('Testing click on first input...');
    inputs[0].click();
  }
}, 2000); 