import React from 'react';
import PropTypes from 'prop-types';
import { StyledNextArrowIcon } from './next-arrow.icon.styles';

const NextArrowIcon = (props) => {
    return (
        <StyledNextArrowIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

NextArrowIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default NextArrowIcon;
