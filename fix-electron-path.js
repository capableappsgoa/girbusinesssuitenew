const fs = require('fs');
const path = require('path');

// Path to the built electron.js file
const electronPath = path.join(__dirname, 'dist', 'win-unpacked', 'resources', 'app.asar', 'build', 'electron.js');

// Read the current electron.js file
let content = fs.readFileSync(electronPath, 'utf8');

// Replace the incorrect path with the correct one
content = content.replace(
  /`file:\/\/\$\{path\.join\(__dirname, 'index\.html'\)\}`/g,
  "`file://${path.join(__dirname, 'index.html')}`"
);

// Write the corrected content back
fs.writeFileSync(electronPath, content);

console.log('✅ Fixed electron.js path in built application');
console.log('📍 The application should now load correctly');
console.log('');
console.log('🚀 To test the application:');
console.log('   cd dist\\win-unpacked');
console.log('   "GET IT RENDERED - Project Manager.exe"'); 