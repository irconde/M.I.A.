const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fsWin = require('fswin');
const { checkIfPathExists } = require('./Utils');
const Constants = require('./Constants');
const { ipcMain } = require('electron');
const { Channels } = require('./Constants');

class ClientFilesManager {
    static STORAGE_FILE_NAME = 'thumbnails.json';
    fileNames = [];
    currentFileIndex = -1;
    thumbnailsPath = '';
    selectedImagesDirPath = null;

    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        // we create a promise for the thumbnails that will be resolved later
        // once the thumbnails have been generated. If there are further updates
        // to the files then Electron will send more thumbnails to React
        this.thumbnailsPromise = new Promise((resolve) => {
            this.resolveThumbnails = resolve;
        });
        this.isThumbnailsPromiseResolved = false;
        ipcMain.handleOnce(
            Channels.requestInitialThumbnailsList,
            () => this.thumbnailsPromise
        );
    }

    /**
     * Called when a new path is provided by the user to update the files and thumbnails
     * @param dirPath {string}
     * @returns {Promise<void>}
     */
    async updateSelectedImagesDir(dirPath) {
        if (dirPath === '') return;
        this.selectedImagesDirPath = dirPath;
        await this.#updateFileNames(dirPath);
        await this.#setThumbnailsPath(dirPath);
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
     * @returns {Promise<void>}
     */
    async #updateFileNames(dirPath) {
        const foundFiles = await fs.promises.readdir(dirPath);
        this.fileNames = foundFiles.filter((file) => {
            const fileExtension = path.extname(file);
            return (
                fileExtension === '.png' ||
                fileExtension === '.jpg' ||
                fileExtension === '.jpeg'
            );
        });
    }

    /**
     * Creates the thumbnails' path if not created and returns that path
     * @param {string} path
     * @returns {Promise<string>}
     */
    async #setThumbnailsPath(path) {
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
     * Generates the thumbnails and saves them to the .thumbnails dir
     * @returns {Promise<>}
     */
    async #generateThumbnails() {
        const newThumbnails = {};
        const storedThumbnails = await this.#getThumbnailsFromStorage();
        this.#sendThumbnailsList(storedThumbnails, true);
        const promises = this.fileNames.map(async (fileName) => {
            // skip creating a thumbnail if there's already one
            if (storedThumbnails?.hasOwnProperty(fileName)) return;

            const pixelData = await fs.promises.readFile(
                path.join(this.selectedImagesDirPath, fileName)
            );
            const thumbnailPath = path.join(this.thumbnailsPath, fileName);
            await sharp(pixelData)
                .resize(Constants.Thumbnail.width)
                .toFile(thumbnailPath);

            newThumbnails[fileName] = thumbnailPath;
        });

        await Promise.allSettled(promises);
        const allThumbnails = {
            ...storedThumbnails,
            ...newThumbnails,
        };
        // if the promise has not been resolved before, then resolve it once
        // TODO: figure out if you should resolve to all thumbnails here or just the new ones
        if (!this.isThumbnailsPromiseResolved) {
            this.resolveThumbnails(allThumbnails);
            this.isThumbnailsPromiseResolved = true;
        }
        // don't update storage if there are no new thumbnails
        if (!Object.keys(newThumbnails).length) return;
        await this.#saveThumbnailsToStorage(allThumbnails);
        this.#sendThumbnailsList(newThumbnails, false);
    }

    /**
     * Saves the thumbnails object to a json file
     * @param object {Object}
     * @returns {Promise<void>}
     */
    async #saveThumbnailsToStorage(object) {
        await fs.promises.writeFile(
            path.join(
                this.thumbnailsPath,
                ClientFilesManager.STORAGE_FILE_NAME
            ),
            JSON.stringify(object)
        );
    }

    /**
     * Gets the thumbnails object from storage
     * @returns {Promise<Object | null>}
     */
    async #getThumbnailsFromStorage() {
        try {
            const string = await fs.promises.readFile(
                path.join(
                    this.thumbnailsPath,
                    ClientFilesManager.STORAGE_FILE_NAME
                )
            );
            return JSON.parse(string);
        } catch (e) {
            return null;
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
}

module.exports.ClientFilesManager = ClientFilesManager;
