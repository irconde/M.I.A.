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
let filesOutputted = [];
const oraExp = /\.ora$/;
const dcsExp = /\.dcs$/;

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    mainWindow = new BrowserWindow({
        width,
        height,
        webPreferences: {
            // Node Integration enables the use of the Node.JS File system
            // Disabling Context Isolation allows the renderer process to make calls to Electron to use Node.JS FS
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

/**
 * Channels - Select Directory - A channel between the main process (electron) and the renderer process (react).
 *                               This returns an object with a cancelled value and an array containing the file path
 *                               if selected.
 * @returns {Object<canceled: Boolean; filePaths: Array<String>>}
 */
ipcMain.handle(Constants.Channels.selectDirectory, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        dialog
            .showOpenDialog({
                properties: ['openDirectory'],
            })
            .then((dialogResult) => {
                resolve(dialogResult);
            })
            .catch((err) => reject(err));
    });
    return result;
});

/**
 * Channels - Load Files - Loads the file from the passed in directory via the args parameter
 *
 * @param {String} - Directory location, i.e. D:\images
 * @returns {Promise}
 */
ipcMain.handle(Constants.Channels.loadFiles, async (event, args) => {
    filesOutputted = [];
    const result = await loadFilesFromPath(args);
    return result;
});

/**
 * Channels - Get Next File - Loads the next file if the path provided exists. This function will
 *            ensure that the path exists, if the file names aren't loaded, it will load them. Then,
 *            it will return the Base64 binary string of the next file.
 *
 * @param {String} - File directory path sent from react
 * @returns {Object<file: String('base64'); fileName: String; numberOfFiles: Number>}
 */
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
                    .catch((error) => {
                        reject(error);
                    });
            }
        }
    });
    return result;
});

/**
 * Channels - Save Current File - Occurs when the user clicks next in react. It saves the file the returned path
 *                                of the file path passed in. As well, it moves the file queue ahead to the next file.
 *
 * @param {Object<file: Buffer; fileDirectory: String; fileFormat: String; fileName: String; fileSuffix: String>}
 * @returns {String} Result
 */
ipcMain.handle(Constants.Channels.saveCurrentFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        const returnedFilePath = `${args.fileDirectory}\\returned`;
        if (fs.existsSync(returnedFilePath) === false) {
            fs.mkdirSync(returnedFilePath);
        }
        readdir(returnedFilePath)
            .then((returnedFiles) => {
                const fileIndex = findMaxFileSuffix(
                    args.fileNameSuffix,
                    returnedFiles
                );
                const filePath = generateFileName(
                    args,
                    fileIndex,
                    returnedFilePath
                );
                fs.writeFile(filePath, args.file, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        filesOutputted.push(files.shift());
                        resolve('File saved');
                    }
                });
            })
            .catch((error) => {
                reject(error);
            });
    });
    return result;
});

/**
 * findMaxFileSuffix - Finds the maximum number used in the already saved files in the returned path
 *
 * @param {String} fileNameSuffix
 * @param {Array<String>} returnedFiles
 * @returns {Number}
 */
const findMaxFileSuffix = (fileNameSuffix, returnedFiles) => {
    let result = 0;
    const fileNameSuffixRegExp = new RegExp(fileNameSuffix, 'i');
    returnedFiles.forEach((filePath) => {
        const splitPath = filePath.split('\\');
        const fileName = splitPath[splitPath.length - 1];
        if (fileNameSuffixRegExp.test(fileName)) {
            const numbers = fileName.match(/\d+/g);
            const testNumber = parseInt(numbers[0]);
            if (testNumber > result) result = testNumber;
        }
    });
    return result;
};

/**
 * generateFileName - Uses the passed in arguments to generate a full file path from a file name,
 *                    directory, suffix, and output format.
 *
 * @param {Object<fileSuffix: String; fileFormat: String>} args
 * @param {Number} fileIndex
 * @param {String} returnedFilePath
 * @returns {String}
 */
const generateFileName = (args, fileIndex, returnedFilePath) => {
    let fileName;
    if (args.fileSuffix !== '') {
        fileName = `${fileIndex + 1}${args.fileSuffix}`;
    }
    if (args.fileFormat === Constants.Settings.OUTPUT_FORMATS.ORA) {
        fileName += '.ora';
    } else if (args.fileFormat === Constants.Settings.OUTPUT_FORMATS.ZIP) {
        fileName += '.zip';
    }
    let filePath = `${returnedFilePath}\\${fileName}`;
    return filePath;
};

/**
 * validateFileExtension - Ensures that the file name being passed is in of type .ora or .dcs
 *
 * @param {String} fileName
 * @returns {Boolean}
 */
const validateFileExtension = (fileName) => {
    if (oraExp.test(fileName) || dcsExp.test(fileName)) return true;
    else return false;
};

/**
 * loadFilesFromPath - Will load the files from the passed in path directory, and will validate that
 *                     the files in the directory are of correct type. I.E. .png, .jpg etc. won't be loaded.
 *
 * @param {String} path
 * @returns {Promise}
 */
const loadFilesFromPath = async (path) => {
    const result = new Promise((resolve, reject) => {
        if (fs.existsSync(path)) {
            readdir(path)
                .then((filesResult) => {
                    files = [];
                    filesResult.forEach((file) => {
                        const filePath = `${path}\\${file}`;
                        if (
                            validateFileExtension(file) === true &&
                            filesOutputted.includes(filePath) === false
                        ) {
                            files.push(filePath);
                        }
                    });
                    resolve('files loaded');
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else {
            reject('directory does not exist');
        }
    });
    return result;
};

/**
 * loadFile  - Loads the file from the front of the file queue and returns an object with its data
 *             and information about the file name and number of files in the directory.
 *
 * @returns {Object<file: String('base64'); fileName: String; numberOfFiles: Number>}
 */
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
