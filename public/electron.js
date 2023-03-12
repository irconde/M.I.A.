const electron = require('electron');
const { dialog, ipcMain, app, BrowserWindow, screen, globalShortcut } =
    electron;
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const Constants = require('./Constants');
const fetch = require('electron-fetch').default;

const { Channels } = Constants;
let mainWindow;
let appSettings = null;
let annotationColors = [];

const [
    MONITOR_FILE_PATH,
    SETTINGS_FILE_PATH,
    COLORS_FILE_PATH,
    TEMP_ANNOTATIONS_FILE_PATH,
] = [
    'monitorConfig.json',
    'settings.json',
    'colors.json',
    'tempAnnotations.json',
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
            ignore: [
                'settings.json',
                'monitorConfig.json',
                'colors.json',
                'tempAnnotations.json',
            ],
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
        const data = fs.readFileSync(MONITOR_FILE_PATH);
        try {
            const rectangle = JSON.parse(data);
            display = screen.getDisplayMatching(rectangle);
        } catch (e) {
            console.log(e);
            display = screen.getPrimaryDisplay();
        }
    }

    mainWindow = new BrowserWindow({
        ...display.bounds,
        icon: path.join(
            __dirname,
            `${process.platform === 'darwin' ? 'icon.icns' : 'icon.ico'}`
        ),
        ...display?.bounds,
        backgroundColor: '#3a3a3a',
        show: false,
        webPreferences: {
            // Node Integration enables the use of the Node.JS File system
            // Disabling Context Isolation allows the renderer process to make calls to Electron to use Node.JS FS
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev,
        },
    });

    files = new ClientFilesManager(
        mainWindow,
        SETTINGS_FILE_PATH,
        TEMP_ANNOTATIONS_FILE_PATH
    );
    files.initSelectedPaths(
        appSettings.selectedImagesDirPath,
        appSettings.selectedAnnotationFile
    );

    const loadWindowContent = () => {
        mainWindow
            .loadURL(
                isDev
                    ? 'http://localhost:3000'
                    : `file://${path.join(__dirname, '../build/index.html')}`
            )
            .then(() => {
                mainWindow.maximize();
                mainWindow.show();
            })
            .catch((err) => {
                console.log(err);
            });

        mainWindow.on('close', (e) => {
            e.preventDefault();
            mainWindow.webContents.send(Channels.closeApp);
        });
    };

    if (isDev) {
        installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], {
            forceDownload: true,
        }).finally(loadWindowContent);

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
        loadWindowContent();
    }
}

app.whenReady().then(() => {
    initSettings()
        .catch(console.log)
        .finally(() => {
            createWindow();
        });
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('web-contents-created', () => {
    const writeStream = fs.createWriteStream(TEMP_ANNOTATIONS_FILE_PATH);
    writeStream.on('error', (err) => {
        console.log(err);
    });
    writeStream.on('finish', () => {
        console.log('Cleared temp data on startup');
    });
    writeStream.write(JSON.stringify([]));
    writeStream.end();
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

const closeAndRemoveListeners = async (mainWindow) => {
    return new Promise((resolve) => {
        mainWindow.removeAllListeners();
        globalShortcut.unregisterAll();
        files
            .removeFileWatcher()
            .catch((err) => {
                console.log(`Error removing file watcher: ${err}`);
            })
            .finally(() => {
                mainWindow.removeAllListeners();
                globalShortcut.unregisterAll();
                mainWindow.close();
                mainWindow = null;
                resolve();
            });
    });
};

ipcMain.handle(Channels.closeApp, async (event, data) => {
    return new Promise((resolve, reject) => {
        const rectangle = mainWindow.getBounds();
        fs.writeFile(MONITOR_FILE_PATH, JSON.stringify(rectangle), (err) => {
            if (err) {
                console.log(`Error saving file: ${err}`);
            }

            // Annotation saving
            if (files.selectedAnnotationFile !== '') {
                files
                    .updateAnnotationsFile(data, true)
                    .catch((err) => console.log(err))
                    .finally(() => {
                        closeAndRemoveListeners(mainWindow).finally(() =>
                            resolve()
                        );
                    });
            } else {
                const { cocoAnnotations } = data;
                if (cocoAnnotations?.length > 0) {
                    dialog
                        .showOpenDialog({
                            properties: ['openDirectory'],
                            buttonLabel: 'Select folder',
                            title: 'Select a folder to save annotations',
                        })
                        .then((dialogResult) => {
                            // if the event is cancelled by the user
                            if (dialogResult.canceled === false) {
                                files
                                    .createAnnotationsFile(
                                        dialogResult.filePaths[0],
                                        data,
                                        true
                                    )
                                    .catch((err) => console.log(err))
                                    .finally(() => {
                                        closeAndRemoveListeners(
                                            mainWindow
                                        ).finally(() => resolve());
                                    });
                            } else {
                                return reject();
                            }
                        })
                        .catch((err) => console.log(err));
                } else {
                    closeAndRemoveListeners(mainWindow).finally(() =>
                        resolve()
                    );
                }
            }
        });
    });
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
            const dialogResult = await dialog.showSaveDialog({
                title: 'Save new annotations to file',
            });

            // if the event is cancelled by the user
            if (dialogResult.canceled) throw new Error('Cancelled');
            mainWindow.webContents.send(Channels.updateSaveModalStatus, true);

            return await files.createAnnotationsFile(
                dialogResult.filePath,
                newAnnotations
            );
        }
    }
);

ipcMain.handle(
    Constants.Channels.saveAsCurrentFile,
    async (event, newAnnotations) => {
        const dialogResult = await dialog.showSaveDialog({
            title: 'Save new annotations to file',
        });

        // if the event is cancelled by the user
        if (dialogResult.canceled) throw new Error('Cancelled');
        mainWindow.webContents.send(Channels.updateSaveModalStatus, true);

        try {
            return await files.createAnnotationsFile(
                dialogResult.filePath,
                newAnnotations
            );
        } catch (e) {
            console.log(e);
        }
    }
);

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Sends next file data
 */
ipcMain.handle(Channels.getNextFile, () => files.getNextFile());

ipcMain.handle(Channels.getCurrentFile, async () => {
    return await files.getCurrentFile(annotationColors);
});

ipcMain.handle(Channels.selectFile, async (e, args) => {
    return new Promise((resolve, reject) => {
        try {
            const {
                fileName,
                cocoAnnotations,
                cocoCategories,
                cocoDeleted,
                tempFileName,
                imageId,
            } = args;

            files
                .createUpdateTempAnnotationsFile(
                    cocoAnnotations,
                    cocoCategories,
                    cocoDeleted,
                    tempFileName,
                    imageId,
                    TEMP_ANNOTATIONS_FILE_PATH
                )
                .then(() => {
                    files
                        .selectFile(fileName)
                        .then(() => resolve())
                        .catch((e) => {
                            console.log(e);
                            reject(e);
                        });
                })
                .catch((e) => {
                    console.log(e);
                    reject(e);
                });
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
});

/**
 * A channel between the main process (electron) and the renderer process (react).
 * Sends the settings variable to the React process
 */
ipcMain.handle(Channels.getSettings, async () => appSettings);

/**
 * Sends a post request to a Google form and responds to react with a boolean success value
 */
ipcMain.handle(Channels.sentFeedbackHTTP, async (e, data) => {
    const FORM_URL = `https://script.google.com/macros/s/AKfycbzlhA1q21UnuKDTkIqm7iZ-yKmAHCRmoUUTdKATipwV62ih9CZWCbP6tLaRc5c6F_T7Qg/exec`;

    try {
        const res = await fetch(FORM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                redirect: 'follow',
            },
            body: data,
        });
        if (res.ok) {
            return {
                success: res.ok,
            };
        } else {
            let errorMessage;
            switch (res.status) {
                case 401:
                case 403:
                    errorMessage =
                        'Internal error. Try again in a few moments.';
                    break;
                case 404:
                    errorMessage =
                        'The server is not responding properly at the moment. Could you try to send the message again in a few minutes?';
                    break;
                default:
                    errorMessage =
                        'The message could not be sent at the moment. Could you try it again in a few minutes?';
                    break;
            }
            return { success: false, error: errorMessage };
        }
    } catch (error) {
        return { success: false, error: error.message };
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
                        let rewriteSettings = false;
                        if (
                            appSettings.selectedImagesDirPath !== '' &&
                            !fs.existsSync(appSettings.selectedImagesDirPath)
                        ) {
                            appSettings.selectedImagesDirPath = '';
                            rewriteSettings = true;
                        }
                        if (
                            appSettings.selectedAnnotationFile !== '' &&
                            !fs.existsSync(appSettings.selectedAnnotationFile)
                        ) {
                            appSettings.selectedAnnotationFile = '';
                            rewriteSettings = true;
                        }

                        if (rewriteSettings) {
                            const writeStream =
                                fs.createWriteStream(SETTINGS_FILE_PATH);
                            writeStream.on('error', (err) => {
                                console.log(err);
                                reject(err);
                            });
                            writeStream.on('finish', () => {
                                console.log(
                                    'Re-saved settings due to one of the paths not existing'
                                );
                                resolve();
                            });
                            writeStream.write(JSON.stringify(appSettings));
                            writeStream.end();
                        } else {
                            resolve(appSettings);
                        }
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
