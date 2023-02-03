import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Utils from '../../utils/general/Utils';
import { Channels } from '../../utils/enums/Constants';
import { getGeneratingThumbnails } from '../../redux/slices-old/ui/uiSlice';
import Tooltip from '@mui/material/Tooltip';
import {
    ImageContainer,
    LazyImageIconWrapper,
    LazyImageText,
    LazyImageTextContainer,
    ThumbnailContainer,
} from './lazy-image-container.styles';
import TwoViewIcon from '../../icons/lazy-image-menu/two-view-icon/two-view.icon';
import SingleViewIcon from '../../icons/lazy-image-menu/single-view-icon/single-view.icon';
import AnnotationsIcon from '../../icons/lazy-image-menu/annotations-icon/annotations.icon';

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
     * @param {number} height
     */
    const thumbnailHeightHandler = (height) => {
        if (height !== thumbnailHeight) setThumbnailHeight(height);
    };
    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState(null);
    const [numOfViews, SetNumOfViews] = useState();
    const [isDetections, SetIsDetections] = useState();
    /**
     * Takes in the thumbnail Blob (image/png) thumbnail and creates an object url for the image to display.
     * If no parameter is passed it revokes the blobs object url if it was loaded already.
     * @param {Blob} [blobData=null]
     * @param {Number} views
     * @param {Boolean} detections
     */
    const thumbnailHandler = (blobData = null, views, detections) => {
        setThumbnailSrc(URL.createObjectURL(blobData));
        if (numOfViews !== views) SetNumOfViews(views);
        if (isDetections !== detections) SetIsDetections(detections);
    };

    /**
     * Clears/revokes the current display thumbnail blob to free up memory
     */
    const clearThumbnail = () => {
        if (thumbnailSrc !== null) {
            URL.revokeObjectURL(thumbnailSrc);
            setThumbnailSrc(null);
        }
    };

    useLayoutEffect(() => {
        if (!generatingThumbnails) {
            if (isOnScreen && thumbnailSrc === null) {
                ipcRenderer
                    .invoke(Channels.getThumbnail, { fileName, filePath })
                    .then((result) => {
                        const blobData = Utils.b64toBlob(
                            result.fileData,
                            'image/png'
                        );
                        thumbnailHandler(
                            blobData,
                            result.numOfViews,
                            result.isDetections
                        );
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
            if (!isOnScreen && thumbnailSrc !== null) {
                clearThumbnail();
            }
        }
    });
    const currentFileName = '';
    // const currentFileName = useSelector(getCurrentFile);
    // let splitPath;
    // if (navigator.platform === 'Win32') {
    //     splitPath = props.file.split('\\');
    // } else {
    //     splitPath = props.file.split('/');
    // }
    // const thisFileName = splitPath[splitPath.length - 1];
    // const selected = currentFileName === thisFileName;
    return (
        <ImageContainer
            ref={containerElement}
            selected={fileName === currentFileName}
            thumbnailHeight={thumbnailHeight}
            loading={generatingThumbnails}>
            {thumbnailSrc !== null ? (
                <ThumbnailContainer
                    onClick={() =>
                        // TODO: figure out what goes here
                        getSpecificFileFromLocalDirectory(filePath)
                    }>
                    <img
                        onLoad={() => {
                            thumbnailHeightHandler(
                                containerElement.current.clientHeight
                            );
                        }}
                        src={thumbnailSrc}
                        alt={fileName}
                    />
                </ThumbnailContainer>
            ) : null}
            <LazyImageTextContainer>
                <Tooltip title={fileName}>
                    <LazyImageText>{fileName}</LazyImageText>
                </Tooltip>
                <LazyImageIconWrapper>
                    {numOfViews > 1 ? (
                        <TwoViewIcon
                            width={'20px'}
                            height={'20px'}
                            color={'#E3E3E3'}
                        />
                    ) : (
                        <SingleViewIcon
                            width={'20px'}
                            height={'20px'}
                            color={'#E3E3E3'}
                        />
                    )}
                </LazyImageIconWrapper>
                {isDetections === true ? (
                    <LazyImageIconWrapper>
                        <AnnotationsIcon
                            width={'20px'}
                            height={'20px'}
                            color={'#E3E3E3'}
                        />
                    </LazyImageIconWrapper>
                ) : null}
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
