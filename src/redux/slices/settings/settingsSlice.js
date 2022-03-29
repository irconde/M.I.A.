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
         * Will set the cookie 'settings' to the passed in object
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action Object containing key values for settings to be set in the cookie
         */
        setSettings: (state, action) => {
            state.settings = action.payload;
            state.settings.hasFileOutput =
                action.payload.localFileOutput !== '' ? true : false;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Will save the current settings into a cookie
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        saveCookieData: (state) => {
            storeCookieData(state.settings);
        },

        /**
         * Will save the settings passed in by action.payload
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

        /**
         * Will delete the current settings cookie and reset the settings to default
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        removeCookieData: (state) => {
            myCookie.remove('settings');
            state.settings = defaultSettings;
            state.settings.firstDisplaySettings = true;
        },
        /**
         * Sets the remote ip to the passed in action payload
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String with the ip of the remote server
         */
        setRemoteIp: (state, action) => {
            state.settings.remoteIp = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets the remote port to the passed in action
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String with the port of the remote server
         */
        setRemotePort: (state, action) => {
            state.settings.remotePort = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets whether the app should automatically connect to the command server
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action True if should auto-connect, false if not.
         */
        setAutoConnect: (state, action) => {
            state.settings.autoConnect = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets the file output format, ora/zip
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String value determining ora or zip
         */
        setFileFormat: (state, action) => {
            state.settings.fileFormat = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets the file annotation format
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String value containing the annotation format
         */
        setAnnotationsFormat: (state, action) => {
            state.settings.annotationsFormat = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets the local file output path to save files to
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String value of the local path
         */
        setLocalFileOutput: (state, action) => {
            state.settings.localFileOutput = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Sets the file suffix
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String value of the file suffix
         */
        setFileSuffix: (state, action) => {
            state.settings.fileSuffix = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * Determines wether the App is using a local or remote service
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action Boolean value true = remote and false = local
         */
        setRemoteOrLocal: (state, action) => {
            state.settings.remoteOrLocal = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
    },
});

// Actions
export const {
    setSettings,
    saveSettings,
    saveCookieData,
    removeCookieData,
    setRemoteIp,
    setRemotePort,
    setAutoConnect,
    setFileFormat,
    setAnnotationsFormat,
    setLocalFileOutput,
    setFileSuffix,
    setRemoteOrLocal,
} = settingsSlice.actions;

// Selectors
/**
 * getSettings - Returns the settings object
 * @param {Object} state
 * @returns {Object<Settings>}
 */
export const getSettings = (state) => state.settings.settings;
/**
 * getRemoteOrLocal - Boolean value for wether the connection is remote === true, or local === false
 * @param {Object} state
 * @returns {Boolean}
 */
export const getRemoteOrLocal = (state) =>
    state.settings.settings.remoteOrLocal;
/**
 * getHasFileOutput - Boolean value for whether file output is clear or not
 * @param {Object} state
 * @returns {Boolean}
 */
export const getHasFileOutput = (state) =>
    state.settings.settings.hasFileOutput;
/**
 * getLocalFileOutput - String value for file output
 * @param {Object} state
 * @returns {String}
 */
export const getLocalFileOutput = (state) =>
    state.settings.settings.localFileOutput;
/**
 * getRemoteConnectionInfo - Returns the remote connection info: ip, port, autoconnect.
 * @param {Object} state
 * @returns {{remoteIp: String, remotePort: String, autoConnect: Boolean}}
 */
export const getRemoteConnectionInfo = (state) => {
    return {
        remoteIp: state.settings.settings.remoteIp,
        remotePort: state.settings.settings.remotePort,
        autoConnect: state.settings.settings.autoConnect,
    };
};

/**
 * getFirstDisplaySettings - Determines if the settings should be displayed on first load or not
 * @param {Object} state
 * @returns {Boolean}
 */
export const getFirstDisplaySettings = (state) =>
    state.settings.settings.firstDisplaySettings;

/**
 * getDeviceType - Returns the type of device, desktop, mobile, tablet
 * @param {Object} state
 * @returns {constants.DEVICE_TYPE}
 */
export const getDeviceType = (state) => state.settings.settings.deviceType;

export default settingsSlice.reducer;
