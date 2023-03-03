const electron = require('electron');
const { dialog, ipcMain, app, BrowserWindow, screen } = electron;
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const Constants = require('./Constants');
require('dotenv').config();
const { Channels } = Constants;
let mainWindow;
let appSettings = null;
let annotationColors = [];

const [MONITOR_FILE_PATH, SETTINGS_FILE_PATH, COLORS_FILE_PATH] = [
    'monitorConfig.json',
    'settings.json',
    'colors.json',
].map((fileName) =>
    isDev ? fileName : path.join(app.getPath('userData'), fileName)
);
const {
    default: installExtension,
    REDUX_DEVTOOLS,
    REACT_DEVELOPER_TOOLS,
} = require('electron-devtools-installer');

const { checkIfPathExists } = require('./Utils');
const { ClientFilesManager } = require('./ClientFilesManager');

// If development environment
if (isDev) {
    try {
        require('electron-reloader')(module, {
            watchRenderer: true,
            ignore: ['settings.json', 'monitorConfig.json', 'colors.json'],
        });
    } catch (e) {
        console.log(e);
    }
}
/**
 * @type ClientFilesManager
 */
let files;

function createWindow() {
    let display;
    // check for file containing information about last window location and dimensions
    // if not found, open the window in the primary display
    if (!fs.existsSync(MONITOR_FILE_PATH)) {
        display = screen.getPrimaryDisplay();
    } else {
        try {
            const data = fs.readFileSync(MONITOR_FILE_PATH);
            const rectangle = JSON.parse(data);
            display = screen.getDisplayMatching(rectangle);
        } catch (error) {
            console.log(error);
            display = screen.getPrimaryDisplay();
        }
    }

    mainWindow = new BrowserWindow({
        ...display.bounds,
        icon: path.join(
            __dirname,
            `${process.platform === 'darwin' ? 'icon.icns' : 'icon.ico'}`
        ),
        webPreferences: {
            // Node Integration enables the use of the Node.JS File system
            // Disabling Context Isolation allows the renderer process to make calls to Electron to use Node.JS FS
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev,
        },
    });

    files = new ClientFilesManager(mainWindow, SETTINGS_FILE_PATH);

    mainWindow
        .loadURL(
            isDev
                ? 'http://localhost:3000'
                : `file://${path.join(__dirname, '../build/index.html')}`
        )
        .catch((err) => console.log(err));

    mainWindow.maximize();
    mainWindow.on('close', async () => {
        const rectangle = mainWindow.getBounds();
        fs.writeFile(MONITOR_FILE_PATH, JSON.stringify(rectangle), (err) => {
            if (err) throw err;
        });
    });
    mainWindow.on('closed', async () => {
        await files.removeFileWatcher();
        mainWindow = null;
    });
    if (isDev) {
        installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS]).finally();

        // Open the DevTools.
        mainWindow.webContents.on('did-frame-finish-load', () => {
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

app.whenReady().then(() => {
    initSettings()
        .catch(console.log)
        .finally(() => {
            createWindow();
            files.initSelectedPaths(
                appSettings.selectedImagesDirPath,
                appSettings.selectedAnnotationFile
            );
        });
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

/**
 * A channel between the main process (electron) and the renderer process (react).
 * This returns a string with the selected directory name, or null if the event is cancelled
 * @returns {string | null}
 */
ipcMain.handle(Channels.showFolderPicker, async (event, args) => {
    if (args === Constants.fileType.IMAGES) {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });

        // if the event is cancelled by the user
        if (result.canceled) return null;

        return result.filePaths[0];
    } else if (args === Constants.fileType.ANNOTATIONS) {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
        });

        // if the event is cancelled by the user
        if (result.canceled) return null;

        return result.filePaths[0];
    }
});

/**
 * A channel between the main process (electron) and the renderer process (react).
 * This accepts an object with each property holding a string path to be validated by electron
 * It will return an object with same given keys as pathsObj with a boolean value representing if
 * the particular path exists or not. An example of a returned value is: {imagesPath: true, annotationsPath: false}
 */
ipcMain.handle(Channels.verifyDirectories, async (event, pathsObj) => {
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
});

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Receives an object containing keys of settings updated values. The callback updates
 * the settings file and returns a promise
 */
ipcMain.handle(Channels.saveSettings, async (event, settingsToUpdate) => {
    await updateSettingsJSON({ ...appSettings, ...settingsToUpdate });
    files
        .updateSelectedPaths(
            settingsToUpdate.selectedImagesDirPath,
            settingsToUpdate.selectedAnnotationFile
        )
        .catch(console.log);
});

ipcMain.handle(Channels.saveColorsFile, async (event, colorUpdate) => {
    return await updateColorsJSON(colorUpdate);
});

ipcMain.handle(
    Constants.Channels.saveCurrentFile,
    async (event, newAnnotations) => {
        if (files.selectedAnnotationFile !== '') {
            return await files.updateAnnotationsFile(newAnnotations);
        } else {
            const dialogResult = await dialog.showOpenDialog({
                properties: ['openDirectory'],
                buttonLabel: 'Select folder',
                title: 'Select a folder to save annotations',
            });

            // if the event is cancelled by the user
            if (dialogResult.canceled) return null;

            return await files.createAnnotationsFile(
                dialogResult.filePaths[0],
                newAnnotations
            );
        }
    }
);

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Sends next file data
 */
ipcMain.handle(Channels.getNextFile, () => files.getNextFile());

ipcMain.handle(Channels.getCurrentFile, () =>
    files.getCurrentFile(annotationColors)
);

ipcMain.handle(Channels.selectFile, (e, fileName) =>
    files.selectFile(fileName)
);

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Sends the settings variable to the React process
 */
ipcMain.handle(Channels.getSettings, async () => appSettings);

/**
 * Sends a post request to a Google form and responds to react with a boolean success value
 */
ipcMain.handle(Channels.sentFeedbackHTTP, async (e, data) => {
    const FORM_URL = `https://script.google.com/macros/s/${process.env.GOOGLE_FORM_API_KEY}/exec`;

    try {
        const res = await fetch(FORM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: data,
        });
        if (!res.ok) throw Error(res.statusText);
        else return { success: res.ok };
    } catch (error) {
        return { success: false, error };
    }
});

/**
 * Initializes the global object for the settings from a json file. If the file doesn't exist,
 * then the default settings are used to update the settings object and the json file
 *
 * @returns {Promise<Object>}
 */
const initSettings = async () => {
    const allPromises = [];
    allPromises.push(
        new Promise((resolve, reject) => {
            const { defaultSettings } = Constants;

            if (fs.existsSync(SETTINGS_FILE_PATH)) {
                fs.readFile(SETTINGS_FILE_PATH, (err, data) => {
                    if (err) {
                        appSettings = defaultSettings;
                        reject(err);
                    } else {
                        // if settings already exist
                        appSettings = JSON.parse(data);
                        resolve(appSettings);
                    }
                });
            } else {
                updateSettingsJSON(defaultSettings).then(resolve).catch(reject);
            }
        })
    );

    allPromises.push(
        new Promise((resolve, reject) => {
            if (fs.existsSync(COLORS_FILE_PATH)) {
                fs.readFile(COLORS_FILE_PATH, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        // if colors already exist
                        annotationColors = JSON.parse(data);
                        resolve();
                    }
                });
            } else {
                updateColorsJSON(annotationColors).then(resolve).catch(reject);
            }
        })
    );

    return await Promise.all(allPromises);
};

/**
 * Updates the settings json file, as well as the cached global object for the settings
 *
 * @param {Object} newSettings - object to update the settings with
 * @returns {Promise<Object>}
 */
const updateSettingsJSON = async (newSettings) => {
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

const updateColorsJSON = async (newColors) => {
    return new Promise((resolve, reject) => {
        const colorsString = JSON.stringify(newColors);
        fs.writeFile(COLORS_FILE_PATH, colorsString, (err) => {
            if (err) {
                reject(err);
            } else {
                annotationColors = newColors;
                resolve();
            }
        });
    });
};
