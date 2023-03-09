import React from 'react';
import PropTypes from 'prop-types';
import { StyledFabIcon } from './grain.icon.styles';

const GrainIcon = (props) => {
    return (
        <StyledFabIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

GrainIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default GrainIcon;
