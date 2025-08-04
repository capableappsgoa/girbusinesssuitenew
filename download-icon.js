const https = require('https');
const fs = require('fs');
const path = require('path');

// Download the GIR logo
const logoUrl = 'https://i.ibb.co/0RLKgHD6/GIR-2.png';
const iconPath = path.join(__dirname, 'public', 'icon.png');

// Create public directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'));
}

console.log('Downloading GIR logo...');

https.get(logoUrl, (response) => {
  if (response.statusCode === 200) {
    const file = fs.createWriteStream(iconPath);
    response.pipe(file);
    
    file.on('finish', () => {
      file.close();
      console.log('✅ GIR logo downloaded successfully to public/icon.png');
      console.log('📁 Icon file created for Electron build');
      console.log('');
      console.log('🚀 To build the .exe file, run:');
      console.log('   npm run dist');
      console.log('');
      console.log('📦 This will create a Windows executable with your GIR logo');
    });
  } else {
    console.error('❌ Failed to download logo:', response.statusCode);
  }
}).on('error', (err) => {
  console.error('❌ Error downloading logo:', err.message);
}); 