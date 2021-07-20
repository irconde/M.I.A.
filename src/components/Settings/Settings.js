import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDisplaySettings } from '../../redux/slices/ui/uiSlice';
import {
    setCookieData,
    removeCookieData,
} from '../../redux/slices/settings/settingsSlice';

const Settings = () => {
    const display = useSelector(getDisplaySettings);
    const dispatch = useDispatch();

    if (display === true) {
        return (
            <div>
                <h1>Settings</h1>
            </div>
        );
    } else {
        return null;
    }
};

export default Settings;
