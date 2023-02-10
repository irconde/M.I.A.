import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Utils from '../../utils/general/Utils';
import { Channels } from '../../utils/enums/Constants';
import {
    ImageContainer,
    LazyImageIconWrapper,
    LazyImageText,
    LazyImageTextContainer,
    ThumbnailContainer,
} from './lazy-image-container.styles';
import AnnotationIcon from '../../icons/annotation-icon/annotation.icon';

const ipcRenderer = window.require('electron').ipcRenderer;
const DEFAULT_HEIGHT = 145.22;

/**
 * Container component for the lazy image thumbnails
 *
 * @component
 *
 */
function LazyImageContainerComponent({
    filePath,
    fileName,
    selected,
    getSpecificFileFromLocalDirectory,
}) {
    const containerElement = useRef();
    const [thumbnailHeight, setThumbnailHeight] = useState(DEFAULT_HEIGHT);

    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [isAnnotations, setIsAnnotations] = useState(false);

    /**
     * Given an image URL, it returns the height of the image
     *
     * @param url {string}
     * @returns {Promise<number>}
     */
    const getImageHeight = async (url) => {
        const img = new Image();
        img.src = url;
        await img.decode();
        return img.naturalHeight;
    };

    /**
     * The image starts at the default height, then when it's loaded we change the height of the container to the
     * height of the image
     * @returns {Promise<void>}
     */
    const thumbnailHeightHandler = async () => {
        if (thumbnailHeight === DEFAULT_HEIGHT) {
            const height = await getImageHeight(thumbnailSrc);
            setThumbnailHeight(height);
        }
    };

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

    return (
        <ImageContainer
            ref={containerElement}
            thumbnailHeight={thumbnailHeight}>
            {thumbnailSrc && (
                <>
                    <ThumbnailContainer
                        selected={selected}
                        onClick={() =>
                            // TODO 2: enable selecting an image
                            getSpecificFileFromLocalDirectory(filePath)
                        }>
                        <img
                            onLoad={thumbnailHeightHandler}
                            src={thumbnailSrc}
                            alt={fileName}
                        />
                        {isAnnotations && (
                            <LazyImageIconWrapper>
                                <AnnotationIcon
                                    width={'24px'}
                                    height={'24px'}
                                    color={'white'}
                                />
                            </LazyImageIconWrapper>
                        )}
                    </ThumbnailContainer>
                    <LazyImageTextContainer>
                        <LazyImageText>{fileName}</LazyImageText>
                    </LazyImageTextContainer>
                </>
            )}
        </ImageContainer>
    );
}

LazyImageContainerComponent.propTypes = {
    fileName: PropTypes.string,
    filePath: PropTypes.string,
    selected: PropTypes.bool,
    /**
     * Calls the Electron channel to invoke a specific file from the selected file system folder.
     */
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainerComponent;
