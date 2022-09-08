import React from 'react';
import PropTypes from 'prop-types';
import { StyledScaleIcon } from './scale.icon.styles';

const ScaleIcon = (props) => {
    return (
        <StyledScaleIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ScaleIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ScaleIcon;
