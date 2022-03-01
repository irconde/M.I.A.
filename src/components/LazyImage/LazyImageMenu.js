import isElectron from 'is-electron';
import React from 'react';
import { useSelector } from 'react-redux';
import {
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import { getCollapsedLazyMenu } from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';
import LazyImageContainer from './LazyImageContainer';

function LazyImageMenu(props) {
    const collapsedLazyMenu = useSelector(getCollapsedLazyMenu);
    const fileOutputPath = useSelector(getLocalFileOutput);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const desktopMode =
        isElectron() && fileOutputPath !== '' && remoteOrLocal === false;
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    if (desktopMode && !collapsedLazyMenu) {
        return (
            <div
                className="lazy-image-menu-container"
                style={{
                    width: sideMenuWidth,
                    height: document.documentElement.clientHeight,
                }}>
                <div
                    style={{
                        height:
                            constants.sideMenuPaddingTop +
                            constants.RESOLUTION_UNIT,
                    }}></div>
                {props.thumbnails !== null
                    ? props.thumbnails.map((file, index) => {
                          return <LazyImageContainer key={index} file={file} />;
                      })
                    : null}
            </div>
        );
    } else return null;
}

export default LazyImageMenu;
