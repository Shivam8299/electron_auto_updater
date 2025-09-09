
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateMessage: (callback) => ipcRenderer.on('update-message', (event, data) => callback(data))
});
