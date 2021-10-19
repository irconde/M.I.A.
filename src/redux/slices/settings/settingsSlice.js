import { createSlice } from '@reduxjs/toolkit';
import { Cookies } from 'react-cookie';
import { COOKIE, SETTINGS } from '../../../utils/Constants';

const myCookie = new Cookies();
const cookieData = myCookie.get('settings');

const storeCookieData = (settings) => {
    myCookie.set('settings', settings, {
        path: '/',
        maxAge: COOKIE.TIME, // Current time is 3 hours
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
    missMatchedClassNames: [],
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
         * setSettings - Will set the cookie 'settings' to the passed in object
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action Object containing key values for settings to be set in the cookie
         */
        setSettings: (state, action) => {
            state.settings = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * saveCookieData - Will save the current settings into a cookie
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        saveCookieData: (state) => {
            storeCookieData(state.settings);
        },
        saveSettings: (state, action) => {
            for (let key in action.payload) {
                if (action.payload[key] !== '') {
                    state.settings[key] = action.payload[key];
                }
                // detection[key] = update[key];
            }
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * removeCookieData - Will delete the current settings cookie and reset the settings to default
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         */
        removeCookieData: (state) => {
            myCookie.remove('settings');
            state.settings = defaultSettings;
            state.settings.firstDisplaySettings = true;
        },
        /**
         * setRemoteIp - Sets the remote ip to the passed in action
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
         * setRemotePort - Sets the remote port to the passed in action
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
         * setAutoConnect - Sets wether the app should automatically connect to the command server
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action True/False to auto connect
         */
        setAutoConnect: (state, action) => {
            state.settings.autoConnect = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * setFileFormat - Sets the file output format, ora/zip
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {String} action String value determining ora xor zip
         */
        setFileFormat: (state, action) => {
            state.settings.fileFormat = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        /**
         * setAnnotationsFormat - Sets the file annotation format
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
         * setLocalFileOutput - Sets the local file output path to save files to
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
         * setFileSuffix - Sets the file suffix
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
         * setRemoteOrLocal - Determines wether the App is using a local or remote service
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Boolean} action Boolean value true = remote and false = local
         */
        setRemoteOrLocal: (state, action) => {
            state.settings.remoteOrLocal = action.payload;
            state.settings.firstDisplaySettings = false;
            storeCookieData(state.settings);
        },
        addMissMatchedClassName: (state, action) => {
            const { className, color } = action.payload;
            const foundIndex = state.settings.missMatchedClassNames.findIndex(
                (el) => el.className === className
            );
            if (foundIndex === -1) {
                state.settings.missMatchedClassNames.push({ className, color });
            } else {
                state.settings.missMatchedClassNames[foundIndex].color = color;
            }
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
    addMissMatchedClassName,
} = settingsSlice.actions;

// Selectors
export const getSettings = (state) => state.settings.settings;
export const getRemoteOrLocal = (state) =>
    state.settings.settings.remoteOrLocal;

export const getRemoteConnectionInfo = (state) => {
    return {
        remoteIp: state.settings.settings.remoteIp,
        remotePort: state.settings.settings.remotePort,
        autoConnect: state.settings.settings.autoConnect,
    };
};

export const getFirstDisplaySettings = (state) =>
    state.settings.settings.firstDisplaySettings;

export default settingsSlice.reducer;
