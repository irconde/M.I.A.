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
let fileSavedCounter = 1;

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
                    loadFilesFromPath(dialogResult.filePaths[0]);
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
                resolve(loadFile());
            }
        } else {
            if (fs.existsSync(args)) {
                loadFilesFromPath(args)
                    .then(() => {
                        if (files.length > 0) {
                            resolve(loadFile());
                        } else {
                            reject('No files loaded');
                        }
                    })
                    .catch(() => {
                        reject('No such directory');
                    });
            }
        }
    });
    return result;
});

ipcMain.handle(Constants.Channels.saveCurrentFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        let fileName;
        if (args.fileSuffix !== '') {
            fileName = `${fileSavedCounter}${args.fileSuffix}`;
        } else {
            fileName = args.fileName;
        }
        if (args.fileFormat === Constants.Settings.OUTPUT_FORMATS.ORA) {
            fileName += '.ora';
        } else if (args.fileFormat === Constants.Settings.OUTPUT_FORMATS.ZIP) {
            fileName += '.zip';
        }
        let filePath = `${args.fileDirectory}\\${fileName}`;
        fs.writeFile(filePath, args.file, (error) => {
            if (error) {
                reject(error);
            } else {
                fileSavedCounter++;
                resolve('File saved');
            }
        });
    });
    return result;
});

const validateFileExtension = (fileName) => {
    if (oraExp.test(fileName) || dcsExp.test(fileName)) return true;
    else return false;
};

const loadFilesFromPath = async (path) => {
    const result = new Promise((resolve, reject) => {
        if (fs.existsSync(path)) {
            readdir(path).then((filesResult) => {
                filesResult.forEach((file) => {
                    if (validateFileExtension(file) === true) {
                        files.push(`${path}\\${file}`);
                    }
                });
                resolve();
            });
        } else {
            reject();
        }
    });
    return result;
};

const loadFile = () => {
    const fileData = fs.readFileSync(files[0]);
    const file = Buffer.from(fileData).toString('base64');
    const splitPath = files[0].split('\\');
    const fileName = splitPath[splitPath.length - 1];
    const result = {
        file: file,
        fileName: fileName,
        numberOfFiles: files.length,
    };
    return result;
};
