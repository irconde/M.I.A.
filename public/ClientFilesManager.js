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
const dicomParser = require('dicom-parser');
const Utils = require('./Utils');

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
        this.#queue.drain(() => {
            // TODO: remove logs
            console.log('Finished all queued tasks');
            this.#saveThumbnailsToStorage().then(() => {
                console.log('SAVED IN DRAIN');
            });
        });
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
        await fs.promises.writeFile(
            path.join(
                this.#thumbnailsPath,
                ClientFilesManager.STORAGE_FILE_NAME
            ),
            JSON.stringify(this.#thumbnailsObj, null, 4)
        );
    }

    /**
     * Gets the thumbnails object from storage and updates the private class member
     * If value already exists in memory, then we just return it
     * @returns {Promise<Object | null>}
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
     * @returns {Promise<object>}
     */
    async addThumbnail(filename, path) {
        const newObj = { [filename]: path };
        this.scheduleStorageUpdate(Thumbnails.ACTION.ADD, newObj);
        return newObj;
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
     * Generates a PNG formatted pixel data along with the width and height of the passed in DICOS/TDR image
     * @param {ArrayBuffer} imageData
     * @returns {{width: Number; height: Number; pixelData: Uint8ClampedArray}}
     */
    dicomToPngData(imageData) {
        try {
            // Allow raw files
            const options = {
                TransferSyntaxUID: '1.2.840.10008.1.2',
            };
            // Parse the byte array to get a DataSet object that has the parsed contents
            const dataSet = dicomParser.parseDicom(imageData, options);

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
            const split = fileName.split('.');
            thumbnailPath = path.join(this.#thumbnailsPath, `${split[0]}.png`);
            const dicomPngData = this.dicomToPngData(pixelData);
            sharp(dicomPngData.pixelData, {
                raw: {
                    width: dicomPngData.width,
                    height: dicomPngData.height,
                    channels: 4,
                },
            })
                .resize(Constants.Thumbnail.width)
                .png()
                .toFile(thumbnailPath)
                .catch((error) => {
                    console.log(error);
                });
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
    #watcher = null;
    #thumbnails = new Thumbnails();

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        // we create a promise for the thumbnails that will be resolved later
        // once the thumbnails have been generated. If there are further updates
        // to the files then Electron will send more thumbnails to React
        this.thumbnailsPromise = new CustomPromise();
        ipcMain.handleOnce(Channels.requestInitialThumbnailsList, async () => {
            try {
                return await this.thumbnailsPromise.promise;
            } catch (e) {
                throw new Error('No initial thumbnails');
            } finally {
                this.thumbnailsPromise.destruct();
            }
        });
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
     * Called when the app is first launched with the images' dir path from the settings
     * @param imagesDirPath {string}
     * @param annotationFilePath {string}
     * @param colorFilePath {string}
     * @returns {Promise<void>}
     */
    async initSelectedPaths(imagesDirPath, annotationFilePath, colorFilePath) {
        this.selectedAnnotationFile = annotationFilePath;
        // if no path exits in the settings then reject the React promise
        if (imagesDirPath === '') return this.thumbnailsPromise.reject();

        this.selectedImagesDirPath = imagesDirPath;
        this.colorFilePath = colorFilePath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(imagesDirPath);
        if (dirContainsAnyImages) {
            this.currentFileIndex = 0;
            await this.#thumbnails.setThumbnailsPath(imagesDirPath);
            await this.#generateThumbnails();
        } else if (!this.thumbnailsPromise.isSettled) {
            // if the directory path from the settings contains no images then reject the promise
            this.thumbnailsPromise.reject();
        }
    }

    /**
     * Called when a new path is provided by the user to update the files and thumbnails
     * @param imagesDirPath {string}
     * @param annotationFilePath {string}
     * @returns {Promise<void>}
     */
    async updateSelectedPaths(imagesDirPath, annotationFilePath) {
        this.selectedAnnotationFile = annotationFilePath;
        this.selectedImagesDirPath = imagesDirPath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(imagesDirPath);
        if (!dirContainsAnyImages) return;
        this.#thumbnails.clearCurrentThumbnails();
        await this.#thumbnails.setThumbnailsPath(imagesDirPath);
        await this.#generateThumbnails();
    }

    async updateAnnotationsFile(newAnnotationData) {
        return new Promise((resolve, reject) => {
            try {
                const { cocoAnnotations, cocoCategories, cocoDeleted } =
                    newAnnotationData;
                if (
                    this.selectedAnnotationFile !== '' &&
                    fs.existsSync(this.selectedAnnotationFile)
                ) {
                    fs.readFile(this.selectedAnnotationFile, (err, data) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            const annotationFile = JSON.parse(data);
                            annotationFile.categories = cocoCategories;
                            cocoAnnotations.forEach((annotation) => {
                                const foundIndex =
                                    annotationFile.annotations.findIndex(
                                        (fileAnnotation) =>
                                            fileAnnotation.id === annotation.id
                                    );
                                if (foundIndex !== -1) {
                                    annotationFile.annotations[foundIndex] =
                                        annotation;
                                } else {
                                    // ID set by client may not be unique, need to check file
                                    annotation.id =
                                        annotationFile.annotations.reduce(
                                            (a, b) => (a.id > b.id ? a : b)
                                        ).id + 1;
                                    annotationFile.annotations.push(annotation);
                                }
                            });
                            annotationFile.annotations =
                                annotationFile.annotations.filter((annot) => {
                                    return !cocoDeleted.includes(annot.id);
                                });
                            fs.writeFile(
                                this.selectedAnnotationFile,
                                JSON.stringify(annotationFile),
                                (err) => {
                                    if (err) {
                                        console.log(err);
                                        reject(err);
                                    } else {
                                        if (
                                            this.currentFileIndex <
                                            this.fileNames.length - 1
                                        ) {
                                            this.currentFileIndex++;
                                        }
                                        resolve();
                                    }
                                }
                            );
                        }
                    });
                }
            } catch (e) {
                console.log(e);
                reject(e);
            }
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
            annotationInformation = await this.getAnnotationsForFile();
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
        if (this.selectedAnnotationFile) {
            annotationInformation = await this.getAnnotationsForFile();
        }
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

    async getAnnotationsForFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.selectedAnnotationFile, (error, data) => {
                if (error) reject(error);
                let annotations = [];
                const allAnnotations = JSON.parse(data);
                const imageInformation = allAnnotations.images.find(
                    (image) =>
                        image.file_name ===
                        this.fileNames[this.currentFileIndex]
                );
                if (imageInformation !== undefined) {
                    const imageId = imageInformation.id;
                    annotations = allAnnotations.annotations.filter(
                        (annotation) => annotation.image_id === imageId
                    );
                }
                resolve({ annotations, categories: allAnnotations.categories });
            });
        });
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
            if (storedThumbnails?.hasOwnProperty(fileName)) {
                return;
            }
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
        // if the promise has not been resolved before, then resolve it once
        if (!this.thumbnailsPromise.isSettled)
            this.thumbnailsPromise.resolve(allThumbnails);

        this.#thumbnails.scheduleStorageUpdate(
            Thumbnails.ACTION.UPDATE_ALL,
            allThumbnails
        );
        this.#sendThumbnailsUpdate(Channels.updateThumbnails, allThumbnails);
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
    #sendThumbnailsUpdate(channel, payload) {
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
                console.log(addedFilename, ' added!');
                this.fileNames.push(addedFilename);
                await this.#thumbnails.setThumbnailsPath(
                    this.selectedImagesDirPath
                );
                try {
                    const newThumbnailPath =
                        await this.#thumbnails.generateThumbnail(
                            this.selectedImagesDirPath,
                            addedFilename
                        );
                    const thumbnailObj = await this.#thumbnails.addThumbnail(
                        addedFilename,
                        newThumbnailPath
                    );
                    this.#sendThumbnailsUpdate(
                        Channels.addThumbnail,
                        thumbnailObj
                    );
                } catch (e) {
                    console.log(e);
                }
            })
            .on(Constants.FileWatcher.unlink, async (removedFilePath) => {
                const removedFileName = getFileNameFromPath(removedFilePath);
                if (!ClientFilesManager.#isFileTypeAllowed(removedFileName))
                    return;
                console.log(removedFileName, ' removed!');
                const removedFileIndex = this.fileNames.findIndex(
                    (fileName) => fileName === removedFileName
                );
                if (removedFileIndex <= -1) {
                    throw new Error('Error with removed file index');
                }
                this.fileNames.splice(removedFileIndex, 1);
                await this.#thumbnails.removeThumbnail(removedFileName);
                this.#sendThumbnailsUpdate(
                    Channels.removeThumbnail,
                    removedFileName
                );
            });
    }

    async removeFileWatcher() {
        await this.#watcher?.unwatch(this.selectedImagesDirPath);
        await this.#watcher?.close();
    }
}

module.exports.ClientFilesManager = ClientFilesManager;
