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
    selectedImagesDirPath: null,
    selectedAnnotationsDirPath: null,
};

export const saveElectronCookie = createAsyncThunk(
    'settings/saveElectronCookie',
    async (payload, { rejectWithValue }) => {
        await ipcRenderer
            .invoke(Channels.saveSettings, payload)
            .then(() => {
                return payload;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });
        return payload;
    }
);

export const initSettings = createAsyncThunk(
    'settings/initSettings',
    async (payload, { rejectWithValue }) => {
        console.log('InitSettings');
        return await ipcRenderer
            .invoke(Channels.getSettings)
            .then((result) => {
                console.log('Success');
                return result;
            })
            .catch((err) => {
                console.log('Failure');
                rejectWithValue(err);
            });
    }
);

const initialState = {
    defaultSettings,
    loadingSettings: true,
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
            state.settings.hasFileOutput =
                action.payload.localFileOutput !== '';
            state.settings.firstDisplaySettings = false;
        },
    },
    extraReducers: {
        [saveElectronCookie.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
            state.settings.hasFileOutput = payload.localFileOutput !== '';
            state.settings.firstDisplaySettings = false;
        },
        [saveElectronCookie.rejected]: (state) => {
            state.settings = defaultSettings;
        },
        [initSettings.fulfilled]: (state, { payload }) => {
            const { settings, firstDisplaySettings } = payload;
            for (let key in settings) {
                state.settings[key] = settings[key];
            }
            state.settings.hasFileOutput = settings.localFileOutput !== '';
            state.settings.firstDisplaySettings = firstDisplaySettings;
            state.settings.loadingElectronCookie = false;
            state.loadingSettings = false;
        },
        [initSettings.pending]: (state) => {
            state.loadingSettings = true;
        },
        [initSettings.rejected]: (state) => {
            state.loadingSettings = false;
        },
    },
});

// Actions
export const { saveSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
