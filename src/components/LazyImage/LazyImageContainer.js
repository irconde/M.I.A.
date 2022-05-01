import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';
import Utils from '../../utils/Utils';
import { Channels } from '../../utils/Constants';
import { getGeneratingThumbnails } from '../../redux/slices/ui/uiSlice';
import isElectron from 'is-electron';
import TwoViewIcon from '../../icons/TwoViewIcon';
import SingleViewIcon from '../../icons/SingleViewIcon';
import AnnotationsIcon from '../../icons/AnnotationsIcon';

let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
}

const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '4px solid #367eff' : '1px solid fff'};
    overflow-x: hidden;
    margin: 0 16px 60px 0;
    border-radius: 6px;
    background-color: #242424;
    justify-content: center;
    width: 197px;
    height: ${(props) =>
        props.loading === 'true' ? '145px' : `${props.thumbnailHeight}px`};
    cursor: pointer;
`;

/**
 * Container component for the lazy image thumbnails
 *
 * @component
 *
 * @param {PropTypes} props Expected props: file<string>, getSpecificFileFromLocalDirectory<function>
 * @param {string} file - Destructured from props -- Name of file
 * @param {function} getSpecificFileFromLocalDirectory - Destructured from props -- Calls the Electron channel to invoke a specific file from the selected file system folder.
 *
 */
function LazyImageContainer(props) {
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
                    .invoke(Channels.getThumbnail, props.file)
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
                        // TODO: Better error handling
                        console.log(error);
                    });
            }
            if (!isOnScreen && thumbnailSrc !== null) {
                clearThumbnail();
            }
        }
    });
    const currentFileName = useSelector(getCurrentFile);
    let splitPath;
    if (navigator.platform === 'Win32') {
        splitPath = props.file.split('\\');
    } else {
        splitPath = props.file.split('/');
    }
    const thisFileName = splitPath[splitPath.length - 1];
    const selected = currentFileName === thisFileName;
    const svgContainerStyle = { marginRight: '4px', marginLeft: '4px' };
    const svgImageStyle = { width: '20px', height: '20px' };
    return (
        <ImageContainer
            ref={containerElement}
            selected={selected}
            thumbnailHeight={thumbnailHeight}
            loading={generatingThumbnails.toString()}
            onClick={() => props.getSpecificFileFromLocalDirectory(props.file)}
            title={thisFileName}>
            {thumbnailSrc !== null ? (
                <img
                    onLoad={() => {
                        thumbnailHeightHandler(
                            containerElement.current.clientHeight
                        );
                    }}
                    src={thumbnailSrc}
                    alt={thisFileName}
                />
            ) : null}
            <div className="lazy-image-text-container">
                <span className="lazy-image-text">{thisFileName}</span>
                {numOfViews > 1 ? (
                    <TwoViewIcon
                        style={svgContainerStyle}
                        svgStyle={svgImageStyle}
                    />
                ) : (
                    <SingleViewIcon
                        style={svgContainerStyle}
                        svgStyle={svgImageStyle}
                    />
                )}
                {isDetections === true ? (
                    <AnnotationsIcon
                        style={svgContainerStyle}
                        svgStyle={svgImageStyle}
                    />
                ) : null}
            </div>
        </ImageContainer>
    );
}

LazyImageContainer.propTypes = {
    /**
     * Name of file
     */
    file: PropTypes.string,
    /**
     * Calls the Electron channel to invoke a specific file from the selected file system folder.
     */
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainer;
