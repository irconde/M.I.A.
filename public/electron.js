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
const chokidar = require('chokidar');

let mainWindow;
let files = [];
let thumbnails = [];
let thumbnailPath = '';
let isGeneratingThumbnails = false;
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

async function handleExternalFileChanges(dirPath) {
    // create a directory watcher, making sure it ignores json files
    // it also doesn't fire the first time to avoid additional rerenders
    const watcher = chokidar.watch(dirPath, {
        ignored: Constants.FileWatcher.all_json_files,
        depth: 0,
        ignoreInitial: true,
    });

    // wire the directory modification event handlers
    watcher
        .on(Constants.FileWatcher.add, async (path) => {
            const addedFilename = getFileNameFromPath(path);

            // handle ora file addition
            if (getFileExtension(addedFilename) === 'ora') {
                parseThumbnail(path)
                    .then(() => {
                        files.push(path);
                        saveThumbnailDatabase(false);
                        // if the files array was empty before adding this file
                        if (files.length === 1) {
                            currentFileIndex = 0;
                            getCurrentFile()
                                .then((response) => {
                                    notifyCurrentFileUpdate(response);
                                })
                                .catch((error) => {
                                    notifyCurrentFileUpdate(null);
                                    console.log(
                                        `Error getting the current file: ${error}`
                                    );
                                });
                        } else {
                            // if the files array already contained a file
                            sendNewFiles();
                        }
                    })
                    .catch((error) => {
                        console.log(`Error in filewatcher: ${error}`);
                    });
            }
        })
        .on(Constants.FileWatcher.unlink, async (path) => {
            const removedFilename = getFileNameFromPath(path);

            // exit the function if the file isn't of type .ora
            if (getFileExtension(removedFilename) !== 'ora') {
                return;
            }

            // find the thumbnail that needs to be deleted
            const thumbnailIndex = thumbnails.findIndex(
                (thumbnail) => thumbnail.fileName === removedFilename
            );
            const { thumbnailPath } = thumbnails.at(thumbnailIndex);

            // remove the thumbnail from the database
            thumbnails.splice(thumbnailIndex, 1);
            saveThumbnailDatabase(false);

            // delete the thumbnail png file
            deleteFileAtPath(thumbnailPath)
                .then(() => {
                    // remove the ora file path from the files array
                    const removedFileIndex = files.findIndex(
                        (filepath) => filepath === path
                    );
                    const currentFilePath = files.at(currentFileIndex);
                    files.splice(removedFileIndex, 1);

                    // if the file deleted is before the selected file
                    if (removedFileIndex < currentFileIndex) {
                        // update the currentFileIndex
                        const mostCurrentFileIndex = files.findIndex(
                            (filepath) => filepath === currentFilePath
                        );
                        if (mostCurrentFileIndex !== -1) {
                            currentFileIndex = mostCurrentFileIndex;
                        } else {
                            currentFileIndex = 0;
                        }
                    }
                    // if the file deleted is the selected file
                    else if (removedFileIndex === currentFileIndex) {
                        // decrement the index if possible, or set it to 0
                        currentFileIndex > 0
                            ? --currentFileIndex
                            : (currentFileIndex = 0);
                        // notify react process about current file update and exit function
                        getCurrentFile()
                            .then((response) => {
                                notifyCurrentFileUpdate(response);
                            })
                            .catch((error) => {
                                notifyCurrentFileUpdate(null);
                                console.log(
                                    `Error getting the current file: ${error}`
                                );
                            });
                        return;
                    }

                    // send the files for the react process
                    sendNewFiles();
                })
                .catch((error) => {
                    console.log(error);
                });
        });

    const getCurrentFile = async () => {
        return new Promise((resolve, reject) => {
            if (files.length > 0 && currentFileIndex < files.length) {
                if (fs.existsSync(files[currentFileIndex])) {
                    resolve(loadFile(files[currentFileIndex]));
                } else {
                    reject('File not found in range');
                }
            } else if (files.length > 0 && currentFileIndex >= files.length) {
                reject('Given currentFileIndex is too high');
            } else {
                reject('No more files to load');
            }
        });
    };

    const deleteFileAtPath = async (path) => {
        return new Promise((resolve, reject) => {
            if (fs.existsSync(path)) {
                fs.unlink(path, (err) => {
                    if (err) {
                        reject(
                            `An error ocurred deleting the file ${err.message}`
                        );
                    }
                    resolve();
                });
            } else {
                reject(`File ${path} doesn't exist, cannot delete!`);
            }
        });
    };

    // notifies react process about the updated files
    const sendNewFiles = () => {
        mainWindow.webContents.send(Constants.Channels.updateFiles, files);
    };

    // notifies react process about the selected file update
    const notifyCurrentFileUpdate = (file) => {
        mainWindow.webContents.send(Constants.Channels.updateCurrentFile, file);
    };

    // returns the name of the file including the extension from a given path
    const getFileNameFromPath = (path) => {
        return path.split('\\').pop().split('/').pop();
    };

    // accepts a file name, and returns the file extension
    const getFileExtension = (filename) => filename.split('.').pop();
}

/**
 * A channel between the main process (electron) and the renderer process (react).
 * This returns an object with a cancelled value and an array containing the file path
 * if selected.
 * @returns {{canceled: Boolean; filePaths: Array<string};>}
 */
ipcMain.handle(Constants.Channels.selectDirectory, async (event, args) => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
    });
    return result;
});

/**
 * Loads the file from the passed in directory via the args parameter
 * @param {string} args Directory location, i.e. D:\images
 * @returns {Promise}
 */
ipcMain.handle(Constants.Channels.loadFiles, async (event, args) => {
    currentFileIndex = 0;
    const result = await loadFilesFromPath(args);
    return result;
});

/**
 * Get Next File loads the next file if the path provided exists. This function will
 * ensure that the path exists, if the file names aren't loaded, it will load them. Then,
 * it will return the Base64 binary string of the next file.
 * @param {string} args File directory path sent from react
 * @returns {{file: string('base64'); fileName: string; numberOfFiles: Number; thumbnails: Array<string>;}}
 */
ipcMain.handle(Constants.Channels.getNextFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (files.length > 0 && currentFileIndex < files.length) {
            if (fs.existsSync(files[currentFileIndex])) {
                sendThumbnailStatus();
                resolve(loadFile(files[currentFileIndex]));
            }
        } else if (files.length !== 0 && currentFileIndex >= files.length) {
            reject('End of queue');
        } else {
            if (fs.existsSync(args)) {
                loadFilesFromPath(args)
                    .then(() => {
                        if (files.length > 0) {
                            sendThumbnailStatus();
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
 * Loads the specified file if the path provided exists. If so it will
 * it will load the file and then, it will return the Base64 binary string of the next file.
 * Along with other information about the file and other files in the path.
 * @param {string} args File path sent from react
 * @returns {{file: string('base64'); fileName: string; numberOfFiles: Number; thumbnails: Array<string>;}}
 */
ipcMain.handle(Constants.Channels.getSpecificFile, async (event, args) => {
    const result = new Promise((resolve, reject) => {
        if (fs.existsSync(args)) {
            currentFileIndex = files.findIndex((filePath) => filePath === args);
            sendThumbnailStatus();
            resolve(loadFile(args));
        } else {
            reject('File path does not exist');
        }
    });
    return result;
});

/**
 * Occurs when the user clicks next in react. It saves the file the returned path
 * of the file path passed in. As well, it moves the file queue ahead to the next file.
 * @param {{file: Buffer; fileDirectory: string; fileFormat: string; fileName: string; fileSuffix: string;}} args
 * @returns {string} Result
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
 * For when a user is selecting a single file and saving it. Displays a file dialog and saves
 * the sent file data
 * @param {Buffer} args - Binary data to be saved
 * @returns {Promise}
 */
ipcMain.handle(Constants.Channels.saveIndFile, async (event, args) => {
    return new Promise((resolve, reject) => {
        dialog.showSaveDialog().then((result) => {
            if (!result.canceled) {
                fs.writeFile(result.filePath, args, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            } else {
                reject('Save cancelled');
            }
        });
    });
});

/**
 * Loads the specified thumbnail if the file name provided exists. If so it will
 * it will load the thumbnail and then, it will return the Base64 binary string of the thumbnail.
 * @param {string} args File path sent from react
 * @returns {string}
 */
ipcMain.handle(Constants.Channels.getThumbnail, async (event, args) => {
    return new Promise((resolve, reject) => {
        const splitPath = args.split(process.platform === 'win32' ? '\\' : '/');
        if (splitPath.length > 0) {
            const fileName = splitPath[splitPath.length - 1];
            const foundThumbnail = thumbnails.find(
                (value) => value.fileName === fileName
            );
            if (foundThumbnail === undefined) {
                reject('Thumbnail does not exist for that file');
            } else {
                const fileData = fs.readFileSync(foundThumbnail.thumbnailPath);
                resolve({
                    fileName,
                    fileData: Buffer.from(fileData).toString('base64'),
                    numOfViews: foundThumbnail.numOfViews,
                    isDetections: foundThumbnail.isDetections,
                });
            }
        } else {
            reject('Could not determine file name from that path');
        }
    });
});

/**
 * Sends the current thumbnail status (generating or not) to the React/renderer process
 */
const sendThumbnailStatus = () => {
    mainWindow.webContents.send(
        Constants.Channels.thumbnailStatus,
        isGeneratingThumbnails
    );
};

/**
 * Finds the maximum number used in the already saved files in the returned path
 * @param {string} fileNameSuffix
 * @param {Array<string>} returnedFiles
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
 * Uses the passed in arguments to generate a full file path from a file name,
 * directory, suffix, and output format.
 * @param {{fileSuffix: string; fileFormat: string}} args
 * @param {Number} fileIndex
 * @param {string} returnedFilePath
 * @returns {string}
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
 * Ensures that the file name being passed is in of type .ora or .dcs
 * @param {string} fileName
 * @returns {Boolean}
 */
const validateFileExtension = (fileName) => {
    if (oraExp.test(fileName)) return true;
    else return false;
};
/**
 * Ensures that the file name being passed is in of type .ora or .dcs
 * @param {string} fileName
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
 * Will load the files from the passed in path directory, and will validate that
 * the files in the directory are of correct type. I.E. .png, .jpg etc. won't be loaded.
 * @param {string} path
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
                    // watch the directory for any external file changes
                    handleExternalFileChanges(path);
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
 * Loads the file from the front of the file queue and returns an object with its data
 * and information about the file name and number of files in the directory.
 * @param {string} filePath Specific location of the file, ie D:\images\1_img.ora
 * @returns {{file: string('base64'); fileName: string; numberOfFiles: Number;}}
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

/**
 * Async function to start the process of parsing and generating thumbnails as needed.
 * @param {string} path
 */
const startThumbnailThread = async (path) => {
    isGeneratingThumbnails = true;
    sendThumbnailStatus();
    createThumbnailsPath(path);
    const filesToGenerate = await filesNeedingThumbnails(path);
    if (filesToGenerate.length > 0) {
        parseFilesForThumbnail(filesToGenerate)
            .catch((error) => console.log(error))
            .finally(() => {
                saveThumbnailDatabase();
            });
    } else {
        isGeneratingThumbnails = false;
        sendThumbnailStatus();
    }
};

/**
 * Creates the thumbnails path if not created and returns that path
 * @param {string} path
 * @returns {string}
 */
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

/**
 * Finds all files in the specified path that are not in the JSON database that need a thumbnail generated.
 * @param {string} filePath
 * @returns {Promise}
 */
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

/**
 * Compares the files to possibly generate thumbnails for against the JSON database. Returns the
 * files not in the database that need a thumbnail generated.
 * @param {Array<string>} filesToGenerate
 * @returns {Array<string>}
 */
const filterMadeThumbnails = (filesToGenerate) => {
    return filesToGenerate.filter((file) => {
        const splitPath = file.split(process.platform === 'win32' ? '\\' : '/');
        const fileName = splitPath[splitPath.length - 1];
        return !thumbnails.some((thumbnail) => {
            return fileName === thumbnail.fileName;
        });
    });
};

/**
 * Function to spin up threads to parse each thumbnail and resolves its promise once all thumbnails have attempted to be parsed
 * @param {Array<string>} files
 * @returns {Promise}
 */
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

/**
 * Parses the given file path into a thumbnail if possible
 * @param {string} filePath Full path to the file, ie D:\images\1_img.ora
 * @returns {Promise}
 */
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
                                let thumbnailSavePath =
                                    process.platform === 'win32'
                                        ? `${thumbnailPath}\\${fileName}_thumbnail.png`
                                        : `${thumbnailPath}/${fileName}_thumbnail.png`;
                                let topIndex;
                                if (result.image.stack.length === 1) {
                                    topIndex = 0;
                                } else if (result.image.stack.length === 2) {
                                    if (
                                        result.image.stack[0].$.view ===
                                        Constants.Viewport.TOP
                                    )
                                        topIndex = 0;
                                    else topIndex = 1;
                                } else reject('Incorrect number of stacks');
                                const dataType = validateImageExtension(
                                    result.image.stack[topIndex].layer[0].$.src
                                );
                                if (dataType.result) {
                                    let isDetections = false;
                                    result.image.stack.forEach((stack) => {
                                        if (stack.layer.length > 1)
                                            isDetections = true;
                                    });
                                    const numOfViews =
                                        result.image.stack.length;
                                    if (
                                        dataType.type ===
                                        Constants.Settings.ANNOTATIONS.COCO
                                    ) {
                                        myZip
                                            .file(
                                                result.image.stack[topIndex]
                                                    .layer[0].$.src
                                            )
                                            .async('nodebuffer')
                                            .then((imageData) => {
                                                generateCocoThumbnail({
                                                    fileName,
                                                    thumbnailSavePath,
                                                    pixelData: imageData,
                                                    numOfViews,
                                                    isDetections,
                                                })
                                                    .then(() => resolve())
                                                    .catch((error) =>
                                                        reject(error)
                                                    );
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                reject(error);
                                            });
                                    } else if (
                                        dataType.type ===
                                        Constants.Settings.ANNOTATIONS.TDR
                                    ) {
                                        myZip
                                            .file(
                                                result.image.stack[topIndex]
                                                    .layer[0].$.src
                                            )
                                            .async('arraybuffer')
                                            .then((imageData) => {
                                                const dicosPngData =
                                                    dicosToPngData(imageData);
                                                generateTdrThumbnail({
                                                    fileName,
                                                    thumbnailSavePath,
                                                    pixelData:
                                                        dicosPngData.pixelData,
                                                    width: dicosPngData.width,
                                                    height: dicosPngData.height,
                                                    numOfViews,
                                                    isDetections,
                                                })
                                                    .then(() => resolve())
                                                    .catch((error) =>
                                                        reject(error)
                                                    );
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                reject(error);
                                            });
                                    } else reject('Incorrect data type');
                                } else reject('Invalid file');
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

/**
 * Generates a PNG formatted pixel data along with the width and height of the passed in DICOS/TDR image
 * @param {ArrayBuffer} imageData
 * @returns {{width: Number; height: Number; pixelData: Uint8ClampedArray}}
 */
const dicosToPngData = (imageData) => {
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

/**
 * Generate a TDR thumbnail
 * @param {{fileName: string; thumbnailSavePath: string; pixelData: Uint8ClampedArray; width: Number; height: Number; numOfViews: Number; isDetections: Boolean;}} newThumbnail
 * @returns {Promise}
 */
const generateTdrThumbnail = (newThumbnail) => {
    const result = new Promise((resolve, reject) => {
        if (newThumbnail !== null) {
            sharp(newThumbnail.pixelData, {
                raw: {
                    width: newThumbnail.width,
                    height: newThumbnail.height,
                    channels: 4,
                },
            })
                .resize(Constants.Thumbnail.width)
                .png()
                .toFile(newThumbnail.thumbnailSavePath)
                .then(() => {
                    thumbnails.push({
                        fileName: newThumbnail.fileName,
                        thumbnailPath: newThumbnail.thumbnailSavePath,
                        numOfViews: newThumbnail.numOfViews,
                        isDetections: newThumbnail.isDetections,
                    });
                    resolve();
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else reject('Image was null');
    });
    return result;
};

/**
 * Generate a COCO thumbnail
 * @param {{fileName: string; thumbnailSavePath: string; pixelData: Buffer; numOfViews: Number; isDetections: Boolean;}} newThumbnail
 * @returns {Promise}
 */
const generateCocoThumbnail = (newThumbnail) => {
    const result = new Promise((resolve, reject) => {
        if (newThumbnail !== null) {
            sharp(newThumbnail.pixelData)
                .resize(Constants.Thumbnail.width)
                .toFile(newThumbnail.thumbnailSavePath)
                .then(() => {
                    thumbnails.push({
                        fileName: newThumbnail.fileName,
                        thumbnailPath: newThumbnail.thumbnailSavePath,
                        numOfViews: newThumbnail.numOfViews,
                        isDetections: newThumbnail.isDetections,
                    });
                    resolve();
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else reject('Image was null');
    });
    return result;
};

/**
 * Saves the JSON database, ie D:\images\.thumbnails\database.json
 */
const saveThumbnailDatabase = (sendThumbnail = true) => {
    fs.writeFileSync(
        `${thumbnailPath}${
            process.platform === 'win32' ? '\\' : '/'
        }database.json`,
        JSON.stringify(thumbnails, null, 4)
    );
    isGeneratingThumbnails = false;
    if (sendThumbnail) {
        sendThumbnailStatus();
    }
};

/**
 * Loads the thumbnail database into the thumbnails array
 */
const loadThumbnailDatabase = () => {
    const thumbnailDBPath = `${thumbnailPath}${
        process.platform === 'win32' ? '\\' : '/'
    }database.json`;
    if (fs.existsSync(thumbnailDBPath)) {
        const rawData = fs.readFileSync(thumbnailDBPath);
        thumbnails = JSON.parse(rawData);
    }
};
