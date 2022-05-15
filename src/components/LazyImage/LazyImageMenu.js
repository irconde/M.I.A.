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
import FileOpenIcon from '../../icons/FileOpenIcon';
let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
}



/**
 * Component for displaying the lazy image menu.
 *
 * @component
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
    const sideMenuWidth = 256 + constants.RESOLUTION_UNIT;
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(0)`,
    });
    const svgContainerStyle = {
        float: 'left',
        display: 'flex',
        alignItems: 'center',
        marginRight: '10px',
    };
    const svgStyle = {
        height: '24px',
        width: '24px',
        color: '#ffffff',
    };
    const prevIsMenuCollapsed = Utils.usePrevious(collapsedLazyMenu);
    useEffect(() => {
        if (prevIsMenuCollapsed !== collapsedLazyMenu) {
            if (collapsedLazyMenu === true) {
                setTranslateStyle({
                    transform: `translate(${-Math.abs(256 + 10)}px)`,
                });
            } else {
                setTranslateStyle({
                    transform: `translate(0)`,
                });
            }
        }
    });

    // change piece of state when the user scrolls. Used for adding box-shadow to header
    const [shouldAddBoxShadow, setShouldAddBoxShadow] = useState(false);

    function handleMenuContainerScroll(event) {
        const element = event.target;
        if(element.scrollTop > 0){
            setShouldAddBoxShadow(true);
        }else{
            setShouldAddBoxShadow(false);
    }
}

    // TODO: Scroll to selected thumbnail
    if (enableMenu) {
        if (desktopMode && collapsedLazyMenu) {
            return (
                <div
                    className="lazy-image-menu-container"
                    onScroll={handleMenuContainerScroll}
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
                    onScroll={handleMenuContainerScroll}
                    style={{
                        ...translateStyle,
                    }}>
                        <p className="images-in-workspace"
                            style={{boxShadow: shouldAddBoxShadow && "0 0.1rem 0.5rem 0.3rem rgba(0, 0, 0, 0.5)"}}>
                            <FileOpenIcon
                                style={svgContainerStyle}
                                svgStyle={{
                                    ...svgStyle,
                                    color: '#ffffff',
                                }}
                            />
                            Images in Workspace
                        </p>
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
