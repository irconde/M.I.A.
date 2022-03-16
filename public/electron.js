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
const Utils = require('./Utils');
const fsWin = require('fswin');
const JSZip = require('jszip');
const parseString = require('xml2js').parseString;
const sharp = require('sharp');
const dicomParser = require('dicom-parser');
const joinImages = require('join-images');

let mainWindow;
let files = [];
let thumbnails = [];
let thumbnailPath = '';
let currentFileIndex = 0;
const oraExp = /\.ora$/;
const dcsExp = /\.dcs$/;
const pngExp = /\.png$/;

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
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
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
    currentFileIndex = 0;
    const result = await loadFilesFromPath(args);
    return result;
});

/**
 * Channels - Get Next File - Loads the next file if the path provided exists. This function will
 *            ensure that the path exists, if the file names aren't loaded, it will load them. Then,
 *            it will return the Base64 binary string of the next file.
 *
 * @param {String} - File directory path sent from react
 * @returns {Object<file: String('base64'); fileName: String; numberOfFiles: Number; thumbnails: Array<String>>}
 */
ipcMain.handle(Constants.Channels.getNextFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (files.length > 0 && currentFileIndex < files.length) {
            if (fs.existsSync(files[currentFileIndex])) {
                resolve(loadFile(files[currentFileIndex]));
            }
        } else if (files.length !== 0 && currentFileIndex >= files.length) {
            reject('End of queue');
        } else {
            if (fs.existsSync(args)) {
                loadFilesFromPath(args)
                    .then(() => {
                        if (files.length > 0) {
                            resolve(loadFile(files[currentFileIndex]));
                        } else {
                            reject('No files loaded');
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else {
                reject('Path does not exist');
            }
        }
    });
    return result;
});

/**
 * Channels - Get Specific File - Loads the specified file if the path provided exists. If so it will
 *                                it will load the file and then, it will return the Base64 binary string of the next file.
 *                                Along with other information about the file and other files in the path.
 *
 * @param {String} - File path sent from react
 * @returns {Object<file: String('base64'); fileName: String; numberOfFiles: Number; thumbnails: Array<String>>}
 */
ipcMain.handle(Constants.Channels.getSpecificFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (fs.existsSync(args)) {
            currentFileIndex = files.findIndex((filePath) => filePath === args);
            resolve(loadFile(args));
        } else {
            reject('File path does not exist');
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
        let returnedFilePath;
        if (process.platform === 'win32') {
            returnedFilePath = `${args.fileDirectory}\\returned`;
        } else {
            returnedFilePath = `${args.fileDirectory}/returned`;
        }
        if (fs.existsSync(returnedFilePath) === false) {
            fs.mkdirSync(returnedFilePath);
        }
        readdir(returnedFilePath)
            .then((returnedFiles) => {
                const fileIndex = findMaxFileSuffix(
                    args.fileSuffix,
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
                        currentFileIndex++;
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
        let splitPath;
        if (process.platform === 'win32') {
            splitPath = filePath.split('\\');
        } else {
            splitPath = filePath.split('/');
        }
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
    if (process.platform === 'win32') {
        return `${returnedFilePath}\\${fileName}`;
    } else {
        return `${returnedFilePath}/${fileName}`;
    }
};

/**
 * validateFileExtension - Ensures that the file name being passed is in of type .ora or .dcs
 *
 * @param {String} fileName
 * @returns {Boolean}
 */
const validateFileExtension = (fileName) => {
    if (oraExp.test(fileName)) return true;
    else return false;
};
/**
 * validateImageExtension - Ensures that the file name being passed is in of type .ora or .dcs
 *
 * @param {String} fileName
 * @returns {Boolean}
 */
const validateImageExtension = (fileName) => {
    if (dcsExp.test(fileName))
        return { result: true, type: Constants.Settings.ANNOTATIONS.TDR };
    else if (pngExp.test(fileName))
        return { result: true, type: Constants.Settings.ANNOTATIONS.COCO };
    else return { result: false };
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
                        let filePath;
                        if (process.platform === 'win32') {
                            filePath = `${path}\\${file}`;
                        } else {
                            filePath = `${path}/${file}`;
                        }
                        if (validateFileExtension(file) === true) {
                            files.push(filePath);
                        }
                    });
                    startThumbnailThread(path);
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
 * @param {String} filePath Specific location of the file, ie D:\images\1_img.ora
 * @returns {Object<file: String('base64'); fileName: String; numberOfFiles: Number>}
 */
const loadFile = (filePath) => {
    const fileData = fs.readFileSync(filePath);
    const file = Buffer.from(fileData).toString('base64');
    let splitPath;
    if (process.platform === 'win32') {
        splitPath = filePath.split('\\');
    } else {
        splitPath = filePath.split('/');
    }

    const fileName = splitPath[splitPath.length - 1];
    const result = {
        file: file,
        fileName: fileName,
        numberOfFiles: files.length,
        thumbnails: files,
    };
    return result;
};

const startThumbnailThread = async (path) => {
    createThumbnailsPath(path);
    const filesToGenerate = await filesNeedingThumbnails(path);
    if (filesToGenerate.length > 0) {
        parseFilesForThumbnail(filesToGenerate)
            .catch((error) => console.log(error))
            .finally(() => {
                saveThumbnailDatabase();
            });
    }
};

const createThumbnailsPath = (path) => {
    if (process.platform === 'win32') {
        thumbnailPath = `${path}\\.thumbnails`;
        if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath);
            fsWin.setAttributesSync(thumbnailPath, { IS_HIDDEN: true });
        }
    } else {
        thumbnailPath = `${path}/.thumbnails`;
        if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath);
        }
    }
};

const filesNeedingThumbnails = async (filePath) => {
    const result = new Promise((resolve, reject) => {
        loadThumbnailDatabase();
        let filesToGenerate = [];
        readdir(filePath)
            .then((filesRead) => {
                filesRead.forEach((fileName) => {
                    if (validateFileExtension(fileName)) {
                        let imagePath;
                        if (process.platform === 'win32') {
                            imagePath = `${filePath}\\${fileName}`;
                        } else {
                            imagePath = `${filePath}/${fileName}`;
                        }
                        filesToGenerate.push(imagePath);
                    }
                });
                if (thumbnails.length > 0) {
                    filesToGenerate = filterMadeThumbnails(filesToGenerate);
                }
                resolve(filesToGenerate);
            })
            .catch((error) => reject(error));
    });
    return result;
};

const filterMadeThumbnails = (filesToGenerate) => {
    return filesToGenerate.filter((file) => {
        const splitPath = file.split(process.platform === 'win32' ? '\\' : '/');
        const fileName = splitPath[splitPath.length - 1];
        return !thumbnails.some((thumbnail) => {
            return fileName === thumbnail.fileName;
        });
    });
};

const parseFilesForThumbnail = async (files) => {
    const result = new Promise((resolve, reject) => {
        const listOfPromises = [];
        files.forEach((file) => {
            listOfPromises.push(parseThumbnail(file));
        });
        const promiseOfList = Promise.all(listOfPromises);
        promiseOfList
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
    return result;
};

const parseThumbnail = async (filePath) => {
    const result = new Promise((resolve, reject) => {
        const splitPath = filePath.split(
            process.platform === 'win32' ? '\\' : '/'
        );
        const fileName = splitPath[splitPath.length - 1];
        const fileData = fs.readFileSync(filePath);
        const fileObject = Buffer.from(fileData).toString('base64');
        const myZip = new JSZip();
        myZip
            .loadAsync(fileObject, { base64: true })
            .then(() => {
                myZip
                    .file('stack.xml')
                    .async('string')
                    .then((stackFile) => {
                        parseString(stackFile, (error, result) => {
                            if (error === null) {
                                let newThumbnail = [];
                                let listOfNewThumbnailPromises = [];
                                result.image.stack.forEach((stack) => {
                                    let thumbnailSavePath =
                                        process.platform === 'win32'
                                            ? `${thumbnailPath}\\${fileName}_thumbnail.png`
                                            : `${thumbnailPath}/${fileName}_thumbnail.png`;
                                    const dataType = validateImageExtension(
                                        stack.layer[0].$.src
                                    );
                                    if (
                                        dataType.result &&
                                        dataType.type ===
                                            Constants.Settings.ANNOTATIONS.COCO
                                    ) {
                                        listOfNewThumbnailPromises.push(
                                            myZip
                                                .file(stack.layer[0].$.src)
                                                .async('nodebuffer')
                                                .then((imageData) => {
                                                    newThumbnail.push({
                                                        fileName,
                                                        view: stack.$.view,
                                                        thumbnailSavePath,
                                                        dataType,
                                                        pixelData: imageData,
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                })
                                        );
                                    } else if (
                                        dataType.result &&
                                        dataType.type ===
                                            Constants.Settings.ANNOTATIONS.TDR
                                    ) {
                                        listOfNewThumbnailPromises.push(
                                            myZip
                                                .file(stack.layer[0].$.src)
                                                .async('arraybuffer')
                                                .then((imageData) => {
                                                    const dicosImageData =
                                                        dcsToPng(imageData);
                                                    newThumbnail.push({
                                                        fileName,
                                                        view: stack.$.view,
                                                        thumbnailSavePath,
                                                        dataType,
                                                        pixelData:
                                                            dicosImageData.pixelData,
                                                        width: dicosImageData.width,
                                                        height: dicosImageData.height,
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                })
                                        );
                                    }
                                });
                                const promiseOfNewThumbnailsList = Promise.all(
                                    listOfNewThumbnailPromises
                                );
                                promiseOfNewThumbnailsList
                                    .then(() => {
                                        if (newThumbnail.length > 0) {
                                            let topIndex, sideIndex;
                                            if (newThumbnail.length === 1) {
                                                topIndex = 0;
                                            } else if (
                                                newThumbnail.length > 1
                                            ) {
                                                topIndex =
                                                    newThumbnail[0].view ===
                                                    Constants.Viewport.TOP
                                                        ? 0
                                                        : 1;
                                                sideIndex =
                                                    newThumbnail[1].view ===
                                                    Constants.Viewport.SIDE
                                                        ? 1
                                                        : 0;
                                            }
                                            if (
                                                newThumbnail[0].dataType
                                                    .type ===
                                                Constants.Settings.ANNOTATIONS
                                                    .TDR
                                            ) {
                                                //

                                                if (newThumbnail.length > 1) {
                                                    //
                                                    sharp(
                                                        newThumbnail[topIndex]
                                                            .pixelData,
                                                        {
                                                            raw: {
                                                                width: newThumbnail[
                                                                    topIndex
                                                                ].width,
                                                                height: newThumbnail[
                                                                    topIndex
                                                                ].height,
                                                                channels: 4,
                                                            },
                                                        }
                                                    )
                                                        .resize(96)
                                                        .png()
                                                        .toBuffer()
                                                        .then((firstData) => {
                                                            sharp(
                                                                newThumbnail[
                                                                    sideIndex
                                                                ].pixelData,
                                                                {
                                                                    raw: {
                                                                        width: newThumbnail[
                                                                            sideIndex
                                                                        ].width,
                                                                        height: newThumbnail[
                                                                            sideIndex
                                                                        ]
                                                                            .height,
                                                                        channels: 4,
                                                                    },
                                                                }
                                                            )
                                                                .resize(96)
                                                                .png()
                                                                .toBuffer()
                                                                .then(
                                                                    (
                                                                        secondData
                                                                    ) => {
                                                                        joinImages
                                                                            .joinImages(
                                                                                [
                                                                                    firstData,
                                                                                    secondData,
                                                                                ],
                                                                                {
                                                                                    direction:
                                                                                        'horizontal',
                                                                                }
                                                                            )
                                                                            .then(
                                                                                (
                                                                                    img
                                                                                ) => {
                                                                                    img.png()
                                                                                        .toBuffer()
                                                                                        .then(
                                                                                            (
                                                                                                data
                                                                                            ) => {
                                                                                                sharp(
                                                                                                    data
                                                                                                )
                                                                                                    .resize(
                                                                                                        96
                                                                                                    )
                                                                                                    .toFile(
                                                                                                        newThumbnail[0]
                                                                                                            .thumbnailSavePath
                                                                                                    )
                                                                                                    .then(
                                                                                                        () => {
                                                                                                            thumbnails.push(
                                                                                                                {
                                                                                                                    fileName,
                                                                                                                    thumbnailPath:
                                                                                                                        newThumbnail[0]
                                                                                                                            .thumbnailSavePath,
                                                                                                                }
                                                                                                            );
                                                                                                            resolve();
                                                                                                        }
                                                                                                    )
                                                                                                    .catch(
                                                                                                        (
                                                                                                            error
                                                                                                        ) => {
                                                                                                            console.log(
                                                                                                                error
                                                                                                            );
                                                                                                            reject(
                                                                                                                error
                                                                                                            );
                                                                                                        }
                                                                                                    );
                                                                                            }
                                                                                        )
                                                                                        .catch(
                                                                                            (
                                                                                                error
                                                                                            ) => {
                                                                                                console.log(
                                                                                                    error
                                                                                                );
                                                                                                reject(
                                                                                                    error
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                }
                                                                            )
                                                                            .catch(
                                                                                (
                                                                                    error
                                                                                ) => {
                                                                                    console.log(
                                                                                        error
                                                                                    );
                                                                                    reject(
                                                                                        error
                                                                                    );
                                                                                }
                                                                            );
                                                                    }
                                                                )
                                                                .catch(
                                                                    (error) => {
                                                                        console.log(
                                                                            error
                                                                        );
                                                                        reject(
                                                                            error
                                                                        );
                                                                    }
                                                                );
                                                        })
                                                        .catch((error) => {
                                                            console.log(error);
                                                            reject(error);
                                                        });
                                                } else if (
                                                    newThumbnail.length === 1
                                                ) {
                                                    sharp(
                                                        newThumbnail[0]
                                                            .pixelData,
                                                        {
                                                            raw: {
                                                                width: newThumbnail[0]
                                                                    .width,
                                                                height: newThumbnail[0]
                                                                    .height,
                                                                channels: 4,
                                                            },
                                                        }
                                                    )
                                                        .resize(96)
                                                        .toFile(
                                                            newThumbnail[0]
                                                                .thumbnailSavePath
                                                        )
                                                        .then(() => {
                                                            thumbnails.push({
                                                                fileName,
                                                                thumbnailPath:
                                                                    newThumbnail[0]
                                                                        .thumbnailSavePath,
                                                            });
                                                            resolve();
                                                        })
                                                        .catch((error) => {
                                                            console.log(error);
                                                            reject(error);
                                                        });
                                                }
                                            } else if (
                                                newThumbnail[0].dataType
                                                    .type ===
                                                Constants.Settings.ANNOTATIONS
                                                    .COCO
                                            ) {
                                                if (newThumbnail.length > 1) {
                                                    sharp(
                                                        newThumbnail[topIndex]
                                                            .pixelData
                                                    )
                                                        .resize(96)
                                                        .toBuffer()
                                                        .then((firstData) => {
                                                            sharp(
                                                                newThumbnail[
                                                                    sideIndex
                                                                ].pixelData
                                                            )
                                                                .resize(96)
                                                                .toBuffer()
                                                                .then(
                                                                    (
                                                                        secondData
                                                                    ) => {
                                                                        joinImages
                                                                            .joinImages(
                                                                                [
                                                                                    firstData,
                                                                                    secondData,
                                                                                ],
                                                                                {
                                                                                    direction:
                                                                                        'horizontal',
                                                                                }
                                                                            )
                                                                            .then(
                                                                                (
                                                                                    img
                                                                                ) => {
                                                                                    img.png()
                                                                                        .toBuffer()
                                                                                        .then(
                                                                                            (
                                                                                                data
                                                                                            ) => {
                                                                                                sharp(
                                                                                                    data
                                                                                                )
                                                                                                    .resize(
                                                                                                        96
                                                                                                    )
                                                                                                    .toFile(
                                                                                                        newThumbnail[0]
                                                                                                            .thumbnailSavePath
                                                                                                    )
                                                                                                    .then(
                                                                                                        () => {
                                                                                                            thumbnails.push(
                                                                                                                {
                                                                                                                    fileName,
                                                                                                                    thumbnailPath:
                                                                                                                        newThumbnail[0]
                                                                                                                            .thumbnailSavePath,
                                                                                                                }
                                                                                                            );
                                                                                                            resolve();
                                                                                                        }
                                                                                                    )
                                                                                                    .catch(
                                                                                                        (
                                                                                                            error
                                                                                                        ) => {
                                                                                                            console.log(
                                                                                                                error
                                                                                                            );
                                                                                                            reject(
                                                                                                                error
                                                                                                            );
                                                                                                        }
                                                                                                    );
                                                                                            }
                                                                                        )
                                                                                        .catch(
                                                                                            (
                                                                                                error
                                                                                            ) => {
                                                                                                console.log(
                                                                                                    error
                                                                                                );
                                                                                                reject(
                                                                                                    error
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                }
                                                                            )
                                                                            .catch(
                                                                                (
                                                                                    error
                                                                                ) => {
                                                                                    console.log(
                                                                                        error
                                                                                    );
                                                                                    reject(
                                                                                        error
                                                                                    );
                                                                                }
                                                                            );
                                                                    }
                                                                )
                                                                .catch(
                                                                    (error) => {
                                                                        console.log(
                                                                            error
                                                                        );
                                                                        reject(
                                                                            error
                                                                        );
                                                                    }
                                                                );
                                                        })
                                                        .catch((error) => {
                                                            console.log(error);
                                                            reject(error);
                                                        });
                                                } else if (
                                                    newThumbnail.length === 1
                                                ) {
                                                    sharp(
                                                        newThumbnail[0]
                                                            .pixelData
                                                    )
                                                        .resize(96)
                                                        .toFile(
                                                            newThumbnail[0]
                                                                .thumbnailSavePath
                                                        )
                                                        .then(() => {
                                                            thumbnails.push({
                                                                fileName,
                                                                thumbnailPath:
                                                                    newThumbnail[0]
                                                                        .thumbnailSavePath,
                                                            });
                                                            resolve();
                                                        })
                                                        .catch((error) => {
                                                            console.log(error);
                                                            reject(error);
                                                        });
                                                }
                                            }
                                        } else {
                                            reject();
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        reject(error);
                                    });
                            } else {
                                console.log(error);
                                reject(error);
                            }
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(error);
                    });
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
    return result;
};

const dcsToPng = (imageData) => {
    const byteArray = new Uint8Array(imageData);
    try {
        // Allow raw files
        const options = {
            TransferSyntaxUID: '1.2.840.10008.1.2',
        };
        // Parse the byte array to get a DataSet object that has the parsed contents
        const dataSet = dicomParser.parseDicom(byteArray, options);

        // get the pixel data element (contains the offset and length of the data)
        const pixelDataElement = dataSet.elements.x7fe00010;

        // create a typed array on the pixel data (this example assumes 16 bit unsigned data)
        const pixelData = new Uint16Array(
            dataSet.byteArray.buffer,
            pixelDataElement.dataOffset,
            pixelDataElement.length / 2
        );
        const intervals = Utils.buildIntervals();
        const height = dataSet.int16('x00280010');
        const width = dataSet.int16('x00280011');
        const EightbitPixels = new Uint8ClampedArray(4 * width * height);
        let z = 0;
        for (let i = 0; i < pixelData.length; i++) {
            const greyValue = Utils.findGrayValue(pixelData[i], intervals);
            EightbitPixels[z] = greyValue;
            EightbitPixels[z + 1] = greyValue;
            EightbitPixels[z + 2] = greyValue;
            EightbitPixels[z + 3] = 255;
            z += 4;
        }
        return { width, height, pixelData: EightbitPixels };
    } catch (ex) {
        console.log('Error parsing byte stream', ex);
    }
};

const saveThumbnailDatabase = () => {
    fs.writeFileSync(
        `${thumbnailPath}${
            process.platform === 'win32' ? '\\' : '/'
        }database.json`,
        JSON.stringify(thumbnails, null, 4)
    );
};

const loadThumbnailDatabase = () => {
    const thumbnailDBPath = `${thumbnailPath}${
        process.platform === 'win32' ? '\\' : '/'
    }database.json`;
    if (fs.existsSync(thumbnailDBPath)) {
        const rawData = fs.readFileSync(thumbnailDBPath);
        thumbnails = JSON.parse(rawData);
    }
};
