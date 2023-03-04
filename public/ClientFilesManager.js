const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fsWin = require('fswin');
const { checkIfPathExists, getFileNameFromPath } = require('./Utils');
const Constants = require('./Constants');
const { ipcMain } = require('electron');
const { Channels } = require('./Constants');
const chokidar = require('chokidar');
const async = require('async');
const PNG = require('pngjs').PNG;
const jpeg = require('jpeg-js');
const dicomParser = require('dicom-parser');
const readline = require('readline');

class CustomPromise {
    isSettled = false;

    constructor() {
        this.promise = new Promise((_resolve, _reject) => {
            this.resolve = function (value) {
                this.isSettled = true;
                return _resolve(value);
            };
            this.reject = function (value) {
                this.isSettled = true;
                return _reject(value);
            };
        });
    }

    destruct() {
        this.promise = null;
        this.resolve = null;
        this.reject = null;
    }
}

class Thumbnails {
    static ACTION = {
        ADD: 'add-thumbnail',
        REMOVE: 'remove-thumbnail',
        UPDATE_ALL: 'update-all-thumbnails',
    };
    // Determines how long the program should wait for another task to start before we start saving
    // the thumbnails to the json file again
    static #STORAGE_SAVE_DELAY = 100;
    #thumbnailsObj = null;
    #thumbnailsPath = '';
    #annotationFilePath = '';
    // Keeps track of the scheduled updates to the thumbnails and update the json file when
    // the queue is empty. This avoids having to save to the file on every single update
    #queue;

    constructor() {
        this.#queue = async.queue(({ type, payload }, done) => {
            this.#updateThumbnails(type, payload);

            // Delay saving if there are no future tasks, otherwise call done immediately to save to the json file
            this.#queue.length() === 0
                ? setTimeout(done, Thumbnails.#STORAGE_SAVE_DELAY)
                : done();
        }, 1);
        // runs when the queue is empty with no tasks to complete
        this.#queue.drain(() => this.#saveThumbnailsToStorage());

        /**
         * Loads the specified thumbnail if the file name provided exists. If so it will
         * load the thumbnail and then, it will return the Base64 binary string of the thumbnail.
         * @param {string} args File path sent from react
         * @returns {string}
         */
        ipcMain.handle(
            Channels.getThumbnail,
            async (event, { fileName, filePath }) => {
                if (!this.#thumbnailsObj[fileName]) {
                    throw new Error('Thumbnail does not exist for that file');
                } else {
                    const fileData = await fs.promises.readFile(filePath);
                    return {
                        fileData: Buffer.from(fileData).toString('base64'),
                    };
                }
            }
        );
    }

    setAnnotationFilePath(path) {
        this.#annotationFilePath = path;
    }

    /**
     * Pushes an update to the thumbnails queue. The callback is invoked when the task is completed
     * which is when the 'done' callback is invoked by the queue
     * @param type
     * @param payload
     */
    scheduleStorageUpdate(type, payload) {
        this.#queue.push({ type, payload }, (error) => {
            console.log(`${type} operation completed!`);
        });
    }

    /**
     * Sets the private member for the thumbnails depending on the action type
     * @param type {string} - provided as a static member in the class definition
     * @param payload {object | string} - file name to be removed, object to be added, or object to override all current thumbnails
     * @returns {*}
     */
    #updateThumbnails(type, payload) {
        switch (type) {
            case Thumbnails.ACTION.ADD:
                return (this.#thumbnailsObj = {
                    ...this.#thumbnailsObj,
                    ...payload,
                });
            case Thumbnails.ACTION.REMOVE:
                return delete this.#thumbnailsObj[payload];
            case Thumbnails.ACTION.UPDATE_ALL:
                return (this.#thumbnailsObj = payload);
        }
    }

    /**
     * Saves the thumbnails object to a json file and updates the cached value in memory
     * @returns {Promise<void>}
     */
    async #saveThumbnailsToStorage() {
        try {
            if (!this.#thumbnailsPath) return;
            await fs.promises.writeFile(
                path.join(
                    this.#thumbnailsPath,
                    ClientFilesManager.STORAGE_FILE_NAME
                ),
                JSON.stringify(this.#thumbnailsObj, null, 4)
            );
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Gets the thumbnails object from storage and updates the private class member
     * If value already exists in memory, then we just return it
     * @returns {Promise<Object<string, string> | null>}
     */
    async getThumbnails() {
        try {
            if (this.#thumbnailsObj) return this.#thumbnailsObj;

            const string = await fs.promises.readFile(
                path.join(
                    this.#thumbnailsPath,
                    ClientFilesManager.STORAGE_FILE_NAME
                )
            );

            this.#thumbnailsObj = JSON.parse(string);
            return this.#thumbnailsObj;
        } catch (e) {
            return null;
        }
    }

    /**
     * Used to reset the cached thumbnails when the images' directory is changed
     */
    clearCurrentThumbnails() {
        this.#thumbnailsObj = null;
    }

    /**
     * Adds a thumbnail to storage
     * @param filename {string}
     * @param path {string}
     */
    addThumbnail(filename, path) {
        const newObj = { [filename]: path };
        this.scheduleStorageUpdate(Thumbnails.ACTION.ADD, newObj);
    }

    /**
     * Removes the thumbnail from the json storage and the associated .png file with it
     * @param filename {string}
     * @returns {Promise<void>}
     */
    async removeThumbnail(filename) {
        const path = this.#thumbnailsObj[filename];
        if (!path) return;
        await fs.promises.unlink(path);
        this.scheduleStorageUpdate(Thumbnails.ACTION.REMOVE, filename);
    }

    /**
     * Creates the thumbnails' path if not created and returns that path
     * @param {string} path
     * @returns {Promise<string>}
     */
    async setThumbnailsPath(path) {
        if (process.platform === 'win32') {
            this.#thumbnailsPath = `${path}\\.thumbnails`;
            try {
                await checkIfPathExists(this.#thumbnailsPath);
            } catch (e) {
                await fs.promises.mkdir(this.#thumbnailsPath);
                fsWin.setAttributesSync(this.#thumbnailsPath, {
                    IS_HIDDEN: true,
                });
            }
        } else {
            this.#thumbnailsPath = `${path}/.thumbnails`;
            try {
                await checkIfPathExists(this.#thumbnailsPath);
            } catch (e) {
                await fs.promises.mkdir(this.#thumbnailsPath);
            }
        }
        return this.#thumbnailsPath;
    }

    /**
     * Creates and saves a png image and returns a promise that resolves to the path of the image thumbnail created
     * @param selectedImagesDirPath {string}
     * @param fileName {string}
     * @returns {Promise<string>}
     */
    async generateThumbnail(selectedImagesDirPath, fileName) {
        const pixelData = await fs.promises.readFile(
            path.join(selectedImagesDirPath, fileName)
        );
        let thumbnailPath = '';
        if (path.extname(fileName).toLowerCase() !== '.dcm') {
            thumbnailPath = path.join(this.#thumbnailsPath, fileName);
            await sharp(pixelData)
                .resize(Constants.Thumbnail.width)
                .toFile(thumbnailPath)
                .catch((error) => console.log(error));
        } else {
            thumbnailPath = 'DICOM';
        }
        return thumbnailPath;
    }
}

class ClientFilesManager {
    static STORAGE_FILE_NAME = 'thumbnails.json';
    static IMAGE_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.dcm'];
    fileNames = [];
    currentFileIndex = -1;
    selectedImagesDirPath = '';
    colorFilePath = '';
    selectedAnnotationFile = '';
    settingsPath = '';
    #watcher = null;
    tempPath = '';
    #thumbnails = new Thumbnails();
    #isLoadingThumbnails = false;

    constructor(mainWindow, settingsPath, tempPath) {
        this.mainWindow = mainWindow;
        // we create a promise for the thumbnails that will be resolved later
        // once the thumbnails have been generated. If there are further updates
        // to the files then Electron will send more thumbnails to React
        this.thumbnailsPromise = new CustomPromise();
        this.settingsPath = settingsPath;
        this.tempPath = tempPath;
        ipcMain.handle(Channels.requestInitialThumbnailsList, async () => {
            try {
                return this.thumbnailsPromise.isSettled
                    ? await this.#prepareClientThumbnails(
                          await this.#thumbnails.getThumbnails()
                      )
                    : await this.thumbnailsPromise.promise;
            } catch (e) {
                throw new Error('No initial thumbnails');
            } finally {
                this.thumbnailsPromise.destruct();
            }
        });
        ipcMain.handle(
            Channels.thumbnailStatus,
            () => this.#isLoadingThumbnails
        );
    }

    /**
     * Checks if the provided file name is an acceptable image format
     * @param fileName {string}
     * @returns {boolean}
     */
    static #isFileTypeAllowed(fileName) {
        return ClientFilesManager.IMAGE_FILE_EXTENSIONS.includes(
            path.extname(fileName).toLowerCase()
        );
    }

    /**
     * Setter for isLoadingThumbnails which also sends the value to the React process
     * @param isLoading {boolean}
     */
    #sendThumbnailsStatus(isLoading) {
        this.#isLoadingThumbnails = isLoading;
        this.#sendUpdate(Channels.thumbnailStatus, this.#isLoadingThumbnails);
    }

    /**
     * Called when the app is first launched with the images' dir path from the settings
     * @param imagesDirPath {string}
     * @param annotationFilePath {string}
     * @param colorFilePath {string}
     * @returns {Promise<void>}
     */
    async initSelectedPaths(imagesDirPath, annotationFilePath, colorFilePath) {
        this.selectedAnnotationFile = annotationFilePath;
        this.#thumbnails.setAnnotationFilePath(annotationFilePath);
        // if no path exits in the settings then reject the React promise
        if (imagesDirPath === '') {
            return this.thumbnailsPromise.reject();
        }

        this.selectedImagesDirPath = imagesDirPath;
        this.colorFilePath = colorFilePath;
        this.#sendThumbnailsStatus(true);
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(imagesDirPath);
        if (dirContainsAnyImages) {
            this.currentFileIndex = 0;
            await this.#thumbnails.setThumbnailsPath(imagesDirPath);
            await this.#generateThumbnails();
            this.#sendFileInfo();
        } else if (!this.thumbnailsPromise.isSettled) {
            // if the directory path from the settings contains no images then reject the promise
            this.thumbnailsPromise.reject();
        }
        this.#sendThumbnailsStatus(false);
    }

    /**
     * Called when a new path is provided by the user to update the files and thumbnails
     * @param imagesDirPath {string}
     * @param annotationFilePath {string}
     * @returns {Promise<void>}
     */
    async updateSelectedPaths(imagesDirPath, annotationFilePath) {
        this.#sendThumbnailsStatus(true);
        this.selectedAnnotationFile = annotationFilePath;
        this.#thumbnails.setAnnotationFilePath(annotationFilePath);
        this.selectedImagesDirPath = imagesDirPath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(imagesDirPath);
        this.#thumbnails.clearCurrentThumbnails();
        this.currentFileIndex = 0;
        this.#sendFileInfo();
        if (dirContainsAnyImages) {
            await this.#thumbnails.setThumbnailsPath(imagesDirPath);
            await this.#generateThumbnails();
        }
        this.#sendThumbnailsStatus(false);
    }

    async updateAnnotationsFile(newAnnotationData) {
        return new Promise((resolve, reject) => {
            try {
                const {
                    cocoAnnotations,
                    cocoCategories,
                    cocoDeleted,
                    fileName,
                    imageId,
                } = newAnnotationData;
                if (
                    this.selectedAnnotationFile !== '' &&
                    fs.existsSync(this.selectedAnnotationFile)
                ) {
                    const readStream = fs.createReadStream(
                        this.selectedAnnotationFile
                    );
                    let data = '';
                    readStream.on('error', (err) => {
                        console.log(err);
                        reject(err);
                    });
                    readStream.on('data', (chunk) => {
                        data += chunk;
                    });
                    readStream.on('end', () => {
                        try {
                            let annotationFile = JSON.parse(data);
                            annotationFile = this.updateCocoFileForAnnotations(
                                annotationFile,
                                cocoAnnotations,
                                cocoCategories,
                                cocoDeleted
                            );
                            const tempReadStream = fs.createReadStream(
                                this.tempPath
                            );
                            let tempData = '';
                            tempReadStream.on('error', (err) => {
                                console.log(err);
                                reject(err);
                            });
                            tempReadStream.on('data', (chunk) => {
                                tempData += chunk;
                            });
                            readStream.on('end', () => {
                                const tempJsonData = JSON.parse(tempData);
                                if (tempJsonData?.length > 0) {
                                    tempJsonData.forEach((temp) => {
                                        annotationFile =
                                            this.updateCocoFileForAnnotations(
                                                annotationFile,
                                                temp.cocoAnnotations,
                                                temp.cocoCategories,
                                                temp.cocoDeleted
                                            );
                                    });
                                }

                                const writeStream = fs.createWriteStream(
                                    this.selectedAnnotationFile
                                );
                                writeStream.on('error', (err) => {
                                    console.log(err);
                                    reject(err);
                                });
                                writeStream.on('finish', () => {
                                    const savedFileName =
                                        this.fileNames[this.currentFileIndex];
                                    this.#sendUpdate(
                                        Channels.updateThumbnailHasAnnotations,
                                        {
                                            hasAnnotations:
                                                !!this.#getAnnotations(
                                                    annotationFile,
                                                    savedFileName
                                                ).length,
                                            fileName: savedFileName,
                                        }
                                    );
                                    if (
                                        this.currentFileIndex <
                                        this.fileNames.length - 1
                                    ) {
                                        this.currentFileIndex++;
                                    }
                                    resolve();
                                });
                                writeStream.write(
                                    JSON.stringify(annotationFile)
                                );
                                writeStream.end();
                            });
                        } catch (err) {
                            console.log(err);
                            reject(err);
                        }
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
        });
    }

    updateCocoFileForAnnotations(
        annotationFile,
        cocoAnnotations,
        cocoCategories,
        cocoDeleted
    ) {
        annotationFile.categories = cocoCategories;
        cocoAnnotations.forEach((annotation) => {
            const foundIndex = annotationFile.annotations.findIndex(
                (fileAnnotation) => fileAnnotation.id === annotation.id
            );
            if (foundIndex !== -1) {
                annotationFile.annotations[foundIndex] = annotation;
            } else {
                annotationFile.annotations.push(annotation);
            }
        });
        annotationFile.annotations = annotationFile.annotations.filter(
            (annot) => !cocoDeleted.includes(annot.id)
        );
        return annotationFile;
    }

    async createUpdateTempAnnotationsFile(
        cocoAnnotations,
        cocoCategories,
        cocoDeleted,
        fileName,
        imageId,
        filePath
    ) {
        if (cocoAnnotations?.length > 0) {
            const readStream = fs.createReadStream(filePath);
            let data = '';
            readStream.on('error', (err) => {
                console.log(err);
            });
            readStream.on('data', (chunk) => {
                data += chunk;
            });
            readStream.on('end', () => {
                try {
                    let annotationFile = JSON.parse(data);
                    annotationFile.push({
                        fileName,
                        imageId,
                        cocoAnnotations,
                        cocoCategories,
                        cocoDeleted,
                    });

                    const writeStream = fs.createWriteStream(filePath);
                    writeStream.on('error', (err) => {
                        console.log(err);
                    });
                    writeStream.on('finish', () => {
                        console.log('Saved temp data');
                    });
                    writeStream.write(JSON.stringify(annotationFile));
                    writeStream.end();
                } catch (err) {
                    console.log(err);
                }
            });
        }
    }

    async createAnnotationsFile(annotationFilePath, newAnnotationData) {
        return new Promise((resolve, reject) => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            const todayDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            const { cocoAnnotations, cocoCategories } = newAnnotationData;
            let annotationJson = {
                info: {
                    description: 'COCO Dataset',
                    url: 'http://cocodataset.org',
                    version: '1.0',
                    year: year,
                    contributor: 'COCO Consortium',
                    date_created: `${year}/${month}/${day}`,
                },
                licenses: [
                    {
                        url: 'http://creativecommons.org/licenses/by-nc-sa/2.0/',
                        id: 1,
                        name: 'Attribution-NonCommercial-ShareAlike License',
                    },
                    {
                        url: 'http://creativecommons.org/licenses/by-nc/2.0/',
                        id: 2,
                        name: 'Attribution-NonCommercial License',
                    },
                    {
                        url: 'http://creativecommons.org/licenses/by-nc-nd/2.0/',
                        id: 3,
                        name: 'Attribution-NonCommercial-NoDerivs License',
                    },
                    {
                        url: 'http://creativecommons.org/licenses/by/2.0/',
                        id: 4,
                        name: 'Attribution License',
                    },
                    {
                        url: 'http://creativecommons.org/licenses/by-sa/2.0/',
                        id: 5,
                        name: 'Attribution-ShareAlike License',
                    },
                    {
                        url: 'http://creativecommons.org/licenses/by-nd/2.0/',
                        id: 6,
                        name: 'Attribution-NoDerivs License',
                    },
                    {
                        url: 'http://flickr.com/commons/usage/',
                        id: 7,
                        name: 'No known copyright restrictions',
                    },
                    {
                        url: 'http://www.usa.gov/copyright.shtml',
                        id: 8,
                        name: 'United States Government Work',
                    },
                ],
                images: [],
                annotations: cocoAnnotations,
                categories: cocoCategories,
            };

            const listOfPromises = [];
            // TODO: Refactor to not loop through file names, but only the file names based on the annotations
            this.fileNames.forEach((file, index) => {
                annotationJson.images.push({
                    id: index + 1,
                    coco_url: '',
                    flickr_url: '',
                    file_name: file,
                    date_capture: todayDateString,
                });
                const imagePath = path.join(this.selectedImagesDirPath, file);
                if (path.extname(file).toLowerCase() === '.dcm') {
                    listOfPromises.push(
                        this.getDICOMDimensions(imagePath, file)
                    );
                } else if (
                    path.extname(file).toLowerCase() === '.jpg' ||
                    path.extname(file).toLowerCase() === '.jpeg'
                ) {
                    listOfPromises.push(
                        this.getJPEGDimensions(imagePath, file)
                    );
                } else if (path.extname(file).toLowerCase() === '.png') {
                    listOfPromises.push(this.getPNGDimensions(imagePath, file));
                }
            });

            Promise.all(listOfPromises)
                .then((results) => {
                    results.forEach((result) => {
                        const foundIndex = annotationJson.images.findIndex(
                            (image) => image.file_name === result.fileName
                        );
                        if (foundIndex !== -1) {
                            annotationJson.images[foundIndex].width =
                                result.width;
                            annotationJson.images[foundIndex].height =
                                result.height;
                        }
                    });
                    const annotationPath = path.join(
                        annotationFilePath,
                        'annotation.json'
                    );
                    const writeStream = fs.createWriteStream(annotationPath);
                    writeStream.on('error', (err) => {
                        console.log(err);
                        reject(err);
                    });
                    writeStream.on('finish', () => {
                        this.selectedAnnotationFile = annotationPath;
                        this.#thumbnails.setAnnotationFilePath(annotationPath);
                        this.#sendUpdate(
                            Channels.updateAnnotationFile,
                            this.selectedAnnotationFile
                        );
                        const settingsWriteStream = fs.createWriteStream(
                            this.settingsPath
                        );
                        settingsWriteStream.write(
                            JSON.stringify({
                                selectedImagesDirPath:
                                    this.selectedImagesDirPath,
                                selectedAnnotationFile:
                                    this.selectedAnnotationFile,
                            })
                        );
                        settingsWriteStream.end();
                        this.currentFileIndex++;
                        resolve();
                    });
                    writeStream.write(JSON.stringify(annotationJson, null, 4));
                    writeStream.end();
                })
                .catch((error) => {
                    console.log(error);
                    reject(error);
                });
        });
    }

    async getPNGDimensions(filePath, fileName) {
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(new PNG())
                .on('parsed', function () {
                    resolve({
                        width: this.width,
                        height: this.height,
                        fileName,
                    });
                })
                .on('error', function (error) {
                    console.log(error);
                    reject(error);
                });
        });
    }

    async getJPEGDimensions(filePath, fileName) {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath);
            let data = Buffer.from([]);
            stream.on('data', (chunk) => {
                data = Buffer.concat([data, chunk]);
            });
            stream.on('end', () => {
                const { width, height } = jpeg.decode(data);
                resolve({ width, height, fileName });
            });
            stream.on('error', (error) => {
                console.log(error);
                reject(error);
            });
        });
    }

    async getDICOMDimensions(filePath, fileName) {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath);
            let data = Buffer.from([]);
            stream.on('data', (chunk) => {
                data = Buffer.concat([data, chunk]);
            });
            stream.on('end', () => {
                const dataSet = dicomParser.parseDicom(data);
                const width = dataSet.uint16('x00280011');
                const height = dataSet.uint16('x00280010');
                resolve({ width, height, fileName });
            });
            stream.on('error', (error) => {
                console.log(error);
                reject(error);
            });
        });
    }

    /**
     * Reads the next file data if there is one and increments the current index
     * @returns {pixelData: <Buffer>, annotationInformation: Array}
     */
    async getNextFile() {
        this.currentFileIndex++;

        this.#sendFileInfo();
        if (!this.fileNames.length) {
            throw new Error('Directory contains no images');
        } else if (this.currentFileIndex >= this.fileNames.length) {
            throw new Error('No more files');
        }

        let annotationInformation = [];
        if (this.selectedAnnotationFile) {
            annotationInformation = await this.getAnnotationsForFile(
                this.fileNames[this.currentFileIndex]
            );
        }
        const pixelData = await fs.promises.readFile(
            path.join(
                this.selectedImagesDirPath,
                this.fileNames[this.currentFileIndex]
            )
        );

        return { pixelData, annotationInformation };
    }

    async getCurrentFile(colors) {
        this.#sendFileInfo();
        if (!this.fileNames.length) {
            throw new Error('Directory contains no images');
        } else if (this.currentFileIndex >= this.fileNames.length) {
            throw new Error('No more files');
        }

        let annotationInformation = [];
        annotationInformation = await this.getAnnotationsForFile(
            this.fileNames[this.currentFileIndex]
        );
        const pixelData = await fs.promises.readFile(
            path.join(
                this.selectedImagesDirPath,
                this.fileNames[this.currentFileIndex]
            )
        );

        return {
            pixelData,
            pixelType: path
                .extname(this.fileNames[this.currentFileIndex])
                .toLowerCase(),
            annotationInformation,
            colors,
        };
    }

    async selectFile(filename) {
        const index = this.fileNames.findIndex((name) => name === filename);
        if (index === -1) throw new Error("File name doesn't exists");
        this.currentFileIndex = index;
        this.#sendFileInfo();
    }

    async getAnnotationsForFile(fileName) {
        // TODO: Refactor below to get temp data if there is any
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.tempPath);
            let data = '';
            readStream.on('error', (error) => {
                reject(error);
            });
            readStream.on('data', (chunk) => {
                data += chunk;
            });
            readStream.on('end', () => {
                const tempData = JSON.parse(data);
                if (tempData?.length > 0) {
                    const foundTempData = tempData.find(
                        (temp) => temp.fileName === fileName
                    );
                    if (foundTempData) {
                        resolve({
                            annotations: foundTempData.cocoAnnotations,
                            categories: foundTempData.cocoCategories,
                            deletedAnnotationIds: foundTempData.cocoDeleted,
                            imageId: foundTempData.imageId,
                        });
                    } else if (this.selectedAnnotationFile) {
                        this.#cocoAnnotationLoader()
                            .then((data) => resolve(data))
                            .catch((err) => reject(err));
                    }
                } else if (this.selectedAnnotationFile) {
                    this.#cocoAnnotationLoader()
                        .then((data) => resolve(data))
                        .catch((err) => reject(err));
                }
            });
        });
    }

    #cocoAnnotationLoader() {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(this.selectedAnnotationFile);
            let data = '';
            readStream.on('error', (error) => {
                reject(error);
            });
            readStream.on('data', (chunk) => {
                data += chunk;
            });
            readStream.on('end', () => {
                const allAnnotations = JSON.parse(data);
                const maxAnnotationId =
                    allAnnotations.annotations.reduce((a, b) =>
                        a.id > b.id ? a : b
                    ).id + 1;

                const image = allAnnotations.images.find(
                    (img) =>
                        img.file_name === this.fileNames[this.currentFileIndex]
                );

                let imageId = 1;
                // TODO: What to do if it is over?
                if (image && image?.id <= Number.MAX_SAFE_INTEGER) {
                    imageId = image.id;
                }

                resolve({
                    annotations: this.#getAnnotations(
                        allAnnotations,
                        this.fileNames[this.currentFileIndex]
                    ),
                    categories: allAnnotations.categories,
                    maxAnnotationId,
                    imageId,
                });
            });
        });
    }

    /**
     * Given the annotations object, it gets the annotations for the given image file name
     *
     * @param annotationFileObj {object} - annotations object read from a file
     * @param fileName {string} - file name of the image
     * @return {T[]|*[]}
     */
    #getAnnotations(annotationFileObj, fileName) {
        const imageInformation = annotationFileObj.images.find(
            (image) => image.file_name === fileName
        );
        if (imageInformation !== undefined) {
            const imageId = imageInformation.id;
            return annotationFileObj.annotations.filter(
                (annotation) => annotation.image_id === imageId
            );
        } else return [];
    }

    /**
     * Updates the fileNames array with new image names
     * @param dirPath
     * @returns {Promise<boolean>} - returns false if the dir contains no images, otherwise it returns true
     */
    async #updateFileNames(dirPath) {
        const foundFiles = await fs.promises.readdir(dirPath);
        this.fileNames = foundFiles.filter((file) =>
            ClientFilesManager.#isFileTypeAllowed(file)
        );
        return !!this.fileNames.length;
    }

    /**
     * Generates the thumbnails and saves them to the .thumbnails dir
     * @returns {Promise<>}
     */
    async #generateThumbnails() {
        const newThumbnails = {};
        const storedThumbnails = await this.#thumbnails.getThumbnails();
        const promises = this.fileNames.map(async (fileName) => {
            // skip creating a thumbnail if there's already one
            if (storedThumbnails?.hasOwnProperty(fileName)) return;
            newThumbnails[fileName] = await this.#thumbnails.generateThumbnail(
                this.selectedImagesDirPath,
                fileName
            );
        });

        await Promise.allSettled(promises);
        const allThumbnails = {
            ...storedThumbnails,
            ...newThumbnails,
        };

        const clientThumbnails = await this.#prepareClientThumbnails(
            allThumbnails
        );

        this.#thumbnails.scheduleStorageUpdate(
            Thumbnails.ACTION.UPDATE_ALL,
            allThumbnails
        );

        // if the promise has not been resolved before, then resolve it once
        if (!this.thumbnailsPromise.isSettled)
            this.thumbnailsPromise.resolve(clientThumbnails);
    }

    /**
     * Takes an object of thumbnails and returns an array of the thumbnails
     * in the original order of the files and determines which thumbnails have annotations
     * @param thumbnails {Object<string, string> | null}
     * @returns {Promise<Array<{fileName: string, filePath: string, hasAnnotations: boolean}>>}
     */
    async #prepareClientThumbnails(thumbnails) {
        const _thumbnails = [];
        if (thumbnails === null) return _thumbnails;
        const annotations = await this.#getAllAnnotationsFromStorage();
        this.fileNames.forEach((fileName) =>
            _thumbnails.push({
                fileName,
                filePath: thumbnails[fileName],
                hasAnnotations: !!annotations[fileName],
            })
        );
        return _thumbnails;
    }

    /**
     * Reads the annotations file if there is one, and returns an object with keys
     * for each file and a boolean indicating if the file has annotations
     * @returns {Object<string, boolean>}
     */
    async #getAllAnnotationsFromStorage() {
        try {
            const data = await fs.promises.readFile(
                this.selectedAnnotationFile
            );
            const { images, annotations } = JSON.parse(data);
            const annotationsMap = {};
            images.forEach((image) => {
                annotationsMap[image.file_name] = annotations.some(
                    (annotation) => annotation.image_id === image.id
                );
            });
            return annotationsMap;
        } catch (e) {
            return {};
        }
    }

    #sendFileInfo() {
        this.mainWindow.webContents.send(Constants.Channels.newFileUpdate, {
            currentFileName: this.fileNames[this.currentFileIndex] || '',
            filesNum: this.fileNames.length,
        });
    }

    /**
     * A channel with the React process to update the list of thumbnails
     * on the UI side.
     * @param channel {string}
     * @param payload {object}
     */
    #sendUpdate(channel, payload) {
        this.mainWindow.webContents.send(channel, payload);
    }

    /**
     * Sets up a file watcher on the images' directory to manage the thumbnails for the images
     * @returns {Promise<void>}
     */
    async #setDirWatcher() {
        await this.removeFileWatcher();
        // create a directory watcher, making sure it ignores json files
        // it also doesn't fire the first time. And we wait for the file to fully write
        this.#watcher = chokidar.watch(this.selectedImagesDirPath, {
            ignored: Constants.FileWatcher.all_json_files,
            depth: 0,
            ignoreInitial: true,
            awaitWriteFinish: true,
        });

        this.#watcher
            .on(Constants.FileWatcher.add, async (addedFilePath) => {
                const addedFilename = getFileNameFromPath(addedFilePath);
                if (!ClientFilesManager.#isFileTypeAllowed(addedFilename))
                    return;

                await this.#thumbnails.setThumbnailsPath(
                    this.selectedImagesDirPath
                );
                try {
                    const newThumbnailPath =
                        await this.#thumbnails.generateThumbnail(
                            this.selectedImagesDirPath,
                            addedFilename
                        );
                    this.#thumbnails.addThumbnail(
                        addedFilename,
                        newThumbnailPath
                    );
                    this.#sendUpdate(Channels.addThumbnail, {
                        fileName: addedFilename,
                        filePath: newThumbnailPath,
                    });
                    this.fileNames.push(addedFilename);

                    if (this.selectedAnnotationFile !== '') {
                        this.addImageAnnotationHandler(
                            addedFilePath,
                            addedFilename
                        );
                    }

                    // if the added file is the only file, then send a file update
                    if (this.fileNames.length === 1) {
                        this.currentFileIndex = 0;
                        this.#sendFileInfo();
                    }
                } catch (e) {
                    console.log(e);
                }
            })
            .on(Constants.FileWatcher.unlink, async (removedFilePath) => {
                const removedFileName = getFileNameFromPath(removedFilePath);
                if (!ClientFilesManager.#isFileTypeAllowed(removedFileName))
                    return;
                const removedFileIndex = this.fileNames.findIndex(
                    (fileName) => fileName === removedFileName
                );
                if (removedFileIndex <= -1) {
                    throw new Error('Error with removed file index');
                }

                if (this.selectedAnnotationFile !== '') {
                    this.removeImageFromAnnotations(removedFileName);
                }
                this.fileNames.splice(removedFileIndex, 1);

                if (this.fileNames.length === 0) {
                    // no files are left
                    this.currentFileIndex = -1;
                    this.#sendFileInfo();
                } else if (removedFileIndex === this.currentFileIndex) {
                    // if the removed file is the current one, then send a file update
                    this.currentFileIndex = Math.max(
                        this.currentFileIndex - 1,
                        0
                    );
                    this.#sendFileInfo();
                } else if (removedFileIndex < this.currentFileIndex) {
                    // update the current index if the file removed is before the current file
                    this.currentFileIndex--;
                }
                await this.#thumbnails.removeThumbnail(removedFileName);
                this.#sendUpdate(Channels.removeThumbnail, removedFileName);
            });
    }

    async removeFileWatcher() {
        await this.#watcher?.unwatch(this.selectedImagesDirPath);
        await this.#watcher?.close();
    }

    async removeImageFromAnnotations(filename) {
        // Read the annotations file and parse it as JSON
        const annotationsFilename = this.selectedAnnotationFile;
        const annotationsReadStream = fs.createReadStream(
            annotationsFilename,
            'utf8'
        );
        const annotationsReader = readline.createInterface({
            input: annotationsReadStream,
            crlfDelay: Infinity,
        });

        let annotationsString = '';
        annotationsReader.on('line', (line) => {
            annotationsString += line;
        });

        annotationsReader.on('close', () => {
            const annotations = JSON.parse(annotationsString);

            // Find the image with the given filename
            const image = annotations.images.find(
                (img) => img.file_name === filename
            );

            if (image) {
                const imageId = image.id;

                // Remove all instances associated with the image
                annotations.annotations = annotations.annotations.filter(
                    (ann) => ann.image_id !== imageId
                );

                // Remove the image from the annotations
                annotations.images = annotations.images.filter(
                    (img) => img.id !== imageId
                );

                // Write the updated annotations to the file
                const writeStream = fs.createWriteStream(annotationsFilename, {
                    encoding: 'utf8',
                });
                const updatedAnnotationsString = JSON.stringify(annotations);
                writeStream.write(updatedAnnotationsString);
                writeStream.end();

                console.log(
                    `Removed instances from ${filename} and saved updated annotations to ${annotationsFilename}`
                );
            } else {
                console.error(`Image ${filename} not found in the annotations`);
            }
        });
    }

    async addImageAnnotationHandler(filePath, fileName) {
        if (path.extname(fileName).toLowerCase() === '.dcm') {
            this.getDICOMDimensions(filePath, fileName)
                .then((result) => {
                    this.addImageToAnnotations(
                        result.fileName,
                        result.width,
                        result.height
                    );
                })
                .catch((error) => console.log(error));
        } else if (path.extname(fileName).toLowerCase() === '.png') {
            this.getPNGDimensions(filePath, fileName)
                .then((result) => {
                    this.addImageToAnnotations(
                        result.fileName,
                        result.width,
                        result.height
                    );
                })
                .catch((error) => console.log(error));
        } else if (
            path.extname(fileName).toLowerCase() === '.jpg' ||
            path.extname(fileName).toLowerCase() === '.jpeg'
        ) {
            this.getJPEGDimensions(filePath, fileName)
                .then((result) => {
                    this.addImageToAnnotations(
                        result.fileName,
                        result.width,
                        result.height
                    );
                })
                .catch((error) => console.log(error));
        }
    }

    async addImageToAnnotations(filename, width, height) {
        // Read the annotations file and parse it as JSON
        const annotationsFilename = this.selectedAnnotationFile;
        const annotationsReadStream = fs.createReadStream(
            annotationsFilename,
            'utf8'
        );
        const annotationsReader = readline.createInterface({
            input: annotationsReadStream,
            crlfDelay: Infinity,
        });

        let annotationsString = '';
        annotationsReader.on('line', (line) => {
            annotationsString += line;
        });

        annotationsReader.on('close', () => {
            const annotations = JSON.parse(annotationsString);

            // Generate a new image ID
            const maxImageId = Math.max(
                ...annotations.images.map((img) => img.id)
            );
            const newImageId = maxImageId + 1;

            // Add the new image to the annotations
            const newImage = {
                id: newImageId,
                file_name: filename,
                width,
                height,
                coco_url: '',
                flickr_url: '',
            };
            annotations.images.push(newImage);

            // Serialize the updated annotations
            const updatedAnnotationsString = JSON.stringify(annotations);

            // Write the updated annotations to the file
            const writeStream = fs.createWriteStream(annotationsFilename, {
                encoding: 'utf8',
            });
            writeStream.write(updatedAnnotationsString);
            writeStream.end();

            console.log(`Added image ${filename} to annotations`);
        });
    }
}

module.exports.ClientFilesManager = ClientFilesManager;
