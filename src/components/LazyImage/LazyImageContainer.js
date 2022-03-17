import React, { useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';
import Utils from '../../utils/Utils';

const ImageContainer = styled.div`
    display: flex;
    border: ${(props) =>
        props.selected ? '1px solid blue' : '1px solid white'};
    overflow-x: hidden;
    padding: 0.75rem;
    margin: 1.5rem;
    background-color: grey;
    height: 96px;
    width: 96px;
    cursor: pointer;
`;

function LazyImageContainer(props) {
    const containerElement = useRef();
    const isOnScreen = Utils.useOnScreen(containerElement);
    useLayoutEffect(() => {
        console.log(`File: ${props.file} | On Screen: ${isOnScreen}`);
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
            title={props.file}></ImageContainer>
    );
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainer;
