import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Channels } from '../../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

const defaultSettings = {
    remoteIp: '127.0.0.1',
    remotePort: '4001',
    autoConnect: true,
    fileFormat: 'Open Raster',
    annotationsFormat: 'DICOS TDR',
    localFileOutput: '',
    fileSuffix: '_img',
    deviceType: '',
    selectedImagesDirPath: '',
    selectedAnnotationsDirPath: '',
};

// TODO: remove this it's just for testing
const delay = async (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

export const initSettings = createAsyncThunk(
    'settings/initSettings',
    async (payload, { rejectWithValue }) => {
        try {
            // TODO: remove this. Just for testing
            await delay(1000);
            return await ipcRenderer.invoke(Channels.getSettings);
        } catch (e) {
            rejectWithValue(e);
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (settingsToUpdate, { rejectedWithValue }) => {
        try {
            return await ipcRenderer.invoke(
                Channels.saveSettings,
                settingsToUpdate
            );
        } catch (e) {
            rejectedWithValue(e);
        }
    }
);

const initialState = {
    settings: {},
    isLoading: true,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {},
    extraReducers: {
        [initSettings.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
            state.isLoading = false;
        },
        [initSettings.pending]: (state) => {
            state.isLoading = true;
        },
        [initSettings.rejected]: (state) => {
            state = { isLoading: false, settings: defaultSettings };
        },
        [updateSettings.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
        },
        [updateSettings.rejected]: (state, { payload }) => {
            // TODO: handle saving settings rejection
        },
    },
});

// Selectors
export const getSettingsLoadingState = (state) => state.settings.isLoading;

export const getAssetsDirPaths = (state) => ({
    selectedImagesDirPath: state.settings.settings.selectedImagesDirPath,
    selectedAnnotationsDirPath:
        state.settings.settings.selectedAnnotationsDirPath,
});

export default settingsSlice.reducer;
