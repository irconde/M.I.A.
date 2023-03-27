import React from 'react';
import PropTypes from 'prop-types';
import { StyledPersonIcon } from './person.icon.styles';

const PersonIcon = (props) => {
    return (
        <StyledPersonIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

PersonIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default PersonIcon;
