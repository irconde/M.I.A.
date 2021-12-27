const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const screen = electron.screen;
const dialog = electron.dialog;
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const Constants = require('./Constants');

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

ipcMain.handle(Constants.Channels.selectDirectory, async (event, args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result;
});
ipcMain.handle(Constants.Channels.getNextFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (fs.existsSync(args)) {
            const filePath = `${args}\\1_img.ora`;
            const fileData = fs.readFileSync(filePath);
            const file = Buffer.from(fileData).toString('base64');
            resolve(file);
            // readdir(args).then((result) => {
            //     const files = result;
            //     console.log(files);
            //     console.log(files.length);
            //     resolve();
            // });
        }
    });
    return result;
});
