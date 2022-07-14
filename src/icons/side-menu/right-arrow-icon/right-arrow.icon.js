import React from 'react';
import PropTypes from 'prop-types';
import { StyledRightArrowIcon } from './right-arrow.icon.styles';

const RightArrowIcon = (props) => {
    return (
        <StyledRightArrowIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

RightArrowIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default RightArrowIcon;
