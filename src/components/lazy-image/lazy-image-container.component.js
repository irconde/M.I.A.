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

/**
 * Container component for the lazy image thumbnails
 *
 * @component
 *
 */
function LazyImageContainerComponent({ filePath, fileName, selected }) {
    const containerElement = useRef();

    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [isAnnotations, setIsAnnotations] = useState(false);

    const handleThumbnailClick = async () => {
        try {
            await ipcRenderer.invoke(Channels.selectFile, fileName);
        } catch (error) {
            console.log(error);
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
        <ImageContainer ref={containerElement}>
            {thumbnailSrc && (
                <>
                    <ThumbnailContainer
                        selected={selected}
                        onClick={handleThumbnailClick}>
                        <img src={thumbnailSrc} alt={fileName} />
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
};

export default LazyImageContainerComponent;
