import React from 'react';
import PropTypes from 'prop-types';
import { StyledVisibilityOffIcon } from './visibility-off.icon.styles';

const VisibilityOffIcon = (props) => {
    return (
        <StyledVisibilityOffIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

VisibilityOffIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default VisibilityOffIcon;
