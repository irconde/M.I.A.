import React from 'react';
import PropTypes from 'prop-types';
import { StyledAnnotationIcon } from './annotation.icon.styles';

const AnnotationIcon = (props) => {
    return (
        <StyledAnnotationIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

AnnotationIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default AnnotationIcon;
