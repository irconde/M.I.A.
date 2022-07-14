import React from 'react';
import PropTypes from 'prop-types';
import { StyledExpandArrowIcon } from './expand-arrow.icon.styles';

const ExpandArrowIcon = (props) => {
    return (
        <StyledExpandArrowIcon
            width={props.width}
            height={props.height}
            color={props.color}
            direction={props.direction}
        />
    );
};

ExpandArrowIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    direction: PropTypes.oneOf(['up', 'down', 'right', 'left']),
};

export default ExpandArrowIcon;
