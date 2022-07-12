import React from 'react';
import PropTypes from 'prop-types';
import { StyledExclamationPointIcon } from './exclamation-point.icon.styles';

const ExclamationPointIcon = (props) => {
    return (
        <StyledExclamationPointIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

ExclamationPointIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default ExclamationPointIcon;
