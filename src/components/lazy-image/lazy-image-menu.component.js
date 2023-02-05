import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Channels } from '../../utils/enums/Constants';
import {
    LazyImageMenuContainer,
    LazyImageMenuPadding,
    LazyImagesContainer,
} from './lazy-image-menu.styles';
import { initSettings } from '../../redux/slices/settings.slice';
import LazyImageContainerComponent from './lazy-image-container.component';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Component for displaying the lazy image menu.
 *
 * @component
 *
 */
function LazyImageMenuComponent() {
    const [thumbnails, setThumbnails] = useState({});

    useEffect(() => {
        // TODO: move this to lazy image component
        addElectronChannels();
        dispatch(initSettings());
    }, []);
    const dispatch = useDispatch();
    const enableMenu = true;
    const collapsedLazyMenu = false;
    const [translateStyle, setTranslateStyle] = useState({
        transform: `translate(0)`,
    });
    // const prevIsMenuCollapsed = Utils.usePrevious(collapsedLazyMenu);
    // useEffect(() => {
    //     if (prevIsMenuCollapsed !== collapsedLazyMenu) {
    //         if (collapsedLazyMenu === true) {
    //             setTranslateStyle({
    //                 transform: `translate(${-Math.abs(256 + 10)}px)`,
    //             });
    //         } else {
    //             setTranslateStyle({
    //                 transform: `translate(0)`,
    //             });
    //         }
    //     }
    // });

    const addElectronChannels = () => {
        const {
            removeThumbnail,
            addThumbnail,
            updateThumbnails,
            requestInitialThumbnailsList,
        } = Channels;
        ipcRenderer
            .on(removeThumbnail, (e, removedThumbnailName) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) => {
                    const updatedThumbnails = { ...thumbnails };
                    delete updatedThumbnails[removedThumbnailName];
                    return updatedThumbnails;
                });
            })
            .on(addThumbnail, (e, addedThumbnail) => {
                // must use a function here to get the most up-to-date state
                setThumbnails((thumbnails) => ({
                    ...thumbnails,
                    ...addedThumbnail,
                }));
            })
            .on(updateThumbnails, (e, thumbnailsObj) => {
                setThumbnails(thumbnailsObj);
            });
        ipcRenderer
            .invoke(requestInitialThumbnailsList)
            .then(setThumbnails)
            .catch(() => {
                console.log('no thumbnails to begin with');
            });
    };

    if (!enableMenu) return;

    if (collapsedLazyMenu) {
        return (
            <LazyImageMenuContainer translateStyle={translateStyle}>
                <LazyImageMenuPadding />
                <LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu} />
            </LazyImageMenuContainer>
        );
    } else {
        return (
            <LazyImageMenuContainer translateStyle={translateStyle}>
                <LazyImagesContainer collapsedLazyMenu={collapsedLazyMenu}>
                    {Object.keys(thumbnails).map((fileName) => (
                        <LazyImageContainerComponent
                            key={fileName}
                            fileName={fileName}
                            filePath={thumbnails[fileName]}
                        />
                    ))}
                </LazyImagesContainer>
            </LazyImageMenuContainer>
        );
    }
}

LazyImageMenuComponent.propTypes = {};

export default LazyImageMenuComponent;
