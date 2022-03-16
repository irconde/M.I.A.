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
                                                        type: dataType.type,
                                                        pixelData: imageData,
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    reject(error);
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
                                                    const dicosPngData =
                                                        dicosToPngData(
                                                            imageData
                                                        );
                                                    newThumbnail.push({
                                                        fileName,
                                                        view: stack.$.view,
                                                        thumbnailSavePath,
                                                        type: dataType.type,
                                                        pixelData:
                                                            dicosPngData.pixelData,
                                                        width: dicosPngData.width,
                                                        height: dicosPngData.height,
                                                    });
                                                })
                                                .catch((error) => {
                                                    console.log(error);
                                                    reject(error);
                                                })
                                        );
                                    } else reject('Unsupported format');
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
                                                newThumbnail[0].type ===
                                                Constants.Settings.ANNOTATIONS
                                                    .TDR
                                            ) {
                                                generateTdrThumbnail(
                                                    newThumbnail,
                                                    { topIndex, sideIndex }
                                                )
                                                    .then(() => resolve())
                                                    .catch((error) =>
                                                        reject(error)
                                                    );
                                            } else if (
                                                newThumbnail[0].type ===
                                                Constants.Settings.ANNOTATIONS
                                                    .COCO
                                            ) {
                                                generateCocoThumbnail(
                                                    newThumbnail,
                                                    { topIndex, sideIndex }
                                                )
                                                    .then(() => resolve())
                                                    .catch((error) =>
                                                        reject(error)
                                                    );
                                            } else reject('Unsupported format');
                                        } else {
                                            reject('No images');
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
 * @param {Array<{fileName: string; view: string; thumbnailSavePath: string; type: Constants.Settings.ANNOTATIONS; pixelData: Uint8ClampedArray; width: Number; height: Number;}>} newThumbnail Array of Objects
 * @param {{topIndex: Number; sideIndex: Number;}} indexes Object containing topIndex & sideIndex as numbers
 * @returns {Promise}
 */
const generateTdrThumbnail = (newThumbnail, indexes) => {
    const result = new Promise((resolve, reject) => {
        const { topIndex, sideIndex } = indexes;
        if (newThumbnail.length > 1) {
            sharp(newThumbnail[topIndex].pixelData, {
                raw: {
                    width: newThumbnail[topIndex].width,
                    height: newThumbnail[topIndex].height,
                    channels: 4,
                },
            })
                .resize(96)
                .png()
                .toBuffer()
                .then((firstData) => {
                    sharp(newThumbnail[sideIndex].pixelData, {
                        raw: {
                            width: newThumbnail[sideIndex].width,
                            height: newThumbnail[sideIndex].height,
                            channels: 4,
                        },
                    })
                        .resize(96)
                        .png()
                        .toBuffer()
                        .then((secondData) => {
                            joinImages
                                .joinImages([firstData, secondData], {
                                    direction: 'horizontal',
                                })
                                .then((img) => {
                                    img.png()
                                        .toBuffer()
                                        .then((data) => {
                                            sharp(data)
                                                .resize(96)
                                                .toFile(
                                                    newThumbnail[0]
                                                        .thumbnailSavePath
                                                )
                                                .then(() => {
                                                    thumbnails.push({
                                                        fileName:
                                                            newThumbnail[0]
                                                                .fileName,
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
        } else if (newThumbnail.length === 1) {
            sharp(newThumbnail[0].pixelData, {
                raw: {
                    width: newThumbnail[0].width,
                    height: newThumbnail[0].height,
                    channels: 4,
                },
            })
                .resize(96)
                .toFile(newThumbnail[0].thumbnailSavePath)
                .then(() => {
                    thumbnails.push({
                        fileName: newThumbnail[0].fileName,
                        thumbnailPath: newThumbnail[0].thumbnailSavePath,
                    });
                    resolve();
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else reject('Incorrect number of views');
    });
    return result;
};

/**
 * Generate a COCO thumbnail
 * @param {Array<{fileName: string; view: string; thumbnailSavePath: string; type: Constants.Settings.ANNOTATIONS; pixelData: Buffer;}>} newThumbnail Array of Objects
 * @param {{topIndex: Number; sideIndex: Number;}} indexes Object containing topIndex & sideIndex as numbers
 * @returns {Promise}
 */
const generateCocoThumbnail = (newThumbnail, indexes) => {
    const result = new Promise((resolve, reject) => {
        const { topIndex, sideIndex } = indexes;
        if (newThumbnail.length > 1) {
            sharp(newThumbnail[topIndex].pixelData)
                .resize(96)
                .toBuffer()
                .then((firstData) => {
                    sharp(newThumbnail[sideIndex].pixelData)
                        .resize(96)
                        .toBuffer()
                        .then((secondData) => {
                            joinImages
                                .joinImages([firstData, secondData], {
                                    direction: 'horizontal',
                                })
                                .then((img) => {
                                    img.png()
                                        .toBuffer()
                                        .then((data) => {
                                            sharp(data)
                                                .resize(96)
                                                .toFile(
                                                    newThumbnail[0]
                                                        .thumbnailSavePath
                                                )
                                                .then(() => {
                                                    thumbnails.push({
                                                        fileName:
                                                            newThumbnail[0]
                                                                .fileName,
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
        } else if (newThumbnail.length === 1) {
            sharp(newThumbnail[0].pixelData)
                .resize(96)
                .toFile(newThumbnail[0].thumbnailSavePath)
                .then(() => {
                    thumbnails.push({
                        fileName: newThumbnail[0].fileName,
                        thumbnailPath: newThumbnail[0].thumbnailSavePath,
                    });
                    resolve();
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        } else reject('Incorrect number of views');
    });
    return result;
};

/**
 * Saves the JSON database, ie D:\images\.thumbnails\database.json
 */
const saveThumbnailDatabase = () => {
    fs.writeFileSync(
        `${thumbnailPath}${
            process.platform === 'win32' ? '\\' : '/'
        }database.json`,
        JSON.stringify(thumbnails, null, 4)
    );
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
