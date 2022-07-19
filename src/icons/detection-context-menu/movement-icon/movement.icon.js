import React from 'react';
import PropTypes from 'prop-types';
import { StyledMovementIcon } from './movement.icon.styles';

const MovementIcon = (props) => {
    return (
        <StyledMovementIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

MovementIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default MovementIcon;
