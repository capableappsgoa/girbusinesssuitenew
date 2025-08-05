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

    // Add comprehensive focus management after page loads
    mainWindow.webContents.on('did-finish-load', () => {
      try {
        // Inject focus management script
        const focusScript = `
          // Comprehensive focus management for remote app
          (function() {
            console.log('Injecting focus management script...');
            
            // Remove any existing focus event listeners
            const removeExistingListeners = () => {
              const inputs = document.querySelectorAll('input, textarea, select, [contenteditable]');
              inputs.forEach(input => {
                input.removeEventListener('focus', input._focusHandler);
                input.removeEventListener('blur', input._blurHandler);
                input.removeEventListener('click', input._clickHandler);
                input.removeEventListener('mousedown', input._mousedownHandler);
              });
            };
            
            // Add proper focus handlers
            const addFocusHandlers = () => {
              const inputs = document.querySelectorAll('input, textarea, select, [contenteditable]');
              inputs.forEach(input => {
                // Store handlers to avoid duplicates
                input._focusHandler = function(e) {
                  e.stopPropagation();
                  this.style.outline = '2px solid #3b82f6';
                  this.style.outlineOffset = '2px';
                };
                
                input._blurHandler = function(e) {
                  this.style.outline = '';
                  this.style.outlineOffset = '';
                };
                
                input._clickHandler = function(e) {
                  e.stopPropagation();
                  setTimeout(() => {
                    this.focus();
                    if (this.tagName === 'INPUT' && this.type !== 'file') {
                      this.select();
                    }
                  }, 10);
                };
                
                input._mousedownHandler = function(e) {
                  e.stopPropagation();
                  setTimeout(() => {
                    this.focus();
                  }, 5);
                };
                
                // Add event listeners
                input.addEventListener('focus', input._focusHandler, true);
                input.addEventListener('blur', input._blurHandler, true);
                input.addEventListener('click', input._clickHandler, true);
                input.addEventListener('mousedown', input._mousedownHandler, true);
              });
            };
            
            // Initial setup
            removeExistingListeners();
            addFocusHandlers();
            
            // Watch for dynamic content changes
            const observer = new MutationObserver(function(mutations) {
              let shouldReapply = false;
              mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                  if (node.nodeType === 1) { // Element node
                    if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' || node.tagName === 'SELECT' || node.hasAttribute('contenteditable')) {
                      shouldReapply = true;
                    }
                    if (node.querySelectorAll) {
                      const inputs = node.querySelectorAll('input, textarea, select, [contenteditable]');
                      if (inputs.length > 0) {
                        shouldReapply = true;
                      }
                    }
                  }
                });
              });
              
              if (shouldReapply) {
                setTimeout(() => {
                  removeExistingListeners();
                  addFocusHandlers();
                }, 100);
              }
            });
            
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
            
            // Handle window focus events
            window.addEventListener('focus', function() {
              setTimeout(() => {
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'SELECT')) {
                  document.activeElement.focus();
                }
              }, 50);
            });
            
            // Prevent form interference
            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                e.stopPropagation();
              }
            }, true);
            
            console.log('Focus management script injected successfully');
          })();
        `;
        
        mainWindow.webContents.executeJavaScript(focusScript);
        
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
        console.error('Error injecting focus script:', error);
      }
    });
    
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