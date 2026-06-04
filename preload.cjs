const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkRootCA: () => ipcRenderer.invoke('check-root-ca'),
  installRootCA: () => ipcRenderer.invoke('install-root-ca'),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  generateCerts: (data) => ipcRenderer.invoke('generate-certs', data),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings)
});
