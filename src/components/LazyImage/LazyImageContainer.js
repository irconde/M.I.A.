import React, { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';
import Utils from '../../utils/Utils';
import { Channels } from '../../utils/Constants';
const ipcRenderer = window.require('electron').ipcRenderer;

const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '1px solid blue' : '1px solid white'};
    overflow-x: hidden;
    margin: 1.5rem;
    background-color: #1f1f1f;
    justify-content: center;
    height: 96px;
    width: 96px;
    cursor: pointer;
`;

function LazyImageContainer(props) {
    const containerElement = useRef();
    const isOnScreen = Utils.useOnScreen(containerElement);
    const [thumbnailData, setThumbnailData] = useState(null);
    const [thumbnailSrc, setThumbnailSrc] = useState(null);
    const thumbnailHandler = (blobData = null) => {
        if (blobData === null) {
            URL.revokeObjectURL(thumbnailSrc);
            setThumbnailData(null);
            setThumbnailSrc(null);
        } else {
            setThumbnailData(blobData);
            setThumbnailSrc(URL.createObjectURL(blobData));
        }
    };
    useLayoutEffect(() => {
        if (isOnScreen && thumbnailData === null) {
            ipcRenderer
                .invoke(Channels.getThumbnail, props.file)
                .then((b64Data) => {
                    const blobData = Utils.b64toBlob(b64Data, 'image/png');
                    thumbnailHandler(blobData);
                })
                .catch((error) => {
                    // TODO: Better error handling, if file didn't exist, thumbnail not loaded yet
                    console.log(error);
                });
        }
        if (!isOnScreen && thumbnailData !== null) {
            thumbnailHandler();
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
            onClick={() => props.getSpecificFileFromLocalDirectory(props.file)}
            title={props.file}>
            {thumbnailSrc !== null ? <img src={thumbnailSrc} /> : null}
        </ImageContainer>
    );
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainer;
