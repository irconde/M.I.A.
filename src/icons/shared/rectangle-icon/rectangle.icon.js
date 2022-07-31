import React from 'react';
import PropTypes from 'prop-types';
import { StyledRectangleIcon } from './rectangle.icon.styles';

const RectangleIcon = (props) => {
    return (
        <StyledRectangleIcon
            width={props.width}
            height={props.height}
            color={props.color}
            border={props.border}
        />
    );
};

RectangleIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
};

export default RectangleIcon;
