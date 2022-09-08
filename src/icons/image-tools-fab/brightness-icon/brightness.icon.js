import React from 'react';
import PropTypes from 'prop-types';
import { StyledBrightnessIcon } from './brightness.icon.styles';

const BrightnessIcon = (props) => {
    return (
        <StyledBrightnessIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

BrightnessIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default BrightnessIcon;
