const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;

function createWindow() {
  try {
    // Create the browser window with frameless style
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      icon: path.join(__dirname, 'icon.png'), // Use GIR logo as icon
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        // Fix focus and cursor issues
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false,
        // Enable better input handling
        spellcheck: false,
        // Improve form interaction
        enableWebSQL: false,
        // Better focus management
        backgroundThrottling: false
      },
      frame: false, // Remove default window frame
      titleBarStyle: 'hidden',
      show: false,
      title: 'GET IT RENDERED'
    });

    // Load the app
    const startUrl = 'https://girbusinesssuitenew.vercel.app/' ;
    
    mainWindow.loadURL(startUrl);

    // Remove titlebar injection to fix focus issues
    // The titlebar was causing focus glitching in forms
    
  } catch (error) {
    console.error('Error creating window:', error);
  }
}

// Create window when app is ready
app.whenReady().then(createWindow).catch(error => {
  console.error('Error in app.whenReady():', error);
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// IPC handlers for file operations
ipcMain.handle('select-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'All Files', extensions: ['*'] },
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
        { name: 'Documents', extensions: ['pdf', 'doc', 'docx'] },
        { name: '3D Models', extensions: ['obj', 'fbx', '3ds', 'dae'] }
      ]
    });
    return result.filePaths;
  } catch (error) {
    console.error('Error in select-file:', error);
    return [];
  }
});

ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });
    return result.filePaths;
  } catch (error) {
    console.error('Error in select-folder:', error);
    return [];
  }
});

ipcMain.handle('save-file', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result.filePath;
  } catch (error) {
    console.error('Error in save-file:', error);
    return null;
  }
});

// Window control handlers
ipcMain.handle('minimize-window', () => {
  mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.handle('close-window', () => {
  mainWindow.close();
});

ipcMain.handle('navigate-home', () => {
  mainWindow.webContents.send('navigate-home');
});

// Remove the default menu completely
Menu.setApplicationMenu(null); 