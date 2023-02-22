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
        this.#thumbnails.setAnnotationFilePath(annotationFilePath);
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
            this.#sendFileInfo();
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
        this.#thumbnails.setAnnotationFilePath(annotationFilePath);
        this.selectedImagesDirPath = imagesDirPath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(imagesDirPath);
        this.#thumbnails.clearCurrentThumbnails();
        this.currentFileIndex = 0;
        this.#sendFileInfo();
        if (!dirContainsAnyImages) return;
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
                                        const fileName =
                                            this.fileNames[
                                                this.currentFileIndex
                                            ];
                                        this.#sendThumbnailsUpdate(
                                            Channels.updateThumbnailHasAnnotations,
                                            {
                                                hasAnnotations:
                                                    !!this.#getAnnotations(
                                                        annotationFile,
                                                        fileName
                                                    ).length,
                                                fileName,
                                            }
                                        );
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

    async createAnnotationsFile(annotationFilePath, newAnnotationData) {
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

        this.fileNames.forEach((file, index) => {
            annotationJson.images.push({
                id: index + 1,
                coco_url: path.join(this.selectedImagesDirPath, file),
                file_name: file,
                date_capture: todayDateString,
            });
        });
        return await fs.promises.writeFile(
            path.join(annotationFilePath, 'annotation.json'),
            JSON.stringify(annotationJson, null, 4)
        );
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

    async selectFile(filename) {
        const index = this.fileNames.findIndex((name) => name === filename);
        if (index === -1) throw new Error("File name doesn't exists");
        this.currentFileIndex = index;
        this.#sendFileInfo();
    }

    async getAnnotationsForFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.selectedAnnotationFile, (error, data) => {
                if (error) reject(error);
                const allAnnotations = JSON.parse(data);
                resolve({
                    annotations: this.#getAnnotations(
                        allAnnotations,
                        this.fileNames[this.currentFileIndex]
                    ),
                    categories: allAnnotations.categories,
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
        else
            this.#sendThumbnailsUpdate(
                Channels.updateThumbnails,
                clientThumbnails
            );
    }

    /**
     * Takes an object of thumbnails and returns an array of the thumbnails
     * in the original order of the files and determines which thumbnails have annotations
     * @param thumbnails {Object<string, string>}
     * @returns {Promise<Array<{fileName: string, filePath: string, hasAnnotations: boolean}>>}
     */
    async #prepareClientThumbnails(thumbnails) {
        const _thumbnails = [];
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
                    this.#sendThumbnailsUpdate(Channels.addThumbnail, {
                        fileName: addedFilename,
                        filePath: newThumbnailPath,
                    });
                    this.fileNames.push(addedFilename);
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
