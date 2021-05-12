// eslint-disable-next-line no-unused-vars
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
const serverSlice = createSlice({
    name: 'server',
    initialState: {
        numFilesInQueue: 0,
        isFileInQueue: false,
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
        setIsFileInQueue: (state, action) => {
            state.isFileInQueue = action.payload;
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
        setCommandServerConnection: (state, action) => {
            const { payload } = action;
            // action payload is either connect or disconnect
            if (payload.action.toLowerCase() === 'connect') {
                payload.socket.connect();
                state.isConnected = true;
            } else {
                payload.socket.disconnect();
                state.isConnected = false;
            }
        },
        setFileServerConnection: (state, action) => {
            const { payload } = action;
            // action payload is either connect or disconnect
            if (payload.action.toLowerCase() === 'connect') {
                //TODO: Do we want to keep track of file server connection status in the store?
                // Currently, in `App.js` we are only updating `isConnected` for command server
                payload.socket.connect();
            } else {
                payload.socket.disconnect();
            }
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
    setCommandServerConnection,
    setFileServerConnection,
} = serverSlice.actions;

// Selectors
export const selectConnectionInfo = (state) => {
    const { isConnected, isUpload, isDownload } = state.server;

    return { isConnected, isUpload, isDownload };
};
export const selectNumFilesInQueue = (state) => state.server.numFilesInQueue;

export default serverSlice.reducer;
