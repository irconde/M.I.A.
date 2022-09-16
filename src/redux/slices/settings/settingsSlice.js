import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Channels, SETTINGS } from '../../../utils/enums/Constants';

const ipcRenderer = window.require('electron').ipcRenderer;

let settings;
const defaultSettings = {
    remoteIp: process.env.REACT_APP_COMMAND_SERVER_IP,
    remotePort: process.env.REACT_APP_COMMAND_SERVER_PORT,
    autoConnect: true,
    fileFormat: SETTINGS.OUTPUT_FORMATS.ORA,
    annotationsFormat: SETTINGS.ANNOTATIONS.TDR,
    localFileOutput: '',
    fileSuffix: '_img',
    firstDisplaySettings: true,
    deviceType: '',
    hasFileOutput: false,
    loadingElectronCookie: true,
};

export const saveElectronCookie = createAsyncThunk(
    'settings/saveElectronCookie',
    async (payload, { rejectWithValue }) => {
        await ipcRenderer
            .invoke(Channels.saveSettingsCookie, payload)
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

export const loadElectronCookie = createAsyncThunk(
    'settings/loadElectronCookie',
    async (payload, { rejectWithValue }) => {
        return await ipcRenderer
            .invoke(Channels.getSettingsCookie)
            .then((result) => {
                return result;
            })
            .catch((err) => rejectWithValue(err));
    }
);
settings = defaultSettings;

const initialState = {
    settings,
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
                action.payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
        },
    },
    extraReducers: {
        [saveElectronCookie.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
            state.settings.hasFileOutput =
                payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
        },
        [saveElectronCookie.rejected]: (state) => {
            state.settings = defaultSettings;
        },
        [loadElectronCookie.fulfilled]: (state, { payload }) => {
            const { settings, firstDisplaySettings } = payload;
            for (let key in settings) {
                state.settings[key] = settings[key];
            }
            state.settings.hasFileOutput =
                settings.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = firstDisplaySettings;
            state.settings.loadingElectronCookie = false;
            state.loadingSettings = false;
        },
        [loadElectronCookie.pending]: (state) => {
            state.loadingSettings = true;
        },
        [loadElectronCookie.rejected]: (state) => {
            state.loadingSettings = false;
        },
    },
});

// Actions
export const { saveSettings } = settingsSlice.actions;

// Selectors
/**
 * Provides the settings object
 * @param {Object} state
 * @returns {Object<Settings>}
 */
export const getSettings = (state) => state.settings.settings;
/**
 * Indicates whether file output is clear or not
 * @param {Object} state
 * @returns {boolean}
 */
export const getHasFileOutput = (state) =>
    state.settings.settings.hasFileOutput;
/**
 * Provides the file output
 * @param {Object} state
 * @returns {string}
 */
export const getLocalFileOutput = (state) =>
    state.settings.settings.localFileOutput;

/**
 * Provides information regarding the type of device, desktop, mobile, tablet
 * @param {Object} state
 * @returns {constants.DEVICE_TYPE}
 */
export const getDeviceType = (state) => state.settings.settings.deviceType;

export default settingsSlice.reducer;
