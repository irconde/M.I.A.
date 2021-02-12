import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';
import { COMMAND_SERVER, server } from '../../Constants';

// Socket.io clients for command & file server
export const commandServer = io(COMMAND_SERVER, { autoConnect: false });
export const fileServer = io(server.FILE_SERVER_ADDRESS, {
    autoConnect: false,
});

// Redux Slice
const serverSlice = createSlice({
    name: 'server',
    initialState: {
        numFilesInQueue: 0,
        isFileInQueue: false,
        isConnected: false,
        isUpload: false,
        isDownload: false,
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
        setCommandServerConnection: (state, action) => {
            const { payload } = action;
            // action payload is either connect or disconnect
            if (payload.toLowerCase() === 'connect') {
                commandServer.connect();
                state.isConnected = true;
            } else {
                commandServer.disconnect();
                state.isConnected = false;
            }
        },
        setFileServerConnection: (state, action) => {
            const { payload } = action;
            // action payload is either connect or disconnect
            if (payload.toLowerCase() === 'connect') {
                //TODO: Do we want to keep track of file server connection status in the store?
                // Currently, in `App.js` we are only updating `isConnected` for command server
                fileServer.connect();
            } else {
                fileServer.disconnect();
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
