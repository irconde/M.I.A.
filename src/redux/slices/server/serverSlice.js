// eslint-disable-next-line no-unused-vars
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const serverSlice = createSlice({
    name: 'server',
    initialState: {
        numFilesInQueue: 0,
        isConnected: false,
        isUpload: false,
        isDownload: false,
        processingHost: null,
        currentProcessingFile: null,
    },
    reducers: {
        setConnected: (state, action) => {
            state.isConnected = action.payload;
        },
        setUpload: (state, action) => {
            state.isUpload = action.payload;
        },
        setDownload: (state, action) => {
            state.isDownload = action.payload;
        },
        setNumFilesInQueue: (state, action) => {
            state.numFilesInQueue = action.payload;
        },
        setProcessingHost: (state, action) => {
            state.processingHost = action.payload;
        },
        setCurrentProcessingFile: (state, action) => {
            state.currentProcessingFile = action.payload;
        },
    },
});

// Actions
export const {
    setConnected,
    setUpload,
    setDownload,
    setIsFileInQueue,
    setNumFilesInQueue,
    setProcessingHost,
    setCurrentProcessingFile,
} = serverSlice.actions;

// Selectors
/**
 * getConnectionInfo - Returns an object with the connection info for if
 *                     the App is downloading, uploading, and connection status
 *
 * @param {State} state Passed in via useSelector
 * @returns {Object} An object containing these values from the serverSlice;
 *                   isConnected, isUpload, and isDownload
 */
export const getConnectionInfo = (state) => {
    const { isConnected, isUpload, isDownload } = state.server;

    return { isConnected, isUpload, isDownload };
};
/**
 * getNumFilesInQueue - Returns an the number of images in the file server queue
 *
 * @param {State} state Passed in via useSelector
 * @returns {Number} The number of images in the queue
 */
export const getNumFilesInQueue = (state) => state.server.numFilesInQueue;
/**
 * getConnected - The connection status to the command server
 *
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} The connection status as a boolean where true is connected and false is not connected
 */
export const getConnected = (state) => state.server.isConnected;
/**
 * getIsDownload - Returns the value representing if we are downloading an image from the command server
 *
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} The download status as a boolean where true is downloading and false is not downloading
 */
export const getIsDownload = (state) => state.server.isDownload;
/**
 * getIsUpload - Returns the value representing if we are uploading an image to the command server
 *
 * @param {State} state Passed in via useSelector
 * @returns {Boolean} The download status as a boolean where true is uploading and false is not uploading
 */
export const getIsUpload = (state) => state.server.isUpload;
/**
 * getProcessingHost - This returns the hostname of the file server the App is connected to
 *
 * @param {State} state Passed in via useSelector
 * @returns {String} The hostname of the file server the App is connected to
 */
export const getProcessingHost = (state) => state.server.processingHost;
/**
 * getCurrentFile - This returns the file name of the image the App is currently rendering/processing.
 *
 * @param {State} state Passed in via useSelector
 * @returns {String} The file name that is being rendered, processed and interacted etc with.
 */
export const getCurrentFile = (state) => state.server.currentProcessingFile;
/**
 * getTopBarInfo - Returns the needed information for the TopBar widget in one call
 *
 * @param {State} state Passed in via useSelector
 * @returns {Object} An object containing these values from the serverSlice;
 *                   processingFile, connectedServer, numberOfFiles, isDownload,
 *                   isUpload, and isConnected
 */
export const getTopBarInfo = (state) => {
    return {
        processingFile: state.server.currentProcessingFile,
        connectedServer: state.server.processingHost,
        numberOfFiles: state.server.numFilesInQueue,
        isDownload: state.server.isDownload,
        isUpload: state.server.isUpload,
        isConnected: state.server.isConnected,
    };
};

export default serverSlice.reducer;
