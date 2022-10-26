const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fsWin = require('fswin');
const { checkIfPathExists, getFileNameFromPath } = require('./Utils');
const Constants = require('./Constants');
const { ipcMain } = require('electron');
const { Channels } = require('./Constants');
const chokidar = require('chokidar');

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
    #thumbnailsObj = null;
    thumbnailsPath = '';

    /**
     * Saves the thumbnails object to a json file and updates the cached value in memory
     * @param object {Object}
     * @returns {Promise<void>}
     */
    async setThumbnails(object) {
        await fs.promises.writeFile(
            path.join(
                this.thumbnailsPath,
                ClientFilesManager.STORAGE_FILE_NAME
            ),
            JSON.stringify(object)
        );
        this.#thumbnailsObj = object;
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
                    this.thumbnailsPath,
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
     * Adds a thumbnail to storage
     * @param filename {string}
     * @param path {string}
     * @returns {Promise<object>}
     */
    async addThumbnail(filename, path) {
        const newObj = { [filename]: path };
        await this.setThumbnails({ ...this.#thumbnailsObj, newObj });
        return newObj;
    }

    /**
     * Creates the thumbnails' path if not created and returns that path
     * @param {string} path
     * @returns {Promise<string>}
     */
    async setThumbnailsPath(path) {
        if (process.platform === 'win32') {
            this.thumbnailsPath = `${path}\\.thumbnails`;
            try {
                await checkIfPathExists(this.thumbnailsPath);
            } catch (e) {
                await fs.promises.mkdir(this.thumbnailsPath);
                fsWin.setAttributesSync(this.thumbnailsPath, {
                    IS_HIDDEN: true,
                });
            }
        } else {
            this.thumbnailsPath = `${path}/.thumbnails`;
            try {
                await checkIfPathExists(this.thumbnailsPath);
            } catch (e) {
                await fs.promises.mkdir(this.thumbnailsPath);
            }
        }
        return this.thumbnailsPath;
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
        const thumbnailPath = path.join(this.thumbnailsPath, fileName);
        await sharp(pixelData)
            .resize(Constants.Thumbnail.width)
            .toFile(thumbnailPath);
        return thumbnailPath;
    }
}

class ClientFilesManager {
    static STORAGE_FILE_NAME = 'thumbnails.json';
    static IMAGE_FILE_EXTENSIONS = ['.png', '.jpg', 'jpeg'];
    fileNames = [];
    currentFileIndex = -1;
    selectedImagesDirPath = '';
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
     * Called when the app is first launched with the images' dir path from the settings
     * @param dirPath {string}
     * @returns {Promise<void>}
     */
    async initSelectedImagesDir(dirPath) {
        // if no path exits in the settings then reject the React promise
        if (dirPath === '') return this.thumbnailsPromise.reject();

        this.selectedImagesDirPath = dirPath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(dirPath);
        if (dirContainsAnyImages) {
            await this.#thumbnails.setThumbnailsPath(dirPath);
            await this.#generateThumbnails();
        } else if (!this.thumbnailsPromise.isSettled) {
            // if the directory path from the settings contains no images then reject the promise
            this.thumbnailsPromise.reject();
        }
    }

    /**
     * Called when a new path is provided by the user to update the files and thumbnails
     * @param dirPath {string}
     * @returns {Promise<void>}
     */
    async updateSelectedImagesDir(dirPath) {
        this.selectedImagesDirPath = dirPath;
        await this.#setDirWatcher();
        const dirContainsAnyImages = await this.#updateFileNames(dirPath);
        if (!dirContainsAnyImages) return;
        await this.#thumbnails.setThumbnailsPath(dirPath);
        await this.#generateThumbnails();
    }

    /**
     * Reads the next file data if there is one and increments the current index
     * @returns {Promise<Buffer>}
     */
    async getNextFile() {
        this.currentFileIndex++;

        this.#sendFileInfo();
        if (!this.fileNames.length) {
            throw new Error('Directory contains no images');
        } else if (this.currentFileIndex >= this.fileNames.length) {
            throw new Error('No more files');
        }

        return fs.promises.readFile(
            path.join(
                this.selectedImagesDirPath,
                this.fileNames[this.currentFileIndex]
            )
        );
    }

    /**
     * Updates the fileNames array with new image names
     * @param dirPath
     * @returns {Promise<boolean>} - returns false if the dir contains no images, otherwise it returns true
     */
    async #updateFileNames(dirPath) {
        const foundFiles = await fs.promises.readdir(dirPath);
        this.fileNames = foundFiles.filter((file) =>
            this.#isFileTypeAllowed(file)
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
        this.#sendThumbnailsList(storedThumbnails, true);
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
        // if the promise has not been resolved before, then resolve it once
        // TODO: figure out if you should resolve to all thumbnails here or just the new ones
        if (!this.thumbnailsPromise.isSettled)
            this.thumbnailsPromise.resolve(allThumbnails);

        // don't update storage if there are no new thumbnails
        if (!Object.keys(newThumbnails).length) return;
        await this.#thumbnails.setThumbnails(allThumbnails);
        this.#sendThumbnailsList(newThumbnails, false);
    }

    #sendFileInfo() {
        this.mainWindow.webContents.send(Constants.Channels.newFileUpdate, {
            currentFileName: this.fileNames[this.currentFileIndex] || '',
            filesNum: this.fileNames.length,
        });
    }

    /**
     * A channel with the React process to update the list of thumbnails
     * pass true to override the current thumbnails
     * @param thumbnails {object | null}
     * @param overrideCurrentThumbnails {boolean}
     */
    #sendThumbnailsList(thumbnails, overrideCurrentThumbnails) {
        if (!thumbnails) return;
        this.mainWindow.webContents.send(
            Constants.Channels.sendThumbnailsList,
            {
                overrideCurrentThumbnails,
                thumbnails,
            }
        );
    }

    async #setDirWatcher() {
        // create a directory watcher, making sure it ignores json files
        // it also doesn't fire the first time. And we wait for the file to fully write
        this.#watcher = chokidar.watch(this.selectedImagesDirPath, {
            ignored: Constants.FileWatcher.all_json_files,
            depth: 0,
            ignoreInitial: true,
            awaitWriteFinish: true,
        });

        this.#watcher.on(Constants.FileWatcher.add, async (addedFilePath) => {
            const addedFilename = getFileNameFromPath(addedFilePath);
            if (!this.#isFileTypeAllowed(addedFilename)) return;
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
                this.#sendThumbnailsList(thumbnailObj, false);
            } catch (e) {
                console.log(e);
            }
        });
    }

    #isFileTypeAllowed(fileName) {
        return ClientFilesManager.IMAGE_FILE_EXTENSIONS.includes(
            path.extname(fileName)
        );
    }
}

module.exports.ClientFilesManager = ClientFilesManager;
