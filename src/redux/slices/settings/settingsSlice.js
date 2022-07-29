import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import isElectron from 'is-electron';
import { Cookies } from 'react-cookie';
import { Channels, COOKIE, SETTINGS } from '../../../utils/Constants';

const myCookie = new Cookies();
let cookieData;

let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
} else {
    cookieData = myCookie.get('settings');
}

const storeCookieData = (settings) => {
    myCookie.set('settings', settings, {
        path: '/',
        expires: new Date(Date.now() + COOKIE.WEB_TIME),
    });
};

let settings;
const defaultSettings = {
    remoteIp: process.env.REACT_APP_COMMAND_SERVER_IP,
    remotePort: process.env.REACT_APP_COMMAND_SERVER_PORT,
    autoConnect: true,
    fileFormat: SETTINGS.OUTPUT_FORMATS.ORA,
    annotationsFormat: SETTINGS.ANNOTATIONS.TDR,
    localFileOutput: '',
    fileSuffix: '_img',
    remoteOrLocal: true,
    firstDisplaySettings: true,
    deviceType: '',
    hasFileOutput: false,
    displaySummarizedDetections: false,
    loadingElectronCookie: isElectron(),
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
            .then((cookie) => {
                return cookie;
            })
            .catch((err) => rejectWithValue(err));
    }
);

if (!isElectron()) {
    if (cookieData !== undefined) {
        settings = cookieData;
    } else {
        settings = defaultSettings;
        myCookie.set('settings', defaultSettings, {
            path: '/',
            expires: isElectron()
                ? new Date(Date.now() + COOKIE.DESKTOP_TIME)
                : new Date(Date.now() + COOKIE.WEB_TIME), // Current time is 3 hours
        });
    }
} else {
    settings = defaultSettings;
}

const initialState = {
    settings,
    apiPrefix: `http://${settings.remoteIp}:${settings.remotePort}`,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        /**
         * Toggles the display of summarized (wbf) or un-summarized (original) detection display
         * @param {State} state
         */
        toggleDisplaySummarizedDetections: (state) => {
            state.settings.displaySummarizedDetections =
                !state.settings.displaySummarizedDetections;
        },
        /**
         * Saves the current settings into a cookie
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        saveCookieData: (state) => {
            storeCookieData(state.settings);
        },

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
            state.apiPrefix = `http://${state.settings.remoteIp}:${state.settings.remotePort}`;
            if (!isElectron()) {
                myCookie.set('settings', state.settings, {
                    path: '/',
                    expires: new Date(Date.now() + COOKIE.WEB_TIME), // Current time is 3 hours
                });
            }
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
            state.apiPrefix = `http://${state.settings.remoteIp}:${state.settings.remotePort}`;
        },
        [saveElectronCookie.rejected]: (state) => {
            state.settings = defaultSettings;
        },
        [loadElectronCookie.fulfilled]: (state, { payload }) => {
            for (let key in payload) {
                state.settings[key] = payload[key];
            }
            state.settings.hasFileOutput =
                payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
            state.settings.loadingElectronCookie = false;
            state.apiPrefix = `http://${state.settings.remoteIp}:${state.settings.remotePort}`;
        },
        [loadElectronCookie.pending]: (state) => {
            state.settings.loadingElectronCookie = true;
        },
        [loadElectronCookie.rejected]: (state) => {
            state.settings.loadingElectronCookie = false;
        },
    },
});

// Actions
export const { saveSettings, toggleDisplaySummarizedDetections } =
    settingsSlice.actions;

// Selectors
/**
 * Indicates whether the display of summarized detections is enabled
 *
 * @param {State} state - Passed in via useSelector/mapStateToProps
 * @returns {boolean} - True when displaying summarized detections - false renders original detections
 */
export const getDisplaySummarizedDetections = (state) =>
    state.settings.settings.displaySummarizedDetections;
/**
 * Provides the settings object
 * @param {Object} state
 * @returns {Object<Settings>}
 */
export const getSettings = (state) => state.settings.settings;
/**
 * Indicates whether the connection is remote (True) or local (False)
 * @param {Object} state
 * @returns {boolean}
 */
export const getRemoteOrLocal = (state) =>
    state.settings.settings.remoteOrLocal;
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
 * Provides the remote connection info: ip, port, auto-connect.
 * @param {Object} state
 * @returns {{remoteIp: string, remotePort: string, autoConnect: Boolean}}
 */
export const getRemoteConnectionInfo = (state) => {
    return {
        remoteIp: state.settings.settings.remoteIp,
        remotePort: state.settings.settings.remotePort,
        autoConnect: state.settings.settings.autoConnect,
    };
};

export const getLoadingElectronCookie = (state) =>
    state.settings.settings.loadingElectronCookie;

/**
 * Determines if the settings should be displayed on first load or not
 * @param {Object} state
 * @returns {Boolean}
 */
export const getFirstDisplaySettings = (state) =>
    state.settings.settings.firstDisplaySettings;

/**
 * Provides information regarding the type of device, desktop, mobile, tablet
 * @param {Object} state
 * @returns {constants.DEVICE_TYPE}
 */
export const getDeviceType = (state) => state.settings.settings.deviceType;

export const getFileSuffix = (state) => state.settings.settings.fileSuffix;

export const getApiPrefix = (state) => state.settings.apiPrefix;

export default settingsSlice.reducer;
