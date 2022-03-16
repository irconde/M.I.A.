import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { getCurrentFile } from '../../redux/slices/server/serverSlice';

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

/**
 * Component for ?.
 *
 * @component
 *
 * @param {PropTypes} props Expected props: file (Name of file), getSpecificFileFromLocalDirectory (?)
 *
 */
function LazyImageContainer(props) {
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
