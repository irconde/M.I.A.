import React from 'react';
import PropTypes from 'prop-types';
import { StyledCogWheelIcon } from './settings-cog.icon.styles';

const CogWheelIcon = (props) => {
    return (
        <StyledCogWheelIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CogWheelIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CogWheelIcon;
