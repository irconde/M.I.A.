import isElectron from 'is-electron';
import React from 'react';
import { useSelector } from 'react-redux';
import {
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import * as constants from '../../utils/Constants';

function LazyImageMenu(props) {
    const fileOutputPath = useSelector(getLocalFileOutput);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const desktopMode =
        isElectron() && fileOutputPath !== '' && remoteOrLocal === false;
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    if (desktopMode === true) {
        return (
            <div
                className="lazy-image-menu-container"
                style={{
                    width: sideMenuWidth,
                    height: document.documentElement.clientHeight,
                }}>
                Lazy Image Container!
            </div>
        );
    } else return null;
}

export default LazyImageMenu;
