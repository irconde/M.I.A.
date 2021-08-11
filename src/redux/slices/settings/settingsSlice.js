import { createSlice } from '@reduxjs/toolkit';
import { Cookies } from 'react-cookie';
import { COOKIE } from '../../../utils/Constants';
import * as constants from '../../../utils/Constants';

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
    fileFormat: 'ORA',
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
         * setCookieData - Will set the cookie 'settings' to the passed in object
         *
         * @param {State} state - Store state information automatically passed in via dispatch/mapDispatchToProps.
         * @param {Object} action Object containing key values for settings to be set in the cookie
         */
        setCookieData: (state, action) => {
            state.settings = action.payload;
            storeCookieData(state.settings);
        },
        saveCookieData: (state) => {
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
        },
        setRemoteIp: (state, action) => {
            state.settings.remoteIp = action.payload;
            storeCookieData(state.settings);
        },
        setRemotePort: (state, action) => {
            state.settings.remotePort = action.payload;
            storeCookieData(state.settings);
        },
        setAutoConnect: (state, action) => {
            state.settings.autoConnect = action.payload;
            storeCookieData(state.settings);
        },
        setFileFormat: (state, action) => {
            state.settings.fileFormat = action.payload;
            storeCookieData(state.settings);
        },
    },
});

// Actions
export const {
    setCookieData,
    saveCookieData,
    removeCookieData,
    setRemoteIp,
    setRemotePort,
    setAutoConnect,
    setFileFormat,
} = settingsSlice.actions;

// Selectors
export const getSettings = (state) => state.settings.settings;

export const getRemoteConnectionInfo = (state) => {
    return {
        remoteIp: state.settings.settings.remoteIp,
        remotePort: state.settings.settings.remotePort,
        autoConnect: state.settings.settings.autoConnect,
    };
};

export default settingsSlice.reducer;
