import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import isElectron from 'is-electron';
import { Cookies } from 'react-cookie';
import { Channels, COOKIE, SETTINGS } from '../../../utils/Constants';

const myCookie = new Cookies();
const cookieData = myCookie.get('settings');

let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
}

// TODO: James - Need to implement Electron cookies rather than React - See Electron.js
const storeCookieData = (settings) => {
    myCookie.set('settings', settings, {
        path: '/',
        expires: isElectron()
            ? new Date(Date.now() + COOKIE.DESKTOP_TIME)
            : new Date(Date.now() + COOKIE.WEB_TIME), // Current time is 3 hours
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
};

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
};

export const saveElectronCookie = createAsyncThunk(
    'settings/saveElectronCookie',
    async (payload, { rejectWithValue }) => {
        // TODO: Implement channel save to electron
        ipcRenderer
            .invoke(Channels.saveElectronCookie, payload)
            .then((res) => {
                console.log(res);
                return payload;
            })
            .catch((error) => {
                console.log(error);
                rejectWithValue(error);
            });
        return payload;
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
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
                if (action.payload[key] !== '') {
                    state.settings[key] = action.payload[key];
                }
                // detection[key] = update[key];
            }
            state.settings.hasFileOutput =
                action.payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
            /*storeCookieData(state.settings);*/
            if (!isElectron()) {
                myCookie.set('settings', state.settings, {
                    path: '/',
                    expires: isElectron()
                        ? new Date(Date.now() + COOKIE.DESKTOP_TIME)
                        : new Date(Date.now() + COOKIE.WEB_TIME), // Current time is 3 hours
                });
            }
        },
    },
    extraReducers: {
        [saveElectronCookie.fulfilled]: (state, { meta, payload }) => {
            console.log('fullfilled');
            console.log(payload);
        },
        [saveElectronCookie.pending]: (state, { meta, payload }) => {
            console.log('pending');
        },
        [saveElectronCookie.rejected]: (state, { meta, payload }) => {
            console.log('rejected');
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
 * Provides the remote connection info: ip, port, autoconnect.
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

export default settingsSlice.reducer;
