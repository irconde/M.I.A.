import React from 'react';
import PropTypes from 'prop-types';
import { StyledEyeCloseIcon } from './eye-close.icon.styles';

const EyeCloseIcon = (props) => {
    return (
        <StyledEyeCloseIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

EyeCloseIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default EyeCloseIcon;
