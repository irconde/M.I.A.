import React from 'react';
import PropTypes from 'prop-types';
import { StyledCodeBracketsIcon } from './code-brackets.icon.styles';

const CodeBracketsIcon = (props) => {
    return (
        <StyledCodeBracketsIcon
            width={props.width}
            height={props.height}
            color={props.color}
        />
    );
};

CodeBracketsIcon.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

export default CodeBracketsIcon;
