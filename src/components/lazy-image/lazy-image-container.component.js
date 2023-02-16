import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { getAnnotations } from '../../redux/slices/annotation.slice';

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
    hasAnnotations,
    selected,
}) {
    const containerElement = useRef();

    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState('');
    const [isAnnotations, setHasAnnotations] = useState(hasAnnotations);
    const { length: annotationCount } = useSelector(getAnnotations);

    const handleThumbnailClick = async () => {
        try {
            await ipcRenderer.invoke(Channels.selectFile, fileName);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        // updates hasAnnotation if the selected image's annotations count changes
        selected && setHasAnnotations(!!annotationCount);
    }, [annotationCount]);

    /**
     * Takes in the thumbnail Blob (image/png) thumbnail and creates an object url for the image to display.
     * If no parameter is passed it revokes the blobs object url if it was loaded already.
     * @param {Blob} [blobData=null]
     */
    const thumbnailHandler = (blobData = null) => {
        setThumbnailSrc(URL.createObjectURL(blobData));
    };

    /**
     * Clears/revokes the current display thumbnail blob to free up memory
     */
    const clearThumbnail = () => {
        URL.revokeObjectURL(thumbnailSrc);
        setThumbnailSrc(null);
    };

    useLayoutEffect(() => {
        if (isOnScreen && !thumbnailSrc) {
            ipcRenderer
                .invoke(Channels.getThumbnail, { fileName, filePath })
                .then(({ fileData }) => {
                    const blobData = Utils.b64toBlob(fileData, 'image/png');
                    thumbnailHandler(blobData);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (!isOnScreen && thumbnailSrc) {
            clearThumbnail();
        }
    }, [isOnScreen]);

    return (
        <ImageContainer ref={containerElement}>
            <ThumbnailContainer
                selected={selected}
                onClick={handleThumbnailClick}>
                {thumbnailSrc && <img src={thumbnailSrc} alt={fileName} />}
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
        </ImageContainer>
    );
}

LazyImageContainerComponent.propTypes = {
    fileName: PropTypes.string,
    filePath: PropTypes.string,
    selected: PropTypes.bool,
    hasAnnotations: PropTypes.bool,
};

export default LazyImageContainerComponent;
