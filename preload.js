const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer -> Main
  loginSuccess: (userInfo) => ipcRenderer.send('login-success', userInfo),
  openPopup: (data) => ipcRenderer.send('open-popup', data),

  // Main -> Renderer (단방향)
  onShowPopup: (callback) => ipcRenderer.on('show-popup', (_event, value) => callback(value)),

  // Renderer -> Main (양방향)
  getUserInfo: () => ipcRenderer.invoke('get-user-info')
});