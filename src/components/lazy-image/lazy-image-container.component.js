import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Utils from '../../utils/general/Utils';
import { Channels } from '../../utils/enums/Constants';
import { getGeneratingThumbnails } from '../../redux/slices-old/ui/uiSlice';
import Tooltip from '@mui/material/Tooltip';
import {
    ImageContainer,
    LazyImageText,
    LazyImageTextContainer,
    ThumbnailContainer,
} from './lazy-image-container.styles';

const ipcRenderer = window.require('electron').ipcRenderer;

/**
 * Container component for the lazy image thumbnails
 *
 * @component
 *
 */
function LazyImageContainerComponent({
    filePath,
    fileName,
    getSpecificFileFromLocalDirectory,
}) {
    const generatingThumbnails = useSelector(getGeneratingThumbnails);
    const containerElement = useRef();
    const [thumbnailHeight, setThumbnailHeight] = useState('auto');
    /**
     * Thumbnails load with a height of auto and we keep track of that calculated height, or height of the image,
     * using this handler. Which sets the thumbnail height passed into the container element of the image.
     * This is namely so that when an image goes offscreen, we keep the container the same size of that image.
     */
    const thumbnailHeightHandler = () => {
        const height = containerElement.current.clientHeight;
        if (height !== thumbnailHeight) setThumbnailHeight(height);
    };
    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [isAnnotations, setIsAnnotations] = useState();
    /**
     * Takes in the thumbnail Blob (image/png) thumbnail and creates an object url for the image to display.
     * If no parameter is passed it revokes the blobs object url if it was loaded already.
     * @param {Blob} [blobData=null]
     * @param {Boolean} annotation
     */
    const thumbnailHandler = (blobData = null, annotation) => {
        setThumbnailSrc(URL.createObjectURL(blobData));
        if (isAnnotations !== annotation) setIsAnnotations(annotation);
    };

    /**
     * Clears/revokes the current display thumbnail blob to free up memory
     */
    const clearThumbnail = () => {
        if (thumbnailSrc) {
            URL.revokeObjectURL(thumbnailSrc);
            setThumbnailSrc(null);
        }
    };

    useLayoutEffect(() => {
        if (isOnScreen && !thumbnailSrc) {
            ipcRenderer
                .invoke(Channels.getThumbnail, { fileName, filePath })
                .then(({ fileData, isAnnotations }) => {
                    const blobData = Utils.b64toBlob(fileData, 'image/png');
                    thumbnailHandler(blobData, isAnnotations);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (!isOnScreen) {
            clearThumbnail();
        }
    }, [isOnScreen]);

    // TODO: get this from Redux
    const currentFileName = '';
    return (
        <ImageContainer
            ref={containerElement}
            selected={fileName === currentFileName}
            thumbnailHeight={thumbnailHeight}
            loading={generatingThumbnails}>
            {thumbnailSrc && (
                <ThumbnailContainer
                    onClick={() =>
                        // TODO: figure out what goes here
                        getSpecificFileFromLocalDirectory(filePath)
                    }>
                    <img
                        onLoad={thumbnailHeightHandler}
                        src={thumbnailSrc}
                        alt={fileName}
                    />
                </ThumbnailContainer>
            )}
            <LazyImageTextContainer>
                <Tooltip title={fileName}>
                    <LazyImageText>{fileName}</LazyImageText>
                </Tooltip>
            </LazyImageTextContainer>
        </ImageContainer>
    );
}

LazyImageContainerComponent.propTypes = {
    fileName: PropTypes.string,
    filePath: PropTypes.string,
    /**
     * Calls the Electron channel to invoke a specific file from the selected file system folder.
     */
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainerComponent;
