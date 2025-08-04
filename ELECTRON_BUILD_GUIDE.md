# Electron Build Guide - GET IT RENDERED Project Manager

This guide will help you build the GET IT RENDERED Project Manager as a Windows executable (.exe) with your GIR logo.

## Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git (for version control)

## Step 1: Download the GIR Logo

First, let's download your GIR logo and set it up as the application icon:

```bash
npm run setup-electron
```

This will:
- Download your GIR logo from the provided URL
- Save it as `public/icon.png`
- Set it up for use in the Electron build

## Step 2: Install Dependencies

If you haven't already, install all the required dependencies:

```bash
npm install
```

## Step 3: Build the Application

### For Windows (.exe file):
```bash
npm run dist-win
```

### For all platforms:
```bash
npm run dist
```

## Step 4: Find Your Executable

After the build completes successfully, you'll find your executable in:
- **Windows**: `dist/GET IT RENDERED - Project Manager Setup.exe`
- **Mac**: `dist/GET IT RENDERED - Project Manager.dmg`
- **Linux**: `dist/GET IT RENDERED - Project Manager.AppImage`

## Build Configuration

The application is configured with:

### Application Details:
- **Name**: GET IT RENDERED - Project Manager
- **Icon**: Your GIR logo (downloaded automatically)
- **Version**: 1.0.0
- **App ID**: com.gir.projectmanager

### Windows Installer Features:
- Custom installation directory selection
- Desktop shortcut creation
- Start menu shortcut creation
- Professional installer with your GIR branding

### Window Configuration:
- **Size**: 1400x900 (minimum 1200x800)
- **Title**: GET IT RENDERED - Project Manager
- **Icon**: Your GIR logo displayed in taskbar and window

## Development Commands

### Run in Development Mode:
```bash
npm run electron-dev
```

This will:
1. Start the React development server
2. Launch Electron with hot reload
3. Open DevTools for debugging

### Build for Production:
```bash
npm run build
```

### Package Electron App:
```bash
npm run electron-pack
```

## Troubleshooting

### Common Issues:

1. **Icon not showing**: Make sure `public/icon.png` exists
   ```bash
   npm run download-icon
   ```

2. **Build fails**: Clear node_modules and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Electron not found**: Install Electron globally
   ```bash
   npm install -g electron
   ```

4. **Permission errors on Windows**: Run as Administrator

### Build Logs:
- Check the console output for detailed error messages
- Look for any missing dependencies or file paths
- Ensure all required files are in the correct locations

## File Structure

```
girbusinesssuite/
├── public/
│   ├── electron.js          # Main Electron process
│   ├── preload.js           # Preload script
│   ├── icon.png             # Your GIR logo
│   └── index.html           # Main HTML file
├── src/                     # React application source
├── package.json             # Project configuration
├── download-icon.js         # Icon download script
└── dist/                    # Built executables (after build)
```

## Customization

### Change Application Name:
Edit `package.json`:
```json
{
  "build": {
    "productName": "Your Custom Name"
  }
}
```

### Change Icon:
1. Replace `public/icon.png` with your new icon
2. Make sure it's a high-quality PNG (256x256 or larger)

### Change Window Size:
Edit `public/electron.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,    // Change width
  height: 1000,   // Change height
  // ... other options
});
```

## Distribution

### Windows:
- The `.exe` file is self-contained
- Users can install it like any other Windows application
- No additional dependencies required

### Installation:
1. Run the `.exe` file
2. Choose installation directory
3. Desktop and Start Menu shortcuts will be created
4. Launch the application

## Security Notes

- The application uses context isolation for security
- Node.js integration is disabled
- Only necessary IPC handlers are exposed
- File system access is limited to user-selected files

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Ensure all dependencies are installed
3. Verify the icon file exists and is valid
4. Try rebuilding from scratch

---

**Built with ❤️ for GET IT RENDERED** 