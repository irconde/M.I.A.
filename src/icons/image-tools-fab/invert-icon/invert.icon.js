import React from 'react';
import PropTypes from 'prop-types';
import { StyledInvertIcon } from './invert.icon.styles';

const InvertIcon = (props) => {
    return (
        <StyledInvertIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

InvertIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default InvertIcon;
