const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFile: async () => {
    try {
      return await ipcRenderer.invoke('select-file');
    } catch (error) {
      console.error('Error in selectFile:', error);
      return [];
    }
  },
  
  selectFolder: async () => {
    try {
      return await ipcRenderer.invoke('select-folder');
    } catch (error) {
      console.error('Error in selectFolder:', error);
      return [];
    }
  },
  
  saveFile: async (options) => {
    try {
      return await ipcRenderer.invoke('save-file', options);
    } catch (error) {
      console.error('Error in saveFile:', error);
      return null;
    }
  },
  
  // Menu events
  onNewProject: (callback) => {
    try {
      ipcRenderer.on('new-project', callback);
    } catch (error) {
      console.error('Error in onNewProject:', error);
    }
  },
  
  onOpenProject: (callback) => {
    try {
      ipcRenderer.on('open-project', callback);
    } catch (error) {
      console.error('Error in onOpenProject:', error);
    }
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    try {
      ipcRenderer.removeAllListeners(channel);
    } catch (error) {
      console.error('Error in removeAllListeners:', error);
    }
  }
});

// Disable security warnings for development
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'; 