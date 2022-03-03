import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ImageContainer = styled.div`
    display: flex;
    border: 1px solid white;
    overflow-x: hidden;
    padding: 0.75rem;
    margin: 1.5rem;
    background-color: grey;
    height: 96px;
    width: 96px;
    cursor: pointer;
`;

function LazyImageContainer(props) {
    return (
        <ImageContainer
            onClick={() => props.getSpecificFileFromLocalDirectory(props.file)}
            title={props.file}></ImageContainer>
    );
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
    getSpecificFileFromLocalDirectory: PropTypes.func,
};

export default LazyImageContainer;
