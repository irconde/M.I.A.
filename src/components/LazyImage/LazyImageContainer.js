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
`;

function LazyImageContainer(props) {
    return <ImageContainer></ImageContainer>;
}

LazyImageContainer.propTypes = {
    file: PropTypes.string,
};

export default LazyImageContainer;
