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
        backgroundThrottling: false,
        // Additional focus fixes
        offscreen: false,
        // Disable features that interfere with focus
        enableBlinkFeatures: '',
        disableBlinkFeatures: 'Auxclick',
        // Prevent focus stealing
        autoplayPolicy: 'document-user-activation-required'
      },
      frame: false, // Remove default window frame
      titleBarStyle: 'hidden',
      show: false,
      title: 'GET IT RENDERED',
      // Additional window options to prevent focus issues
      focusable: true,
      alwaysOnTop: false,
      skipTaskbar: false,
      // Prevent focus stealing
      autoHideMenuBar: true
    });

    // Load the app
    const startUrl = isDev ? 'http://localhost:3000' : 'https://girbusinesssuitenew.vercel.app/';
    
    mainWindow.loadURL(startUrl);

    // Add simple window controls after page loads
    mainWindow.webContents.on('did-finish-load', () => {
      try {
        const windowControlsScript = `
          // Simple window controls that don't interfere with clicks
          (function() {
            console.log('Adding window controls...');
            
            // Create window controls container
            const controlsContainer = document.createElement('div');
            controlsContainer.id = 'window-controls';
            controlsContainer.style.cssText = \`
              position: fixed;
              top: 8px;
              right: 8px;
              z-index: 9999;
              display: flex;
              background: rgba(31, 41, 55, 0.8);
              border-radius: 6px;
              padding: 4px;
              gap: 2px;
              backdrop-filter: blur(4px);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            \`;
            
            // Minimize button
            const minimizeBtn = document.createElement('button');
            minimizeBtn.innerHTML = '─';
            minimizeBtn.style.cssText = \`
              width: 28px;
              height: 28px;
              background: transparent;
              color: #d1d5db;
              border: none;
              cursor: pointer;
              font-size: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s;
              border-radius: 4px;
            \`;
            minimizeBtn.onmouseover = () => {
              minimizeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            minimizeBtn.onmouseout = () => {
              minimizeBtn.style.background = 'transparent';
            };
            minimizeBtn.onclick = () => {
              if (window.electronAPI) {
                window.electronAPI.minimizeWindow();
              }
            };
            
            // Maximize button
            const maximizeBtn = document.createElement('button');
            maximizeBtn.innerHTML = '□';
            maximizeBtn.style.cssText = minimizeBtn.style.cssText;
            maximizeBtn.onmouseover = () => {
              maximizeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            maximizeBtn.onmouseout = () => {
              maximizeBtn.style.background = 'transparent';
            };
            maximizeBtn.onclick = () => {
              if (window.electronAPI) {
                window.electronAPI.maximizeWindow();
              }
            };
            
            // Close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = minimizeBtn.style.cssText;
            closeBtn.onmouseover = () => {
              closeBtn.style.background = 'rgba(239, 68, 68, 0.8)';
              closeBtn.style.color = 'white';
            };
            closeBtn.onmouseout = () => {
              closeBtn.style.background = 'transparent';
              closeBtn.style.color = '#d1d5db';
            };
            closeBtn.onclick = () => {
              if (window.electronAPI) {
                window.electronAPI.closeWindow();
              }
            };
            
            // Add buttons to container
            controlsContainer.appendChild(minimizeBtn);
            controlsContainer.appendChild(maximizeBtn);
            controlsContainer.appendChild(closeBtn);
            
            // Add to page
            document.body.appendChild(controlsContainer);
            
            console.log('Window controls added successfully');
          })();
        `;
        
        mainWindow.webContents.executeJavaScript(windowControlsScript);
      } catch (error) {
        console.error('Error adding window controls:', error);
      }
    });

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.focus();
    });
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    
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