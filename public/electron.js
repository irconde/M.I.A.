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
let files = [];
const oraExp = /\.ora$/;
const dcsExp = /\.dcs$/;

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
    const result = new Promise((resolve, reject) => {
        dialog
            .showOpenDialog({
                properties: ['openDirectory'],
            })
            .then((dialogResult) => {
                if (
                    dialogResult.canceled === false &&
                    dialogResult.filePaths.length > 0
                ) {
                    if (fs.existsSync(dialogResult.filePaths[0])) {
                        readdir(dialogResult.filePaths[0]).then(
                            (filesResult) => {
                                filesResult.forEach((file) => {
                                    if (validateFileExtension(file) === true) {
                                        files.push(
                                            `${dialogResult.filePaths[0]}\\${file}`
                                        );
                                    }
                                });
                                resolve(dialogResult);
                            }
                        );
                    }
                }
                resolve(dialogResult);
            })
            .catch((err) => reject(err));
    });
    return result;
});
ipcMain.handle(Constants.Channels.getNextFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (files.length > 0) {
            if (fs.existsSync(files[0])) {
                const fileData = fs.readFileSync(files[0]);
                const file = Buffer.from(fileData).toString('base64');
                resolve(file);
            }
        }
    });
    return result;
});

const validateFileExtension = (fileName) => {
    if (oraExp.test(fileName) || dcsExp.test(fileName)) return true;
    else return false;
};
