const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const server = require('./server'); 

let loginWindow;
let dashboardWindow;
let adminWindow;
let currentUser;

const SERVER_URL = 'https://status-app-server.onrender.com/';

function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  loginWindow.loadURL(SERVER_URL);
}

function createDashboardWindow() {
    dashboardWindow = new BrowserWindow({
    width: 180, // <<-- 창 폭을 180으로 수정
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  dashboardWindow.loadURL(`${SERVER_URL}/dashboard.html`);
  
  dashboardWindow.on('closed', () => {
    app.quit();
  });
}

// ... 이하 나머지 코드는 이전과 동일합니다 ...
function createAdminWindow() {
    adminWindow = new BrowserWindow({
        width: 600,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    adminWindow.loadURL(`${SERVER_URL}/admin.html`);
    adminWindow.on('closed', () => {
      app.quit();
    });
}
function createPopup(data) {
    const popup = new BrowserWindow({
        width: 500,
        height: 300,
        frame: false, 
        transparent: true, 
        alwaysOnTop: true, 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    popup.loadFile(path.join(__dirname, 'public/popup.html'));
    popup.webContents.on('did-finish-load', () => {
        popup.webContents.send('show-popup', data);
    });
}
app.whenReady().then(() => {
  createLoginWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createLoginWindow();
  });
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
ipcMain.on('login-success', (event, userInfo) => {
    currentUser = userInfo;
    if (loginWindow) loginWindow.close();
    if (userInfo.isAdmin) {
        createAdminWindow();
    } else {
        createDashboardWindow();
    }
});
ipcMain.handle('get-user-info', async (event) => {
    return currentUser;
});
ipcMain.on('open-popup', (event, data) => {
    createPopup(data);

});
