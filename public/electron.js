const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const screen = electron.screen;
const dialog = electron.dialog;
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });
    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    );
    mainWindow.maximize();
    mainWindow.on('closed', () => (mainWindow = null));
    if (!isDev) mainWindow.removeMenu();
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

<<<<<<< HEAD
// TODO: Implement constant sharing between React and Electron for channel names
ipcMain.handle('test-message', async (event, args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result;
=======
ipcMain.on('test-message', (event, args) => {
    console.log(args);
    event.reply('test-message', 'pong');
>>>>>>> 75550b6 (Testing of React making a call to the Electron module. Electron module recieves and console logs but the React app, renderer, freezes afterwards.)
});
