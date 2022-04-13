import isElectron from 'is-electron';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import {
    getLocalFileOutput,
    getRemoteOrLocal,
} from '../../redux/slices/settings/settingsSlice';
import {
    getCollapsedLazyMenu,
    getLocalFileOpen,
    setGeneratingThumbnails,
} from '../../redux/slices/ui/uiSlice';
import * as constants from '../../utils/Constants';
import Utils from '../../utils/Utils';
import LazyImageContainer from './LazyImageContainer';
let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
}

/**
 * Component for ?.
 *
 * @component
 *
 * @param {PropTypes} props Expected props: thumbnails<Array<string>>, getSpecificFileFromLocalDirectory<function>
 * @param {Array<string>} thumbnails - Destructured from props -- Array with string values to the file path of thumbnails, IE: ['D:\images\.thumbnails\1_img.ora_thumbnail.png', 'D:\images\.thumbnails\2_img.ora_thumbnail.png',...]
 * @param {function} getSpecificFileFromLocalDirectory - Destructured from props -- Calls the Electron channel to invoke a specific file from the selected file system folder.
 *
 */
function LazyImageMenu(props) {
    const dispatch = useDispatch();
    ipcRenderer.on(constants.Channels.thumbnailStatus, (event, status) => {
        dispatch(setGeneratingThumbnails(status));
    });
    const enableMenu = useSelector(getLocalFileOpen);
    const collapsedLazyMenu = useSelector(getCollapsedLazyMenu);
    const fileOutputPath = useSelector(getLocalFileOutput);
    const remoteOrLocal = useSelector(getRemoteOrLocal);
    const desktopMode =
        isElectron() && fileOutputPath !== '' && remoteOrLocal === false;
    const sideMenuWidth = constants.sideMenuWidth + constants.RESOLUTION_UNIT;
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(0)`,
    });
    const prevIsMenuCollapsed = Utils.usePrevious(collapsedLazyMenu);
    useEffect(() => {
        if (prevIsMenuCollapsed !== collapsedLazyMenu) {
            if (collapsedLazyMenu === true) {
                setTranslateStyle({
                    transform: `translate(${-Math.abs(
                        constants.sideMenuWidth + 10
                    )}px)`,
                });
            } else {
                setTranslateStyle({
                    transform: `translate(0)`,
                });
            }
        }
    });
    // TODO: Scroll to selected thumbnail
    if (enableMenu) {
        if (desktopMode && collapsedLazyMenu) {
            return (
                <div
                    className="lazy-image-menu-container"
                    style={{
                        ...translateStyle,
                        transition: 'none',
                    }}>
                    <div
                        style={{
                            height:
                                constants.sideMenuPaddingTop +
                                constants.RESOLUTION_UNIT,
                            width: '100%',
                        }}></div>
                    <div
                        className="lazy-images-container"
                        style={{
                            width: sideMenuWidth,
                            height: document.documentElement.clientHeight,
                        }}></div>
                </div>
            );
        } else if (desktopMode && !collapsedLazyMenu) {
            return (
                <div
                    className="lazy-image-menu-container"
                    style={{
                        ...translateStyle,
                    }}>
                    <div
                        className="lazy-images-container"
                        style={{
                            width: sideMenuWidth,
                        }}>
                        {props.thumbnails !== null
                            ? props.thumbnails.map((file, index) => {
                                  return (
                                      <LazyImageContainer
                                          getSpecificFileFromLocalDirectory={
                                              props.getSpecificFileFromLocalDirectory
                                          }
                                          key={index}
                                          file={file}
                                      />
                                  );
                              })
                            : null}
                    </div>
                </div>
            );
        } else return null;
    } else return null;
}

LazyImageMenu.propTypes = {
    /**
     * Array with string values to the file path of thumbnails,
     * IE: ['D:\images\.thumbnails\1_img.ora_thumbnail.png', 'D:\images\.thumbnails\2_img.ora_thumbnail.png', ...]
     */
    thumbnails: PropTypes.array,
    /**
     * Calls the Electron channel to invoke a specific file from the selected file system folder.
     */
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageMenu;
