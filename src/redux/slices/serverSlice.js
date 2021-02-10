import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';
import { COMMAND_SERVER, server } from '../../Constants';

export const commandServer = io(COMMAND_SERVER, { autoConnect: false });
export const fileServer = io(server.FILE_SERVER_ADDRESS, {
    autoConnect: false,
});

export const connectCommandServer = createAsyncThunk(
    'commandServer/connect',
    async () => {
        commandServer.connect();
    }
);
export const disconnectCommandServer = createAsyncThunk(
    'commandServer/disconnect',
    async () => {
        commandServer.disconnect();
    }
);

export const connectFileServer = createAsyncThunk(
    'fileServer/connect',
    async () => {
        fileServer.connect();
    }
);
export const disconnectFileServer = createAsyncThunk(
    'fileServer/disconnect',
    async () => {
        fileServer.disconnect();
    }
);
const serverSlice = createSlice({
    name: 'server',
    initialState: {
        numFilesInQueue: 0,
        isConnected: false,
        isUpload: false,
        isDownload: false,
    },
    reducers: {
        // Set connection status (connected, upload, download)
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
        // SocketIO
        // Command Server

        // Triggered by socket.on('img')
        sendImageToFileServer: (state, action) => {},
    },
    extraReducers: {
        [connectCommandServer.fulfilled]: (state, action) => {
            state.isConnected = true;
        },
        [disconnectCommandServer.fulfilled]: (state, action) => {
            state.isConnected = false;
        },
        [connectFileServer.fulfilled]: (state, action) => {},
    },
});

// Actions
export const {
    setConnected,
    setUpload,
    setDownload,
    setNumFilesInQueue,
} = serverSlice.actions;

// Selectors
export const selectConnectionInfo = (state) => {
    const { isConnected, isUpload, isDownload } = state.server;

    return { isConnected, isUpload, isDownload };
};
export const selectNumFilesInQueue = (state) => state.server.numFilesInQueue;

export default serverSlice.reducer;
