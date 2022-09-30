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

const initialState = {
    settings: {},
    isLoading: true,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        /**
         * Saves the settings passed in by action.payload
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action Object containing key values for settings to be set in the settings
         */
        saveSettings: (state, action) => {
            for (let key in action.payload) {
                state.settings[key] = action.payload[key];
            }
        },
    },
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
    },
});

// Selectors
export const getSettingsLoadingState = (state) => state.settings.isLoading;

export const getAssetsDirPaths = (state) => ({
    selectedImagesDirPath: state.settings.settings.selectedImagesDirPath,
    selectedAnnotationsDirPath:
        state.settings.settings.selectedAnnotationsDirPath,
});

// Actions
export const { saveSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
