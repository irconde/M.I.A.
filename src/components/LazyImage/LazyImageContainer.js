import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';
import Utils from '../../utils/Utils';
import { Channels } from '../../utils/Constants';
import { getGeneratingThumbnails } from '../../redux/slices/ui/uiSlice';
import isElectron from 'is-electron';
let ipcRenderer;
if (isElectron()) {
    ipcRenderer = window.require('electron').ipcRenderer;
}

const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '1px solid #367eff' : '1px solid white'};
    overflow-x: hidden;
    margin: 1.5rem;
    background-color: ${(props) =>
        props.loading === 'true' ? 'gray' : '#1f1f1f'};
    justify-content: center;
    width: 96px;
    height: ${(props) =>
        props.loading === 'true' ? '96px' : `${props.thumbnailHeight}px`};
    cursor: pointer;
`;

function LazyImageContainer(props) {
    const generatingThumbnails = useSelector(getGeneratingThumbnails);
    const containerElement = useRef();
    const [thumbnailHeight, setThumbnailHeight] = useState('auto');
    /**
     * Thumbnails load with a height of auto and we keep track of that calculated height, or height of the image,
     * using this handler. Which sets the thumbnail height passed into the container element of the image.
     * This is namely so that when an image goes off screen, we keep the container the same size of that image.
     * @param {Number} height
     */
    const thumbnailHeightHandler = (height) => {
        if (height !== thumbnailHeight) setThumbnailHeight(height);
    };
    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailSrc, setThumbnailSrc] = useState(null);
    /**
     * Takes in the thumbnail Blob (image/png) thumbnail and creates an object url for the image to display.
     * If no parameter is passed it revokes the blobs object url if it was loaded already.
     * @param {Blob = null} blobData
     */
    const thumbnailHandler = (blobData = null) => {
        if (blobData === null) {
            if (thumbnailSrc !== null) {
                URL.revokeObjectURL(thumbnailSrc);
                setThumbnailSrc(null);
            }
        } else {
            setThumbnailSrc(URL.createObjectURL(blobData));
        }
    };
    useLayoutEffect(() => {
        if (!generatingThumbnails) {
            if (isOnScreen && thumbnailSrc === null) {
                ipcRenderer
                    .invoke(Channels.getThumbnail, props.file)
                    .then((b64Data) => {
                        const blobData = Utils.b64toBlob(b64Data, 'image/png');
                        thumbnailHandler(blobData);
                    })
                    .catch((error) => {
                        // TODO: Better error handling
                        console.log(error);
                    });
            }
            if (!isOnScreen && thumbnailSrc !== null) {
                thumbnailHandler();
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
    return (
        <ImageContainer
            ref={containerElement}
            selected={selected}
            thumbnailHeight={thumbnailHeight}
            loading={generatingThumbnails.toString()}
            onClick={() => props.getSpecificFileFromLocalDirectory(props.file)}
            title={props.file}>
            {thumbnailSrc !== null ? (
                <img
                    onLoad={(event) => {
                        thumbnailHeightHandler(
                            containerElement.current.clientHeight
                        );
                    }}
                    src={thumbnailSrc}
                />
            ) : null}
        </ImageContainer>
    );
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainer;
