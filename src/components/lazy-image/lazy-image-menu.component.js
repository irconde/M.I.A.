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
import LazyImageContainer from './lazy-image-container.component';
import FileOpenIcon from '../../icons/lazy-image-menu/file-open-icon/file-open.icon';
import {
    ImagesInWorkspace,
    LazyImageMenuContainer,
    LazyImageMenuPadding,
    LazyImagesContainer,
} from './lazy-image-menu.styles';

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
function LazyImageMenuComponent(props) {
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
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(0)`,
    });
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
        if (element.scrollTop > 0) {
            setShouldAddBoxShadow(true);
        } else {
            setShouldAddBoxShadow(false);
        }
    }

    if (enableMenu) {
        if (desktopMode && collapsedLazyMenu) {
            return (
                <LazyImageMenuContainer
                    onScroll={handleMenuContainerScroll}
                    translateStyle={translateStyle}>
                    <LazyImageMenuPadding />
                    <LazyImagesContainer
                        collapsedLazyMenu={collapsedLazyMenu}
                    />
                </LazyImageMenuContainer>
            );
        } else if (desktopMode && !collapsedLazyMenu) {
            return (
                <LazyImageMenuContainer
                    onScroll={handleMenuContainerScroll}
                    translateStyle={translateStyle}>
                    <ImagesInWorkspace shouldAddBoxShadow={shouldAddBoxShadow}>
                        <FileOpenIcon
                            width={'24px'}
                            height={'24px'}
                            color={'#ffffff'}
                        />
                        Images in Workspace
                    </ImagesInWorkspace>
                    <LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu}>
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
                    </LazyImagesContainer>
                </LazyImageMenuContainer>
            );
        } else return null;
    } else return null;
}

LazyImageMenuComponent.propTypes = {
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

export default LazyImageMenuComponent;
