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
import DicomThumbnail from '../../icons/thumb_placeholder.png';
import { useDispatch } from 'react-redux';
import { selectFileAndSaveTempAnnotations } from '../../redux/slices/annotation.slice';
import { updateIsLoadingFile } from '../../redux/slices/ui.slice';

const ipcRenderer = window.require('electron').ipcRenderer;
const REPEAT_REQUEST_COUNT = 3;

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
    const dispatch = useDispatch();

    const handleThumbnailClick = async () => {
        try {
            if (!selected) {
                // we set the loading back to false when the DisplayImage requests the annotations and updates the view
                dispatch(updateIsLoadingFile(true));
                dispatch(selectFileAndSaveTempAnnotations(fileName));
            }
        } catch (error) {
            console.log(error);
        }
    };

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

    /**
     * Requests the thumbnail pixel data from electron and updates the state
     * if failed, it will recursively try again (REPEAT_REQUEST_COUNT) times
     * it tries again because electron takes time to generate the thumbnail
     * @param {number} [trialCount=0]
     */
    const requestThumbnailData = (trialCount = 0) => {
        if (trialCount === REPEAT_REQUEST_COUNT) return;
        ipcRenderer
            .invoke(Channels.getThumbnail, { fileName, filePath })
            .then(({ fileData }) => {
                const blobData = Utils.b64toBlob(fileData, 'image/png');
                thumbnailHandler(blobData);
            })
            .catch((error) => {
                console.log(error);
                setTimeout(() => requestThumbnailData(trialCount + 1), 100);
            });
    };

    const setDicomThumbnailData = () => {
        setThumbnailSrc(DicomThumbnail);
    };

    useLayoutEffect(() => {
        if (filePath?.toLowerCase() !== 'dicom') {
            if (isOnScreen && !thumbnailSrc) {
                requestThumbnailData();
            } else if (!isOnScreen && thumbnailSrc) {
                clearThumbnail();
            }
        } else {
            if (isOnScreen && !thumbnailSrc) {
                setDicomThumbnailData();
            } else if (!isOnScreen && thumbnailSrc) {
                clearThumbnail();
            }
        }
    }, [isOnScreen]);

    return (
        <ImageContainer ref={containerElement}>
            <ThumbnailContainer
                selected={selected}
                onClick={handleThumbnailClick}>
                {thumbnailSrc && <img src={thumbnailSrc} alt={fileName} />}
                {hasAnnotations && (
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
