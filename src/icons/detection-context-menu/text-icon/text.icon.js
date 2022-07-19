import React from 'react';
import PropTypes from 'prop-types';
import { StyledTextIcon } from './text.icon.styles';

const TextIcon = (props) => {
    return (
        <StyledTextIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

TextIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default TextIcon;
