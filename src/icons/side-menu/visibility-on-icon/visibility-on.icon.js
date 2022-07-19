import React from 'react';
import PropTypes from 'prop-types';
import { StyledVisibilityOnIcon } from './visibility-on.icon.styles';

const VisibilityOnIcon = (props) => {
    return (
        <StyledVisibilityOnIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

VisibilityOnIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default VisibilityOnIcon;
