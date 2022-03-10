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

let mainWindow;
let files = [];
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
                    generateThumbNails(path);
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

const generateThumbNails = async (path) => {
    const thumbnailsPath = createThumbnailsPath(path);
    readdir(path)
        .then((filesResult) => {
            let thumbnails = [];
            filesResult.forEach((fileName) => {
                if (validateFileExtension(fileName)) {
                    let filePath;
                    if (process.platform === 'win32') {
                        filePath = `${path}\\${fileName}`;
                    } else {
                        filePath = `${path}/${fileName}`;
                    }
                    try {
                        const fileData = fs.readFileSync(filePath);
                        const fileObject =
                            Buffer.from(fileData).toString('base64');
                        const myZip = new JSZip();
                        myZip
                            .loadAsync(fileObject, { base64: true })
                            .then(() => {
                                myZip
                                    .file('stack.xml')
                                    .async('string')
                                    .then((stackFile) => {
                                        parseString(
                                            stackFile,
                                            (error, result) => {
                                                if (error === null) {
                                                    let newThumbnail = [];
                                                    result.image.stack.forEach(
                                                        (stack) => {
                                                            console.log(
                                                                `File: ${stack.layer[0].$.src}`
                                                            );
                                                            let saveThumbnailPath =
                                                                process.platform ===
                                                                'win32'
                                                                    ? `${path}\\.thumbnails\\${fileName}_thumbnail_${stack.$.view}.png`
                                                                    : `${path}/.thumbnails/${fileName}_thumbnail_${stack.$.view}.png`;
                                                            newThumbnail.push({
                                                                image: filePath,
                                                                thumbnail:
                                                                    saveThumbnailPath,
                                                            });
                                                            myZip
                                                                .file(
                                                                    stack
                                                                        .layer[0]
                                                                        .$.src
                                                                )
                                                                .async(
                                                                    'arraybuffer'
                                                                )
                                                                .then(
                                                                    (
                                                                        imageData
                                                                    ) => {
                                                                        console.log(
                                                                            'file loaded'
                                                                        );
                                                                        const byteArray =
                                                                            new Uint8Array(
                                                                                imageData
                                                                            );
                                                                        try {
                                                                            // Allow raw files
                                                                            const options =
                                                                                {
                                                                                    TransferSyntaxUID:
                                                                                        '1.2.840.10008.1.2',
                                                                                };
                                                                            // Parse the byte array to get a DataSet object that has the parsed contents
                                                                            const dataSet =
                                                                                dicomParser.parseDicom(
                                                                                    byteArray,
                                                                                    options
                                                                                );

                                                                            // get the pixel data element (contains the offset and length of the data)
                                                                            const pixelDataElement =
                                                                                dataSet
                                                                                    .elements
                                                                                    .x7fe00010;

                                                                            // create a typed array on the pixel data (this example assumes 16 bit unsigned data)
                                                                            const pixelData =
                                                                                new Uint16Array(
                                                                                    dataSet.byteArray.buffer,
                                                                                    pixelDataElement.dataOffset,
                                                                                    pixelDataElement.length /
                                                                                        2
                                                                                );
                                                                            const intervals =
                                                                                Utils.buildIntervals();
                                                                            const height =
                                                                                dataSet.int16(
                                                                                    'x00280010'
                                                                                );
                                                                            const width =
                                                                                dataSet.int16(
                                                                                    'x00280011'
                                                                                );
                                                                            const EightbitPixels =
                                                                                new Uint8ClampedArray(
                                                                                    4 *
                                                                                        width *
                                                                                        height
                                                                                );
                                                                            let z = 0;
                                                                            for (
                                                                                let i = 0;
                                                                                i <
                                                                                pixelData.length;
                                                                                i++
                                                                            ) {
                                                                                const greyValue =
                                                                                    Utils.findGrayValue(
                                                                                        pixelData[
                                                                                            i
                                                                                        ],
                                                                                        intervals
                                                                                    );
                                                                                EightbitPixels[
                                                                                    z
                                                                                ] =
                                                                                    greyValue;
                                                                                EightbitPixels[
                                                                                    z +
                                                                                        1
                                                                                ] =
                                                                                    greyValue;
                                                                                EightbitPixels[
                                                                                    z +
                                                                                        2
                                                                                ] =
                                                                                    greyValue;
                                                                                EightbitPixels[
                                                                                    z +
                                                                                        3
                                                                                ] = 255;
                                                                                z += 4;
                                                                            }
                                                                            sharp(
                                                                                EightbitPixels,
                                                                                {
                                                                                    raw: {
                                                                                        width,
                                                                                        height,
                                                                                        channels: 4,
                                                                                    },
                                                                                }
                                                                            )
                                                                                .resize(
                                                                                    96,
                                                                                    96
                                                                                )
                                                                                .toFile(
                                                                                    saveThumbnailPath,
                                                                                    (
                                                                                        error,
                                                                                        info
                                                                                    ) => {
                                                                                        console.log(
                                                                                            error
                                                                                        );
                                                                                        console.log(
                                                                                            info
                                                                                        );
                                                                                        thumbnails.push(
                                                                                            newThumbnail
                                                                                        );
                                                                                        fs.writeFileSync(
                                                                                            `${thumbnailsPath}${
                                                                                                process.platform ===
                                                                                                'win32'
                                                                                                    ? '\\'
                                                                                                    : '/'
                                                                                            }database.json`,
                                                                                            JSON.stringify(
                                                                                                thumbnails,
                                                                                                null,
                                                                                                4
                                                                                            )
                                                                                        );
                                                                                    }
                                                                                );
                                                                        } catch (ex) {
                                                                            console.log(
                                                                                'Error parsing byte stream',
                                                                                ex
                                                                            );
                                                                        }
                                                                    }
                                                                );
                                                            // myZip
                                                            //     .file(
                                                            //         stack
                                                            //             .layer[0]
                                                            //             .$.src
                                                            //     )
                                                            //     .async(
                                                            //         'nodebuffer'
                                                            //     )
                                                            //     .then(
                                                            //         (
                                                            //             imageData
                                                            //         ) => {
                                                            //             sharp(
                                                            //                 imageData
                                                            //             )
                                                            //                 .resize(
                                                            //                     96,
                                                            //                     96
                                                            //                 )
                                                            //                 .toFile(
                                                            //                     saveThumbnailPath,
                                                            //                     (
                                                            //                         error,
                                                            //                         info
                                                            //                     ) => {
                                                            //                         console.log(
                                                            //                             error
                                                            //                         );
                                                            //                         console.log(
                                                            //                             info
                                                            //                         );
                                                            //                         thumbnails.push(
                                                            //                             newThumbnail
                                                            //                         );
                                                            //                         fs.writeFileSync(
                                                            //                             `${thumbnailsPath}${
                                                            //                                 process.platform ===
                                                            //                                 'win32'
                                                            //                                     ? '\\'
                                                            //                                     : '/'
                                                            //                             }database.json`,
                                                            //                             JSON.stringify(
                                                            //                                 thumbnails,
                                                            //                                 null,
                                                            //                                 4
                                                            //                             )
                                                            //                         );
                                                            //                     }
                                                            //                 );
                                                            //         }
                                                            //     );
                                                        }
                                                    );
                                                } else console.log(error);
                                            }
                                        );
                                    });
                            });
                    } catch (error) {
                        console.log(error);
                    }
                }
            });
        })
        .catch((error) => {
            console.log(error);
        });
};

const createThumbnailsPath = (path) => {
    let thumbnailsPath;
    if (process.platform === 'win32') {
        thumbnailsPath = `${path}\\.thumbnails`;
        if (!fs.existsSync(thumbnailsPath)) {
            fs.mkdirSync(thumbnailsPath);
            fsWin.setAttributesSync(thumbnailsPath, { IS_HIDDEN: true });
        }
    } else {
        thumbnailsPath = `${path}/.thumbnails`;
        if (!fs.existsSync(thumbnailsPath)) {
            fs.mkdirSync(thumbnailsPath);
        }
    }
    return thumbnailsPath;
};
