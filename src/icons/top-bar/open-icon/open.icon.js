import React from 'react';
import PropTypes from 'prop-types';
import { StyledOpenIcon } from './open.icon.styles';

const OpenIcon = (props) => {
    return (
        <StyledOpenIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

OpenIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default OpenIcon;
