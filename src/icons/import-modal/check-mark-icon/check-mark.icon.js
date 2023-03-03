import React from 'react';
import PropTypes from 'prop-types';
import { StyledCheckMarkIcon } from './check-mark.icon.styles';

const CheckMarkIcon = (props) => {
    return (
        <StyledCheckMarkIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CheckMarkIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CheckMarkIcon;
