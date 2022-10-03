const electron = require('electron');
const { dialog, ipcMain, app, BrowserWindow, screen } = electron;
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const util = require('util');
const Constants = require('./Constants');
let mainWindow;
let appSettings = null;
let watcher = null;
let currentPath = '';
const MONITOR_FILE_PATH = isDev
    ? 'monitorConfig.json'
    : path.join(app.getPath('userData'), 'monitorConfig.json');
const SETTINGS_FILE_PATH = isDev
    ? 'settings.json'
    : path.join(app.getPath('userData'), 'settings.json');
const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer');

// If development environment
if (isDev) {
    try {
        require('electron-reloader')(module, {
            watchRenderer: true,
            ignore: ['settings.json', 'monitorConfig.json'],
        });
    } catch (e) {
        console.log(e);
    }
}

function createWindow() {
    let display;
    // check for file containing information about last window location and dimensions
    // if not found, open the window in the primary display
    if (!fs.existsSync(MONITOR_FILE_PATH)) {
        display = screen.getPrimaryDisplay();
    } else {
        const data = fs.readFileSync(MONITOR_FILE_PATH);
        const rectangle = JSON.parse(data);
        display = screen.getDisplayMatching(rectangle);
    }

    mainWindow = new BrowserWindow({
        ...display.bounds,
        webPreferences: {
            // Node Integration enables the use of the Node.JS File system
            // Disabling Context Isolation allows the renderer process to make calls to Electron to use Node.JS FS
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev,
        },
    });
    mainWindow
        .loadURL(
            isDev
                ? 'http://localhost:3000'
                : `file://${path.join(__dirname, '../build/index.html')}`
        )
        .then(() => {
            initSettings().catch(console.log);
        })
        .catch((err) => console.log(err));

    mainWindow.maximize();
    mainWindow.on('close', async () => {
        const rectangle = mainWindow.getBounds();
        fs.writeFile(MONITOR_FILE_PATH, JSON.stringify(rectangle), (err) => {
            if (err) throw err;
        });
    });
    mainWindow.on('closed', async () => {
        await watcher?.unwatch(currentPath);
        await watcher?.close();
        mainWindow = null;
    });
    if (isDev) {
        installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
            .then((name) => console.log(`Added Extension:  ${name}`))
            .catch((err) => console.log('An error occurred: ', err));

        // Open the DevTools.
        mainWindow.webContents.on('did-frame-finish-load', () => {
            // We close the DevTools so that it can be reopened and redux reconnected.
            // This is a workaround for a bug in redux devtools.
            mainWindow.webContents.closeDevTools();

            mainWindow.webContents.once('devtools-opened', () => {
                mainWindow.focus();
            });

            mainWindow.webContents.openDevTools();
        });
    } else {
        mainWindow.removeMenu();
    }
}

app.on('ready', createWindow);

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

/**
 * A channel between the main process (electron) and the renderer process (react).
 * This returns a string with the selected directory name, or null if the event is cancelled
 * @returns {string | null}
 */
ipcMain.handle(Constants.Channels.showFolderPicker, async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });

    // if the event is cancelled by the user
    if (result.canceled) return null;

    return result.filePaths[0];
});

/**
 * A channel between the main process (electron) and the renderer process (react).
 * This accepts an object with each property holding a string path to be validated by electron
 * It will return an object with same given keys as pathsObj with a boolean value representing if
 * the particular path exists or not. An example of a returned value is: {imagesPath: true, annotationsPath: false}
 */
ipcMain.handle(
    Constants.Channels.verifyDirectories,
    async (event, pathsObj) => {
        const promises = [];
        for (const key in pathsObj) {
            promises.push(checkIfPathExists(pathsObj[key]));
        }
        const response = await Promise.allSettled(promises);
        const result = {};
        const keys = Object.keys(pathsObj);
        for (let i = 0; i < keys.length; i++) {
            result[keys[i]] = response[i].status === 'fulfilled';
        }

        return result;
    }
);

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Receives an object containing keys of settings updated values. The callback updates
 * the settings file and returns a promise
 */
ipcMain.handle(
    Constants.Channels.saveSettings,
    async (event, settingsToUpdate) => {
        return updateSettings({ ...appSettings, ...settingsToUpdate });
    }
);

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Sends the settings variable to the React process
 */
ipcMain.handle(Constants.Channels.getSettings, async (event) => {
    return appSettings;
});

/**
 * Checks if a path exists
 *
 * @param {string} path
 * @returns {Promise<undefined>}
 */
const checkIfPathExists = async (path) => {
    return new Promise((resolve, reject) => {
        fs.access(path, (err) => {
            err ? reject() : resolve();
        });
    });
};

/**
 * Initializes the global object for the settings from a json file. If the file doesn't exist,
 * then the default settings are used to update the settings object and the json file
 *
 * @returns {Promise<Object>}
 */
const initSettings = async () => {
    return new Promise((resolve, reject) => {
        const { defaultSettings } = Constants;
        fs.readFile(SETTINGS_FILE_PATH, (err, data) => {
            if (err?.code === 'ENOENT') {
                updateSettings(defaultSettings).then(resolve).catch(reject);
            } else if (err) {
                appSettings = defaultSettings;
                reject(err);
            } else {
                appSettings = JSON.parse(data);
                resolve(appSettings);
            }
        });
    });
};

/**
 * Updates the settings json file, as well as the cached global object for the settings
 *
 * @param {Object} newSettings - object to update the settings with
 * @returns {Promise<Object>}
 */
const updateSettings = async (newSettings) => {
    return new Promise((resolve, reject) => {
        const settingsString = JSON.stringify(newSettings);
        fs.writeFile(SETTINGS_FILE_PATH, settingsString, (err) => {
            if (err) {
                reject(err);
            } else {
                appSettings = newSettings;
                resolve(newSettings);
            }
        });
    });
};
