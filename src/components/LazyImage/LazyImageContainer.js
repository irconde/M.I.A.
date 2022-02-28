import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ImageContainer = styled.div`
    display: flex;
    border: 1px solid white;
    overflow-x: hidden;
    padding: 0.75rem;
`;

function LazyImageContainer(props) {
    return <ImageContainer>{props.file}</ImageContainer>;
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
};

export default LazyImageContainer;
