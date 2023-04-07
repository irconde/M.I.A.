import React from 'react';
import PropTypes from 'prop-types';
import { StyledErrorIcon } from './error.icon.styles';

const ErrorIcon = (props) => {
    return (
        <StyledErrorIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ErrorIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ErrorIcon;
