import React from 'react';
import PropTypes from 'prop-types';
import { StyledCheckmarkIcon } from './checkmark.icon.styles';

const CheckmarkIcon = (props) => {
    return (
        <StyledCheckmarkIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CheckmarkIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CheckmarkIcon;
