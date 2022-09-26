import React from 'react';
import PropTypes from 'prop-types';
import { StyledContrastIcon } from './contrast.icon.styles';

const ContrastIcon = (props) => {
    return (
        <StyledContrastIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ContrastIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ContrastIcon;
