import { createSlice } from '@reduxjs/toolkit';
import isElectron from 'is-electron';
import { Cookies } from 'react-cookie';
import { COOKIE, SETTINGS } from '../../../utils/Constants';

const myCookie = new Cookies();
const cookieData = myCookie.get('settings');

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
    displaySummarizedDetections: false,
};

if (cookieData !== undefined) {
    settings = cookieData;
} else {
    settings = defaultSettings;
    myCookie.set('settings', defaultSettings, {
        path: '/',
        maxAge: COOKIE.TIME, // Current time is 3 hours
    });
}

const initialState = {
    settings,
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
                if (action.payload[key] !== '') {
                    state.settings[key] = action.payload[key];
                }
                // detection[key] = update[key];
            }
            state.settings.hasFileOutput =
                action.payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
    },
});

// Actions
export const { saveSettings } = settingsSlice.actions;

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
