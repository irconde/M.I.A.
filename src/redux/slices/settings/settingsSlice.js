import { createSlice } from '@reduxjs/toolkit';
import { Cookies } from 'react-cookie';

const myCookie = new Cookies();
const cookieData = myCookie.get('settings');

let settings;
const defaultSettings = {
    view: top,
};
if (cookieData !== undefined) {
    settings = cookieData;
} else {
    settings = defaultSettings;
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
                maxAge: 10800,
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
    },
});

export const { setCookieData, removeCookieData } = settingsSlice.actions;

export default settingsSlice.reducer;
