import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Channels } from '../../utils/enums/Constants';
import {
    LazyImageMenuContainer,
    LazyImagesContainer,
} from './lazy-image-menu.styles';
import LazyImageContainerComponent from './lazy-image-container.component';
import {
    getCurrFileName,
    getIsLazyMenuCollapsed,
} from '../../redux/slices/ui.slice';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Component for displaying the lazy image menu.
 *
 * @component
 *
 */
function LazyImageMenuComponent() {
    const [thumbnails, setThumbnails] = useState({});
    const isLazyMenuCollapsed = useSelector(getIsLazyMenuCollapsed);
    const currentFileName = useSelector(getCurrFileName);

    useEffect(() => {
        addElectronChannels();
    }, []);

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

    return (
        <LazyImageMenuContainer>
            <LazyImagesContainer collapsedLazyMenu={isLazyMenuCollapsed}>
                {Object.keys(thumbnails).map((fileName) => (
                    <LazyImageContainerComponent
                        key={fileName}
                        selected={fileName === currentFileName}
                        fileName={fileName}
                        filePath={thumbnails[fileName]}
                    />
                ))}
            </LazyImagesContainer>
        </LazyImageMenuContainer>
    );
}

LazyImageMenuComponent.propTypes = {};

export default LazyImageMenuComponent;
