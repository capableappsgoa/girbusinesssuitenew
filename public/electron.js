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

    // Add proper title bar after page loads
    mainWindow.webContents.on('did-finish-load', () => {
      try {
        const titleBarScript = `
          // Proper title bar with web content clickable
          (function() {
            console.log('Adding title bar...');
            
            // Create title bar container
            const titleBar = document.createElement('div');
            titleBar.id = 'electron-titlebar';
            titleBar.style.cssText = \`
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 32px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0 8px;
              z-index: 9999;
              -webkit-app-region: drag;
              user-select: none;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            \`;
            
            // Create left side with app title
            const leftSection = document.createElement('div');
            leftSection.style.cssText = \`
              display: flex;
              align-items: center;
              gap: 8px;
              -webkit-app-region: drag;
            \`;
            
            // App title
            const appTitle = document.createElement('span');
            appTitle.textContent = 'GET IT RENDERED';
            appTitle.style.cssText = \`
              color: white;
              font-size: 12px;
              font-weight: 600;
              letter-spacing: 0.5px;
            \`;
            
            leftSection.appendChild(appTitle);
            
            // Create right side with window controls
            const rightSection = document.createElement('div');
            rightSection.style.cssText = \`
              display: flex;
              align-items: center;
              gap: 4px;
              -webkit-app-region: no-drag;
            \`;
            
            // Minimize button
            const minimizeBtn = document.createElement('button');
            minimizeBtn.innerHTML = '─';
            minimizeBtn.style.cssText = \`
              background: transparent;
              color: white;
              border: none;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 14px;
              transition: background-color 0.2s;
              border-radius: 4px;
              -webkit-app-region: no-drag;
            \`;
            minimizeBtn.onmouseover = () => {
              minimizeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
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
              maximizeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
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
            };
            closeBtn.onmouseout = () => {
              closeBtn.style.background = 'transparent';
            };
            closeBtn.onclick = () => {
              if (window.electronAPI) {
                window.electronAPI.closeWindow();
              }
            };
            
            rightSection.appendChild(minimizeBtn);
            rightSection.appendChild(maximizeBtn);
            rightSection.appendChild(closeBtn);
            
            // Assemble title bar
            titleBar.appendChild(leftSection);
            titleBar.appendChild(rightSection);
            
            // Add title bar to page
            document.body.insertBefore(titleBar, document.body.firstChild);
            
            // Adjust body padding to account for title bar
            document.body.style.paddingTop = '32px';
            
            // Make web content clickable and draggable
            const webContent = document.body;
            webContent.style.cssText += \`
              -webkit-app-region: no-drag;
              cursor: default;
            \`;
            
            // Allow specific elements to be draggable (like the title bar area)
            const makeDraggable = (element) => {
              element.style.cssText += \`
                -webkit-app-region: drag;
              \`;
            };
            
            // Make buttons and interactive elements non-draggable
            const makeNonDraggable = (element) => {
              element.style.cssText += \`
                -webkit-app-region: no-drag;
              \`;
            };
            
            // Apply to existing elements
            const buttons = document.querySelectorAll('button, a, input, textarea, select, [role="button"]');
            buttons.forEach(makeNonDraggable);
            
            // Watch for new elements
            const observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                  if (node.nodeType === 1) { // Element node
                    const newButtons = node.querySelectorAll ? node.querySelectorAll('button, a, input, textarea, select, [role="button"]') : [];
                    newButtons.forEach(makeNonDraggable);
                  }
                });
              });
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            console.log('Title bar added successfully with web content clickable');
          })();
        `;
        
        mainWindow.webContents.executeJavaScript(titleBarScript);
      } catch (error) {
        console.error('Error adding title bar:', error);
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