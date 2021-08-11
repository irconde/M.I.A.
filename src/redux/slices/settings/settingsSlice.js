import { createSlice } from '@reduxjs/toolkit';
import { Cookies } from 'react-cookie';
import { COOKIE } from '../../../utils/Constants';
import * as constants from '../../../utils/Constants';

const myCookie = new Cookies();
const cookieData = myCookie.get('settings');

let settings;
const defaultSettings = {
    remoteIp: process.env.REACT_APP_COMMAND_SERVER_IP,
    remotePort: process.env.REACT_APP_COMMAND_SERVER_PORT,
    autoConnect: true,
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
            myCookie.set('settings', action.payload, {
                path: '/',
                maxAge: COOKIE.TIME, // Current time is 3 hours
            });
        },
        saveCookieData: (state) => {
            myCookie.set('settings', state.settings, {
                path: '/',
                maxAge: COOKIE.TIME, // Current time is 3 hours
            });
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
        },
        setRemotePort: (state, action) => {
            state.settings.remotePort = action.payload;
        },
        setAutoConnect: (state, action) => {
            state.settings.autoConnect = action.payload;
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
