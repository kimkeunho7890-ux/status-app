const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Renderer -> Main
  // 로그인 성공 시 사용자 정보 객체를 보냄
  loginSuccess: (userInfo) => ipcRenderer.send('login-success', userInfo),
  openPopup: (data) => ipcRenderer.send('open-popup', data),

  // Main -> Renderer (단방향)
  onShowPopup: (callback) => ipcRenderer.on('show-popup', (_event, value) => callback(value)),

  // Renderer -> Main (양방향)
  // 사용자 정보 객체를 요청
  getUserInfo: () => ipcRenderer.invoke('get-user-info')
});