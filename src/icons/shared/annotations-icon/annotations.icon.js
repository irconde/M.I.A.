import React from 'react';
import PropTypes from 'prop-types';
import { StyledAnnotationsIcon } from './annotations.icon.styles';

const AnnotationsIcon = (props) => {
    return (
        <StyledAnnotationsIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

AnnotationsIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default AnnotationsIcon;
