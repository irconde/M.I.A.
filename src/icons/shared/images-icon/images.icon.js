import React from 'react';
import PropTypes from 'prop-types';
import { StyledImagesIcon } from './images.icon.styles';

const ImagesIcon = (props) => {
    return (
        <StyledImagesIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ImagesIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ImagesIcon;
