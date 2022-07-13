import React from 'react';
import PropTypes from 'prop-types';
import { StyledExpandArrowIcon } from './expand-arrow.icon.styles';

const ExpandArrowIcon = (props) => {
    return (
        <StyledExpandArrowIcon
            width={props.width}
            height={props.height}
            color={props.color}
            expanded={props.expanded}
        />
    );
};

ExpandArrowIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    expanded: PropTypes.bool.isRequired,
};

export default ExpandArrowIcon;
